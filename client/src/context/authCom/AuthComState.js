import React, { useReducer } from 'react';
import axios from 'axios';
import AuthComContext from './authComContext';
import AuthComReducer from './authComReducer';

//Global Header for token
import setAuthToken from '../../utils/setAuthToken';

import {
  COM_REGISTER_SUCCESS,
  COM_REGISTER_FAIL,
  COM_LOADED,
  COM_AUTH_ERROR,
  COM_LOGIN_SUCCESS,
  COM_LOGIN_FAIL,
  COM_LOGOUT,
  COM_CLEAR_ERRORS,
} from '../types';

const AuthComState = (props) => {
  //State --------
  const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    company: null,
    error: null,
  };

  const [state, dispatch] = useReducer(AuthComReducer, initialState);
  // Get the information of the Company
  const loadCom = async () => {
    //Set auth token to the latest token, if you don't set, it may take the previous token to login
    // if (localStorage.token) {
    //   setAuthToken(localStorage.token);
    // }
    try {
      const res = await axios.get('/api/auth/company');
      dispatch({ type: COM_LOADED, payload: res.data });
    } catch (err) {
      dispatch({ type: COM_AUTH_ERROR });
    }
  };

  // Register Company
  const registerCom = async (formData) => {
    console.log('The registerCom function is tritred'); // Test Code
    // Use axios sent out a POST, must use "config" warpping the headers
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    try {
      const res = await axios.post('/registercom', formData, config);

      dispatch({
        //Get token
        type: COM_REGISTER_SUCCESS,
        payload: res.data,
      });
      // If register is success loading the users of the company
      //@ Very important !! Set auth token to the latest token, if not, the following function may take the previous token to login
      if (localStorage.token) {
        setAuthToken(localStorage.token);
      }
      //@ Very important !! Set auth token to the latest token, if not, the following function may take the previous token to login
      if (localStorage.token) {
        setAuthToken(localStorage.token);
      }

      // loadUser();
      loadCom();
    } catch (err) {
      dispatch({
        type: COM_REGISTER_FAIL,
        payload: err.response.data.msg,
      });
      // console.log('you fucked up');
    }
  };

  // Login Company
  const loginCom = async (formData) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    try {
      const res = await axios.post('/api/auth/company', formData, config);
      dispatch({
        type: COM_LOGIN_SUCCESS,
        payload: res.data,
      });
      //@ Very important !! Set auth token to the latest token, if not, the following function may take the previous token to login
      if (localStorage.token) {
        setAuthToken(localStorage.token);
      }
      loadCom();
    } catch (err) {
      dispatch({
        type: COM_LOGIN_FAIL,
        payload: 'Company Login fail. Invalid crendential.',
      });
      console.log(err);
    }
  };

  // Logout Company
  const logoutCom = () => dispatch({ type: COM_LOGOUT });

  // Clear Error
  const clearErrors = () => dispatch({ type: COM_CLEAR_ERRORS });

  //Return -------
  return (
    <AuthComContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        company: state.company,
        error: state.error,
        loadCom,
        registerCom,
        clearErrors,
        loginCom,
        logoutCom,
      }}
    >
      {props.children}
    </AuthComContext.Provider>
  );
};
export default AuthComState;
