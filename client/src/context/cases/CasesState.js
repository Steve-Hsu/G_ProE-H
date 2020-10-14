import React, { useReducer } from 'react';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import CasesContext from './casesContext';
import CasesReducer from './casesReducer';
import Papa from 'papaparse';

//@Global Header for token

import {
  SIZE_ADD,
  SIZE_UPDATE,
  CLR_WAY_ADD,
  CLR_WAY_UPDATE,
  MTRL_ADD,
  MTRL_UPDATE,
  MTRL_DELETE,
  CASE_DOWNLOAD,
  CASE_QTY_UPDATE,
  CASE_USER_NOT_AUTHORIZED,
  CASETYPE_UPDATE,
  STYLE_UPDATE,
  CLIENT_UPDATE,
  CASE_CLEAR,
  CASENO_CLEAR,
  TOGGLE_ISUPDATE,
  TOGGLE_CASE,
  TOGGLE_DISPALYTITALES,
  INPUTTAG_FILE_NAME,
  CASE_LIST_DOWNLOAD,
  CASE_MTRL_CARD,
  UPDATE_ERROR,
} from '../types';

const CasesState = (props) => {
  // @State
  const initialState = {
    caseList: [],
    _id: null, //It will generated automatically by mongoDB
    user: null,
    company: null,
    cNo: null,
    caseType: null,
    style: null,
    client: null,
    cWays: [],
    sizes: [],
    gQtys: [],
    mtrls: [],
    displayTitles: [
      {
        supplier: true,
      },
      {
        ref_no: true,
      },
      {
        position: true,
      },
      {
        descriptions: true,
      },
    ],
    poDate: null,
    osNo: null,
    formIsHalfFilledOut: true,
    caseError: null,
    isEditingCase: false,
    isUpdated: null,
    isBoardMode: false,
    isImportedExcel: false,
    inputFileName: 'Select a File...',
    showMtrlCard: false,
    merchandiser: null,
    lastUpdateBy: null,
    updateDate: null,
  };

  const generateId = () => {
    return (
      //generate 22 digits string with number or character.
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  };

  // @object Model
  // For setting state more convenient
  const newCWay = {
    id: '',
    gClr: '',
  };
  const newSize = {
    id: uuidv4() + generateId(),
    gSize: '',
  };
  let newgQty = {
    id: uuidv4() + generateId(),
    cWay: '',
    size: '',
    gQty: 0,
  };

  // According to React : default input should not be an 'null'
  const newMtrl = {
    // id: '',
    item: 'Item',
    // spec: '',
    supplier: '',
    ref_no: '',
    position: '',
    descriptions: [],
    unit: '',
    mtrlColors: [],
    sizeSPECs: [],
    cspts: [],
    expandColor: false,
    expandSizeSPEC: false,
    expandCspt: false,
    multipleColor: false,
    multipleSPEC: false,
    multipleCSPT: false,
    isEditingMtrl: false,
  };

  let newMtrlColor = {
    id: uuidv4() + generateId(),
    mtrl: '',
    cWay: '',
    mColor: '',
  };

  let newSizeSPEC = {
    id: uuidv4() + generateId(),
    mtrl: '',
    size: '',
    mSizeSPEC: '',
  };

  let newCspt = {
    id: uuidv4() + generateId(),
    cWay: '',
    size: '',
    gQty: '',
    mtrl: '',
    // Human readable info :
    mColor: '',
    mSizeSPEC: '',
    unit: '',
    cspt: 0,
    requiredMQty: 0,
  };

  const [state, dispatch] = useReducer(CasesReducer, initialState);
  const { sizes, cWays, gQtys, mtrls } = state;

  // @Actions ----------------------------------------------------------------------------------------------------------
  // Only applying in this scope for other functions ----------
  const updateMaterials = (materials) => {
    dispatch({ type: MTRL_UPDATE, payload: materials });
  };

  // @gQtys.gQty item ----------------------------
  const addQtyBycWay = (cWayId) => {
    console.log("I'am called"); // Test Code
    sizes.map((size) => {
      newgQty = {
        ...newgQty,
        id: uuidv4() + generateId(),
        cWay: cWayId,
        size: size.id,
      };
      addMtrlCsptBygQty(newgQty);
      return gQtys.push(newgQty);
    });
    dispatch({ type: CASE_QTY_UPDATE, payload: gQtys });
  };

  const addQtyBySize = (sizeId) => {
    cWays.map((cWay) => {
      newgQty = {
        ...newgQty,
        id: uuidv4() + generateId(),
        cWay: cWay.id,
        size: sizeId,
      };
      addMtrlCsptBygQty(newgQty);
      return gQtys.push(newgQty);
    });
    dispatch({ type: CASE_QTY_UPDATE, payload: gQtys });
  };

  // const deletegQtyBycWay = (cWayId) => {
  //   let Qtys = gQtys.filter((gQty) => gQty.cWay !== cWayId);
  //   // console.log("I'm here deleteQtyBycWay", Qtys); // Test Code
  //   dispatch({ type: CASE_QTY_UPDATE, payload: Qtys });
  // };

  // const deletegQtyBySize = (sizeId) => {
  //   let Qtys = gQtys.filter((gQty) => gQty.size !== sizeId);
  //   dispatch({ type: CASE_QTY_UPDATE, payload: Qtys });
  // };

  // @mtrl.cspts.cspt item ----------------------------
  const addMtrlCsptBygQty = (gQty) => {
    let materials = mtrls;

    materials.map((mtrl) => {
      newCspt = {
        ...newCspt,
        id: uuidv4() + generateId(),
        cWay: gQty.cWay,
        size: gQty.size,
        gQty: gQty.id,
        mtrl: mtrl.id,
        unit: mtrl.unit,
      };
      mtrl.cspts.map((cspt) => {
        if (cspt.size === newCspt.size) {
          newCspt.cspt = cspt.cspt;
        }
        return newCspt;
      });
      return mtrl.cspts.push(newCspt);
    });
    updateMaterials(materials);
  };

  const updateCsptgClr = (mtrlId, cWayId) => {
    let materials = mtrls;
    let material = materials.find(({ id }) => id === mtrlId);
    let garmentClr = cWays.find(({ id }) => id === cWayId).gClr;
    material.cspts.map((cspt) => {
      if (cspt.cWay === cWayId) {
        cspt.gClr = garmentClr;
      }
      return materials;
    });
    updateMaterials(materials);
  };

  const updateCsptgSize = (mtrlId, sizeId) => {
    let materials = mtrls;
    let material = materials.find(({ id }) => id === mtrlId);
    let garmentSize = sizes.find(({ id }) => id === sizeId).gSize;
    material.cspts.map((cspt) => {
      if (cspt.size === sizeId) {
        cspt.gSize = garmentSize;
      }
      return materials;
    });
    updateMaterials(materials);
  };

  const updateCsptmColor = (mtrlId, mtrlColorId) => {
    let materials = mtrls;
    let material = materials.find(({ id }) => id === mtrlId);
    let materialClrObj = material.mtrlColors.find(
      ({ id }) => id === mtrlColorId
    );
    let materialClr = materialClrObj.mColor;

    material.cspts.map((cspt) => {
      let cWayId = materialClrObj.cWay;
      if (cspt.cWay === cWayId) {
        cspt.mColor = materialClr;
      }
      return materials;
    });
    updateMaterials(materials);
  };

  const updateCsptmSizeSPEC = (mtrlId, SizeSPECId) => {
    let materials = mtrls;
    let material = materials.find(({ id }) => id === mtrlId);
    let sizeSPECObj = material.sizeSPECs.find(({ id }) => id === SizeSPECId);
    let materialSizeSPEC = sizeSPECObj.mSizeSPEC;

    material.cspts.map((cspt) => {
      let sizeId = sizeSPECObj.size;
      if (cspt.size === sizeId) {
        cspt.mSizeSPEC = materialSizeSPEC;
      }
      return materials;
    });
    updateMaterials(materials);
  };

  const updateCsptRequiredMQty = (mtrlId, gQtyId) => {
    console.log(gQtyId);
    let materials = mtrls;
    let material = materials.find(({ id }) => id === mtrlId);
    // console.log(
    //   'this is gQty',
    //   gQtys.find(({ id }) => id === gQtyId)
    // ); // Test Code
    let Qty = gQtys.find(({ id }) => id === gQtyId).gQty;

    material.cspts.map((cspt) => {
      if (cspt.gQty === gQtyId) {
        cspt.requiredMQty = cspt.cspt * Qty;
      }
      return materials;
    });
    updateMaterials(materials);
  };

  // const deleteMtrlCsptBycWay = (cWayId) => {
  //   console.log('deleteMtrlCspt is triggered');
  //   let materials = mtrls;
  //   materials.map((mtrl) => {
  //     return (mtrl.cspts = mtrl.cspts.filter((cspt) => cspt.cWay !== cWayId));
  //   });
  //   updateMaterials(materials);
  // };

  // const deleteMtrlCsptBySize = (sizeId) => {
  //   let materials = mtrls;
  //   materials.map((mtrl) => {
  //     return (mtrl.cspts = mtrl.cspts.filter((cspt) => cspt.size !== sizeId));
  //   });
  //   updateMaterials(materials);
  // };

  // @mtrl.mtrlColors.mtrlColor item ----------------------------
  const addMtrlColor = (cWayId) => {
    let materials = mtrls;

    materials.map((mtrl) => {
      newMtrlColor = {
        ...newMtrlColor,
        id: uuidv4() + generateId(),
        mtrl: mtrl.id,
        cWay: cWayId,
      };
      return mtrl.mtrlColors.push(newMtrlColor);
    });
    updateMaterials(materials);
  };

  // const deleteMtrlColor = (cWayId) => {
  //   // console.log('DeleteMtrlColor is triggered'); // Test Code
  //   let materials = mtrls;
  //   materials.map((mtrl) => {
  //     return (mtrl.mtrlColors = mtrl.mtrlColors.filter(
  //       (mtrlColor) => mtrlColor.cWay !== cWayId
  //     ));
  //   });
  //   updateMaterials(materials);
  // };

  // @mtrl.mSizeSPECs.mSizeSPEC item ----------------------------
  const addMtrlSizeSPEC = (sizeId) => {
    let materials = mtrls;
    materials.map((mtrl) => {
      newSizeSPEC = {
        ...newSizeSPEC,
        id: uuidv4() + generateId(),
        mtrl: mtrl.id,
        size: sizeId,
      };
      return mtrl.sizeSPECs.push(newSizeSPEC);
    });
    updateMaterials(materials);
  };

  // const deleteMtrlSizeSPEC = (sizeId) => {
  //   let materials = mtrls;
  //   materials.map((mtrl) => {
  //     return (mtrl.sizeSPECs = mtrl.sizeSPECs.filter(
  //       (mtrlSPEC) => mtrlSPEC.size !== sizeId
  //     ));
  //   });
  //   updateMaterials(materials);
  // };

  // @Export using functions ----------------------------------------------------------------------------------------------------------
  const addcWay = (e, newCWayId = uuidv4() + generateId()) => {
    if (e) {
      e.preventDefault();
    }

    if (cWays.length < 20) {
      // if (newCWayId === null) {
      //   newCWayId = uuidv4() + generateId();
      // }

      // Add the new color way to each material

      addQtyBycWay(newCWayId);
      addMtrlColor(newCWayId);

      dispatch({
        type: CLR_WAY_ADD,
        payload: { id: newCWayId, gClr: '' },
      });
    }

    // Update all new cspt generated by the new cWay.
    sizes.map((size) =>
      mtrls.map((mtrl) => {
        // update gSize in all new cspt generated by the new cWay.
        updateCsptgSize(mtrl.id, size.id);
        // update sizeSPEC in all new cspt generated by the new cWay.
        // The .find() will confused by name "size" of attribute in the sizes and the attribute of sizeSPECs, so must const a new name ,in this case, the "sizeId", for the size.id
        const sizeId = size.id;
        let mSizeSPECId = mtrl.sizeSPECs.find(({ size }) => size === sizeId).id;
        return updateCsptmSizeSPEC(mtrl.id, mSizeSPECId);
      })
    );
  };

  const updatecWay = (e) => {
    e.preventDefault();
    const targetID = e.target.id;
    // Prevent the computer confused two cWays so the variable named "colorWay"
    const colorWays = cWays;
    //Toggle the value
    colorWays.find(({ id }) => id === targetID).gClr = e.target.value;
    dispatch({ type: CLR_WAY_UPDATE, payload: colorWays });

    // update gColor in cspt
    mtrls.map((mtrl) => updateCsptgClr(mtrl.id, targetID));
  };

  // const deletecWay = (cWayId) => {
  //   //Delete the cWay in eatch mtrl
  //   deletegQtyBycWay(cWayId);
  //   deleteMtrlColor(cWayId);
  //   deleteMtrlCsptBycWay(cWayId);
  //   dispatch({ type: CLR_WAY_DELETE, payload: cWayId });
  // };

  const addSize = (e) => {
    // e.preventDefault : the e here is the app itself. Prevent it set back to default value
    e.preventDefault();
    // Add the new Size to each material

    if (sizes.length < 12) {
      addQtyBySize(newSize.id);
      addMtrlSizeSPEC(newSize.id);
      dispatch({ type: SIZE_ADD, payload: newSize });
    }

    // update gColor in all new cspt generated by the new Size.
    cWays.map((cWay) =>
      mtrls.map((mtrl) => {
        updateCsptgClr(mtrl.id, cWay.id);
        // update sizeSPEC in all new cspt generated by the new cWay.
        // The .find() will confused by name "size" of attribute in the sizes and the attribute of sizeSPECs, so must const a new name ,in this case, the "sizeId", for the size.id
        const cWayId = cWay.id;
        const mtrlColor = mtrl.mtrlColors.find(({ cWay }) => cWay === cWayId);
        let mColorId = new String();
        if (mtrlColor) {
          mColorId = mtrl.mtrlColors.find(({ cWay }) => cWay === cWayId).id;
          return updateCsptmColor(mtrl.id, mColorId);
        }
        // else {
        //   //If the mtrl dosen't have the mtrlColor match to the cWay, then push a new one.
        //   mColorId = uuidv4() + generateId();
        //   mtrl.mtrlColors.push({
        //     id: mColorId,
        //     mtrl: '',
        //     cWay: cWay.id,
        //     mColor: '',
        //   });
        // }
      })
    );
  };

  const updateSize = (e) => {
    e.preventDefault();
    const targetID = e.target.id;
    // Prevent the computer confused two cWays so the variable named "colorWay"
    let gSizes = sizes;
    //Toggle the value
    gSizes.find(({ id }) => id === targetID).gSize = e.target.value;
    dispatch({ type: SIZE_UPDATE, payload: gSizes });
    // update gSize in cspt
    mtrls.map((mtrl) => updateCsptgSize(mtrl.id, targetID));
  };

  // const deleteSize = (sizeId) => {
  //   //Delete the size SPEC in eatch mtrl
  //   deletegQtyBySize(sizeId);
  //   deleteMtrlSizeSPEC(sizeId);
  //   deleteMtrlCsptBySize(sizeId);
  //   dispatch({ type: SIZE_DELETE, payload: sizeId });
  // };

  const addMtrl = (e, newColorWays = null, mtrlObj = null) => {
    if (e) {
      e.preventDefault();
    }
    const newMtrlId = uuidv4() + generateId();
    if (mtrls.length < 500) {
      let mtrlColorNum = 0;
      let sizeSPECNum = 0;
      let gQtyNum = 0;
      let mtrlColors = [];
      let sizeSPECs = [];
      let cspts = [];
      let cWayLength = 0;
      let sizesLength = 0;
      let gQtyLength = 0;
      let multipleColor = false;

      let colorWays = cWays;
      if (newColorWays !== null) {
        colorWays = newColorWays;
      }
      console.log('newColorWays', newColorWays); //Test Code
      console.log('colorWays', colorWays); //Test Code

      if (colorWays.length === 0) {
        cWayLength = 1;
      } else {
        cWayLength = colorWays.length;
        multipleColor = true;
        mtrlColors = colorWays.map((colorWay, idx) => {
          mtrlColorNum = idx;
          let mColor = '';
          if (mtrlObj !== null) {
            let index = Number(idx + 1);
            mColor = mtrlObj[`colorway_${index}`];
          }
          return {
            ...newMtrlColor,
            id: uuidv4() + generateId(),
            mtrl: newMtrlId,
            cWay: colorWay.id,
            mColor: mColor,
          };
        });
      }

      if (sizes.length === 0) {
        sizesLength = 1;
      } else {
        sizesLength = sizes.length;
        sizeSPECs = sizes.map((size, idx) => {
          sizeSPECNum = idx;
          return {
            ...newSizeSPEC,
            id: uuidv4() + generateId(),
            mtrl: newMtrlId,
            size: size.id,
          };
        });
      }

      if (gQtys.length === 0) {
        gQtyLength = 1;
      } else {
        gQtyLength = gQtys.length;
        cspts = gQtys.map((gQty, idx) => {
          gQtyNum = idx;
          return {
            ...newCspt,
            id: uuidv4() + generateId(),
            cWay: gQty.cWay,
            size: gQty.size,
            gQty: gQty.id,
            mtrl: newMtrlId,
          };
        });
      }

      // console.log('the MtrlColors', mtrlColors); // Test Code

      // Make sure the 3 element, mtrlColors, sizeSPECs, and cspt are exising or done
      if (
        mtrlColorNum + 1 === cWayLength &&
        sizeSPECNum + 1 === sizesLength &&
        gQtyNum + 1 === gQtyLength
      ) {
        if (mtrlObj === null) {
          // Manual create a new mtrl
          dispatch({
            type: MTRL_ADD,
            payload: {
              ...newMtrl,
              id: newMtrlId,
              mtrlColors: mtrlColors,
              sizeSPECs: sizeSPECs,
              cspts: cspts,
              multipleColor: multipleColor,
            },
          });
        } else {
          // Create new mtrl by input a csv, the mtrlObj is the item in the csv sheet
          const { ref_no, position, CATEGORY } = mtrlObj;
          if (mtrlObj.undefined_1) {
            const lengthOfMtrlObj = Object.keys(mtrlObj).length;
            let descriptions = [];
            console.log(typeof mtrlObj);
            console.log('the length of mtrlObj', lengthOfMtrlObj);

            Object.keys(mtrlObj).map((key, idx) => {
              console.log('in the map', key);
              if (key.includes('undefined')) {
                descriptions.push(mtrlObj[key]);
              }
              if (idx + 1 == lengthOfMtrlObj) {
                dispatch({
                  type: MTRL_ADD,
                  payload: {
                    ...newMtrl,
                    item: CATEGORY,
                    ref_no,
                    position,
                    descriptions: descriptions,
                    id: newMtrlId,
                    mtrlColors: mtrlColors,
                    sizeSPECs: sizeSPECs,
                    cspts: cspts,
                    multipleColor: multipleColor,
                  },
                });
              }
            });
          } else {
            dispatch({
              type: MTRL_ADD,
              payload: {
                ...newMtrl,
                item: CATEGORY,
                ref_no,
                position,
                id: newMtrlId,
                mtrlColors: mtrlColors,
                sizeSPECs: sizeSPECs,
                cspts: cspts,
                multipleColor: multipleColor,
              },
            });
          }
        }
      }
    }
  };

  const deleteMtrl = async (caseId, mtrlId) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const res = await axios.put(
      `/api/case/deletemtrl/${caseId}/${mtrlId}`,
      config
    );

    dispatch({ type: MTRL_DELETE, payload: mtrlId });
  };

  // @Layer 2 functions ----------------------------------------------------------------------------------------------------------
  const expandExtraPanels = (e) => {
    e.preventDefault();
    //The id is set in the value of the btn when which is created. so here we fetch id by e.target.value.
    const mtrlId = e.target.value;
    const btnName = e.target.name;
    let materials = mtrls;
    let material = materials.find(({ id }) => id === mtrlId);

    switch (btnName) {
      case 'mtrlColor':
        material.expandColor = !material.expandColor;
        material.expandSizeSPEC = false;
        material.expandCspt = false;
        break;
      case 'SizeSPEC':
        material.expandColor = false;
        material.expandSizeSPEC = !material.expandSizeSPEC;
        material.expandCspt = false;
        break;
      case 'cspt':
        material.expandColor = false;
        material.expandSizeSPEC = false;
        material.expandCspt = !material.expandCspt;
        break;
      default:
    }
    updateMaterials(materials);
  };

  //@Add value from input to state ----------------------------------------------------------------------------------------------------------

  const addValueMtrlColor = (e) => {
    e.preventDefault();
    const mtrlId = e.target.name;
    const mtrlColorId = e.target.id;
    //??? This code works, however I still don't know why the sup variable will affect parent variable here.
    //There is something chainning the materials to the sub array material
    let materials = mtrls;
    let material = materials.find(({ id }) => id === mtrlId);
    material.mtrlColors.find(
      ({ id }) => id === mtrlColorId
    ).mColor = e.target.value.toLowerCase();

    updateMaterials(materials);
    //Update the mColor in cspt of the mtrl
    updateCsptmColor(mtrlId, mtrlColorId);
  };

  const addValueMtrlSizeSPEC = (e) => {
    e.preventDefault();
    const mtrlId = e.target.name;
    const mtrlSizeSPECId = e.target.id;
    //??? This code works, however I still don't know why the sup variable will affect parent variable here.
    //There is something chainning the materials to the sub array material
    let materials = mtrls;
    let material = materials.find(({ id }) => id === mtrlId);
    material.sizeSPECs.find(
      ({ id }) => id === mtrlSizeSPECId
    ).mSizeSPEC = e.target.value.toLowerCase();

    updateMaterials(materials);
    //Update the mSizeSPCE in cspt of the mtrl
    updateCsptmSizeSPEC(mtrlId, mtrlSizeSPECId);
  };

  const addValueMtrlCspt = (e) => {
    e.preventDefault();

    const mtrlId = e.target.name;
    // const sizeId = String(e.target.id).slice(4);
    //??? This code works, however I still don't know why the sup variable will affect parent variable here.
    //There is something chainning the materials to the sub array material
    let materials = mtrls;
    let material = materials.find(({ id }) => id === mtrlId);
    const sizeId = material.cspts.find(({ id }) => id === e.target.id).size;

    material.cspts.map((cspt) => {
      if (String(cspt.size) === sizeId) {
        // Prevent the value of number too big
        if (String(e.target.value).length > 5) {
          e.target.value = 99999;
          cspt.cspt = e.target.value;
        } else {
          cspt.cspt = e.target.value;
        }

        // let gQtyId = material.cspts.find(({ id }) => id === cspt.id).gQty;
        let gQtyId = cspt.gQty;
        updateCsptRequiredMQty(mtrlId, gQtyId);
      }
      return material;
    });

    updateMaterials(materials);
  };

  const addMtrlValue = (e) => {
    // e.preventDefault(); // I face problem with checkbox, after removing this function, everything works fine, even other input tag too.
    // For label tag need to target the Id, so here we save the id in the e.target.name
    console.log('the name of the addMtrlValue', e.target.name); // Test Code
    const mtrlId = e.target.name;
    let materials = mtrls;
    switch (e.target.id) {
      case 'Item' + String(mtrlId):
        materials.find(({ id }) => id === mtrlId).item = e.target.value;
        break;
      // case 'SPEC' + String(mtrlId):
      //   materials.find(({ id }) => id === mtrlId).spec = e.target.value;
      //   break;
      case 'Supplier' + String(mtrlId):
        materials.find(
          ({ id }) => id === mtrlId
        ).supplier = e.target.value.toUpperCase();
        break;
      case 'Ref_no' + String(mtrlId):
        materials.find(
          ({ id }) => id === mtrlId
        ).ref_no = e.target.value.toUpperCase();
        break;
      case 'Position' + String(mtrlId):
        materials.find(({ id }) => id === mtrlId).position = e.target.value;
        break;
      // case Number():
      //   // case e.target.id.includes('Description'):
      //   console.log("yes i'm triggred ");
      //   // materials.find(({ id }) => id === mtrlId).description = e.target.value;
      //   break;
      case 'unit' + String(mtrlId):
        // console.log('The unit Add value is called'); // Test Codes
        let material = materials.find(({ id }) => id === mtrlId);
        material.unit = e.target.value;
        material.cspts.map((cspt) => {
          cspt.unit = e.target.value;
          return material;
        });
        break;
      case 'multipleColor':
      case 'multipleSPEC':
      case 'multipleCSPT':
        materials.find(({ id }) => id === mtrlId)[e.target.id] = e.target
          .checked
          ? true
          : false;
        break;
      case 'isEditingMtrl':
        const bool = materials.find(({ id }) => id === mtrlId)[e.target.id];
        materials.find(({ id }) => id === mtrlId)[e.target.id] = !bool;
        break;
      //  setUser({ ...user, [e.target.id]: e.target.checked ? true : false });
      default:
    }
    updateMaterials(materials);
  };

  const addMtrlValueDescription = (e) => {
    const mtrlId = e.target.name;
    let materials = mtrls;
    const index = e.target.id;
    materials.find(({ id }) => id === mtrlId).descriptions[index] =
      e.target.value;
    updateMaterials(materials);
  };

  const addCaseValue = (e) => {
    // e.preventDefault();
    switch (e.target.name) {
      case 'style':
        dispatch({ type: STYLE_UPDATE, payload: e.target.value });
        break;
      case 'client':
        dispatch({
          type: CLIENT_UPDATE,
          payload: e.target.value,
        });
        break;
      case 'caseType':
        dispatch({ type: CASETYPE_UPDATE, payload: e.target.value });
        break;
      case 'gQty':
        let Qtys = gQtys;
        let Qty = Qtys.find(({ id }) => id === e.target.id);
        // Prevent the number too big
        if (String(e.target.value).length > 5) {
          e.target.value = 99999;
          Qty.gQty = e.target.value;
        } else {
          Qty.gQty = e.target.value;
        }

        dispatch({ type: CASE_QTY_UPDATE, payload: Qtys });
        mtrls.map((mtrl) => updateCsptRequiredMQty(mtrl.id, Qty.id));
        break;
      case 'isEditingCase':
        if (state.isEditingCase) {
          defaultCase();
        } else {
          dispatch({ type: TOGGLE_CASE, payload: e.target.name });
        }
        break;
      case 'isBoardMode':
      case 'isImportedExcel':
        // console.log('Yes here is toggled'); // TestCode
        dispatch({ type: TOGGLE_CASE, payload: e.target.name });
        break;
      case 'displayTitles':
        e.preventDefault();
        // console.log(e.target.id); // Test code
        dispatch({ type: TOGGLE_DISPALYTITALES, payload: e.target.id });
        break;
      case 'inputFileName':
        e.preventDefault();

        let fileName = e.target.value.slice(12, -1);
        dispatch({
          type: INPUTTAG_FILE_NAME,
          payload: fileName,
        });

        break;
      default:
    }
  };

  // @Other functions ----------------------------------------------------------------------------------------------------------

  // add newcase or upload case to database - Submit form
  const uploadCase = async (
    cases,
    caseId = 'newCase',
    isDownLoadCase = true
  ) => {
    console.log('uploadNewCase is called in state'); // Test Code
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };


    const res = await axios.post(`/api/case/upload/${caseId}`, cases, config).catch((err) => {
      dispatch({
        type: CASE_USER_NOT_AUTHORIZED,
        payload: 'You are not authorized to generate a new case',
      });
      console.log(
        'Upload new case faild, The user not authorized to update this case'
      );
    });


    if (res.data[0]) {
      const err = res.data[0].err
      console.log('Multiple user login~!')
      dispatch({ type: UPDATE_ERROR, payload: err });
      setTimeout(() => {
        dispatch({ type: UPDATE_ERROR, payload: null });
      }, 3500);
    } else {
      console.log('Upload succeed!');
      if (isDownLoadCase) {
        //This dispatch is nothing related to the upload, just after upload we need to take back the cases to feed to the state for the UI is updated to inform the user, so here use CASE_DOWNLOAD
        dispatch({ type: CASE_DOWNLOAD, payload: res.data });
        dispatch({ type: TOGGLE_ISUPDATE, payload: true });
      }
    }
    return res.data;


  };

  // // Upload existing case- Submit form
  // const uploadCase = async (cases, caseId, isDownLoadCase = true) => {
  //   console.log('UploadCase is triggered');
  //   console.log(caseId);
  //   console.log(cases);
  //   const config = {
  //     headers: {
  //       'Content-Type': 'application/json',
  //     },
  //   };

  //   try {
  //     const res = await axios.post(`/api/case/upload/${caseId}`, cases, config);
  //     console.log('Update succeed!');
  //     if (isDownLoadCase) {
  //       //This dispatch is nothing related to the upload, just after upload we need to take back the cases to feed to the state for the UI is updated to inform the user, so here use CASE_DOWNLOAD
  //       dispatch({ type: CASE_DOWNLOAD, payload: res.data });
  //       dispatch({ type: TOGGLE_ISUPDATE, payload: true });
  //     }
  //     return res.data;
  //   } catch (err) {
  //     dispatch({
  //       type: CASE_USER_NOT_AUTHORIZED,
  //       payload: 'You are not authorized to Update the case',
  //     });
  //     console.log(
  //       'Update case faild, The user not authorized to update this case'
  //     );
  //   }
  // };

  //Download Existing Case
  const downloadCase = async (id) => {
    if (id != 'emptycase') {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const res = await axios.get(`/api/case/existingcase/${id}`, config);


      if (res.data[0]) {
        const err = res.data[0].err
        console.log('Multiple user login~!')
        dispatch({ type: UPDATE_ERROR, payload: err });
        setTimeout(() => {
          dispatch({ type: UPDATE_ERROR, payload: null });
        }, 3500);
      } else {
        console.log('Download succeed!');
        dispatch({ type: CASE_DOWNLOAD, payload: res.data });
      }
    }
  };

  //Clear all the data in state, when user logout
  const defaultCase = () => {
    dispatch({ type: CASE_CLEAR });
  };

  //Clear case no of existing case for copying and  uploading it as new Case.
  const clearcNo = (mtrls) => {
    const cWayPart = new Promise(async (resolve) => {
      let newColorWays = [];
      let num = 0;
      newColorWays = await cWays.map((cWay, idx) => {
        cWay.id = uuidv4() + generateId();
        num = idx;
        return cWay;
      });
      if (num + 1 === cWays.length) {
        resolve(newColorWays);

        console.log(
          'the resolve, the newColorWays',
          newColorWays,
          'the num',
          num
        );
      }
    });

    const sizePart = new Promise(async (resolve) => {
      let newSizes = [];
      let num = 0;
      newSizes = await sizes.map((size, idx) => {
        size.id = uuidv4() + generateId();
        num = idx;
        return size;
      });
      if (num + 1 === sizes.length) {
        // console.log('the newSizes', newSizes);
        resolve(newSizes);
      }
    });

    const gQtyPart = new Promise(async (resolve) => {
      Promise.all([cWayPart, sizePart]).then(async (result) => {
        const newColorWays = result[0];
        const newSizes = result[1];
        console.log('newColorWays in gQtyPart', newColorWays);
        console.log('newSizes in gQtyPart', newSizes);
        let newgQtys = [];
        let num = 0;
        let gQtysLength = gQtys.length;
        let cWayLength = cWays.length;
        // let sizeLength = sizes.length;
        let cWayKey = gQtysLength / cWayLength;
        // let sizeKey = gQtysLength / sizeLength;
        let cWayIdx = 0;
        let sizeIdx = 0;
        // const getIndex = (length, idx)=>{
        //   let number = (idx + 1) % length

        // }
        // const getId = (obj, idx) => {
        //   return obj[idx].id;
        // };

        await gQtys.map((gQty, idx) => {
          let checkcWay = (idx + 1) % cWayKey;
          const newObj = {
            id: uuidv4() + generateId(),
            cWay: newColorWays[cWayIdx].id,
            size: newSizes[sizeIdx].id,
            gQty: gQty.gQty,
          };

          newgQtys.push(newObj);

          // console.log(
          //   'checkcWay',
          //   checkcWay,
          //   'the cwayIdx',
          //   cWayIdx,
          //   'the (idx + 1)',
          //   idx + 1
          // ); // Test code
          // console.log('the sizeIndx', sizeIdx, 'the (idx +1 ', idx + 1); // Test Code
          // console.log('The cWay Id', newColorWays[cWayIdx].id);
          // console.log('the size Id ', newSizes[sizeIdx].id);

          sizeIdx = sizeIdx + 1;

          if (checkcWay) {
          } else {
            cWayIdx = cWayIdx + 1;
            sizeIdx = 0;
          }

          num = idx;
        });
        if (num + 1 === gQtys.length) {
          console.log('the newgQtys', newgQtys);
          resolve(newgQtys);
        }
      });
    });
    Promise.all([cWayPart, sizePart, gQtyPart]).then(async (result) => {
      const newColorWays = result[0];
      const newSizes = result[1];
      const newgQtys = result[2];

      console.log('newColorWays,', newColorWays);
      console.log('newSize', newSizes);
      console.log('newgQtys', newgQtys);
      const MtrlPart = new Promise((resolve) => {
        if (mtrls.length > 0) {
          mtrls.map((mtrl, mtrlIdx) => {
            mtrl.id = uuidv4() + generateId();

            const mtrlcWayPart = new Promise((resolve) => {
              mtrl.mtrlColors.map((mtrlColor, idx) => {
                mtrlColor.id = uuidv4() + generateId();
                mtrlColor.mtrl = mtrl.id;
                mtrlColor.cWay = newColorWays[idx].id;
                if (idx + 1 === newColorWays.length) {
                  resolve();
                }
              });
            });
            const mtrlSizePart = new Promise((resolve) => {
              mtrl.sizeSPECs.map((spec, idx) => {
                spec.id = uuidv4() + generateId();
                spec.mtrl = mtrl.id;
                spec.size = newSizes[idx].id;
                if (idx + 1 === newSizes.length) {
                  resolve();
                }
              });
            });

            const mtrlgQtyPart = new Promise((resolve) => {
              mtrl.cspts.map((cspt, idx) => {
                cspt.id = uuidv4() + generateId();
                cspt.cWay = newgQtys[idx].cWay;
                cspt.size = newgQtys[idx].size;
                cspt.gQty = newgQtys[idx].id;
                cspt.mtrl = mtrl.id;
                if (idx + 1 === newgQtys.length) {
                  resolve();
                }
              });
            });

            Promise.all([mtrlcWayPart, mtrlSizePart, mtrlgQtyPart]).then(() => {
              if (mtrlIdx + 1 === mtrls.length) {
                return resolve(mtrls);
              }
            });
          });
        } else {
          return resolve([]);
        }
      });

      Promise.all([MtrlPart]).then((result) => {
        const mtrls = result[0];
        const body = {
          cWays: newColorWays,
          sizes: newSizes,
          gQtys: newgQtys,
          mtrls: mtrls,
        };
        dispatch({ type: CASENO_CLEAR, payload: body });
      });
    });
  };

  //@ turn isUpdated false
  const turnCaseIsUpdatedFalse = () => {
    dispatch({ type: TOGGLE_ISUPDATE, payload: false });
  };

  const deletecWayOrgSize = async (subject, caseId, subjectId) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const body = {
      subject: subject,
    };
    console.log(caseId, 'in the state');

    try {
      const res = await axios.put(
        `/api/case/delete/${caseId}/${subjectId}`,
        body,
        config
      );
      dispatch({ type: CASE_DOWNLOAD, payload: res.data });
    } catch (err) {
      console.log('Download new case faild, server problems');
    }
  };

  const getStyleFromCSV = (csv) => {
    if (csv[0].style) {
      dispatch({ type: STYLE_UPDATE, payload: csv[0].style });
    }
    // Count how many color way
    const colorWayKeys = Object.keys(csv[0]).filter((i) => i.includes('color'));
    // console.log(colorWayKeys); // Test code

    // Insert cWays form csv
    let colorWays = cWays;

    colorWayKeys.map((i) => {
      const newcWayId = uuidv4() + generateId();
      addcWay(null, newcWayId);
      colorWays.push({ id: newcWayId, gClr: '' });
    });

    console.log('the colorWays in getStyleFromCSV', colorWays);
    // });
    csv.map((mtrlObj, idx) => {
      // console.log('The 1st step addMtrl should be called');
      addMtrl(null, colorWays, mtrlObj);
    });
  };

  const getM_list = async (JSONBOM) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // const url = 'http://127.0.0.1:5000/m-list'; // This original port will conflcit so I change it
    // const url = 'http://localhost:8000/m-list'; // Local coreFun, this works fine locally
    const url = 'https://g-proe-m-list-generator.herokuapp.com/m-list'; // Cloud coreFun

    const res = await axios.post(`${url}`, JSONBOM, config);
    const csv = res.data;

    console.log('The csv, the res.data', csv);

    if (csv) {
      Papa.parse(csv, {
        header: true,
        // download: true, // When the "csv" is a path, to local or url, this option must be used
        complete: async (result) => {
          // console.log('The result in complete', result.data); // Test Code
          getStyleFromCSV(result.data);
          // console.log('In the left bar', cWays); // Test Code
        },
      });
    } else {
      console.log('Please Select a csv file before reading it');
    }

    // console.log(res.data);
    return null;
  };

  const getCaseList = async () => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    const res = await axios.get('/api/case/', config);
    // console.log('download succeed!', res.data); // Test Code

    if (res.data.length === 0) {
      dispatch({ type: UPDATE_ERROR, payload: 'No case found.' });
      setTimeout(() => {
        dispatch({ type: UPDATE_ERROR, payload: null });
      }, 3500);
    } else if (res.data[0].err) {
      console.log('Multiple user login~!')
      dispatch({ type: UPDATE_ERROR, payload: res.data[0].err });
      setTimeout(() => {
        dispatch({ type: UPDATE_ERROR, payload: null });
      }, 3500);
    } else {
      dispatch({ type: CASE_LIST_DOWNLOAD, payload: res.data });
    }

  };

  const deleteCase = async (caseId) => {
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    await axios.delete(`/api/case/${caseId}`, config);
    defaultCase();
  };

  const toggleMtrlCard = () => {
    dispatch({ type: CASE_MTRL_CARD });
  };

  const clearCaseError = () => {
    dispatch({ type: UPDATE_ERROR, payload: null });
  }

  return (
    <CasesContext.Provider
      value={{
        caseList: state.caseList,
        _id: state._id,
        user: state.user,
        company: state.company,
        cNo: state.cNo,
        caseType: state.caseType,
        style: state.style,
        client: state.client,
        cWays: state.cWays,
        sizes: state.sizes,
        gQtys: state.gQtys,
        mtrls: state.mtrls,
        deletedMtrls: state.deletedMtrls,
        formIsHalfFilledOut: state.formIsHalfFilledOut,
        isEditingCase: state.isEditingCase,
        isUpdated: state.isUpdated,
        isBoardMode: state.isBoardMode,
        displayTitles: state.displayTitles,
        isImportedExcel: state.isImportedExcel,
        inputFileName: state.inputFileName,
        osNo: state.osNo,
        poDate: state.poDate,
        showMtrlCard: state.showMtrlCard,
        merchandiser: state.merchandiser,
        lastUpdateBy: state.lastUpdateBy,
        updateDate: state.updateDate,
        caseError: state.caseError,
        addCaseValue,
        addcWay,
        updatecWay,
        addSize,
        updateSize,
        // deleteSize,// If it end up not be used, you should delete the action in the state and reducer
        // deletecWay,
        addMtrl,
        deleteMtrl,
        expandExtraPanels,
        addValueMtrlColor,
        addValueMtrlSizeSPEC,
        addValueMtrlCspt,
        addMtrlValue,
        addMtrlValueDescription,
        uploadCase,
        downloadCase,
        defaultCase,
        clearcNo,
        turnCaseIsUpdatedFalse,
        deletecWayOrgSize,
        getStyleFromCSV,
        getM_list,
        getCaseList,
        deleteCase,
        toggleMtrlCard,
        clearCaseError,
      }}
    >
      {props.children}
    </CasesContext.Provider>
  );
};

export default CasesState;
