import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import VideoPlayer from '../../components/VideoPlayer';
import { deleteUserCourse, myCourses } from '../../redux/actions/userAction';
import { Link } from 'react-router-dom';
// Import the action creator for deleting a course

const MyCourses = () => {
    const user = useSelector(store => store.userRoot.user);
    const [arr, setArr] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(myCourses());
    }, []);

    useEffect(() => {
        if (user.coursesBought) {
            setArr(user.coursesBought);
        }  
    }, [user]);

    const handleDeleteCourse = (courseId) => {
        dispatch(deleteUserCourse(courseId));
    };

    return (
        <div className="container" style={{ marginTop: "100px" }}>
            <div className="row">
                {arr.length !== 0 && arr.map((course, index) => (
                    <div key={index} className="col-md-4 mb-4">
                        <div className="card">
                            <img src={course.image} className="card-img-top" alt={course.title} />
                            <div className="card-body">
                                <h5 className="card-title">{course.title}</h5>
                                <p className="card-text">{course.description}</p>
                                <p className="card-text"><strong>Price:</strong> {course.price}</p>
                                <p className="card-text"><strong>Duration:</strong> {course.duration} minute(s)</p>
                                <Link to={`/courseDetails/${course._id}`} className="btn btn-info btn-block">View</Link>
                                <button onClick={() => handleDeleteCourse(course._id)} className="btn btn-danger btn-block mt-2">Unenroll Course</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyCourses;
