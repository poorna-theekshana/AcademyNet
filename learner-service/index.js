const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 8000;
const mongoose = require("mongoose");
const User = require("./user");
const Course = require("./course");
const jwt = require("jsonwebtoken");
const amqp = require("amqplib");
const bufferConversion = require('./utils/bufferConversion')
const cloudinary = require('./utils/cloudinary')
const passport = require('passport')
const bcrypt = require('bcryptjs')
const gravatar = require('gravatar')
const sendEmail = require('./utils/nodemailer')
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const keys = require('./config/keys')
const validateUserLoginInput = require('./validation/userLogin')
const validateUserRegisterInput = require('./validation/userRegister')
const validateOTP = require('./validation/otpValidation')
const validateForgotPassword = require('./validation/forgotPassword')
const validateUserUpdatePassword = require('./validation/updatePassword')
const dotenv = require('dotenv');
dotenv.config()
const cors = require('cors')
const cookieParser = require('cookie-parser');
const morgan = require('morgan')
const initializePassport = require('./config/passport'); // Import Passport configuration
const Quiz = require("./quizSchema");
initializePassport();
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

var channel, connection;

app.use(express.json());
mongoose.connect(
    "mongodb+srv://kpamudu:Pamudu12345$@cluster0.vxpwe1n.mongodb.net/dsProject?retryWrites=true&w=majority&appName=Cluster0",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    () => {
        console.log(`Learner-Service DB Connected`);
    }
);


// User Courses
app.get('/userCourses', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { _id } = req.user
        const user = await User.findOne({ _id }).populate('coursesCreated').populate('coursesBought').populate('cart')
        return res.status(200).json({ message: user })
    }
    catch (err) {
        console.log("error in userCourses", err.message)
        res.status(400).json({ 'Error in userCourse': err.message })

    }
});


app.delete('/deleteUserCourses/:courseId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { _id } = req.user;
        const courseIdToDelete = req.params.courseId;
        const user = await User.findOne({ _id }).populate('coursesBought');

        // Check if the user has bought the course
        const courseIndex = user.coursesBought.findIndex(course => course._id.equals(courseIdToDelete));

        if (courseIndex !== -1) {
            // Remove the course ID from the coursesBought array
            user.coursesBought.splice(courseIndex, 1);
            await user.save();

            return res.status(200).json({ message: 'Course removed from user coursesBought' });
        } else {
            return res.status(404).json({ message: 'Course not found in user coursesBought' });
        }
    }
    catch (err) {
        console.log("error in deleteUserCourses", err.message);
        res.status(400).json({ 'Error in deleteUserCourses': err.message });
    }
});



// Comment on Q&A
app.post('/commentOnQna/:courseId/:videoIndex', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { name } = req.user;
        const { courseId, videoIndex } = req.params;
        const { question } = req.body;

        // Find the course by ID
        const course = await Course.findOne({ _id: courseId });

        const video = course.file[videoIndex];
        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        // Get the video URL from the file object
        const videoUrl = video;

        // Push the question to the Q&A section of the video
        course.qna.push({ video: videoUrl, sender: name, message: question });

        // Save the updated course
        await course.save();

        res.status(200).json({ message: 'Question added successfully', course });
    } catch (err) {
        console.log("Error in commentOnQna", err.message);
        res.status(400).json({ error: 'Error in commentOnQna', message: err.message });
    }
});



app.post('/submit-answers', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { userId, answers } = req.body;
        const { _id } = req.user;

        for (const [quizId, selectedOptions] of Object.entries(answers)) {
            // Fetch the quiz from the database
            const quiz = await Quiz.findById(quizId);
            if (!quiz) {
                return res.status(404).json({ message: `Quiz with ID ${quizId} not found` });
            }

            // Calculate marks for the quiz
            let marks = 0;
            quiz.questions.forEach((question, questionIndex) => {
                const correctOptionIndex = question.options.findIndex(option => option.isCorrect);
                if (correctOptionIndex !== -1 && selectedOptions[questionIndex] === correctOptionIndex) {
                    marks++;
                }
            });

            // Update the user's quiz information
            await User.findByIdAndUpdate(_id, {
                $push: {
                    quizzes: {
                        courseId: quiz.courseId,
                        quizId: quizId,
                        marks: marks
                    }
                }
            });
        }

        res.status(200).json({ message: 'Marks updated successfully' });
    } catch (error) {
        console.error('Error submitting answers:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



app.delete('/deleteUserQuiz/:quizId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { _id } = req.user;
        const { quizId } = req.params;

        // Update the user document to remove the quiz
        const user = await User.findByIdAndUpdate(_id, { $pull: { quizzes: { quizId } } });

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ message: 'Quiz deleted successfully' });
    } catch (err) {
        console.error("Error in deleteQuiz:", err.message);
        res.status(400).json({ error: 'Error in deleteQuiz', message: err.message });
    }
});

// Add to Cart
app.get('/addToCart/:courseId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { _id } = req.user
        const { courseId } = req.params
        const user = await User.findById(_id)
        user.cart.push(courseId)
        await user.save()
        const userRes = await User.findById(_id).populate('coursesCreated').populate('coursesBought').populate('cart')
        res.status(200).json({message:userRes})
    }
    catch (err) {
        console.log("error in addToCart", err.message)
        res.status(400).json({ 'Error in addToCart': err.message })
        
    }
});


app.listen(PORT, () => {
    console.log(`Learner-Service at ${PORT}`);
});
