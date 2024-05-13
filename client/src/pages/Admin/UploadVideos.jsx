import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import classnames from 'classnames';
import { addCourse, spinnerHelper } from '../../redux/actions/userAction';
import Navbar from '../../components/Navbar';

const UploadVideos = () => {
    const history = useHistory();
    const store = useSelector(store => store.courseRoot);
    const dispatch = useDispatch();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState(0);
    const [videoFile, setVideoFile] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const categories = [
        { value: "web-development", label: "Web Development" },
        { value: "andriod-development", label: "Android Development" },
        { value: "ui/ux-design", label: "Ui/UX Design" },
        { value: "cooking", label: "Cooking" },
        { value: "graphic-design", label: "Graphic Design" },
    ];

    const fileHandler = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setVideoFile(file);
            const reader = new FileReader();
            reader.onload = function (event) {
                setImageUrl(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const formHandler = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("file", videoFile);
        formData.append("title", title);
        formData.append("price", price);
        formData.append("category", category);
        formData.append("description", description);
        dispatch(addCourse(formData, history));
        setIsLoading(true);
    };

    useEffect(() => {
        if (store.addCourseFlag) {
            setIsLoading(false);
            dispatch(spinnerHelper(false));
        }
    }, [store.addCourseFlag]);

    return (
        <>
            <Navbar />
            <div className="container mt-5">
                <br></br>   <br></br>
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <form noValidate onSubmit={formHandler}>
                            <div className="form-group">
                                <label htmlFor="inputId">Upload Image</label>
                                <div className="custom-file">
                                    <input required className="custom-file-input" type="file" accept="image/*" id="inputId" onChange={fileHandler} />
                                    <label className="custom-file-label" htmlFor="inputId">{imageUrl ? 'Change Image' : 'Choose file'}</label>
                                </div>
                            </div>
                            {imageUrl && (
                                <div className="form-group">
                                    <img src={imageUrl} alt="Uploaded" className="img-thumbnail" style={{ maxWidth: '100%', maxHeight: '200px' }} />
                                </div>
                            )}
                            <div className="form-group">
                                <label htmlFor="titleId">Title</label>
                                <input value={title} onChange={(e) => setTitle(e.target.value)} required type="text" className="form-control" id="titleId" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="categoryId">Category</label>
                                <select value={category} onChange={(e) => setCategory(e.target.value)} className={classnames("form-control")} id="categoryId">
                                    <option>Select</option>
                                    {categories.map((data, index) => (
                                        <option key={index} value={data.value}>{data.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group ">
                                <label htmlFor="descriptionId">Description</label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} type="text" className="form-control" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="priceId">Price</label>
                                <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" className="form-control" />
                            </div>
                            <div className="row justify-content-center">
                                <div className="col-md-1">
                                    {isLoading && (
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="sr-only">Loading...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {!isLoading && <button type="submit" className="btn btn-info mt-3">Upload</button>}
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UploadVideos;
