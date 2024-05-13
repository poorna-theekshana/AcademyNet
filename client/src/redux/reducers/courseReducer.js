const initialState = {
    addCourseFlag: false,
    allCourse: [],
    singleCourse: {},
    userQuizzes: [],
    userDetail: [],
    userDetail1: [],
}


const courseReducer = (state = initialState, action) => {
    switch (action.type) {
        case "SET_ADD_COURSE_FLAG":
            return {
                ...state,
                addCourseFlag: action.payload
            }
        case "SPINNER_HELPER":
            return {
                ...state,
                addCourseFlag: action.payload
            }
        case "SET_SINGLE_COURSE":
            return {
                ...state,
                singleCourse: action.payload
            }
        case "SET_ALL_COURSES":
            return {
                ...state,
                allCourse: action.payload
            }
        case "SET_USER_QUIZZES":
            return {
                ...state,
                userQuizzes: action.payload // Set userQuizzes array in the state
            };
        case "SET_ALL_USERDETAILS":
            return {
                ...state,
                userDetail: action.payload // Set userQuizzes array in the state
            };
        case "SET_ALL_USERDETAILS1":
            return {
                ...state,
                userDetail1: action.payload // Set userQuizzes array in the state
            };
        default:
            return state
    }
}


export default courseReducer