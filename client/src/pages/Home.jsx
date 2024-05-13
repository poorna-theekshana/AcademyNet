import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { allCourses } from "../redux/actions/userAction";
import Navbar from "../components/Navbar";
import Card from "../components/Card";

const Home = () => {
  const dispatch = useDispatch();
  const store = useSelector((store) => store.userRoot);
  const coursesStore = useSelector((store) => store.courseRoot);
  const [courses, setAllCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    dispatch(allCourses());
    setIsLoading(true);
  }, [dispatch]);

  useEffect(() => {
    if (coursesStore.allCourse.length !== 0) {
      console.log(coursesStore.allCourse);
      const sortedCourses = [...coursesStore.allCourse].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setAllCourses(sortedCourses);
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
