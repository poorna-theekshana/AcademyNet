import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { buyCourse } from "../../redux/actions/userAction";
import { loadStripe } from "@stripe/stripe-js";

const Payment = (props) => {
  const history = useHistory();
  const store = useSelector((store) => store.userRoot);
  const dispatch = useDispatch();
  const [courseId, setCourseId] = useState("");
  const [course, setCourse] = useState({});
  const apiURL = `http://localhost:5000`;

  useEffect(() => {
    setCourseId(props.match.params.courseId);
  }, [props.match.params.courseId]);

  useEffect(() => {
    const curr_course = store.user.cart.find((obj) => {
      return obj._id === props.match.params.courseId;
    });
    setCourse(curr_course);
  }, []);

  console.log(courseId);

  useEffect(() => {
    localStorage.setItem("courseIdToBuy", courseId);
  }, [courseId]);

  const clickHandler = (courseId) => {
    dispatch(buyCourse(courseId, history));
  };

  const makepayment = async () => {
    const stripe = await loadStripe(
      "pk_test_51PEzaQKTplEsuRF9QUQX1R4VlYgMcLxiZvEFI9ZLHTia1VeUas4J3D6pYPdGyFRmQ2h4gh0RXZXOv3Cw6YhT2Ec400xZM8edwd"
    );

    const body = {
      course: course,
    };

    const response = await fetch(`${apiURL}/create-checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorResponse = await response.text();
      console.error("Failed to fetch:", errorResponse);
      throw new Error("Network response was not ok: " + errorResponse);
    }

    const session = await response.json();

    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });
    if (result.error) {
      console.error("Error in redirect to checkout:", result.error.message);
    }
  };

  return (
    <div className="container" style={{ marginTop: "100px" }}>
      <div className="row">
        <div className="col-md-4 offset-md-4 border">
          {course ? (
            <div class="card-body">
              <h5 class="card-title">{course.title}</h5>
              <h5 class="card-title">Price: {course.price}$</h5>
              <h6 class="card-title">Duration: {course.duration} minute</h6>
              <h6 class="card-title">Category: {course.category}</h6>
              <p class="card-text">{course.description}</p>
              <button
                onClick={makepayment}
                type="button"
                class="btn btn-primary"
              >
                Proceed to Pay with Stripe
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Payment;
