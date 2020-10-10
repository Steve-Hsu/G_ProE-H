import React, { useReducer } from 'react';
import axios from 'axios';
import UserContext from './userContext';
import userReducer from './userReducer';
import {
  DELETE_USER,
  SET_CURRENT,
  CLEAR_CURRENT,
  FILTER_USER,
  CLEAR_FILTER_USER,
  USER_ERROR,
  COM_GET_USERS,
  CLEAR_USERS_STATE,
  // CONFIRM_DELETE_USER,
  // CLEAR_CONFIRM_DELETE,
  TOGGLE_LOSS_SET,
  TOGGLE_LOSS_CATEGORY,
  UPDATE_LOSS,
} from '../types';

const UserState = (props) => {
  const initialState = {
    users: null,
    current: null,
    filtered: null,
    error: null,
    confirmDelete: null,
    openLossSets: false,
    openLossCategory: [],
  };

  const [state, dispatch] = useReducer(userReducer, initialState);
  //@ Get User
  const getUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      dispatch({ type: COM_GET_USERS, payload: res.data });
    } catch (err) {
      dispatch({
        type: USER_ERROR,
        payload: err.response.msg,
      });
    }
  };

  //@ Add User
  const addUser = async (user) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    try {
      await axios.post('/api/users', user, config);
      getUsers();
      // dispatch({ type: ADD_USER, payload: res.data });
    } catch (err) {
      dispatch({
        type: USER_ERROR,
        // payload: err.response.msg,
        payload: 'add user err',
      });
    }
  };

  //@ Confirm Delete User
  // Before delete User check again with the name of the user
  // const confirmDeleteUser = (name) => {
  //   dispatch({
  //     type: CONFIRM_DELETE_USER,
  //     payload: name,
  //   });
  // };

  // const clearConfirmDelete = () => {
  //   dispatch({
  //     type: CLEAR_CONFIRM_DELETE,
  //   });
  // };

  //@ Delete USER
  const deleteUser = async (id) => {
    try {
      await axios.delete(`/api/users/${id}`);
      dispatch({
        type: DELETE_USER,
        payload: id,
      });
    } catch (err) {
      dispatch({
        type: USER_ERROR,
        payload: 'Delete User error',
      });
    }
  };

  //@ Clear Users in UserState
  //When the company logout, we need clear the state in the client end for security
  const clearUsers = () => {
    dispatch({ type: CLEAR_USERS_STATE });
  };

  //@ Set Current USER
  const setCurrent = (user) => {
    dispatch({ type: SET_CURRENT, payload: user });
  };

  //@ Clear Current USER
  const clearCurrent = () => {
    dispatch({ type: CLEAR_CURRENT });
  };

  //@ Update USER
  const updateUser = async (subject) => {
    const config = {
      header: {
        'Content-Type:': 'application/json',
      },
    };
    try {
      const res = await axios.put(`/api/users/${subject._id}`, subject, config);
      getUsers();
    } catch (err) {
      dispatch({
        type: USER_ERROR,
        payload: 'Update user Error',
      });
    }
  };

  //@ Filter USER
  const filterUser = (text) => {
    dispatch({ type: FILTER_USER, payload: text });
  };

  //@ Clear Filter
  const clearFilterUser = () => {
    dispatch({ type: CLEAR_FILTER_USER });
  };

  const togglePanel = (e) => {
    const targeName = e.target.name;
    switch (targeName) {
      case 'lossSets':
        dispatch({ type: TOGGLE_LOSS_SET });
        break;
      default:
        let subjects = state.openLossCategory;
        const pushedValue = e.target.name;
        if (subjects.includes(pushedValue)) {
          subjects = state.openLossCategory.filter((i) => i != pushedValue);
        } else {
          subjects.push(pushedValue);
        }
        dispatch({ type: TOGGLE_LOSS_CATEGORY, payload: subjects });
    }
  };
  const lossSetInputUpdate = (e) => {
    const lossSet = e.target.name;
    const lossSetValue = Number(e.target.value);
    const user = state.users[0];
    const idx = Number(String(lossSet.slice(-1))) - 1;
    user.loss.sets[idx][lossSet] = lossSetValue;
    dispatch({ type: UPDATE_LOSS, payload: user });
  };

  const lossInputUpdate = (e) => {
    const lossCategory = e.target.id.slice(5) || null;
    const loss = e.target.name;
    const lossValue = Number(e.target.value);
    const user = state.users[0];

    // console.log('the lossCategory', lossCategory);
    // console.log('The loss', loss);
    if (user) {
      user.loss[lossCategory][loss] = lossValue;

      dispatch({ type: UPDATE_LOSS, payload: user });
    }
  };

  const uploadLoss = async () => {
    const config = {
      header: {
        'Content-Type:': 'application/json',
      },
    };
    const loss = state.users[0].loss;
    try {
      const res = await axios.post('/api/users/uploadloss', loss, config);
      dispatch({ type: COM_GET_USERS, payload: res.data });
    } catch (err) {
      dispatch({
        type: USER_ERROR,
        payload: err.response.msg,
      });
    }
  };

  return (
    <UserContext.Provider
      value={{
        users: state.users,
        current: state.current,
        filtered: state.filtered,
        error: state.error,
        confirmDelete: state.confirmDelete,
        openLossSets: state.openLossSets,
        openLossCategory: state.openLossCategory,
        addUser,
        deleteUser,
        setCurrent,
        clearCurrent,
        updateUser,
        filterUser,
        clearFilterUser,
        getUsers,
        clearUsers,
        togglePanel,
        // confirmDeleteUser,
        // clearConfirmDelete,
        lossSetInputUpdate,
        lossInputUpdate,
        uploadLoss,
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
};

export default UserState;
