import React, { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CardDetailsForm from './CardDetailsForm';

const stripePromise = loadStripe('your_stripe_public_key');

const PaymentWithElementsProvider = (props) => {
    return (
        <div className="container">
        <h1>Payment Page</h1>
        <Elements stripe={stripePromise}>
            <CardDetailsForm />
        </Elements>
    </div>
    );
};

export default PaymentWithElementsProvider;
