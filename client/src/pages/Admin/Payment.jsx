import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { buyCourse } from '../../redux/actions/userAction';
import Razorpay from 'razorpay';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';

const Payment = (props) => {
    const history = useHistory();
    const store = useSelector(store => store.userRoot);
    const dispatch = useDispatch();
    const [courseId, setCourseId] = useState("");
    const [course, setCourse] = useState({});
    const [showCardDetails, setShowCardDetails] = useState(false);
    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: ''
    });
    const [validationError, setValidationError] = useState('');

    useEffect(() => {
        setCourseId(props.match.params.courseId);
    }, [props.match.params.courseId]);

    useEffect(() => {
        const curr_course = store.user.cart.find(obj => {
            return obj._id === props.match.params.courseId;
        });
        setCourse(curr_course);
    }, []);

    const handleClick = () => {
        setShowCardDetails(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCardDetails({
            ...cardDetails,
            [name]: value
        });
    };

    const handlePayment = async () => {
        // Fake validation for card details
        if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv) {
            setValidationError('Please fill in all the fields.');
            return;
        }

        // Simulate payment success
        alert('Payment successful!');

        // Dispatch buyCourse action
        dispatch(buyCourse(courseId, history));
    };

    return (
        <>
            <div className="container" style={{ marginTop: "100px" }}>
                <div className="row">
                    <div className="col-md-4 offset-md-4 border">
                        {course ? <div className="card-body">
                            <h5 className="card-title">{course.title}</h5>
                            <h5 className="card-title">Price: {course.price}$</h5>
                            <h6 className="card-title">Duration: {course.duration} minute</h6>
                            <h6 className="card-title">Category: {course.category}</h6>
                            <p className="card-text">{course.description}</p>
                            {!showCardDetails && (
                                <button onClick={handleClick} type="button" className="btn btn-primary">Proceed to Pay with Razorpay</button>
                            )}
                        </div> : null}
                    </div>
                </div>
            </div>
            {showCardDetails &&
                <div className="container mt-4">
                    <div className="row justify-content-center">
                        <div className="col-md-4 border p-4">
                            <h2 className="mb-3">Enter Card Details</h2>
                            <input type="text" name="cardNumber" value={cardDetails.cardNumber} onChange={handleChange} className="form-control mb-3" placeholder="Card Number" />
                            <input type="text" name="expiryDate" value={cardDetails.expiryDate} onChange={handleChange} className="form-control mb-3" placeholder="Expiry Date" />
                            <input type="text" name="cvv" value={cardDetails.cvv} onChange={handleChange} className="form-control mb-3" placeholder="CVV" />
                            {validationError && <div className="text-danger">{validationError}</div>}
                            <button onClick={handlePayment} className="btn btn-primary">Pay Now</button>
                        </div>
                    </div>
                </div>
            }
        </>
    )
};

export default Payment;
