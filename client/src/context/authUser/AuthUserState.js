import React, { useReducer } from 'react';
import axios from 'axios';
import AuthUserContext from './authUserContext';
import AuthUserReducer from './authUserReducer';

//Global Header for token
import setAuthToken from '../../utils/setAuthToken';

import {
  USER_CASE_LOADED,
  USER_AUTH_ERROR,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAIL,
  USER_LOGOUT,
  USER_CLEAR_ERRORS,
  USER_LOADED,
} from '../types';

const AuthUserState = (props) => {
  //State --------
  const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    name: null,
    comName: null,
    comNameTail: null,
    comSymbol: null,
    comAddress: null,
    comPhone: null,
    cases: null,
    error: null,
  };

  const [state, dispatch] = useReducer(AuthUserReducer, initialState);

  // Get the information of the user
  const loadUser = async () => {
    try {
      const res = await axios.get('/api/auth/user');
      dispatch({ type: USER_LOADED, payload: res.data });
    } catch (err) {
      dispatch({ type: USER_AUTH_ERROR });
    }
  };

  // Load Cases of The user
  const loadCases = async () => {
    try {
      const res = await axios.get('/api/case/user');
      dispatch({
        type: USER_CASE_LOADED,
        payload: res.data,
      });
      // console.log(res.data);
      console.log('Cases loadding success');
    } catch (err) {
      dispatch({ type: USER_AUTH_ERROR });
    }
  };

  // Login User
  const loginUser = async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    try {
      const res = await axios.post('/api/auth/user', formData, config);
      dispatch({
        //Get token
        type: USER_LOGIN_SUCCESS,
        payload: res.data,
      });
      //@ Very important !! Set auth token to the latest token, if not, the following function may take the previous token to login
      if (localStorage.token) {
        setAuthToken(localStorage.token);
      }
      console.log('User Login success');
      // loadCases();
      loadUser();
    } catch (err) {
      dispatch({
        type: USER_LOGIN_FAIL,
        payload: err.response.data.msg,
      });
    }
  };

  // Logout User
  const logoutUser = () => dispatch({ type: USER_LOGOUT });

  // Clear Error
  const clearErrors = () => dispatch({ type: USER_CLEAR_ERRORS });

  //Return -------
  return (
    <AuthUserContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        name: state.name,
        comName: state.comName,
        comNameTail: state.comNameTail,
        comSymbol: state.comSymbol,
        comAddress: state.comAddress,
        comPhone: state.comPhone,
        error: state.error,
        loadCases,
        loginUser,
        logoutUser,
        clearErrors,
      }}
    >
      {props.children}
    </AuthUserContext.Provider>
  );
};
export default AuthUserState;
