import axios from 'axios'
import setAuthToken from '../helper/setAuthToken'
import jwt_decode from 'jwt-decode'

export const spinnerHelper = (data) => {
    return {
        type: "SPINNER_HELPER",
        payload: data
    }
}

export const userLoginHelper = (data) => {
    return {
        type: "SET_USERS_DATA",
        payload: data
    }
}

const userLogoutHelper = (data) => {
    return {
        type: "DELETE_USERS_DATA",
        payload: data
    }
}


const registerLoaderFlagHelper = (data) => {
    return {
        type: "SET_REGISTER_LOADER",
        payload: data
    }
}

export const userRegister = (userRegisterCredentials,history) => {
    return async (dispatch) => {
        try {
            const { data } = await axios({
                method: "Post",
                url: "http://localhost:5000/register",
                data: userRegisterCredentials
            })
            dispatch(registerLoaderFlagHelper(true))
            history.push('/')
        }
        catch (err) {
            dispatch({
                type:"SET_REGISTER_ERRORS",
                payload: err.response.data
            })
            console.log("Error in userRegister Action", err.message)
        }
       
    }
}

export const userLogin = (userLoginCredentials,history) => {
    return async (dispatch) => {
        try {
        
            const { data } = await axios({
                method: "Post",
                url: "http://localhost:5000/login",
                data: userLoginCredentials
            })
            
            const { token } = data
            localStorage.setItem('userJwtToken', token);
            setAuthToken(token);
            const decoded = jwt_decode(token);
            dispatch(userLoginHelper(decoded.user))
            history.push('/home')
        }
        catch (err) {
            dispatch({
                type: "SET_LOGIN_ERRORS",
                payload: err.response.data
            })
            console.log("Error in userLogin Action", err.message)
        }

    }
}


export const getOTP = (userEmail) => {
    return async (dispatch) => {
        try {
            await axios({
                method: 'Post',
                url: 'http://localhost:5000/forgotPassword',
                data: userEmail
            })
            alert("Otp has been sent to your email")
            dispatch({
                type: "SET_FORGOT_PASSWORD_HELPER_FLAG",
                payload: true
            })
        }
        catch (err) {
            dispatch({
                type: "SET_FORGOT_PASSWORD_ERRORS",
                payload: err.response.data
            })
            console.log("Error in getOTPUser", err.message)
        }
    }
}

export const submitOTP = (newPasswordWithOtp, history) => {
    return async (dispatch) => {
        try {
            const { data } = await axios({
                method: 'Post',
                url: "http://localhost:5000/postOTP",
                data: newPasswordWithOtp
            })
            alert("Password Update, kindly login with updated password")
            history.push('/')
        }
        catch (err) {
            dispatch({
                type: "SET_FORGOT_PASSWORD_ERRORS",
                payload: err.response.data
            })
            console.log("Error in submitOTP", err.message)
        }
    }
}

export const updatePassword = (passwordData,history) => {
    return async (dispatch) => {
        try {
            const { data } = await axios({
                method: 'Post',
                url: "http://localhost:5000/updatePassword",
                data: passwordData
            })
            alert("Password Updated Successfully")
            history.push('/profile')
        }
        catch (err) {
            dispatch({
                type: "SET_UPDATE_PASSWORD_ERROR",
                payload: err.response.data
            })
        }
    }
}


export const addCourse = (courseCredentials,history) => {
    return async (dispatch) => {
        try {
            const config = {
                headers: { 'content-type': 'multipart/form-data' }
            }
            const { data } = await axios({
                method: "Post",
                url: "http://localhost:8080/addCourse",
                data: courseCredentials,
                config
            })
            dispatch({
                type: "SET_ADD_COURSE_FLAG",
                payload: true
            })
            alert("Course Added successfully")
            history.push('/home')
            
        }
        catch (err) {
            console.log("Error in addCourse Action", err.message)
        }

    }
}

export const allCourses = () => {
    return async (dispatch) => {
        try {
            const { data } = await axios({
                method: "Get",
                url: `http://localhost:8080/getAllCourse`,
            })
            dispatch({
                type: "SET_ALL_COURSES",
                payload: data.message
            })
        }
        catch (err) {
            console.log("Error in all Course Action", err.message)
        }

    }
}

export const allCoursesNot = () => {
    return async (dispatch) => {
        try {
            const { data } = await axios({
                method: "Get",
                url: `http://localhost:8080/getAllCourseNot`,
            })
            dispatch({
                type: "SET_ALL_COURSES",
                payload: data.message
            })
        }
        catch (err) {
            console.log("Error in all Course Action", err.message)
        }

    }
}

