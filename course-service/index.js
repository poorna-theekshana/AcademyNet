const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 8080;
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
  process.env.MONGO_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  () => {
    console.log(`Course-Service DB Connected`);
  }
);


// Add Course
app.post('/addCourse', passport.authenticate('jwt', { session: false }), upload.single('file'), async (req, res) => {
    try {
        const { _id } = req.user;
        const { title, category, description, price } = req.body;

        const convertedBuffer = await bufferConversion(req.file.originalname, req.file.buffer);
        const uploadedImage = await cloudinary.uploader.upload(convertedBuffer, { resource_type: "image" });
        const course = new Course({
            title,
            category,
            description,
            file: null, // Set file to null
            image: uploadedImage.secure_url,
            price,
            createdBy: _id,
            duration: 0,
            approve: false // Set approve to false
        });
        await course.save();
        const user = await User.findById(_id);
        user.coursesCreated.push(course._id);
        await user.save();
        res.status(200).json({ message: course });
    } catch (err) {
        console.log("Error in addCourse", err.message);
        res.status(400).json({ error: 'Error in addCourse', message: err.message });
    }
});


// All Courses
app.get('/getAllCourse', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { _id } = req.user;
        const user = await User.findById(_id)
            .populate('coursesCreated')
            .populate('coursesBought')
            .populate('cart');

        const allApprovedCourses = await Course.find({ approve: true }).populate('createdBy');

        if (allApprovedCourses.length === 0) {
            return res.status(400).json({ message: "No approved courses found" });
        }

        return res.status(200).json({ message: allApprovedCourses, user });
    } catch (err) {
        console.log("Error in getAllCourse", err.message);
        res.status(400).json({ 'Error in getAllCourse': err.message });
    }
});


// NON APPROVED COURSES
app.get('/getAllCourseNot', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { _id } = req.user;
        const user = await User.findById(_id)
            .populate('coursesCreated')
            .populate('coursesBought')
            .populate('cart');

        const allApprovedCourses = await Course.find({ approve: false }).populate('createdBy');

        if (allApprovedCourses.length === 0) {
            return res.status(400).json({ message: "No approved courses found" });
        }

        return res.status(200).json({ message: allApprovedCourses, user });
    } catch (err) {
        console.log("Error in getAllCourse", err.message);
        res.status(400).json({ 'Error in getAllCourse': err.message });
    }
});

// Update Course Approval
app.put('/updateCourseApproval/:courseId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { _id } = req.user;
        const { courseId } = req.params;
        const { approve } = req.body;

        // Check if the user has permission to update course approval
        const user = await User.findById(_id);
        if (!user) {
            return res.status(403).json({ error: 'You do not have permission to update course approval' });
        }

        // Find the course by ID and update its approval status
        const course = await Course.findByIdAndUpdate(courseId, { approve }, { new: true });

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        return res.status(200).json({ message: 'Course approval updated successfully', course });
    } catch (err) {
        console.log("Error in updateCourseApproval", err.message);
        res.status(400).json({ error: 'Error in updateCourseApproval', message: err.message });
    }
});




// Course Details by ID
app.get('/getCourseById/:courseId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { courseId } = req.params
        const course = await Course.findOne({ _id: courseId }).populate('createdBy')
        return res.status(200).json({ message: course })
    }
    catch (err) {
        console.log("error in courseDetailsById", err.message)
        res.status(400).json({ 'Error in courseDetailsById': err.message })
    }
});



app.put('/updateCourse/:courseId', passport.authenticate('jwt', { session: false }), upload.fields([{ name: 'file', maxCount: 1 }, { name: 'image', maxCount: 1 }]), async (req, res) => {
    try {
        const { _id } = req.user;
        const { courseId } = req.params;
        const { title, category, description, price } = req.body;

        // Find the course by ID
        let course = await Course.findById(courseId);

        // Check if the course exists
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Check if a new video file is uploaded
        if (req.files['file']) {
            const videoFile = req.files['file'][0];
            const convertedBuffer = await bufferConversion(videoFile.originalname, videoFile.buffer);
            const uploadedVideo = await cloudinary.uploader.upload(convertedBuffer, { resource_type: "video" });
            const newVideoUrl = uploadedVideo.secure_url;
            // Update the duration if needed
            course.duration = (uploadedVideo.duration / 60).toFixed(2);
            // Add the new video URL to the array
            if (course.file === null) {
                course.file = [];
            }
            // Add the new video URL to the array
            course.file.push(newVideoUrl);
        }

        // Check if a new image file is uploaded
        if (req.files['image']) {
            const imageFile = req.files['image'][0];
            const convertedBuffer = await bufferConversion(imageFile.originalname, imageFile.buffer);
            const uploadedImage = await cloudinary.uploader.upload(convertedBuffer, { resource_type: "image" });
            const newImageUrl = uploadedImage.secure_url;
            // Set the new image URL
            course.image = newImageUrl;
        }

        // Update course details
        course.title = title;
        course.category = category;
        course.description = description;
        course.price = price;

        // Save the updated course
        await course.save();

        res.status(200).json({ message: 'Course updated successfully', course });
    } catch (err) {
        console.log("Error in updateCourse", err.message);
        res.status(400).json({ error: 'Error in updateCourse', message: err.message });
    }
});




// Delete Course
app.delete('/deleteCourse/:courseId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { _id } = req.user;
        const { courseId } = req.params;

        // Find the course by ID
        const course = await Course.findById(courseId);

        // Check if the course exists
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }


        // Delete the course
        await Course.findByIdAndDelete(courseId);

        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (err) {
        console.log("Error in deleteCourse", err.message);
        res.status(400).json({ error: 'Error in deleteCourse', message: err.message });
    }
});


