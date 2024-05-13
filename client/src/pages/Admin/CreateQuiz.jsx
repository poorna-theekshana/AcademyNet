import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { myCourses, createQuiz } from '../../redux/actions/userAction'; 

const CreateQuiz = () => {
  const dispatch = useDispatch();
  const user = useSelector(store => store.userRoot.user);
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [questions, setQuestions] = useState([{ questionText: '', options: [{ optionText: '', isCorrect: false }, { optionText: '', isCorrect: false }, { optionText: '', isCorrect: false }, { optionText: '', isCorrect: false }] }]);
  const history = useHistory();
  
  useEffect(() => {
    dispatch(myCourses());
}, [dispatch]);

useEffect(() => {
    if (user.coursesCreated) {
        setCourses(user.coursesCreated);
    }
}, [user]);

  const handleQuestionChange = (index, event) => {
    const { name, value } = event.target;
    const newQuestions = [...questions];
    newQuestions[index][name] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.forEach((option, index) => {
      option.isCorrect = index === optionIndex;
    });
    setQuestions(newQuestions);
  };

  const handleOptionTextChange = (questionIndex, optionIndex, event) => {
    const { value } = event.target;
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex].optionText = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { questionText: '', options: [{ optionText: '', isCorrect: false }, { optionText: '', isCorrect: false }, { optionText: '', isCorrect: false }, { optionText: '', isCorrect: false }] }]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    dispatch(createQuiz(courseId, questions));
    setCourseId('');
    setQuestions([{ questionText: '', options: [{ optionText: '', isCorrect: false }, { optionText: '', isCorrect: false }, { optionText: '', isCorrect: false }, { optionText: '', isCorrect: false }] }]);
  };

  return (
    <div className="container mt-5 flex justify-content-center">

      <br></br><br></br>
      <h2 className="text-center mb-4">Create Quiz</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="course">Select Course:</label>
          <select id="course" className="form-control col-md-6" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            <option value="">Select a course</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>{course.title}</option>
            ))}
          </select>
        </div>
        {questions.map((question, index) => (
          <div key={index} className="mb-4 col-md-6">
            <label className="question-label">Question {index + 1}:</label>
            <input type="text" className="form-control mb-2 col-md-6" name="questionText" value={question.questionText} onChange={(e) => handleQuestionChange(index, e)} />
   
            <ul className="list-group">
              {question.options.map((option, optionIndex) => (
                <li key={optionIndex} className="list-group-item">
                          
                  <input type="text" value={option.optionText} onChange={(e) => handleOptionTextChange(index, optionIndex, e)} placeholder={`Option ${optionIndex + 1} text`} className="form-control mr-2 col-md-5" />
                  <br></br>
                  <input type="radio" checked={option.isCorrect} onChange={() => handleOptionChange(index, optionIndex)} className="form-check-input ml-2" />
                  <br></br>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <button type="button" onClick={addQuestion} className="btn btn-secondary mr-2">Add Question</button>
        <button type="submit" className="btn btn-primary">Submit Quiz</button>
        <br></br>     <br></br>
      </form>
    </div>
  );
};

export default CreateQuiz;
