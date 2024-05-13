import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getAllQuizzes, submitAnswers, getUserQuizzes, deleteUserQuiz  } from '../../redux/actions/userAction'; // Import getUserQuizzes action

const QuizList = () => {
    const dispatch = useDispatch();
    const store = useSelector(store => store.courseRoot);
    const [courses, setCourses] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState({}); // State to track selected answers
    const userId = 'user123'; // Placeholder user ID, replace with actual user ID

    useEffect(() => {
        // Dispatch action to get quizzes and user's quizzes
        dispatch(getAllQuizzes());
        dispatch(getUserQuizzes());
    }, [dispatch]);

    useEffect(() => {
        setCourses(store.allCourse);
    }, [store.allCourse]);

    
    useEffect(() => {
        if (store.userQuizzes) {
            setQuizzes([store.userQuizzes.quizId]);
        }
    }, [store.userQuizzes]);
    
    

    // Get the array of quiz IDs submitted by the user

    const handleAnswerSelect = (quizId, questionIndex, optionIndex) => {
        // Update the selected answer in the component's state
        setSelectedAnswers(prevState => ({
            ...prevState,
            [quizId]: {
                ...(prevState[quizId] || {}),
                [questionIndex]: optionIndex
            }
        }));
    };

    const handleSubmitQuiz = (quizId) => {
        // Dispatch action to submit answers
        dispatch(submitAnswers(userId, quizId, selectedAnswers));
    };
   console.log(store.allCourse);
   console.log(store.userQuizzes);

   const ss = store.userQuizzes
   const quizIds = ss?.submittedQuizzes?.map(submittedQuiz => submittedQuiz.quizId) || [];
   console.log("quizId2:", quizIds);
  

    // Function to check if a quiz has already been completed by the user
// Function to check if a quiz has already been completed by the user
const isQuizSubmitted = (quizId) => {
    console.log("quizzes:", ss);
    console.log("quizId:", quizId);
    return quizIds.includes(quizId);
};

const handleRetakeQuiz = (quizId) => {
    // Dispatch action to delete the quiz for retaking
    dispatch(deleteUserQuiz(quizId));
};

console.log(isQuizSubmitted);

    return (
        <div className="container">
            <h2 className="my-4">All Quizzes</h2>
            {courses.map(quiz => (
                <div key={quiz._id} className="card mb-4">
                    <div className="card-body">
                        <h3 className="card-title">{quiz.title}</h3>
                        <ul className="list-group">
                            {quiz.questions.map((question, questionIndex) => (
                                <li key={question._id} className="list-group-item">
                                    <strong>{question.questionText}</strong>
                                    <div className="row">
                                        {question.options.map((option, optionIndex) => (
                                            <div key={option._id} className="col-md-6 mt-2">
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        onChange={() => handleAnswerSelect(quiz._id, questionIndex, optionIndex)}
                                                        disabled={isQuizSubmitted(quiz._id)} // Disable if quiz is already submitted
                                                    />
                                                    <label className="form-check-label">{option.optionText}</label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </li>
                            ))}
                        </ul>
                        {isQuizSubmitted(quiz._id) && (
                            <button className="btn btn-primary mt-3" onClick={() => handleRetakeQuiz(quiz._id)}>Retake Quiz</button>
                        )}
                        {!isQuizSubmitted(quiz._id) && (
                            <button className="btn btn-primary mt-3" onClick={() => handleSubmitQuiz(quiz._id)}>Submit Quiz</button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default QuizList;
