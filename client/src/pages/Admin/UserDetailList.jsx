import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserDetails } from '../../redux/actions/userAction';

const UserDetailList = () => {
    const dispatch = useDispatch();
    const store = useSelector(store => store.courseRoot);
    const { loading, error, userDetail } = store;

    useEffect(() => {
        dispatch(fetchUserDetails());
    }, [dispatch]);

    return (
        <div className="container py-4">
            <h2 className="mb-4">User Details</h2>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className="text-danger">Error: {error}</p>
            ) : (
                <table className="table table-bordered">
                    <thead className="thead-dark">
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Quizzes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userDetail.map(user => (
                            <tr key={user._id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>
                                    <ul className="list-group">
                                        {user.submittedQuizzes.map(quiz => (
                                            <li key={quiz.quizId} className="list-group-item">
                                                <span className="font-weight-bold">{quiz.quizCourse}</span> - Marks: {quiz.quizMarks}
                                            </li>
                                        ))}
                                    </ul>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default UserDetailList;
