import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { courseDetailsById } from '../../redux/actions/userAction'; // Import the action
import { askQuestion } from '../../redux/actions/userAction'; // Import the askQuestion action

const PlayVideo = () => {
    const dispatch = useDispatch();
    const { courseId, index } = useParams(); // Get courseId and index from params
    const course = useSelector(state => state.courseRoot.singleCourse); // Get course details from Redux store
    const [videoUrl, setVideoUrl] = useState('');
    const [message, setMessage] = useState("");

    useEffect(() => {
        // Dispatch action to fetch course details by courseId
        dispatch(courseDetailsById(courseId));
    }, [dispatch, courseId]);

    useEffect(() => {
        // Set video URL based on the index
        if (course?.file && course.file[index]) {
            setVideoUrl(course.file[index]);
        } else {
            // Handle case where video URL is not found
            setVideoUrl(''); // Set empty URL or show error message
        }
    }, [course, index]);

    const clickHandler = () => {
        dispatch(askQuestion(courseId, index, message)); // Include videoIndex when dispatching askQuestion
        setMessage("");
        window.location.reload(); // Reload the page after asking the question
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Playing Video {parseInt(index) + 1}</h2>
            {videoUrl ? ( // Check if videoUrl is available
                <div className="mb-4">
                    <video width="100%" controls>
                        <source src={videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
            ) : (
                <p>No video found.</p> // Show error message if videoUrl is empty
            )}
      <div className="mb-4">
    <h3 className="mb-3">Q&A Section</h3>
    <div className="card mb-3">
        <div className="card-body">
            {course.qna && course.qna.filter(qna => qna.video === videoUrl).map((obj, idx) => (
                <div key={idx}>
                    <h5 className="card-title">{obj.sender}</h5>
                    <p className="card-text">{obj.message}</p>
                    <br></br>
                </div>
           
            ))}
        </div>
    </div>
</div>

            <div className="mb-4">
                <textarea 
                    onChange={(e) => setMessage(e.target.value)} 
                    value={message} 
                    id="exampleInputPassword1" 
                    className="form-control mb-2"
                    placeholder="Enter your question..."
                />
                <button onClick={clickHandler} type="button" className="btn btn-info">Ask Question</button>
            </div>
        </div>
    );
};

export default PlayVideo;
