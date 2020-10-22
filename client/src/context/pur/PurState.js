import React, { useReducer } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import PurContext from './purContext';
import PurReducer from './purReducer';

import {
  CASE_LIST_DOWNLOAD,
  SELECTEDCASES_UPDATE,
  DEFAULT,
  PURPAGE_SWITCH,
  OS_LIST_DOWNLOAD,
  OS_CURRENT,
  PO_CURRENT,
  PO_CURRENT_MTRLPRICE,
  OS_DELETE,
  UPDATE_SUPPLIERS,
  UPDATE_MOQPOQTY,
  UPDATE_HSCODE,
  UPDATE_ERROR,
  UPDATE_EDITING_LIST,
  // UPDATE_CASEMTRL,
} from '../types';

const PurState = (props) => {
  const initialState = {
    osList: [],
    selectedCases: [],
    openPage: null,
    currentOrderSummary: null,
    currentPo: null,
    currentPoPriceList: [],
    osError: null,
    editingLeadTime: [],
  };
  const [state, dispatch] = useReducer(PurReducer, initialState);
  const { caseList, openPage, currentOrderSummary, currentPo } = state;
  //@ Id for prevent uuid duplicated
  const generateId = () => {
    return (
      //generate 22 digits string with number or character.
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  };

  //@_action

  //@ Use searchbar to find the cases
  const searchCaseList = async (body) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    try {
      const res = await axios.post('/api/purchase/query', body, config);
      console.log('Seach result returned');
      dispatch({ type: CASE_LIST_DOWNLOAD, payload: res.data });
    } catch (err) {
      console.log(err.msg, 'Query failed');
    }
  };

  const selectCase = (caseId, selectAll = false) => {
    if (selectAll) {
      if (state.selectedCases.length === caseList.length) {
        state.selectedCases = [];
      } else {
        state.selectedCases = [];
        caseList.map((i) => {
          state.selectedCases.push(i._id);
        });
      }
    } else {
      const haveSeletedTheCase = state.selectedCases.includes(caseId);
      if (haveSeletedTheCase) {
        state.selectedCases.splice(state.selectedCases.indexOf(caseId), 1);
      } else {
        state.selectedCases.push(caseId);
      }
    }
    dispatch({ type: SELECTEDCASES_UPDATE, payload: state.selectedCases });
  };

  const createOrderSummary = async (selectedCases) => {
    console.log('createOrderSummary is triggered'); // test Code
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // const res = await axios.post('/api/purchase', selectedCases, config);
    try {
      await axios.post('/api/purchase', selectedCases, config).then((result) => {
        if (result[0]) {
          const err = result[0].err
          console.log('Multiple user login~!')
          dispatch({ type: UPDATE_ERROR, payload: err });
          setTimeout(() => {
            dispatch({ type: UPDATE_ERROR, payload: null });
          }, 3500);
        } else {
          switchPage('osSelector');
          console.log('Upload Order Summary');
        }
        return result
      })
    } catch (err) {
      console.log(err, 'Order Summary failed');
    }
  };

  const defaultPurState = () => {
    dispatch({ type: DEFAULT });
  };

  const switchPage = (value, value2 = null) => {
    switch (value) {
      case 'caseSelector':
        dispatch({ type: PURPAGE_SWITCH, payload: value });
        break;
      case 'osSelector':
        console.log('osSelector in state is triggered');
        dispatch({ type: PURPAGE_SWITCH, payload: value });
        dispatch({ type: OS_CURRENT, payload: null });
        break;
      case 'orderSummary':
        // const subject = value2
        dispatch({ type: PURPAGE_SWITCH, payload: value });
        dispatch({ type: PO_CURRENT, payload: null });
        dispatch({ type: PO_CURRENT_MTRLPRICE, payload: [] });
        break;
      case 'purchaseOrder':
        const subject = value2;
        dispatch({ type: PURPAGE_SWITCH, payload: value });
        dispatch({ type: PO_CURRENT, payload: subject });
        break;
      case 'oSMtrlList':
      case 'leadTimePage':
        dispatch({ type: PURPAGE_SWITCH, payload: value });
        break;
      default:
        console.log('no value is triggered ');
      // dispatch({ type: PURPAGE_SWITCH, payload: value });
      // dispatch({ type: PO_CURRENT, payload: id });
      // break;
    }

    // if (value) {
    //   if (value === 'osSelector') {
    //     dispatch({ type: PURPAGE_SWITCH, payload: value });
    //     dispatch({ type: OS_CURRENT, payload: null });
    //   } else {
    //     dispatch({ type: PURPAGE_SWITCH, payload: value });
    //   }
    // } else {
    //   dispatch({ type: PURPAGE_SWITCH, payload: null });
    // }
  };

  const getOsList = async () => {
    console.log('I triggered here !!!')
    const res = await axios.get('/api/purchase/ordersummary');
    // console.log("the res ",res) // test code
    if (res.data.length === 0) {
      console.log('No order summary found!');
      dispatch({ type: UPDATE_ERROR, payload: 'No Order summary found' })
      setTimeout(() => {
        dispatch({ type: UPDATE_ERROR, payload: null })
      }, 3500);
    } else if (res.data[0].err) {
      const err = res.data[0].err
      console.log('Multiple user login~!')
      dispatch({ type: UPDATE_ERROR, payload: err });
      setTimeout(() => {
        dispatch({ type: UPDATE_ERROR, payload: null });
      }, 3500);
    } else {
      console.log('download succeed!');
      dispatch({ type: OS_LIST_DOWNLOAD, payload: res.data });
    }
  };

  const switchOsCurrent = (osItem) => {
    if (currentOrderSummary === null) {
      dispatch({ type: OS_CURRENT, payload: osItem });
    } else {
      dispatch({ type: OS_CURRENT, payload: null });
    }
  };

  const getMaterialPrice = async (currentPo, caseMtrls) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const body = {
      currentPo: currentPo,
      caseMtrls: caseMtrls,
    };
    try {
      const res = await axios.post('/api/purchase/materialprice', body, config);
      console.log('Get the material prices');
      dispatch({ type: PO_CURRENT_MTRLPRICE, payload: res.data });
    } catch (err) {
      console.log(err.msg, 'Get the material prices');
    }
  };

  const deleteOs = async (osId) => {

    const res = await axios.delete(`/api/purchase/deleteos/${osId}`).catch((err) => {
      console.log(err);
    });

    if (res.data[0]) {
      const err = res.data[0].err
      console.log('Multiple user login~!')
      dispatch({ type: UPDATE_ERROR, payload: err });
      setTimeout(() => {
        dispatch({ type: UPDATE_ERROR, payload: null });
      }, 3500);
    } else {
      console.log('Download succeed!');
      dispatch({ type: OS_DELETE, payload: osId });
    }

  };

  const updatePOInform = (e) => {
    const nameOfTarget = e.target.name;
    const idOfTarget = e.target.id;
    const value = e.target.value;
    const idOfItem = String(e.target.id).slice(
      nameOfTarget.length,
      idOfTarget.length
    );

    let subject = state.currentPo;
    switch (nameOfTarget) {
      case 'addCondition':
        subject.conditions.push({
          id: uuidv4() + generateId(),
          condition: null,
          conditionDescription: null,
        });
        break;
      case 'condition':
      case 'conditionDescription':
        subject.conditions.map((c) => {
          if (c.id === idOfItem) {
            c[nameOfTarget] = value;
          }
        });
        break;
      case 'deleteCondition':
        subject.conditions = subject.conditions.filter((c) => c.id != value);
        break;
      case 'address':
      case 'attn':
      case 'email':
      case 'tel':
        subject[nameOfTarget] = value;
        break;
      default:
    }

    dispatch({ type: PO_CURRENT, payload: subject });
  };

  const uploadPO = async (osId, currentPo, priceList = null) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const checkConfirmDate = currentPo.poConfirmDate;
    const currentPoId = currentPo._id;
    console.log('the currentPo id', currentPoId);
    if (checkConfirmDate) {
      priceList = state.currentPoPriceList;
    }

    const inputCaseMtrls = state.currentOrderSummary.caseMtrls;

    const body = {
      supplier: currentPo,
      priceList: priceList,
      inputCaseMtrls: inputCaseMtrls,
    };
    try {
      const res = await axios.post(
        `/api/purchase/purchaseorder/${osId}`,
        body,
        config
      );
      if (res.data[0]) {
        const err = res.data[0].err
        console.log('Multiple user login~!')
        dispatch({ type: UPDATE_ERROR, payload: err });
        setTimeout(() => {
          dispatch({ type: UPDATE_ERROR, payload: null });
        }, 3500);
      } else {
        console.log('Upload condition succeed');
        const theSuppliers = res.data.suppliers;
        const subject = theSuppliers.find(({ _id }) => _id === currentPoId);
        dispatch({ type: UPDATE_SUPPLIERS, payload: theSuppliers });
        dispatch({ type: PO_CURRENT, payload: subject });
        dispatch({ type: OS_CURRENT, payload: res.data });
      }
    } catch (err) {
      console.log(err.msg, 'Upload conditions failed');
    }
  };

  const togglePoConfirmDate = () => {
    let subject = state.currentPo;
    const checkConfirmDate = subject.poConfirmDate;
    if (checkConfirmDate) {
      subject.poConfirmDate = null;
    } else {
      var date = Date.now();
      subject.poConfirmDate = date;
    }

    dispatch({ type: PO_CURRENT, payload: subject });
  };

  const getPOTotal = (supplier) => {
    console.log('getPOTotal triggered');
    let mPrice = 0;
    let moq = 0;
    let moqPrice = 0;
    let total = 0;
    const theMtrlPrice = (purchaseQtySumUp, mPrice, moq, moqPrice) => {
      if (typeof moq === 'Number' && typeof moqPrice === 'Number') {
        if (purchaseQtySumUp > moq) {
          return Number(mPrice);
        } else {
          return Number(moqPrice);
        }
      } else {
        return Number(mPrice);
      }
    };

    const cal = new Promise(async (resolve) => {
      console.log('getPOTotal promise');
      await currentOrderSummary.caseMtrls.map(async (osMtrl, idx) => {
        console.log('getPOotal the map');
        if (osMtrl.supplier == supplier) {
          if (currentPo.currentMtrlPrice) {
            const currentMtrlPrice = currentPo.currentMtrlPrice;
            mPrice = currentMtrlPrice.mPrice;
            moq = currentMtrlPrice.moq;
            moqPrice = currentMtrlPrice.moqPrice;
            // }
          } else {
            if (osMtrl.price) {
              mPrice = osMtrl.price.mPrice;
              moq = osMtrl.price.moq;
              moqPrice = osMtrl.price.moqPrice;
            }
          }
          total =
            total +
            osMtrl.purchaseQtySumUp *
            theMtrlPrice(osMtrl.purchaseQtySumUp, mPrice, moq, moqPrice);
          if (idx + 1 === currentOrderSummary.caseMtrls.length) {
            console.log('1');
            resolve(total);
          }
        } else {
          if (idx + 1 === currentOrderSummary.caseMtrls.length) {
            console.log('2');
            resolve(total);
          }
        }
        // if (idx + 1 === currentOrderSummary.length) {
        //   resolve(total);
        // }
        // console.log('3');
      });
    });

    Promise.all([cal]).then((result) => {
      console.log('the promise all');
      const totalFigure = result[0];
      const subject = currentPo;
      subject.poTotalFigure = totalFigure;
      dispatch({ type: PO_CURRENT, payload: subject });
    });
  };

  const evenMoq = (moq, totalQty, purchaseMoqQty, id) => {
    let newPurchasedMoqQty = 0;
    if (purchaseMoqQty) {
    } else {
      newPurchasedMoqQty = moq - totalQty + 1;
    }
    const payload = {
      id: id,
      newPurchasedMoqQty: newPurchasedMoqQty,
    };

    dispatch({ type: UPDATE_MOQPOQTY, payload: payload });
  };

  const enterHsCode = (e) => {
    const id = e.target.id;
    const value = e.target.value;
    const payload = {
      id: id.slice(6),
      hsCode: value,
    };
    dispatch({ type: UPDATE_HSCODE, payload: payload });
  };

  const uploadHsCode = async () => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const body = {
      inputCaseMtrls: currentOrderSummary.caseMtrls,
    };
    try {
      const res = await axios.post(
        `/api/purchase/updatehscode/${currentOrderSummary._id}`,
        body,
        config
      );
      if (res.data[0]) {
        const err = res.data[0].err
        console.log('Multiple user login~!')
        dispatch({ type: UPDATE_ERROR, payload: err });
        setTimeout(() => {
          dispatch({ type: UPDATE_ERROR, payload: null });
        }, 3500);
      } else {
        console.log('Upload hs-code succeed');
      }
    } catch (err) {
      console.log(err.msg, 'Upload hs-code failed');
    }
  };

  const clearOsError = () => {
    dispatch({ type: UPDATE_ERROR, payload: null });
  };

  const openMtrlLeadTime = (mtrlId) => {
    let list = state.editingLeadTime;
    const check = state.editingLeadTime.includes(mtrlId);
    if (check) {
      list = state.editingLeadTime.filter((i) => {
        return i !== mtrlId;
      });
      dispatch({ type: UPDATE_EDITING_LIST, payload: list });
    } else {
      // console.log('The push is triggered'); // test Code
      list.push(mtrlId);
      dispatch({ type: UPDATE_EDITING_LIST, payload: list });
    }
  };


  return (
    <PurContext.Provider
      value={{
        osList: state.osList,
        caseList: state.caseList,
        selectedCases: state.selectedCases,
        openPage: state.openPage,
        currentOrderSummary: state.currentOrderSummary,
        currentPo: state.currentPo,
        currentPoPriceList: state.currentPoPriceList,
        osError: state.osError,
        editingLeadTime: state.editingLeadTime,
        searchCaseList,
        selectCase,
        createOrderSummary,
        defaultPurState,
        switchPage,
        getOsList,
        switchOsCurrent,
        getMaterialPrice,
        deleteOs,
        updatePOInform,
        uploadPO,
        togglePoConfirmDate,
        getPOTotal,
        evenMoq,
        enterHsCode,
        uploadHsCode,
        clearOsError,
        openMtrlLeadTime,
      }}
    >
      {props.children}
    </PurContext.Provider>
  );
};

export default PurState;
