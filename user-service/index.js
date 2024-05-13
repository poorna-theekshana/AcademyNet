const express = require("express");
const app = express();
const Razorpay = require('razorpay');
const PORT = process.env.PORT_ONE || 5000;
const mongoose = require("mongoose");
const User = require("./user");
const nodemailer = require('nodemailer');
const Course = require("./course");
const jwt = require("jsonwebtoken");
const amqp = require("amqplib");
const passport = require('passport')
const bcrypt = require('bcryptjs')
const axios = require('axios');
const gravatar = require('gravatar')
const keys = require('./config/keys')
const validateUserLoginInput = require('./validation/userLogin')
const validateUserRegisterInput = require('./validation/userRegister')
const validateOTP = require('./validation/otpValidation')
const validateForgotPassword = require('./validation/forgotPassword')
const validateUserUpdatePassword = require('./validation/updatePassword')
const dotenv = require('dotenv');
const initializePassport = require('./config/passport'); 
initializePassport(); 
dotenv.config()
const cors = require('cors')
const cookieParser = require('cookie-parser');
const morgan = require('morgan')
app.use(express.urlencoded({ extended: false }))
app.use(express.json());
app.use(cookieParser())
app.use(cors())
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    next();
});

let loggedInUsers = [];
app.use(morgan('dev'))


app.use(passport.initialize()); 

const razorpay = new Razorpay({
    key_id: 'rzp_test_VeJyusQck4J2MV',
    key_secret: 'zWXLwM76hLujfIEhwJ9OL7Xl'
});


var channel, connection;

app.use(express.json());
mongoose.connect(
  process.env.MONGO_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log(`User-Service DB Connected`);
  }
);

async function connect() {
    const amqpServer = "amqp://localhost:5672";
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue("PRODUCT");
}
connect();

app.post('/register', async (req, res) => {
    try {
        const { errors, isValid } = validateUserRegisterInput(req.body);
        if (!isValid) {
            return res.status(400).json(errors);
        }

        const { name, email, password, role } = req.body;
        const user = await User.findOne({ email });

        if (user) {
            errors.email = 'Email already exists';
            return res.status(400).json(errors);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const avatar = gravatar.url(email, { s: '200', r: 'pg', d: 'mm' });
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            avatar,
            role
        });

        await newUser.save();
        res.status(200).json({ message: newUser });
    } catch (err) {
        console.error('Error in userRegister:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { errors, isValid } = validateUserLoginInput(req.body);
        if (!isValid) {
            return res.status(400).json(errors);
        }

        const { email, password } = req.body;
        const user = await User.findOne({ email }).populate('coursesCreated').populate('coursesBought').populate('cart');

        if (!user) {
            errors.email = "Email doesn't exist";
            return res.status(400).json(errors);
        }

        const isCorrect = await bcrypt.compare(password, user.password);

        if (!isCorrect) {
            errors.password = 'Invalid Credentials';
            return res.status(404).json(errors);
        }

        // Save the logged in user's ID
        loggedInUsers.push(user.id);

        const payload = { id: user.id, user: user };
        jwt.sign(
            payload,
            keys.secretKey,
            { expiresIn: 7200 },
            (err, token) => {
                if (err) {
                    console.error('Error in generating token:', err);
                    return res.status(500).json({ error: 'Failed to authenticate' });
                }
                res.json({
                    success: true,
                    token: 'Bearer ' + token
                });
            }
        );
    } catch (err) {
        console.error('Error in userLogin:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

async function sendEmail(to, OTP, subject) {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.elasticemail.com',
            port: 2525, // or 587 for TLS
            secure: false, // for SSL
            auth: {
                user: 'eripper85@gmail.com',
                pass: '97E08D07458603B6690F74303BF500551E9E'
            }
        });

        // Email content
        const mailOptions = {
            from: 'eripper85@gmail.com',
            to: to,
            subject: subject,
            text: `Your OTP is ${OTP}`
        };

        // Send email
        await transporter.sendMail(mailOptions);
    } catch (error) {
        throw new Error(`Error sending email: ${error.message}`);
    }
}

// Update the sendEmail function call in your /forgotPassword route
app.post('/forgotPassword', async (req, res) => {
    try {
        const { errors, isValid } = validateForgotPassword(req.body);
        if (!isValid) {
            return res.status(400).json(errors);
        }
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            errors.email = "Email Not found, Provide registered email";
            return res.status(400).json(errors);
        }

        function generateOTP() {
            var digits = '0123456789';
            let OTP = '';
            for (let i = 0; i < 6; i++) {
                OTP += digits[Math.floor(Math.random() * 10)];
            }
            return OTP;
        }

        const OTP = await generateOTP();
        user.otp = OTP;
        await user.save();
        
        // Send email with OTP
        await sendEmail(user.email, OTP, "OTP");

        // Respond to client
        res.status(200).json({ message: "Check your registered email for OTP" });

        // Clear OTP after 5 minutes
        const helper = async () => {
            user.otp = "";
            await user.save();
        };
        setTimeout(function () {
            helper();
        }, 300000);
    } catch (err) {
        console.log("Error in sending email", err.message);
        return res.status(400).json({ message: `Error in generateOTP: ${err.message}` });
    }
});

