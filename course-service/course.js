const mongoose = require('mongoose');
const { Schema } = mongoose;

const courseSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    file: [String], // Array to store multiple video file URLs
    image: {
        type: String,
    }, 
    price: {
        type: String
    },
    duration: {
        type: Number,
        default: 0
    },
    userWhoHasBought: [{
        type: Schema.Types.ObjectId,
        ref: 'user'
    }],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    qna: [{
        video: {
            type: String, // Assuming video is identified by its URL
            required: true
        },
        sender: {
            type: String
        },
        message: {
            type: String
        }
    }],
    approve: {
        type: Boolean,
        default: false // Default value for the approve attribute
    }
});

module.exports = mongoose.model('course', courseSchema);
