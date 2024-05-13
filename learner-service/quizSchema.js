const mongoose = require('mongoose');
const { Schema } = mongoose;

const quizSchema = new Schema({
    course: {
        type: Schema.Types.ObjectId,
        ref: 'course',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        
    },
    questions: [{
        questionText: {
            type: String,
            required: true
        },
        options: [{
            optionText: {
                type: String,
                required: true
            },
            isCorrect: {
                type: Boolean,
                required: true
            }
        }]
    }],
    score: {
        type: Number,
        default: 0
    },
    completedAt: {
        type: Date,
        default: null
    }
});

module.exports = mongoose.model('quiz', quizSchema);