// Post OTP
app.post('/postOTP', async (req, res) => {
    try {
        const { errors, isValid } = validateOTP(req.body);
        if (!isValid) {
            return res.status(400).json(errors);
        }
        const { email, otp, newPassword, confirmNewPassword } = req.body;
        if (newPassword !== confirmNewPassword) {
            errors.confirmNewPassword = 'Password Mismatch';
            return res.status(400).json(errors);
        }
        const user = await User.findOne({ email });
        if (user.otp === "") {
            errors.otp = "OTP has expired";
            return res.status(400).json(errors);
        }
        if (user.otp !== otp) {
            errors.otp = "Invalid OTP, check your email again";
            return res.status(400).json(errors);
        }
        let hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        return res.status(200).json({ message: "Password Changed" });
    } catch (err) {
        console.log("Error in submitting otp", err.message);
        return res.status(400).json({ message: `Error in postOTP${err.message}` });
    }
});

// Update password
// Update password
app.post('/updatePassword', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { errors, isValid } = validateUserUpdatePassword(req.body);
        if (!isValid) {
            return res.status(400).json(errors);
        }
        const { email, oldPassword, newPassword, confirmNewPassword } = req.body;
        if (newPassword !== confirmNewPassword) {
            errors.confirmNewPassword = 'Password Mismatch';
            return res.status(404).json(errors);
        }
        const user = await User.findOne({ email });
        const isCorrect = await bcrypt.compare(oldPassword, user.password);
        if (!isCorrect) {
            errors.oldPassword = 'Invalid old Password';
            return res.status(404).json(errors);
        }
        let hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({ message: "Password Updated" });
    } catch (err) {
        console.log("Error in updating password", err.message);
        return res.status(400).json({ message: `Error in updatePassword${err.message}` });
    }
});



// Buy Course
app.get('/buyCourse/:courseId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const {_id} = req.user;
        const { courseId } = req.params;
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Calculate the total price of the course
        const totalPrice = parseInt(course.price);

        // Create an order with Razorpay
        const order = await razorpay.orders.create({
            amount: totalPrice * 100, // Razorpay expects the amount in paise
            currency: 'INR', // Change this according to your currency
            receipt: `course_${course._id}`,
            payment_capture: 1 // Auto capture payment
        });

        // Now you can send this order ID to your frontend to complete the payment flow
        // Your frontend should then call Razorpay's SDK to complete the payment

        // Update the user who is buying the course
        const buyerUser = await User.findById(_id);
        buyerUser.coursesBought.push(courseId);
        buyerUser.totalExpenditure = (buyerUser.totalExpenditure || 0) + totalPrice;
        await buyerUser.save();

        const index = buyerUser.cart.findIndex((courseid) => courseId.toString() === courseid.toString());
        buyerUser.cart.splice(index, 1);  
        await buyerUser.save();

        const buyerUserResponse = await User.findById(_id).populate('coursesCreated').populate('coursesBought').populate('cart');

        // Update the seller's total income
        const seller = await User.findById(course.createdBy);
        seller.totalIncome = (seller.totalIncome || 0) + totalPrice;
        await seller.save();

        return res.status(200).json({ order, user: buyerUserResponse });
    } catch (err) {
        console.log("error in buyCourse", err.message);
        res.status(400).json({ 'Error in buyCourse': err.message });
    }
});


app.get('/razorpayOrders', async (req, res) => {
    try {
        // Fetch all orders from Razorpay
        const orders = await razorpay.orders.all();

        // Return the orders as JSON response
        res.status(200).json({orders});
    } catch (error) {
        console.error('Error fetching Razorpay orders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.post('/refundOrder/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;

        // Make an API call to Razorpay refund endpoint
        const refundResponse = await axios.post(`https://api.razorpay.com/v1/payments/${orderId}/refund`, {
            amount: 5000,  // Refund amount in paise
            speed: 'normal'  // Refund speed
        }, {
            auth: {
                username: 'rzp_test_VeJyusQck4J2MV',
                password: 'zWXLwM76hLujfIEhwJ9OL7Xl'
            }
        });

        // Check if the refund was successful
        if (refundResponse.data.status === 'processed') {
            // Refund was successful
            res.status(200).json({ success: true, message: 'Order refunded successfully' });
        } else {
            // Refund failed
            res.status(400).json({ success: false, message: 'Order refund failed' });
        }
    } catch (error) {
        console.error('Error refunding order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.listen(PORT, () => {
    console.log(`User-Service at ${PORT}`);
});
