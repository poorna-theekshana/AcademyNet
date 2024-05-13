import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { allCourses } from "../redux/actions/userAction";
import Navbar from "../components/Navbar";
import Card from "../components/Card";

const Home = () => {
  const dispatch = useDispatch();
  const store = useSelector((store) => store.userRoot); // Assuming userRoot has user data
  const coursesStore = useSelector((store) => store.courseRoot); // Assuming courseRoot has courses data
  const [courses, setAllCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    dispatch(allCourses());
    setIsLoading(true);
  }, [dispatch]);

  useEffect(() => {
    if (coursesStore.allCourse.length !== 0) {
      setAllCourses(coursesStore.allCourse);
      setIsLoading(false);
    }
  }, [coursesStore.allCourse]);

  return (
    <>
      <Navbar />
      <div className="container" style={{ marginTop: "100px" }}>
        {/* Welcome message and app description */}
        <div className="row">
          <div className="col-12 text-center">
            <h1>Welcome, {store.user.name}!</h1>
            <p>
              Explore our wide range of courses and expand your knowledge with
              AcademyNet.
            </p>
            <hr />
          </div>
        </div>
        <div className="row justify-content-center">
          {isLoading ? (
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          ) : (
            courses.map((data, index) => <Card key={index} course={data} />)
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
