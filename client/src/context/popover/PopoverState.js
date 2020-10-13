import React, { useReducer, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';
import PopoverContext from './popoverContext';
import popoverReducer from './popoverReducer';
import {
  TOGGLE_POPOVER,
  CURRENT_ADD,
  CURRENT_DELETE,
  TOGGLE_LOADING,
  ADD_DOUBLECHECK_VALUE,
} from '../types';
import CasesContext from '../../context/cases/casesContext';
import SrMtrlContext from '../../context/srMtrl/srMtrlContext';
import QuoContext from '../../context/quo/quoContext';
import PurContext from '../../context/pur/purContext';
import UserContext from '../../context/user/userContext';

const PopoverState = (props) => {
  //State -------
  const initialState = {
    current: null,
    popover: false,
    isLoading: false,
    doubleCheck: null,
  };
  const [state, dispatch] = useReducer(popoverReducer, initialState);
  const casesContext = useContext(CasesContext);
  const srMtrlContext = useContext(SrMtrlContext);
  const quoContext = useContext(QuoContext);
  const purContext = useContext(PurContext);
  const userContext = useContext(UserContext);
  const { _id, cNo, cWays, sizes, mtrls } = casesContext;
  const { srMtrls } = srMtrlContext;
  const { quotation } = quoContext;
  const { osList } = purContext;
  const { users } = userContext;

  //Action -------

  const togglePopover = (e, subId) => {
    const newPopover = !state.popover;
    dispatch({ type: TOGGLE_POPOVER, payload: newPopover });
    if (newPopover) {
      e.preventDefault();
      const targetId = e.target.value;
      let subject = {};
      switch (e.target.name) {
        case 'cWay':
          subject = cWays.find(({ id }) => id === targetId);
          break;
        case 'size':
          subject = sizes.find(({ id }) => id === targetId);
          break;
        case 'mtrl':
          subject = mtrls.find(({ id }) => id === targetId);
          break;
        case 'case':
          subject = { caseId: _id, cNo: cNo };
          break;
        case 'quoForm':
          subject = quotation.quoForms.find(({ _id }) => _id === targetId);
          break;
        case 'deleteOs':
          subject = osList.find(({ _id }) => _id === targetId);
          break;
        case 'deleteMPrice':
          let srMtrl = srMtrls.find(({ _id }) => _id === targetId);
          subject = srMtrl.mPrices.find(({ id }) => id === subId);
          subject.srMtrlId = targetId;
          break;
        case 'user':
          subject = users.find(({ _id }) => _id === targetId);
          break;
        default:
          subject = { key: 'no target id' };
      }
      subject.target = e.target.name;

      dispatch({ type: CURRENT_ADD, payload: subject });
    } else {
      // Here use preventDefault(), the broswer recommand to use e.persist();
      e.persist();
      dispatch({ type: CURRENT_DELETE });
    }
  };

  const defaultPopover = () => {
    dispatch({ type: CURRENT_DELETE });
  };

  const toggleLoading = (value) => {
    console.log(value)
    dispatch({ type: TOGGLE_LOADING, payload: value });
  };

  const addDoubleCheckValue = (e) => {
    dispatch({ type: ADD_DOUBLECHECK_VALUE, payload: e.target.value });
  };

  return (
    <PopoverContext.Provider
      value={{
        current: state.current,
        popover: state.popover,
        isLoading: state.isLoading,
        doubleCheck: state.doubleCheck,
        togglePopover,
        defaultPopover,
        toggleLoading,
        addDoubleCheckValue,
      }}
    >
      {props.children}
    </PopoverContext.Provider>
  );
};

export default PopoverState;
