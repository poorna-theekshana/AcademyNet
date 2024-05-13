import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { addToCart } from '../redux/actions/userAction';

const Card = (props) => {
    const store = useSelector(store => store.userRoot);
    const [isDisabled, setIsDisabled] = useState(false);

    const dispatch = useDispatch();

    const addToCartClickHandler = () => {
        dispatch(addToCart(props.course._id));
    };

    useEffect(() => {
        const alreadyAdded = store.user.cart.find(obj => {
            return obj._id === props.course._id;
        });
        if (alreadyAdded) {
            setIsDisabled(true);
        }
    }, [store.user.cart]);

    return (
        <div className="card ml-5 my-3" style={{ width: "20rem", display: "inline-block" }}>
            <img src={props.course.image} className="card-img-top" alt="Course Image" />
            <div className="card-body">
                <h4 className="card-title text-center">Author: <Link to={`/profile`}>{props.course.createdBy.name}</Link></h4>
                <h4 className="card-title"><strong>{props.course.title}</strong></h4>
                <h5 className="card-title"><strong>Sales: </strong>{props.course.userWhoHasBought.length}</h5>
                <h5 className="card-title"><strong>Price: </strong>{props.course.price}$</h5>
                <h6 className="card-title"><strong>Duration: </strong>{props.course.duration} minute</h6>
                <h6 className="card-title"><strong>Category: </strong>{props.course.category}</h6>
                <p className="card-text"><strong>Description: </strong>{props.course.description}</p>
                {store.user._id !== props.course.createdBy._id ? (
                    <button disabled={isDisabled} onClick={addToCartClickHandler} className="btn btn-info btn-block">
                        {isDisabled ? "Already Added" : "Add To Cart"} 
                    </button>
                ) : (
                    <Link to={`/courseDetails/${props.course._id}`} className="btn btn-info btn-block">View </Link>
                )}
            </div>
        </div>
    );
};

export default Card;
