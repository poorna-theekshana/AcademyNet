import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { myCourses , deleteCourse } from '../../redux/actions/userAction';

const InstructorCourseList = () => {
    const user = useSelector(store => store.userRoot.user);
    const [courses, setCourses] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(myCourses());
    }, [dispatch]);

    useEffect(() => {
        if (user.coursesCreated) {
            setCourses(user.coursesCreated);
        }
    }, [user]);

    const handleDelete = (courseId) => {
        dispatch(deleteCourse(courseId));
    };
    return (
        <div className="container" style={{ marginTop: "100px" }}>
            <div className="row">
                <div className="col">
                    <h2>My Courses</h2>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Duration</th>
                                <th>Description</th>
                                <th>Price</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map(course => (
                                <tr key={course._id}>
                                    <td>{course.title}</td>
                                    <td>{course.category}</td>
                                    <td>{course.duration} minutes</td>
                                    <td>{course.description}</td>
                                    <td>{course.price}$</td>
                                    <td>
                                    <Link to={`/updateCourse/${course._id}`} className="btn btn-info btn-block">View </Link>
                                <button className="btn btn-danger" onClick={() => handleDelete(course._id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InstructorCourseList;
