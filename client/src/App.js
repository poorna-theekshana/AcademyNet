import React from 'react';
import {useSelector} from 'react-redux'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import {userLoginHelper, userLogout} from './redux/actions/userAction'
import setAuthToken from './redux/helper/setAuthToken'
import store from './redux/store'

//Components
import RegisterPage from './pages/Register'
import LoginPage from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import Home from './pages/Home'
import Cart from './pages/Admin/Cart'
import Navbar from './components/Navbar'
import Payment from './pages/Admin/Payment'
import MyCourses from './pages/Admin/MyCourses'
import CourseDetails from './pages/Admin/CourseDetails'
import Profile from './pages/Admin/Profile'

//Admin
import UploadVideos from './pages/Admin/UploadVideos'
import CourseList from './pages/Admin/CourseList';
import UpdateCourses from './pages/Admin/UpdateCourse ';
import InstructorCourseList from './pages/Admin/InstructorCourseList';
import PlayVideo from './pages/Admin/PlayVideo';
import CreateQuiz from './pages/Admin/CreateQuiz';
import QuizList from './pages/Admin/QuizList';
import QuizListByCourse from './pages/Admin/QuizListByCourse';
import CardDetailsForm from './pages/Admin/CardDetailsForm';
import PaymentWithElementsProvider from './pages/Admin/PaymentWithElementsProvider';
import NotApprovedCourseList from './pages/Admin/NotApprovedCourseList';
import UserDetailList from './pages/Admin/UserDetailList';
import RazorPayments from './pages/Admin/RazorPayments';
import PaymentSuccess from './components/PaymentSuccess';


if (window.localStorage.userJwtToken) {
  setAuthToken(localStorage.userJwtToken);
  const decoded = jwt_decode(localStorage.userJwtToken);
  store.dispatch(userLoginHelper(decoded.user))
  const currentTime = Date.now() / 1000;
  if (decoded.exp < currentTime) {
    store.dispatch(userLogout());
    window.location.href = '/';
  }
}




function App() {
  const store = useSelector(store => store.userRoot)
  
  return (
    <div className="App">
      <Router>
        {store.isAuthenticated ? <Navbar /> : null}
        <Switch>
          <Route exact path='/' component={LoginPage} />
          <Route exact path='/register' component={RegisterPage} />
          <Route exact path="/forgotPassword" component={ForgotPassword} />
          <Route exact path="/home" component={Home} />
          <Route exact path="/addCourse" component={UploadVideos} />
          <Route exact path="/cart" component={Cart} />
          <Route exact path="/payment/:courseId" component={Payment} />
          <Route exact path="/myCourses" component={MyCourses} />
          <Route exact path="/courseDetails/:courseId" component={CourseDetails} />
          <Route exact path="/profile" component={Profile} />
          <Route exact path="/courseList" component={CourseList} />
          <Route exact path="/courseCreated" component={InstructorCourseList} />
          <Route exact path="/updateCourse/:courseId" component={UpdateCourses} />
          <Route path="/play-video/:courseId/:index" component={PlayVideo} />
          <Route path="/createQuiz" component={CreateQuiz} />
          <Route path="/quizlist" component={QuizList} />
          <Route path="/credit-card-form" component={PaymentWithElementsProvider} />
          <Route path="/quizByCourse/:courseId" component={QuizListByCourse} />
          <Route exact path="/notcourseList" component={NotApprovedCourseList} />
          <Route exact path="/learnerProgress" component={UserDetailList} />
          <Route exact path="/transactions" component={RazorPayments} />
          <Route path="/payment-success" component={PaymentSuccess} />
       
        </Switch>
      </Router>
    </div>
  );
}

export default App;
