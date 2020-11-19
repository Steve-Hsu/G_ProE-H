import React, { useReducer } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import QuoContext from './quoContext';
import QuoReducer from './quoReducer';

import {
  // CASE_LIST_DOWNLOAD,
  QUOFORM_SELECTOR_SWITCH,
  QUOFORM_SWITCH,
  QUOFORM_DOWNLOAD,
  QUOPAGE_SWITCH,
  QUOFORM_DELETE,
  QUOTATION_DOWNLOAD,
  QUOFORM_UPDATE,
  CURRETQUOFORM_UPDATE,
  CURRETQUOFORM_MQUOS_UPDATE,
  UPDATE_ERROR,
  QUOFORM_REPLACE_ONE,
  DEFAULT,
} from '../types';

const QuoState = (props) => {
  const initialState = {
    // caseList: [],
    quotateFor: null,
    isQuotating: null,
    openQuoForm: null,
    quotation: {
      quoForms: [
        // {
        //   id: '',
        //   quoNo: '',
        //   currency: '',
        //   quoSizes: [],
        //   quocWays: [],
        //   cmpts: [],
        //   mQuos: [],
        //   otherExpenses: [],
        //   fob: '',
        // },
      ],
      theCase: null,
    },
    currentQuoForm: null,
    quoError: null,
  };
  const [state, dispatch] = useReducer(QuoReducer, initialState);
  const {
    quotateFor,
    isQuotating,
    openQuoForm,
    quotation,
    currentQuoForm,
  } = state;

  //@ Id for prevent uuid duplicated
  const generateId = () => {
    return (
      //generate 22 digits string with number or character.
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  };

  //@_action
  // const getCaseList = async () => {
  //   const config = {
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //   };
  //   const res = await axios.get('/api/quogarment', config);
  //   console.log('download succeed!');
  //   dispatch({ type: CASE_LIST_DOWNLOAD, payload: res.data });
  // };

  const switchPage = (value) => {
    // if (quotateFor === null) {
    dispatch({ type: QUOPAGE_SWITCH, payload: value });
    // } else {
    //   dispatch({ type: QUOPAGE_SWITCH, payload: null });
    // }
  };

  const switchQuoFormSelector = async (cNo) => {
    if (isQuotating === null) {
      dispatch({ type: QUOFORM_SELECTOR_SWITCH, payload: cNo });
      const res = await axios.get(`/api/quogarment/quohead/${cNo}`);

      if (res.data[0]) {
        const err = res.data[0].err
        console.log('Multiple user login~!')
        dispatch({ type: UPDATE_ERROR, payload: err });
        setTimeout(() => {
          dispatch({ type: UPDATE_ERROR, payload: 'Jump to login page' });
        }, 3500);
      } else {
        console.log('Download succeed!');
        dispatch({ type: QUOTATION_DOWNLOAD, payload: res.data });
      }

      return cNo;
    } else {
      dispatch({ type: QUOFORM_SELECTOR_SWITCH, payload: null });
      dispatch({
        type: QUOTATION_DOWNLOAD,
        payload: { quoForms: [], theCase: null },
      });

      // await downLoadQuoHead(null).then(() => {
      //   // resolve();
      // });
      return null;
    }
  };

  // const downLoadQuoHead = async (check) => {
  //   // console.log('downLoadQuoHead is called, the check', check); // Test Code
  //   if (check !== null) {
  //     const res = await axios.get(`/api/quogarment/quohead/${check}`);
  //     dispatch({ type: QUOTATION_DOWNLOAD, payload: res.data });
  //   } else {
  //     dispatch({
  //       type: QUOTATION_DOWNLOAD,
  //       payload: { quoForms: [], theCase: null },
  //     });
  //   }
  // };

  const switchQuoForm = (quoFormId) => {
    dispatch({ type: QUOFORM_SWITCH, payload: quoFormId });
    // if (quoFormId === null) {
    //   dispatch({ type: QUOFORM_SWITCH, payload: null });
    //   return null;
    // } else {
    //   dispatch({ type: QUOFORM_SWITCH, payload: quoFormId });
    //   return quoFormId;
    // }
  };

  const uploadQuoForm = async (cNo, isNewQuoForm, form) => {
    const upLoad = new Promise(async (resolve) => {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const body = { isNewQuoForm: isNewQuoForm, form: form };

      const res = await axios.put(
        `/api/quogarment/quoform/${cNo}/uploadquoForm`,
        body,
        config
      );
      if (res.data[0]) {
        const err = res.data[0].err
        console.log('Multiple user login~!')
        dispatch({ type: UPDATE_ERROR, payload: err });
        setTimeout(() => {
          dispatch({ type: UPDATE_ERROR, payload: 'Jump to login page' });
        }, 3500);
        return resolve(null)
      } else {
        dispatch({ type: QUOFORM_DOWNLOAD, payload: res.data });
        // Return quoForm id for switch to the QuoForm page.
        return resolve(res.data);
      }

    });
    return upLoad;
  };

  const downLoadmtrlPrice = async (body) => {
    // const quoFormId = body.quoFormId;
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const res = await axios.put(`/api/quogarment/quotateadvise/`, body, config);

    // const quoForm = res.data.filter((i) => {
    //   return i._id === quoFormId;
    // });

    dispatch({ type: QUOFORM_REPLACE_ONE, payload: res.data });
    // dispatch({ type: QUOFORM_UPDATE, payload: res.data });
    dispatch({ type: CURRETQUOFORM_MQUOS_UPDATE, payload: res.data });
    // dispatch({ type: CURRETQUOFORM_MQUOS_UPDATE, payload: quoForm[0] });

  };

  const deleteQuoForm = async (body) => {
    const quoNo = body.quoNo;
    const quoFormId = body.quoFormId;
    //This could be a severe problem
    //Here the path seem a little strange, I still can't figure it out, only can use the path now to temparalily solve the problem
    const res = await axios.delete(`quogarment/delete/quoform/${quoNo}/${quoFormId}`).catch((err) => {
      console.log('Delete quoForm have problem', err);
    });

    if (res.data[0]) {
      const err = res.data[0].err
      console.log('Multiple user login~!')
      dispatch({ type: UPDATE_ERROR, payload: err });
      setTimeout(() => {
        dispatch({ type: UPDATE_ERROR, payload: 'Jump to login page' });
      }, 3500);
    } else {
      console.log('Delete the quotation form succeed!');
      dispatch({ type: QUOFORM_DELETE, payload: quoFormId });
    }
  };

  const deletemQuo = async (cNo, mtrlId) => {
    console.log('The deletemQuo is triggered');
    try {
      await axios.delete(`/api/quogarment/delete/mquosbymtrl/${cNo}/${mtrlId}`);
      console.log('The mQuo is deleted');
    } catch (err) {
      console.log('Got problem deleting the mQuo', err);
    }
  };

  const updateQuoSize = (quoFormId, size) => {
    const quoForms = quotation.quoForms;
    const quoForm = currentQuoForm;

    const haveTheQuoSize = quoForm.quoSizes.includes(size);
    if (haveTheQuoSize) {
      quoForm.quoSizes.splice(quoForm.quoSizes.indexOf(size), 1);
    } else {
      quoForm.quoSizes.push(size);
    }
    const updateQuoForms = quoForms.map((qF) => {
      if (qF._id == quoForm._id) {
        qF = quoForm
      }
      return qF
    });
    dispatch({ type: QUOFORM_UPDATE, payload: updateQuoForms });
    dispatch({ type: CURRETQUOFORM_UPDATE, payload: quoForm });
  };

  const updateQuocWay = (quoFormId, cWay) => {
    const quoForms = quotation.quoForms;
    const quoForm = currentQuoForm;

    const haveTheQuocWay = quoForm.quocWays.includes(cWay);
    if (haveTheQuocWay) {
      quoForm.quocWays.splice(quoForm.quocWays.indexOf(cWay), 1);
    } else {
      quoForm.quocWays.push(cWay);
    }
    const updateQuoForms = quoForms.map((qF) => {
      if (qF._id == quoForm._id) {
        qF = quoForm
      }
      return qF
    });
    dispatch({ type: QUOFORM_UPDATE, payload: updateQuoForms });
    dispatch({ type: CURRETQUOFORM_UPDATE, payload: quoForm });
  };

  const updateCurrentQuoForm = (e) => {
    const nameOfTarget = e.target.name;
    const idOfTarget = e.target.id;
    const value = e.target.value;
    const quoForm = currentQuoForm;
    const idOfItem = String(e.target.id).slice(
      nameOfTarget.length,
      idOfTarget.length
    );
    let totalCost = 0;
    switch (nameOfTarget) {
      case 'currency':
        quoForm.currency = value;
        break;
      case 'cm':
        quoForm.cm = Number(value);
        break;
      case 'addOtherExpense':
        quoForm.otherExpenses.push({
          id: uuidv4() + generateId(),
          costName: '',
          costDescription: '',
          cost: 0,
        });
        break;
      case 'addCondition':
        quoForm.conditions.push({
          id: uuidv4() + generateId(),
          condition: '',
          conditionDescription: '',
        });
        break;
      case 'deleteOtherExpense':
        quoForm.otherExpenses = quoForm.otherExpenses.filter((i) => {
          return i.id !== value;
        });
        quoForm.otherExpenses.map((oE) => {
          if (oE.id === idOfItem) {
            oE.cost = Number(e.target.value);
          }
          totalCost += Number(oE.cost);
        });
        quoForm.otherExpensesTotal = totalCost;
        break;
      case 'deleteCondition':
        quoForm.conditions = quoForm.conditions.filter((i) => {
          return i.id !== value;
        });
        break;
      case 'cspt':
        quoForm.mQuos.map((mQuo) => {
          if (mQuo.mtrlId === idOfItem) {
            mQuo.csptAddvised = e.target.value;
            let mtrlQuotation = mQuo.csptAddvised * mQuo.mQuoAddvised;
            mQuo.materialFinalQuotation = Number(mtrlQuotation);
          }
          totalCost += Number(mQuo.materialFinalQuotation);
        });
        quoForm.mQuosTotal = totalCost.toFixed(2);
        break;
      case 'unitprice':
        quoForm.mQuos.map((mQuo) => {
          if (mQuo.mtrlId === idOfItem) {
            mQuo.mQuoAddvised = e.target.value;
            let mtrlQuotation = mQuo.csptAddvised * mQuo.mQuoAddvised;
            mQuo.materialFinalQuotation = Number(mtrlQuotation);
          }
          totalCost += Number(mQuo.materialFinalQuotation);
        });
        quoForm.mQuosTotal = totalCost.toFixed(2);
        break;
      case 'otherExpenseCost':
        quoForm.otherExpenses.map((oE) => {
          if (oE.id === idOfItem) {
            oE.cost = Number(e.target.value);
          }
          totalCost += Number(oE.cost);
        });
        quoForm.otherExpensesTotal = totalCost;
        break;
      case 'costName':
        quoForm.otherExpenses.map((oE) => {
          if (oE.id === idOfItem) {
            oE.costName = e.target.value;
          }
        });
        break;
      case 'costDescription':
        quoForm.otherExpenses.map((oE) => {
          if (oE.id === idOfItem) {
            oE.costDescription = e.target.value;
          }
        });
        break;
      case 'condition':
      case 'conditionDescription':
        quoForm.conditions.map((c) => {
          if (c.id === idOfItem) {
            c[nameOfTarget] = e.target.value;
          }
        });
        break;

      // quoForm.conditions.map((c) => {
      //   if (c.id === idOfItem) {
      //     c.conditionDescription = e.target.value;
      //   }
      // });
      // break;
      default:
    }
    const finalTotal =
      Number(quoForm.cm) +
      Number(quoForm.mQuosTotal) +
      Number(quoForm.otherExpensesTotal);
    // quoForm.fob = Number(
    //   quoForm.cm + quoForm.mQuosTotal + quoForm.otherExpensesTotal
    // ).toFixed(2);
    quoForm.fob = finalTotal.toFixed(2);

    dispatch({ type: CURRETQUOFORM_UPDATE, payload: quoForm });
  };

  const clearQuoError = () => {
    dispatch({ type: UPDATE_ERROR, payload: null });
  };

  const defaultQuo = () => {
    dispatch({ type: DEFAULT });
  }
  return (
    <QuoContext.Provider
      value={{
        caseList: state.caseList,
        quotateFor: state.quotateFor,
        isQuotating: state.isQuotating,
        openQuoForm: state.openQuoForm,
        quotation: state.quotation,
        currentQuoForm: state.currentQuoForm,
        quoError: state.quoError,
        // getCaseList,
        switchPage,
        switchQuoFormSelector,
        switchQuoForm,
        uploadQuoForm,
        // downLoadQuoHead,
        downLoadmtrlPrice,
        deleteQuoForm,
        deletemQuo,
        updateQuoSize,
        updateQuocWay,
        updateCurrentQuoForm,
        clearQuoError,
        defaultQuo,
      }}
    >
      {props.children}
    </QuoContext.Provider>
  );
};

export default QuoState;
