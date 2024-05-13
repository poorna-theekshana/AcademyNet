import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getAllQuizzes, submitAnswers, getUserQuizzes, deleteUserQuiz, deleteQuiz } from '../../redux/actions/userAction'; // Import getUserQuizzes action

const QuizListByCourse = () => {
    const dispatch = useDispatch();
    const { courseId } = useParams(); // Get courseId and index from params
    const store = useSelector(store => store.courseRoot);
    const [courses, setCourses] = useState([]);
    const [selectedAnswers, setSelectedAnswers] = useState({}); // State to track selected answers
    const userId = 'user123'; // Placeholder user ID, replace with actual user ID
    const user = useSelector(store => store.userRoot.user);

    useEffect(() => {
        // Dispatch action to get quizzes and user's quizzes
        dispatch(getAllQuizzes(courseId));
        dispatch(getUserQuizzes());
    }, [dispatch, courseId]);

    useEffect(() => {
        setCourses(store.userDetail1);
    }, [store.userDetail1]);

    // Function to check if a quiz has already been completed by the user
    const isQuizSubmitted = (quizId) => {
        const quizIds = (store.userQuizzes?.submittedQuizzes || []).map(submittedQuiz => submittedQuiz.quizId);
        return quizIds.includes(quizId);
    };

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

    const handleRetakeQuiz = (quizId) => {
        // Dispatch action to delete the quiz for retaking
        dispatch(deleteUserQuiz(quizId));
    };

    const handleDeleteQuiz = (quizId) => {
        // Dispatch action to delete the quiz
        dispatch(deleteQuiz(quizId));
    };

    return (
        <div className="container">
            <h2 className="my-4">All Quizzes</h2>
            {courses && courses.map(quiz => {
                const quizMarks = (store.userQuizzes?.submittedQuizzes || [])
                    .filter(submittedQuiz => submittedQuiz.quizId === quiz._id) // Filter submittedQuizzes based on quiz._id
                    .map(submittedQuiz => submittedQuiz.quizMarks) || [];

                return (
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
                                <>
                                    <p>Marks: {quizMarks} / {quiz.questions.length}</p>

                                    <button className="btn btn-primary mt-3" onClick={() => handleRetakeQuiz(quiz._id)}>Retake Quiz</button>
                                </>
                            )}
                            {!isQuizSubmitted(quiz._id) && (
                                <button className="btn btn-primary mt-3" onClick={() => handleSubmitQuiz(quiz._id)}>Submit Quiz</button>
                            )}
                            <br></br>
                            {(user.role === 'Admin' || user.role === 'Instructor') && (
                             <button className="btn btn-danger mt-3" onClick={() => handleDeleteQuiz(quiz._id)}>Delete Quiz</button>
                            )}
                        </div>
                       
                    </div>
                    
                   
                );
            })}
        </div>
    );
};

export default QuizListByCourse;
