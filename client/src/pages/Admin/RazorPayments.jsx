import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RazorPayments = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // Fetch Razorpay orders from the server
    axios.get('http://localhost:5000/razorpayOrders')
      .then((res) => {
        console.log('Response from server:', res.data);
        if (res.status === 200) {
          // Extract the orders from the response
          const { items } = res.data.orders;
          setOrders(items);
        } else {
          console.error('Failed to fetch Razorpay orders');
        }
      })
      .catch((error) => {
        console.error('Error fetching Razorpay orders:', error.message);
      });
  }, []);

  // Function to handle refunding a Razorpay order
  const handleRefundOrder = (orderId) => {
    const requestData = {
      amount: 500, // Example refund amount in paise
      speed: 'normal' // Example refund speed
    };
  
    axios.post(`http://localhost:5000/refundOrder/${orderId}`, requestData)
      .then((res) => {
        console.log('Response from server:', res.data);
        // Refresh the list of orders after refunding the order
        axios.get('http://localhost:5000/razorpayOrders')
          .then((res) => {
            if (res.status === 200) {
              const { items } = res.data.orders;
              setOrders(items);
            } else {
              console.error('Failed to fetch Razorpay orders');
            }
          })
          .catch((error) => {
            console.error('Error fetching Razorpay orders:', error.message);
          });
      })
      .catch((error) => {
        console.error('Error refunding Razorpay order:', error.message);
      });
  };
  

  return (
    <div>
      <br /><br /><br />
      <h2 style={{ textAlign: "center" }}>Razorpay Orders</h2>
      <br />
      <table className="table table-striped">
        <thead>
          <tr>
            <th scope="col">Order ID</th>
            <th scope="col">Amount</th>
            <th scope="col">Currency</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(orders) && orders.length > 0 ? (
            orders.map((order, index) => (
              <tr key={index}>
                <td>{order.id}</td>
                <td>{order.amount}</td>
                <td>{order.currency}</td>
                <td>
                  <button className="btn btn-primary" onClick={() => handleRefundOrder(order.id)}>Refund</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No orders found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RazorPayments;
