import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { askQuestion } from '../redux/actions/userAction';

const VideoPlayer = (props) => {
    const [message, setMessage] = useState("");
    const dispatch = useDispatch();

    const clickHandler = (videoIndex) => {
        dispatch(askQuestion(props.course._id, videoIndex, message)); // Include videoIndex when dispatching askQuestion
        setMessage("");
    };

    return (
        <div className="card ml-5 my-3" style={{ width: "25rem", display: "inline-block" }}>
            {props.course.file.map((video, index) => (
                <div key={index}>
                    <video width="400" controls>
                        <source src={video} type="video/mp4" />
                    </video>
                    <h4 className="card-title"><strong>Title: </strong>{props.course.title}</h4>
                    <h5 className="card-title"><strong>Duration: </strong>{props.course.duration} minute</h5>
                    <h5 className="card-title"><strong>Category: </strong> {props.course.category}</h5> 
                    <Link to={`/courseDetails/${props.course._id}`}>QNA </Link>
                    <textarea 
                        onChange={(e) => setMessage(e.target.value)} 
                        value={message} 
                        id="exampleInputPassword1" 
                        className="form-control"
                    />
                    <button onClick={() => clickHandler(index)} type="button" className="btn btn-info">Ask Question</button>
                </div>
            ))}
        </div>
    );
};

export default VideoPlayer;