export const getAllQuizzes = (courseId) => {
    return async (dispatch) => {
        try {
            const { data } = await axios({
                method: "Get",
                url: `http://localhost:8080/quizzes/${courseId}`,
            })
            dispatch({
                type: "SET_ALL_USERDETAILS1",
                payload: data.message
            })
        }
        catch (err) {
            console.log("Error in all Course Action", err.message)
        }

    }
}

export const addToCart = (courseId) => {
    return async (dispatch) => {
        try {
            const { data } = await axios({
                method: "Get",
                url: `http://localhost:8000/addToCart/${courseId}`,
            })
           
            dispatch(userLoginHelper(data.message))
        }
        catch (err) {
            console.log("Error in addCourse Action", err.message)
        }

    }
}

export const buyCourse = (courseId,history) => {
    return async (dispatch) => {
        try {
            const { data } = await axios({
                method: "Get",
                url: `http://localhost:5000/buyCourse/${courseId}`,
            })
            dispatch(userLoginHelper(data.message))
            alert("payment successfull")
            history.push('/myCourses')
        }
        catch (err) {
            console.log("Error in addCourse Action", err.message)
        }

    }
}


export const myCourses = () => {
    return async (dispatch) => {
        try {
            const { data } = await axios({
                method: "Get",
                url: `http://localhost:8000/userCourses`,
            })
            const { message } = data
            dispatch(userLoginHelper(message))
        }
        catch (err) {
            console.log("Error in addCourse Action", err.message)
        }

    }
}


export const myRazorPayments = () => {
    return async (dispatch) => {
        try {
            const { data } = await axios({
                method: "Get",
                url: `http://localhost:5000/razorpayOrders`,
            })
            dispatch({
                type: "SET_ALL_COURSES",
                payload: data.orders
            })
        }
        catch (err) {
            console.log("Error in transactions Action", err.message)
        }

    }
}

export const courseDetailsById = (courseId) => {
    return async (dispatch) => {
        try {
            const { data } = await axios({
                method: "Get",
                url: `http://localhost:8080/getCourseById/${courseId}`,
            })
            const { message } = data
            dispatch({
                type: "SET_SINGLE_COURSE",
                payload: message
            })
        }
        catch (err) {
            console.log("Error in addCourse Action", err.message)
        }

    }
}

export const askQuestion = (courseId, videoIndex, question) => {
    return async (dispatch) => {
        try {
            const { data } = await axios.post(`http://localhost:8000/commentOnQna/${courseId}/${videoIndex}`, { question });
            const { message } = data;
            dispatch({
                type: "SET_SINGLE_COURSE",
                payload: message.course
            });
            alert("Question submitted. Go to Q&A section for discussions.");
        } catch (err) {
            console.log("Error in askQuestion action", err.message);
        }
    };
};



export const userLogout = () => {
    return (dispatch) => {
        localStorage.removeItem('userJwtToken');
        setAuthToken(false);
        dispatch(userLogoutHelper({}));
    }
}


export const updateCourse = (courseId, courseData) => {
    return async (dispatch) => {
        try {
            const { data } = await axios.put(`http://localhost:8080/updateCourse/${courseId}`, courseData);
            alert("Course updated successfully");
           dispatch(allCourses());  // Fetch all courses after updating
        } catch (err) {
            console.log("Error in updateCourse Action", err.message);
        }
    }
}

export const updateCourseApproval = (courseId, approve) => {
    return async (dispatch) => {
        try {
            const { data } = await axios.put(`http://localhost:8080/updateCourseApproval/${courseId}`, { approve });
            alert("Course approval updated successfully");
            dispatch(allCoursesNot()); 
        } catch (err) {
            console.log("Error in updateCourseApproval Action", err.message);
        }
    }
}


