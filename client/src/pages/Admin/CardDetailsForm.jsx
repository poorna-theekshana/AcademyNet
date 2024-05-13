import React, { useState } from 'react';
import { buyCourse } from '../../redux/actions/userAction';

const CardDetailsForm = ({ courseId, onBuyCourse }) => {
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCVV] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        try {
            // Call the onBuyCourse function with the course ID and card details
            await buyCourse(courseId, cardNumber, expiryDate, cvv);
        } catch (error) {
            console.error('Error:', error.message);
            setErrorMessage('An error occurred while processing your payment. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <br /><br /><br />
            <div className="form-group">
                <label htmlFor="cardNumber">Card Number</label>
                <input type="text" className="form-control" id="cardNumber" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
            </div>
            <div className="form-group">
                <label htmlFor="expiryDate">Expiry Date</label>
                <input type="text" className="form-control" id="expiryDate" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            </div>
            <div className="form-group">
                <label htmlFor="cvv">CVV</label>
                <input type="text" className="form-control" id="cvv" value={cvv} onChange={(e) => setCVV(e.target.value)} />
            </div>
            {errorMessage && <div className="text-danger">{errorMessage}</div>}
            <button type="submit" className="btn btn-primary">Proceed to PayHere</button>
        </form>
    );
};

export default CardDetailsForm;
