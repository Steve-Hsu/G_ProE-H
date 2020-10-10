import React, { useReducer } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ComContext from './comContext';
import comReducer from './comReducer';
import {
  ADD_COMPANY,
  DELETE_COMPANY,
  SET_CURRENT,
  CLEAR_CURRENT,
  UPDATE_COMPANY,
  FILTER_COMPANY,
  CLEAR_FILTER_COMPANY,
} from '../types';

const ComState = (props) => {
  const initialState = {
    companies: [
      // for test
      // {
      //   id: 1,
      //   comName: 'Soluna',
      //   email: 'steve@soluna.com',
      //   password: 'soluna123',
      //   userNumLimit: 5,
      //   userNum: 0,
      //   type: 'paid',
      // },
      // {
      //   id: 2,
      //   comName: 'Infinity',
      //   email: 'steve@infinity.com',
      //   password: 'infinity123',
      //   userNumLimit: 5,
      //   userNum: 1,
      //   type: 'unpaid',
      // },
    ],
    current: null,
    filtered: null,
  };

  const [state, dispatch] = useReducer(comReducer, initialState);

  // Add company
  const addCompany = (company) => {
    company.id = uuidv4();
    dispatch({ type: ADD_COMPANY, payload: company });
  };

  //Delete Company
  const deleteCompany = (id) => {
    dispatch({ type: DELETE_COMPANY, payload: id });
  };

  //Set Current Company
  const setCurrent = (company) => {
    dispatch({ type: SET_CURRENT, payload: company });
  };

  //Clear Current Company
  const clearCurrent = () => {
    dispatch({ type: CLEAR_CURRENT });
  };

  //Update company
  const updateCompany = (company) => {
    dispatch({ type: UPDATE_COMPANY, payload: company });
  };

  //Filter Company
  const filterCompany = (text) => {
    dispatch({ type: FILTER_COMPANY, payload: text });
  };

  //Clear Filter
  const clearFilterCompany = () => {
    dispatch({ type: CLEAR_FILTER_COMPANY });
  };

  return (
    <ComContext.Provider
      value={{
        companies: state.companies,
        current: state.current,
        filtered: state.filtered,
        addCompany,
        deleteCompany,
        setCurrent,
        clearCurrent,
        updateCompany,
        filterCompany,
        clearFilterCompany,
      }}
    >
      {props.children}
    </ComContext.Provider>
  );
};

export default ComState;
