import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { allCoursesNot, deleteCourse, updateCourseApproval } from '../../redux/actions/userAction';
import { Link } from 'react-router-dom'

const NotApprovedCourseList = () => {
    const dispatch = useDispatch();
    const store = useSelector(store => store.courseRoot);
    const [courses, setCourses] = useState([]);
    const history = useHistory();

    useEffect(() => {
        dispatch(allCoursesNot());
    }, [dispatch]);

    useEffect(() => {
        if (store.allCourse.length !== 0) {
            setCourses(store.allCourse);
        }
    }, [store.allCourse]);

    const handleDelete = (courseId) => {
        dispatch(deleteCourse(courseId));
    };

    const handleApprove = (courseId) => {
        dispatch(updateCourseApproval(courseId, true));
    };

    return (
        <div className="container mt-5">
            <br />
            <br />
            <h2 className="mb-4">All Courses</h2>
            <table className="table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Price</th>
                        <th>Duration</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map(course => (
                        <tr key={course._id}>
                            <td>{course.title}</td>
                            <td>{course.category}</td>
                            <td>{course.description}</td>
                            <td>{course.price}$</td>
                            <td>{course.duration} minutes</td>
                            <td>
                                <button className="btn btn-success" onClick={() => handleApprove(course._id)}>Approve</button>
                                <button className="btn btn-danger" onClick={() => handleDelete(course._id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default NotApprovedCourseList;