app.delete('/deleteCourseVideo/:courseId/:videoIndex', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { courseId, videoIndex } = req.params;
        const { _id } = req.user;

        // Find the course by ID
        const course = await Course.findById(courseId);

        // Check if the course exists
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        // Check if the video index is valid
        if (videoIndex < 0 || videoIndex >= course.file.length) {
            return res.status(404).json({ error: 'Video index out of range' });
        }

        // Remove the video at the specified index from the course file array
        course.file.splice(videoIndex, 1);
        // Save the updated course
        await course.save();

        res.status(200).json({ message: 'Video deleted successfully' });
    } catch (err) {
        console.log("Error in deleteCourseVideo", err.message);
        res.status(400).json({ error: 'Error in deleteCourseVideo', message: err.message });
    }
});

app.post('/createQuiz', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { courseId, questions } = req.body;
        const { _id: userId } = req.user;

        // Convert courseId to mongoose ObjectId
        const courseIdObjectId = mongoose.Types.ObjectId(courseId);

        // Check if questions is an array
        if (!Array.isArray(questions)) {
            return res.status(400).json({ error: 'Questions must be an array' });
        }

        // Check if any question is missing questionText or options
        const invalidQuestions = questions.some(question => !question.questionText || !Array.isArray(question.options));
        if (invalidQuestions) {
            return res.status(400).json({ error: 'Each question must have questionText and options as an array of objects' });
        }

        // Create new quiz document
        const formattedQuestions = questions.map(question => ({
            questionText: question.questionText,
            options: question.options.map(option => ({ optionText: option.optionText, isCorrect: option.isCorrect })) // Mapping to embed option documents
        }));

        // Create new quiz document
        const quiz = new Quiz({
            course: courseIdObjectId,
            user: userId,
            questions: formattedQuestions
        });

        // Save the quiz to the database
        await quiz.save();

        res.status(200).json({ message: 'Quiz created successfully', quiz });
    } catch (error) {
        console.error('Error creating quiz:', error);
        res.status(500).json({ error: 'Error creating quiz', message: error.message });
    }
});



app.get('/quizzes/:courseId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { _id } = req.user;
        const { courseId } = req.params;

        // Find quizzes by courseId and populate the 'course' field
        const quizzes = await Quiz.find({ course: courseId });

        if (quizzes.length === 0) {
            return res.status(400).json({ message: "No course Found" });
        }

        return res.status(200).json({ message: quizzes });
    } catch (err) {
        console.log("error in getAllCourse", err.message);
        res.status(400).json({ 'Error in getAllCourse': err.message });
    }
});

app.delete('/quizzes/:quizId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { _id } = req.user;
        const { quizId } = req.params;

        // Find the quiz by ID
        const quiz = await Quiz.findById(quizId);

        // Check if the quiz exists
        if (!quiz) {
            return res.status(404).json({ error: 'Quiz not found' });
        }

        // Ensure that the quiz belongs to the user
        if (quiz.user.toString() !== _id.toString()) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Delete the quiz
        await Quiz.findByIdAndDelete(quizId);

        res.status(200).json({ message: 'Quiz deleted successfully' });
    } catch (err) {
        console.log("Error in deleteQuiz", err.message);
        res.status(400).json({ error: 'Error in deleteQuiz', message: err.message });
    }
});


app.get('/user/quizzes', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // Extract the user ID from the authenticated user
        const userId = req.user._id;

        // Fetch the user from the database including their submitted quizzes
        const user = await User.findById(userId).populate('quizzes');

        // Extract the submitted quizzes from the user object
        const submittedQuizzes = user.quizzes.map(quiz => ({
            quizId: quiz.quizId,
            quizCourse: quiz.courseId,
            quizMarks: quiz.marks
        }));

        res.status(200).json({ submittedQuizzes });
    } catch (error) {
        console.error('Error fetching user quizzes:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



app.get('/quizzesList/:courseId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { courseId } = req.params;

        // Find quizzes by courseId and populate the 'course' field
        const quizzes = await Quiz.find({ course: courseId });

        if (quizzes.length === 0) {
            return res.status(404).json({ message: "No quizzes found for the provided courseId" });
        }

        return res.status(200).json({ quizzes });
    } catch (err) {
        console.log("Error in fetching quizzes by courseId:", err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/user/details', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // Fetch all users from the database
        const { _id } = req.user;
        const users = await User.find();

        // Prepare an array to store user details
        const userDetails = [];

        // Iterate over each user to extract required details
        for (const user of users) {
            // Extract user details
            const { name, email } = user;

            // Extract submitted quizzes details for the user
            const submittedQuizzes = [];
            for (const quiz of user.quizzes) {
                const quizDetails = await Quiz.findOne({ user: _id, _id: quiz.quizId })
                    .populate('course');
            
                if (quizDetails) {
                    submittedQuizzes.push({
                        quizId: quizDetails._id,
                        quizCourse: quizDetails.course.title, // Assuming the course title is stored in the 'title' field of the Course model
                        quizMarks: quiz.marks
                    });
                } else {
                    console.log(`Quiz with ID ${quiz.quizId} not found for user ${_id}`);
                }
            }
            

            // Push user details along with submitted quizzes details to userDetails array
            userDetails.push({
                name,
                email,
                submittedQuizzes
            });
        }

        res.status(200).json({ userDetails });
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Course-Service at ${PORT}`);
});
