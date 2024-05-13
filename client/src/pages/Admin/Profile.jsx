import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Profile = () => {
    const user = useSelector(store => store.userRoot.user);

    return (
        <div className="container mt-5">
            <br></br><br></br><br></br>
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            <div className="text-center">
                                <img src={user.avatar} alt="Avatar" className="img-fluid rounded-circle mb-3" style={{ width: '150px' }} />
                                <h2 className="card-title">{user.name}</h2>
                                <p className="card-text">{user.email}</p>
                            </div>
                            <hr />
                            <div>
                                {(user.role === 'Admin' || user.role === 'Instructor') && (
                                    <h5>Own Courses: {user.coursesCreated && user.coursesCreated.length}</h5>
                                )}
                                 {(user.role === 'Admin' || user.role === 'Instructor') && (
                                <h5>Total Earnings: {user.totalIncome}</h5>
                            )}
                                {(user.role === 'Admin' || user.role === 'Learner') && (
                                    <h5>Total Course Bought: {user.coursesBought && user.coursesBought.length}</h5>
                                )}
                                 {(user.role === 'Admin' || user.role === 'Learner') && (
                                <h5>Total Expenditures: {user.totalExpenditure}</h5>
                                 )}
                                  {(user.role === 'Admin' || user.role === 'Learner') && (
                                <h5>Total Quizzes Done: {user.quizzes.length}</h5>
                            )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
