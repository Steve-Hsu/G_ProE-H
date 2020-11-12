import React, { useReducer } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import SrMtrlContext from './srMtrlContext';
import SrMtrlReducer from './srMtrlReducer';
import {
  SRMTRL_DOWNLOAD,
  TOGGLE_ISUPDATE,
  SRMTRL_UPDATE,
  SRMTRL_CLEAR,
  UPDATE_EDITING_LIST,
  TOGGLE_MAINPRICE,
  UPDATE_ERROR,
} from '../types';

const SrMtrlState = (props) => {
  //@ States------------------------------------------------------
  const initialState = {
    srMtrls: [],
    isUpdated: false,
    editingList: [],
    srMtrlError: null,
  };

  const [state, dispatch] = useReducer(SrMtrlReducer, initialState);
  const { srMtrls } = state;
  //@ Id for prevent uuid duplicated
  const generateId = () => {
    return (
      //generate 22 digits string with number or character.
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  };

  //@ new Items
  // const newMPrice = {
  //   id: uuidv4() + generateId(),
  //   mColor: '',
  //   sizeSPEC: '',
  //   unit: '',
  //   currency: '',
  //   mPrice: '',
  //   moq: '',
  //   moqPrice: '',
  //   quotation: '',
  // };

  //@ Actions------------------------------------------------------

  //@1 Get srMtrl
  const getSrMtrls = async () => {
    const res = await axios.get('/api/srmtrl');
    // Now matter what you return in the router, the axios will return a object in format that have head and data, you need to put foo.data to the payload, or you will get exatra datas like head.
    if (res.data.length === 0) {
      dispatch({ type: UPDATE_ERROR, payload: 'No material is found' });
      setTimeout(() => {
        dispatch({ type: UPDATE_ERROR, payload: null });
      }, 3500)
    } else if (res.data[0].err) {
      console.log('Multiple user login~!')
      dispatch({ type: UPDATE_ERROR, payload: res.data[0].err });
      setTimeout(() => {
        dispatch({ type: UPDATE_ERROR, payload: 'Jump to login page' });
      }, 3500);
    } else {
      dispatch({
        type: SRMTRL_DOWNLOAD,
        payload: res.data,
      });
    }
  };

  const getSpecificSrMtrl = async (obj) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const srMtrls = await axios.put('/api/srmtrl/queryresult', obj, config);
    dispatch({
      type: SRMTRL_DOWNLOAD,
      payload: srMtrls.data,
    });
  };

  //@1 Add srMtrls by uploading of cases
  const updateSrMtrlByMtrl = async (body) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    try {
      await axios.put(`/api/srmtrl/${body.cases._id}`, body, config);
      dispatch({
        type: TOGGLE_ISUPDATE,
        payload: true,
      });
    } catch (err) {
      console.log('Upload srMtrl faild, server problems');
    }
  };

  //@1 Delete refs in srMtrl by delete Mtrl
  const deleteSRMtrlByMtrl = async (comName, comSymbol, mtrl, casesId) => {
    //Make a fake body for backend

    const body = {
      comName: comName,
      comSymbol: comSymbol,
      mtrl: mtrl,
    };

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    try {
      await axios.put(`/api/srmtrl/${casesId}/deletesrmtrl`, body, config);
    } catch (err) {
      console.log(err);
    }
  };

  //@1 turn isUpdated false
  const turnSrMtrlIsUpdatedFalse = () => {
    dispatch({
      type: TOGGLE_ISUPDATE,
      payload: false,
    });
  };

  //@1 add new mPrice
  const addMPrice = (srMtrlId) => {
    let srMaterials = srMtrls;
    let srMaterial = srMaterials.find(({ _id }) => _id === srMtrlId);

    const mtrlColorNum = srMaterial.mtrlColors.length;
    const sizeSPECNum = srMaterial.sizeSPECs.length;
    const mPriceNum = srMaterial.mPrices.length;
    const mPriceMaxNum = mtrlColorNum * sizeSPECNum;
    // console.log('this is mtrlColorNum', mtrlColorNum); // Test Code
    // console.log('this is sizeSPECNum', sizeSPECNum);
    // console.log('this is mPriceNum', mPriceNum);
    // console.log('this is mPriceMaxNum', mPriceMaxNum);
    // Prevent duplicated mPrice (repeated in set of color and spec)
    if (mPriceNum < mPriceMaxNum) {
      let cArr = [];
      let sArr = [];

      if (mPriceNum === 0) {
        cArr.push(srMaterial.mtrlColors[0].mColor);
        sArr.push(srMaterial.sizeSPECs[0].mSizeSPEC);
      } else {
        for (let i = 0; i < mtrlColorNum; i++) {
          let num = 0;
          srMaterial.mPrices.map((mPrice) => {
            if (mPrice.mColor === srMaterial.mtrlColors[i].mColor) {
              return (num = num + 1);
            }
          });
          if (num < sizeSPECNum) {
            cArr.push(srMaterial.mtrlColors[i].mColor);
            break;
          }
        }
        sArr = srMaterial.sizeSPECs.map((size) => {
          return size.mSizeSPEC;
        });
        srMaterial.mPrices.map((mPrice) => {
          if (mPrice.mColor === cArr[0]) {
            let idx = sArr.indexOf(mPrice.sizeSPEC);
            return sArr.splice(idx, 1);
          }
        });
      }

      console.log(cArr[0]);
      srMaterial.mPrices.push({
        id: uuidv4() + generateId(),
        mColor: cArr[0],
        sizeSPEC: sArr[0],
        unit: srMaterial.caseUnit,
        currency: 'USD',
        mPrice: '',
        moq: '',
        moqPrice: '',
        quotation: '',
      });
      dispatch({
        type: SRMTRL_UPDATE,
        payload: srMaterials,
      });
    }
  };

  //@1 Delete srMtrl
  const deleteSrMtrlPrice = async (ids) => {
    const srMtrlId = ids.srMtrlId;
    const mPriceId = ids.mPriceId;
    let srMaterials = srMtrls;
    srMaterials.map((srMtrl) => {
      return (srMtrl.mPrices = srMtrl.mPrices.filter(
        (mPrice) => mPrice.id !== mPriceId
      ));
    });

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const res = await axios.put(
      `/api/srmtrl/deleteprice/${srMtrlId}/${mPriceId}`,
      config
    );
    console.log('the result of delete Price', res.data);

    dispatch({
      type: SRMTRL_UPDATE,
      payload: srMaterials,
    });
  };

  // Basically update the value of item and unitConvertRatio for srMtrl
  const updateItemAndUnitConvertRation = (e) => {
    let srMaterials = srMtrls;
    const srMtrlId = e.target.id
    let srMaterial = srMaterials.find(({ _id }) => _id === srMtrlId);
    srMaterial[e.target.name] = e.target.value
    dispatch({
      type: SRMTRL_UPDATE,
      payload: srMaterials,
    });
  }

  //@1 Add Value to mPrice
  const addSrMtrlValue = (e, srMtrlId, mPriceList) => {
    // For label tag need to target the Id, so here we save the id in the e.target.name
    const mPriceId = e.target.name;
    let srMaterials = srMtrls;
    let srMaterial = srMaterials.find(({ _id }) => _id === srMtrlId);

    mPriceList.map((m) => {
      let matchPattern = `${m}${mPriceId}`;
      if (e.target.id === matchPattern) {
        srMaterial.mPrices.map((mPrice) => {
          if (mPrice.id === mPriceId) {
            mPrice[m] = e.target.value;
          }
        });
      }
    });
    dispatch({
      type: SRMTRL_UPDATE,
      payload: srMaterials,
    });
  };

  //@1 update mPrices
  const updateMPrices = async (body) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };


    const res = await axios.put('/api/srmtrl/update/mpricevalues', body, config).catch((err) => {
      return console.log('Upload srMtrl faild, server problems');
    });

    if (res.data[0]) {
      const err = res.data[0].err
      console.log('Multiple user login~!')
      dispatch({ type: UPDATE_ERROR, payload: err });
      setTimeout(() => {
        dispatch({ type: UPDATE_ERROR, payload: 'Jump to login page' });
      }, 3500);
    } else {
      dispatch({
        type: TOGGLE_ISUPDATE,
        payload: true,
      });
      return console.log('mPrice color updated');
    }

  };

  //@1 update quotation of material in mPrices
  const updateMPricesQuotation = async (body) => {
    // console.log('Yes triggered'); // Test Code
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };


    const res = await axios.put(
      '/api/srmtrl/update/mpricevalues/quotation',
      body,
      config
    ).catch((err) => {
      return console.log('Upload srMtrl faild, server problems');
    });

    if (res.data[0]) {
      const err = res.data[0].err
      console.log('Multiple user login~!')
      dispatch({ type: UPDATE_ERROR, payload: err });
      setTimeout(() => {
        dispatch({ type: UPDATE_ERROR, payload: 'Jump to login page' });
      }, 3500);
    } else {
      dispatch({
        type: TOGGLE_ISUPDATE,
        payload: true,
      });

      return console.log('mPrice color updated');
    }
  };

  //@1 Default the srMtrl states
  const clearSrMtrl = () => {
    dispatch({ type: SRMTRL_CLEAR });
  };

  const openSrMtrl = (srMtrlId) => {
    let list = state.editingList;
    const check = state.editingList.includes(srMtrlId);
    if (check) {
      list = state.editingList.filter((i) => {
        return i !== srMtrlId;
      });
      dispatch({ type: UPDATE_EDITING_LIST, payload: list });
    } else {
      // console.log('The push is triggered'); // test Code
      list.push(srMtrlId);
      dispatch({ type: UPDATE_EDITING_LIST, payload: list });
    }
  };

  const toggleMainPrice = (srMtrlId, mPriceId) => {
    const ids = {
      srMtrlId: srMtrlId,
      mPriceId: mPriceId,
    };
    // console.log('the Ids', ids); // Test Code
    dispatch({ type: TOGGLE_MAINPRICE, payload: ids });
  };

  const clearSrMtrlError = () => {
    dispatch({ type: UPDATE_ERROR, payload: null })
  }
  // const deletePrice = async (srMtrlId, mPriceId) => {
  //   const config = {
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //   };
  //   const res = await axios.put(`/api/srmtrl/${srMtrlId}/${mPriceId}`, config);
  //   console.log('the result of delete Price', res.data);
  // };

  //@ Returns------------------------------------------------------

  return (
    <SrMtrlContext.Provider
      value={{
        srMtrls: state.srMtrls,
        isUpdated: state.isUpdated,
        editingList: state.editingList,
        mainPrice: state.mainPrice,
        srMtrlError: state.srMtrlError,
        getSrMtrls,
        updateSrMtrlByMtrl,
        deleteSRMtrlByMtrl,
        turnSrMtrlIsUpdatedFalse,
        addMPrice,
        deleteSrMtrlPrice,
        updateItemAndUnitConvertRation,
        addSrMtrlValue,
        updateMPrices,
        updateMPricesQuotation,
        getSpecificSrMtrl,
        clearSrMtrl,
        openSrMtrl,
        toggleMainPrice,
        clearSrMtrlError,
        // mtrlColorOption,
        // sizeSPECOption,
        // deletePrice,
      }}
    >
      {props.children}
    </SrMtrlContext.Provider>
  );
};

export default SrMtrlState;
