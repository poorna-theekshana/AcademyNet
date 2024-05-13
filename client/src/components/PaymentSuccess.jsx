import React, { useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import jwtDecode from "jwt-decode";

const PaymentSuccess = () => {
  const history = useHistory();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get("session_id");
  const courseId = localStorage.getItem("courseIdToBuy");
  const token = localStorage.getItem("userJwtToken");
  let userId;

  console.log("session check", sessionId);

  useEffect(() => {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.id;
    } catch (error) {
      console.error("Token decoding failed:", error);
      alert("Session invalid. Please log in again.");
      history.push("/login");
      return null;
    }

    if (!sessionId || !courseId || !token) {
      console.error("Missing sessionId, courseId, or token.");
      alert("Missing information for finalizing the purchase.");
      history.push("/payment-error");
      return;
    }

    finalizeCoursePurchase(courseId, sessionId, token);
  }, [sessionId, courseId, token, history]);

  const finalizeCoursePurchase = async (courseId, sessionId, token) => {
    try {
      const response = await fetch(
        `http://localhost:5000/buyCourse/${courseId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Make sure the token is correct
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (!response.ok) {
        console.error(`HTTP error status: ${response.status}`);
        const errorText = await response.text();
        alert(`Failed to process your purchase: ${errorText}`);
        history.push("/payment-error");
        return;
      }

      if (response.headers.get("content-type")?.includes("application/json")) {
        const result = await response.json();
        console.log("Purchase successful:", result);
        alert("Purchase successful! Redirecting to your courses.");
        history.push("/myCourses");
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to process your purchase: ${errorText}`);
      }
    } catch (error) {
      console.error("Failed to finalize purchase:", error);
      alert(`Failed to process your purchase: ${error.message}`);
      history.push("/payment-error");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Finalizing your purchase...</h1>
      <p>Please wait while we confirm your payment details...</p>
    </div>
  );
};

export default PaymentSuccess;
