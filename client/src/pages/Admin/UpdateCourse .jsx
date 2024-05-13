import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { courseDetailsById, updateCourse, deleteCourseVideo  } from '../../redux/actions/userAction';
import { useParams } from 'react-router-dom';

const UpdateCourse = () => {
    const dispatch = useDispatch();
    const { courseId } = useParams();
    const course = useSelector(state => state.courseRoot.singleCourse);
    const [updatedCourse, setUpdatedCourse] = useState({
        title: '',
        category: '',
        description: '',
        duration: '',
        price: '',
        // Add other fields if needed
    });
    const [videoFile, setVideoFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null); // For displaying the image preview
    const [videoFileName, setVideoFileName] = useState('Choose video file');
    const [imageFileName, setImageFileName] = useState('Choose image file');

    useEffect(() => {
        dispatch(courseDetailsById(courseId));
    }, [dispatch, courseId]);

    useEffect(() => {
        setUpdatedCourse(course || {}); // Set initial values for editing
        if (course && course.image) {
            setImagePreview(course.image); // Set image preview if available
        }
    }, [course]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUpdatedCourse({ ...updatedCourse, [name]: value });
    };

    const handleVideoFileChange = (e) => {
        setVideoFile(e.target.files[0]);
        setVideoFileName(e.target.files[0].name); // Update file name
    };

    const handleImageFileChange = (e) => {
        setImageFile(e.target.files[0]);
        setImageFileName(e.target.files[0].name); // Update file name
        setImagePreview(URL.createObjectURL(e.target.files[0])); // Set image preview
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', updatedCourse.title);
        formData.append('category', updatedCourse.category);
        formData.append('description', updatedCourse.description);
        formData.append('duration', updatedCourse.duration);
        formData.append('price', updatedCourse.price);
        formData.append('file', videoFile);
        formData.append('image', imageFile); // Add image to form data
        // Add other fields if needed
        dispatch(updateCourse(courseId, formData));
    };
    const handleDeleteVideo = (index) => {
        // Dispatch the deleteCourseVideo action with the courseId and videoIndex
        dispatch(deleteCourseVideo(courseId, index));
    };
    

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-md-6 mx-auto">
                    {course && (
                        <>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Title:</label>
                                    <input type="text" name="title" value={updatedCourse.title} onChange={handleChange} className="form-control" />
                                </div>
                                <div className="form-group">
                                    <label>Category:</label>
                                    <input type="text" name="category" value={updatedCourse.category} onChange={handleChange} className="form-control" />
                                </div>
                                <div className="form-group">
                                    <label>Description:</label>
                                    <textarea name="description" value={updatedCourse.description} onChange={handleChange} className="form-control" />
                                </div>
                                <div className="form-group">
                                    <label>Price:</label>
                                    <input type="number" name="price" value={updatedCourse.price} onChange={handleChange} className="form-control" />
                                </div>
                                <div className="form-group">
                                    <label>Duration:</label>
                                    <input type="text" name="duration" value={updatedCourse.duration} onChange={handleChange} className="form-control" />
                                </div>
                                <div className="form-group">
                                    <label>Video:</label>
                                    <div className="custom-file">
                                        <input type="file" name="file" onChange={handleVideoFileChange} className="custom-file-input" id="videoFile" />
                                        <label className="custom-file-label" htmlFor="videoFile">{videoFileName}</label>
                                    </div>
                                </div>
                                {course.file && (
                                    <div style={{ overflowY: 'scroll', maxHeight: '200px',  maxWidth: '400px'}}>
                                        {course.file.map((video, index) => (
                                            <div key={index} style={{ display: 'flex', marginBottom: '10px' }}>
                                                <video width="250" controls>
                                                    <source src={video} type="video/mp4" />
                                                </video>
                                                <button onClick={() => handleDeleteVideo(index)} className="btn btn-danger ml-2" style={{height:"60px"}}>Delete</button>
                                            </div>
                                        ))}
                                    </div>
                                )}


                                <div className="form-group">
                                    <label>Image:</label>
                                    <div className="custom-file">
                                        <input type="file" name="image" onChange={handleImageFileChange} className="custom-file-input" id="imageFile" />
                                        <label className="custom-file-label" htmlFor="imageFile">{imageFileName}</label>
                                    </div>
                                    {imagePreview && <img src={imagePreview} alt="Course Preview" className="mt-2 img-fluid" />} {/* Display image preview */}
                                </div>
                                <button type="submit" className="btn btn-primary">Update</button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpdateCourse;
