import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { courseDetailsById } from "../../redux/actions/userAction";
import { Link } from "react-router-dom";

const CourseDetails = (props) => {
  const dispatch = useDispatch();
  const singleCourse = useSelector((store) => store.courseRoot.singleCourse);
  const [course, setCourse] = useState({});

  useEffect(() => {
    dispatch(courseDetailsById(props.match.params.courseId));
  }, [dispatch, props.match.params.courseId]);

  useEffect(() => {
    if (singleCourse) {
      setCourse(singleCourse);
    }
  }, [singleCourse]);

  return (
    <div className="container mt-5 pt-5">
      <div className="row justify-content-center align-items-center">
        {/* Course Image */}
        <div className="col-md-6 text-center">
          {course.image && (
            <img src={course.image} alt="Course" className="img-fluid mb-3" />
          )}
        </div>

        {/* Course Details and Video List */}
        <div className="col-md-6">
          <h3 className="text-center my-4">Course Videos</h3>
          {course.file &&
            course.file.map((video, index) => (
              <div key={index} className="card mb-3">
                <div className="card-body">
                  <h5 className="card-title">
                    Episode {index + 1}: {video.title}
                  </h5>
                  <Link
                    to={`/play-video/${props.match.params.courseId}/${index}`}
                    className="btn btn-primary"
                  >
                    Watch Now
                  </Link>
                </div>
              </div>
            ))}
          <h2>{course.title}</h2>
          <p>{course.description}</p>
          <p>
            <strong>Category:</strong> {course.category}
          </p>
          <p>
            <strong>Duration:</strong> {course.duration} minutes
          </p>
          <Link
            to={`/quizByCourse/${props.match.params.courseId}`}
            className="btn btn-success mt-2"
          >
            Start Quiz
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
