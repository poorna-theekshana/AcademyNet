import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { courseDetailsById } from '../../redux/actions/userAction';
import { Link } from 'react-router-dom';

const CourseDetails = (props) => {
    const dispatch = useDispatch();
    const singleCourse = useSelector(store => store.courseRoot.singleCourse);
    const [course, setCourse] = useState({});

    useEffect(() => {
        dispatch(courseDetailsById(props.match.params.courseId));
    }, [props.match.params.courseId]);

    useEffect(() => {
        if (singleCourse) {
            setCourse(singleCourse);
        }
    }, [singleCourse]);

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <br /><br />
                    {course.file && course.file.map((video, index) => (
                        <div key={index} className="mb-3 d-flex justify-content-center">
                            <div className="card" style={{ width: '18rem' }}>
                                {/* <video width="100%" controls>
                                    <source src={video} type="video/mp4" />
                                </video> */}
                               
                                <div className="card-body text-center">
                                    <h5 className="card-title">Episode {index + 1}</h5>
                                    <p className="card-text">{video.title}</p>
                                    <Link to={`/play-video/${props.match.params.courseId}/${index}`} className="btn btn-primary">Watch Now</Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Link to={`/quizByCourse/${props.match.params.courseId}`} className="btn btn-primary">Quiz</Link>
        </div>
    );
};

export default CourseDetails;