export const deleteCourse = (courseId) => {
    return async (dispatch) => {
        try {
            const { data } = await axios.delete(`http://localhost:8080/deleteCourse/${courseId}`);
            alert("Course deleted successfully");
            dispatch(allCourses()); // Fetch all courses after deleting
        } catch (err) {
            console.log("Error in deleteCourse Action", err.message);
        }
    }
}

 
 export const deleteCourseVideo = (courseId, videoIndex) => {
     return async (dispatch) => {
         try {
             const { data } = await axios.delete(`http://localhost:8080/deleteCourseVideo/${courseId}/${videoIndex}`);
             alert("Video deleted successfully");
             dispatch(courseDetailsById(courseId)); // Fetch updated course details after deleting video
         } catch (err) {
             console.log("Error in deleteCourseVideo Action", err.message);
         }
     }
 }
 
 export const deleteQuiz = (quizId) => {
    return async (dispatch) => {
        try {
            // Send a DELETE request to the backend endpoint
            await axios.delete(`http://localhost:8080/quizzes/${quizId}`);
            alert("Quiz deleted successfully");
            dispatch(allCourses()); // Fetch all courses after deleting
         
        } catch (err) {
            console.log("Error in deleteCourseVideo Action", err.message);
        }
    };
 }

export const createdCourses = () => {
    return async (dispatch) => {
        try {
            const { data } = await axios({
                method: "Get",
                url: `http://localhost:8080/courseCreated`,
            })
            const { message } = data
            dispatch(userLoginHelper(message))
        }
        catch (err) {
            console.log("Error in addCourse Action", err.message)
        }

    }
}

export const createQuiz = (courseId, questions) => {
    return async (dispatch) => {
        try {
            // Make a POST request to the backend endpoint
            const response = await axios.post('http://localhost:8080/createQuiz', { courseId, questions });

            // Extract the quiz data from the response
            const { data } = response;

            // Dispatch an action to handle the successful creation of the quiz
            dispatch({
                type: 'CREATE_QUIZ_SUCCESS',
                payload: data.quiz // Assuming the backend returns the created quiz
            });

            // Optionally, you can perform any other actions after creating the quiz
            alert('Quiz created successfully');
        } catch (error) {
            // Dispatch an action to handle errors
            dispatch({
                type: 'CREATE_QUIZ_FAILURE',
                payload: error.message // Assuming you want to handle errors in the Redux state
            });

            console.error('Error creating quiz:', error);
            // Optionally, you can show an error message to the user
            alert('Error creating quiz. Please try again later.');
        }
    };
};

export const submitAnswers = (userId, quizId, answers) => {
    return async (dispatch) => {
        try {
            const response = await axios.post('http://localhost:8000/submit-answers', { userId, quizId, answers });
            // Dispatch any actions you need after successfully submitting answers
            console.log(response.data); // Log response or dispatch actions based on your requirements
        } catch (error) {
            console.error('Error submitting answers:', error);
            // Dispatch any error actions if needed
        }
    };
};

export const getUserQuizzes = () => {
    return async (dispatch) => {
        try {
            // Make a GET request to fetch quizzes array object for the logged-in user
            const response = await axios.get('http://localhost:8080/user/quizzes');

            // Dispatch action to set the user's quizzes
            dispatch({
                type: 'SET_USER_QUIZZES',
                payload: response.data // Assuming the response data contains the quizzes array object
            });
        } catch (error) {
            console.error('Error fetching user quizzes:', error);
        }
    };
};

export const deleteUserQuiz = (quizId) => {
    return async (dispatch) => {
        try {
            const { data } = await axios.delete(`http://localhost:8000/deleteUserQuiz/${quizId}`);
            alert("Quiz deleted successfully");
            dispatch(allCourses()); // Fetch all courses after deleting
        } catch (err) {
            console.log("Error in QuizDelete Action", err.message);
        }
    }
}

export const deleteUserCourse = (courseId) => {
    return async (dispatch) => {
        try {
            const { data } = await axios.delete(`http://localhost:8000/deleteUserCourses/${courseId}`);
            alert("Unenroll course deleted successfully");
            dispatch(myCourses()); // Fetch all courses after deleting
        } catch (err) {
            console.log("Error in deleteCourse Action", err.message);
        }
    }
}
  

export const getUserQuizzesByCourse = (courseId) => {
    return async (dispatch) => {
        try {
            const { data } = await axios({
                method: "Get",
                url: `http://localhost:8080/quizzesList/${courseId}`,
            })
            dispatch({
                type: "SET_ALL_COURSES",
                payload: data.message
            })
        }
        catch (err) {
            console.log("Error in all Course Action", err.message)
        }

    }
}


export const fetchUserDetails = () => {
    return async (dispatch) => {
        try {
            const { data } = await axios.get('http://localhost:8080/user/details'); 
            dispatch({ type: 'SET_ALL_USERDETAILS', payload: data.userDetails });
        } catch (error) {
            console.error('Error fetching user details:', error);
           
        }
    };
};
