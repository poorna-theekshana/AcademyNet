import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { userLogout } from '../redux/actions/userAction';

const Navbar = () => {
    const user = useSelector(store => store.userRoot.user);
    const history = useHistory();
    const [name, setName] = useState('');
    const [cartLength, setCartLength] = useState(0);
    const [courseLength, setCourseLength] = useState(0);
    const dispatch = useDispatch();
    const logoutHandler = () => {
        dispatch(userLogout());
        history.push('/');
    };

    const Title = "AcademyNet";

    useEffect(() => {
        if (user.name) {
            setName(user.name);
        }
    }, [user]);

    useEffect(() => {
        if (user.cart) {
            setCartLength(user.cart.length);
        }
    }, [user]);

    useEffect(() => {
        if (user.coursesBought) {
            setCourseLength(user.coursesBought.length);
        }
    }, [user]);

    return (
      <div className="container-fluid">
        <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top">
          <h4 className="navbar-brand mt-1">
            <Link to="/home">{Title}</Link>
          </h4>
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              <li className="nav-item active">
                <button type="button" className="btn">
                  <Link to={`/profile`}>
                    <li>{name.toUpperCase()}</li>
                  </Link>
                </button>
              </li>
              {(user.role === "Instructor" || user.role === "Admin") && (
                <li className="nav-item">
                  <button type="button" className="btn">
                    <Link to="/addCourse">
                      <li>CREATE COURSE</li>
                    </Link>
                  </button>
                </li>
              )}
              {(user.role === "Instructor" || user.role === "Admin") && (
                <li className="nav-item">
                  <button type="button" className="btn">
                    <Link to="/createQuiz">
                      <li>CREATE QUIZ</li>
                    </Link>
                  </button>
                </li>
              )}
              {(user.role === "Instructor" || user.role === "Admin") && (
                <li className="nav-item">
                  <button type="button" className="btn">
                    <Link to="/learnerProgress">
                      <li>LEARNER PROGRESS</li>
                    </Link>
                  </button>
                </li>
              )}

              {user.role === "Admin" && ( // Render only for Admin role
                <li className="nav-item">
                  <button type="button" className="btn">
                    <Link to="/notcourseList">
                      <li>APPROVAL LIST</li>
                    </Link>
                  </button>
                </li>
              )}

              {user.role === "Admin" && ( // Render only for Admin role
                <li className="nav-item">
                  <button type="button" className="btn">
                    <Link to="/courseList">
                      <li>COURSE LIST</li>
                    </Link>
                  </button>
                </li>
              )}
              {user.role === "Instructor" && ( // Render only for Admin role
                <li className="nav-item">
                  <button type="button" className="btn">
                    <Link to="/courseCreated">
                      <li>COURSE LIST</li>
                    </Link>
                  </button>
                </li>
              )}
              {user.role === "Admin" && ( // Render only for Admin role
                <li className="nav-item">
                  <button type="button" className="btn">
                    <Link to="/userList">
                      <li>USER LIST</li>
                    </Link>
                  </button>
                </li>
              )}
              {user.role === "Learner" && (
                <li className="nav-item">
                  <button type="button" className="btn">
                    <Link to="/myCourses">
                      <li>MY COURSES {courseLength} </li>
                    </Link>
                  </button>
                </li>
              )}
              {user.role === "Learner" && (
                <li className="nav-item">
                  <button type="button" className="btn">
                    <Link to="/cart">
                      <li> CART {cartLength} </li>
                    </Link>
                  </button>
                </li>
              )}
            </ul>
          </div>
          <div>
            <button
              style={{ listStyle: "None" }}
              onClick={logoutHandler}
              type="button"
              className="btn"
            >
              <li>LOGOUT</li>
            </button>
          </div>
        </nav>
      </div>
    );
};

export default React.memo(Navbar);
