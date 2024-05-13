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
dotenv.config();
const initializePassport = require('./config/passport'); 
initializePassport(); 
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const cors = require('cors')
const cookieParser = require('cookie-parser');
const morgan = require('morgan')
app.use(express.urlencoded({ extended: false }))
app.use(express.json());
app.use(cookieParser())
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
  })
);
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
            role,
            active: true
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

        // Check if the user is active
        if (!user.active || user.active == null ) {
            errors.account = "Your account is not active. Please contact support.";
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


app.put('/users/:userId/deactivate', async (req, res) => {
    try {
        const userId = req.params.userId;

        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update the active status to false
        user.active = false;

        // Save the updated user
        await user.save();

        res.json({ message: 'User deactivated successfully' });
    } catch (err) {
        console.error('Error in deactivating user:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.put('/users/:userId/activate', async (req, res) => {
    try {
        const userId = req.params.userId;

        // Find the user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update the active status to false
        user.active = true;

        // Save the updated user
        await user.save();

        res.json({ message: 'User deactivated successfully' });
    } catch (err) {
        console.error('Error in deactivating user:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/api/:userId/users', async (req, res) => {
    try {
        // Get the _id of the logged-in user
        const _id = req.params.userId;

        // Fetch all users from the database except the logged-in user
        const users = await User.find({ _id: { $ne: _id } });
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/api/users/:userId/role', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { role } = req.body;

        // Validate the role
        if (!['Admin', 'Instructor', 'Learner'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // Find the user by ID and update their role
        const updatedUser = await User.findByIdAndUpdate(userId, { role }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(updatedUser);
    } catch (err) {
        console.error('Error updating user role:', err);
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
app.post('/buyCourse/:courseId',  async (req, res) => {
    try {
        const userId = req.body.userId;
        const { _id } = userId;
        const { courseId } = req.params;
        const course = await Course.findById(courseId);
        console.log("course check", course);


        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        course.userWhoHasBought.push(userId);
        await course.save();

        const buyerUser = await User.findById(userId);
        if (!buyerUser) {
          return res.status(404).json({ error: "User not found" });
        }
        buyerUser.coursesBought.push(courseId);
        buyerUser.totalExpenditure = (buyerUser.totalExpenditure || 0) + parseInt(course.price);
        await buyerUser.save();

        const index = buyerUser.cart.findIndex((courseid) => courseId.toString() === courseid.toString());
        buyerUser.cart.splice(index, 1);  
        await buyerUser.save();

        const buyerUserResponse = await User.findById(userId)
          .populate("coursesCreated")
          .populate("coursesBought")
          .populate("cart");

        const seller = await User.findById(course.createdBy);
        seller.totalIncome = (seller.totalIncome || 0) + parseInt(course.price);
        await seller.save();

        
        return res.status(200).json({ message: course});
    } catch (err) {
        console.log("error in buyCourse", err.message);
        res.status(400).json({ 'Error in buyCourse': err.message });
    }
});

app.post("/create-checkout-session", async (req, res) => {
  const { course } = req.body;
  
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.title,
              description: course.description,
              images: [course.image],
            },
            unit_amount: course.price * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `http://localhost:3000/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3000/home`,
    });

    res.json({ id: session.id });
  } catch (err) {
    console.error("Stripe Checkout Session creation failed:", err);
    res.status(500).send({ error: err.message });
  }
});


app.listen(PORT, () => {
    console.log(`User-Service at ${PORT}`);
});
