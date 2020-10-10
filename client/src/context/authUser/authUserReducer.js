import {
  USER_CASE_LOADED,
  USER_AUTH_ERROR,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAIL,
  USER_LOGOUT,
  USER_CLEAR_ERRORS,
  USER_LOADED,
} from '../types';

export default (state, action) => {
  switch (action.type) {
    case USER_LOADED:
      return {
        ...state,
        // The code below means, generate new state if the payload have some and the initial state don't have
        ...action.payload,
      };
    case USER_CASE_LOADED:
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        cases: action.payload,
      };
    case USER_LOGIN_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        // The code below means, generate new state if the payload have and the initial state don't have
        ...action.payload,
        isAuthenticated: true,
        loading: false,
      };
    case USER_AUTH_ERROR:
    case USER_LOGIN_FAIL:
    case USER_LOGOUT:
      localStorage.removeItem('token');
      return {
        token: null,
        isAuthenticated: false,
        name: null,
        comName: null,
        comNameTail: null,
        comSymbol: null,
        comAddress: null,
        comPhone: null,
        cases: null,
        loading: false,
        error: action.payload,
      };
    case USER_CLEAR_ERRORS:
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};
