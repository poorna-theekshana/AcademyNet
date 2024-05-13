import React, { useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import classnames from 'classnames';
import { userRegister } from '../redux/actions/userAction';

const Register = () => {
    const errorRoot = useSelector(store => store.errorRoot);
    const store = useSelector(store => store.userRoot);
    const dispatch = useDispatch();
    const history = useHistory();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('learner'); // Default role is 'learner'
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const formSubmitHandler = (e) => {
        e.preventDefault();
        dispatch(userRegister({ name, email, password, role }, history)); // Include role in the user registration data
        setIsLoading(true);
    };

    useEffect(() => {
        if (errorRoot.registerErrors) {
            setErrors(errorRoot.registerErrors);
        }
    }, [errorRoot.registerErrors]);

    useEffect(() => {
        if (errorRoot.registerErrors || store.registerLoaderFlag) {
            setIsLoading(false);
        }
    }, [errorRoot.registerErrors, store.registerLoaderFlag]);

    return (
        <div className="container">
            <div className="row mt-5">
                <div className="col-md-4 m-auto">
                    <h1 className="display-4 text-center">USER</h1>
                    <form noValidate onSubmit={formSubmitHandler}>
                        <div className="form-group">
                            <label htmlFor="exampleInputEmail1">Email address</label>
                            <input
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                value={email}
                                id="exampleInputEmail1"
                                className={classnames("form-control", { 'is-invalid': errors.email })}
                            />
                            {errors.email && (<div className="invalid-feedback">{errors.email}</div>)}
                        </div>
                        <div className="form-group">
                            <label htmlFor="exampleInputEmail2">Name</label>
                            <input
                                onChange={(e) => setName(e.target.value)}
                                type="text"
                                value={name}
                                id="exampleInputEmail2"
                                className={classnames("form-control", { 'is-invalid': errors.name })}
                            />
                            {errors.name && (<div className="invalid-feedback">{errors.name}</div>)}
                        </div>
                        <div className="form-group">
                            <label htmlFor="exampleInputPassword1">Password</label>
                            <input
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                                value={password}
                                id="exampleInputPassword1"
                                className={classnames("form-control", { 'is-invalid': errors.password })}
                            />
                            {errors.password && (<div className="invalid-feedback">{errors.password}</div>)}
                        </div>
                        <div className="form-group">
                            <label>Role:</label>
                            <div>
                                <input
                                    type="radio"
                                    id="Learner"
                                    name="role"
                                    value="Learner"
                                    checked={role === 'Learner'}
                                    onChange={() => setRole('Learner')}
                                />
                                <label htmlFor="Learner">Learner</label>
                            </div>
                            <div>
                                <input
                                    type="radio"
                                    id="Instructor"
                                    name="role"
                                    value="Instructor"
                                    checked={role === 'Instructor'}
                                    onChange={() => setRole('Instructor')}
                                />
                                <label htmlFor="Instructor">Instructor</label>
                            </div>
                            <div>
                                <input
                                    type="radio"
                                    id="Admin"
                                    name="role"
                                    value="Admin"
                                    checked={role === 'Admin'}
                                    onChange={() => setRole('Admin')}
                                />
                                <label htmlFor="Admin">Admin</label>
                            </div>
                        </div>
                        <div className="row justify-content-center">
                            <div className="col-md-1">
                                {isLoading && <div className="spinner-border text-primary" role="status">
                                    <span className="sr-only">Loading...</span>
                                </div>}
                            </div>
                        </div>
                        {!isLoading && <button type="submit" className="btn btn-info btn-block">Register</button>}
                    </form>
                    <div className="mt-3">
                        <Link to="/">Already User?</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
