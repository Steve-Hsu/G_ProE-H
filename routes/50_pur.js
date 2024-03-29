const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const authUser = require('../middleware/authUser');
// Not set up yet, for check the value entered by user at the some specific column
// const { check, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const myModule = require('../myModule/myModule');

const User = require('../models/10_User');
const Case = require('../models/20_Case');
const SRMtrl = require('../models/30_SRMtrl');
const OS = require('../models/50_OS');
const CS = require('../models/60_CS');

// @route   GET api/purchase/oslist
// @desc    Read the compnay's all of order Summary from database, and return limited datas
// @access  Private
router.get('/oslist', authUser, async (req, res) => {
  let user = await User.findById(req.user.id);
  //Check if multiple login, if yes, do nothing
  const token = req.header('x-auth-token');
  if (user.sKey !== token) {
    const msg = { err: 'Multiple user login, please login again.' }
    console.log(msg)
    return res.json([msg])
  }
  //Check if the user have the right
  if (!user.po) {
    return res.status(400).json({ msg: 'Out of authority' });
  }
  const comId = req.user.company;
  const osList = await OS.find({ company: comId }, { company: 0, suppliers: 0, caseMtrls: 0 }).sort({ osNo: 1 });
  // console.log('the osList', osList) // test code
  if (osList.length === 0) {
    console.log('No os Found')

    return res.json([])
  } else {
    console.log('osList is returned')
    return res.json(osList);
  }
});


// @route   GET api/purchase/ordersummary/osNo
// @desc    get the specific os by osNo
// @access  Private
router.get('/ordersummary/:osNo', authUser, async (req, res) => {
  let user = await User.findById(req.user.id);
  const osNo = req.params.osNo
  //Check if multiple login, if yes, do nothing
  const token = req.header('x-auth-token');

  // @Due to I don't figure out how to block in this section when multiple user happned, I let this router can pass multiple user.
  // @Here may be a hole but I've block from beginning and the end, 
  // if (user.sKey !== token) {
  //   const msg = { err: 'Multiple user login, please login again.' }
  //   console.log(msg)
  //   return res.json(msg)
  // }

  //Check if the user have the right
  if (!user.po) {
    return res.status(400).json({ msg: 'Out of authority' });
  }
  const comId = req.user.company;
  const osList = await OS.findOne({ company: comId, osNo: osNo }, { company: 0 });
  // console.log('the osList', osList) // test code
  if (osList) {
    console.log('osList is returned')
    return res.json(osList);

  } else {
    console.log('No os Found')
    return res.json({})
  }
});

// @route   post api/purchase
// @desc    generate order summary by the list of case's Id, then generate purchases orders seperated by suppliers.
// @access  Private
router.post('/', authUser, async (req, res) => {
  console.log('Generate Order Summary by cases selected');
  const user = await User.findById(req.user.id);

  //Check if multiple login, if yes, do nothing
  const token = req.header('x-auth-token');
  if (user.sKey !== token) {
    const msg = { err: 'multiple user login, please login again.' }
    console.log(msg);
    return res.json(msg);
  }
  //Check if the user have the right
  if (!user.po) {
    return res.status(400).json({ msg: 'Out of authority' });
  }
  const comId = req.user.company;
  const selectedCNos = req.body;
  const comName = user.comName;
  const comSymbol = user.comSymbol;
  const lossInform = user.loss;


  // @ Create OS number -------------------------------------------------

  //Get last 2 digits of year
  const strDate = new Date(); // By default Date empty constructor give you Date.now
  let shortYear = strDate.getFullYear();
  let twoDigitYear = shortYear.toString().substr(-2); // Add this line
  let newOsNO = ''

  // Get the number of os
  let osQty = 1;
  const oss = await OS.find({
    $and: [
      { company: comId },
      { osNo: { $regex: comSymbol + twoDigitYear + 'POS', $options: 'i' } }, // Query the same cases in same year by cNo, It promises return cases of same company in same year
    ],
  }).sort({
    osNo: 1,
  });
  const makingOsNumber = new Promise((resolve) => {
    const checkOsNumber = new Promise((resolve) => {
      if (oss.length < 1) {
        resolve()
      } else {
        //Check the number of os, include the new os.
        //for example, If current os number is 5, then the new os would be 6th os.
        osQty = Number(osQty + oss.length);
        for (var idx = 0; idx < oss.length; idx++) {
          const checkOsNo = oss[idx].osNo.slice(0, -String(idx + 1).length) + String(idx + 1)
          // console.log("the checkOsNo", checkOsNo) // Test code
          if (oss[idx].osNo !== checkOsNo) {
            osQty = Number(idx + 1)
            resolve()
            break;
          }
          if (idx + 1 === oss.length) {
            resolve()
          }
        }
      }
    })

    Promise.all([checkOsNumber]).then(() => {
      const digits = 5 - osQty.toString().length;
      const osNumber = [];
      for (let i = 1; i <= digits; i++) {
        osNumber.push('0');
      }
      osNumber.push(osQty);
      // Create new Os number
      let newOsNumber = osNumber.toString().split(',').join('');
      newOsNO = comSymbol + twoDigitYear + 'POS' + '_' + newOsNumber;
      console.log("the osQty", osQty)
      console.log("the newOsNo", newOsNO)
      return resolve()
    })
  })

  //@ Define the elements for OS -------------------------------------------------
  let caseList = [];
  // let clientList = [];
  let supplierList = [];
  let caseMtrls = [];
  //@ Define the elements for CS -------------------------------------------------
  let csOrder = []

  // @ create object for caseMtrls -------------------------------------------------
  // Loop through cases

  console.log('Start the promise, inserCaseMtrls');
  const insertCaseMtrls = selectedCNos.map(async (cNo) => {
    return new Promise(async (resolve) => {

      const theCase = await Case.findOne({
        cNo: cNo,
        company: comId,
        poDate: null,
        caseConfirmDate: { $ne: null }, // Only order summary the Case that has confirmed by merchandiser.
      });
      const caseId = theCase._id;
      if (!theCase) {
        const msg =
          "One of case dosen't exist or has being purchased by other order summary";
        console.log(msg);
        return res.status(404).json({
          msg: msg,
        });
      }
      csOrder.push(theCase.cNo)
      const mtrls = theCase.mtrls;
      const gQtys = theCase.gQtys;

      if (mtrls.length === 0 || !mtrls || gQtys.length === 0 || !gQtys) {
        //If the case don't have mtrls or gQtys, which means no cspt can be calculated, then it will skip the case
        // resolve();
      } else {
        caseList.push({
          caseId: caseId,
          cNo: theCase.cNo,
          style: theCase.style,
          client: theCase.client,
          caseType: theCase.caseType
        });
        // clientList.push(theCase.clients);
        const loopMtrls = mtrls.map(async (mtrl) => {
          const csr = comName + comSymbol + mtrl.supplier + mtrl.ref_no;
          const lowerCasecsr = csr.toLowerCase();
          const CSRIC = lowerCasecsr.replace(/[^\da-z]/gi, ''); // Only read from "0" to "9" & "a" to "z"
          const srMtrl = await SRMtrl.findOne({ CSRIC: CSRIC, })
          const theConvertRatio = Number(srMtrl.caseUnits.find(({ caseUnit }) => caseUnit === mtrl.unit).unitConvertRatio) > 0 ?
            Number(srMtrl.caseUnits.find(({ caseUnit }) => caseUnit === mtrl.unit).unitConvertRatio) : 1;
          return new Promise((resolve) => {

            // const mtrlId = mtrl.id;
            const cspts = mtrl.cspts;
            const supplier = mtrl.supplier;
            const ref_no = mtrl.ref_no;
            // console.log('mtrl start ', caseId, mtrlId); // Test Code
            const itemNameOfTheMtrl = mtrl.item
              ? mtrl.item.toLowerCase()
              : 'other';
            const lossItemOfTheMtrl =
              lossInform[itemNameOfTheMtrl] || lossInform['other'];

            const csptLoops = cspts.map((cspt) => {
              return new Promise((resolve) => {

                //Check the Existing caseMtrls object
                //The condition
                // console.log('cspt start ', caseId, mtrlId, cspt.id); // Test Code

                // Check the loss of cspt
                lossInform;
                let theLossPercentage = 0;
                const thegQty = gQtys.filter(
                  (i) => i.cWay === cspt.cWay && i.size === cspt.size
                )[0];
                if (thegQty.gQty > lossInform.sets[2]['set3']) {
                  if (thegQty.gQty > lossInform.sets[3]['set4']) {
                    if (thegQty.gQty > lossInform.sets[4]['set5']) {
                      theLossPercentage = lossItemOfTheMtrl.loss6;
                    } else {
                      theLossPercentage = lossItemOfTheMtrl.loss5;
                    }
                  } else {
                    theLossPercentage = lossItemOfTheMtrl.loss4;
                  }
                } else {
                  if (thegQty.gQty < lossInform.sets[1]['set2']) {
                    if (thegQty.gQty < lossInform.sets[0]['set1']) {
                      theLossPercentage = lossItemOfTheMtrl.loss1;
                    } else {
                      theLossPercentage = lossItemOfTheMtrl.loss2;
                    }
                  } else {
                    theLossPercentage = lossItemOfTheMtrl.loss3;
                  }
                }

                //The quantity of the mtrl
                const purchaseLossQtySumUp =
                  cspt.requiredMQty * Number(theLossPercentage / 100);

                const currentCsptMtrl = {
                  supplier: supplier,
                  ref_no: ref_no,
                  mColor: cspt.mColor,
                  mSizeSPEC: cspt.mSizeSPEC,
                };

                // The default, existCaseMtrl must be an empty Array,
                // If there are nothing in the array, then push a new caseMtrl,
                // If there are nothing matched to current mtrl, then push a new caseMtrl,
                //    Else, use the existing caseMtrl in the existCaseMtrl and add the requested Qty to it.
                const existCaseMtrl = caseMtrls.filter((i) => {
                  for (var key in currentCsptMtrl) {
                    if (i[key] === undefined || i[key] != currentCsptMtrl[key]) {
                      return false;
                    }
                  }
                  return true;
                });

                console.log('The existCaseMtrl', existCaseMtrl); // Test Code

                if (existCaseMtrl.length === 0) {
                  const checkSupplier = supplierList.filter(
                    (s) => s.supplier === supplier
                  ).length;
                  if (!checkSupplier) {
                    supplierList.push({
                      supplier: supplier,
                      conditions: [],
                      poConfirmDate: null,
                    });
                  }
                  // Convert Unit 

                  const unitConvertedRequiredMQty = cspt.requiredMQty / theConvertRatio;
                  const unitConvertedLossQtySumUp = purchaseLossQtySumUp / theConvertRatio

                  // Round it number to 2 decimal
                  // const roundRequiredMQty = Math.round((cspt.requiredMQty + Number.EPSILON) * 100) / 100;
                  // @ 2020/11/04 - I think it is convinent and save cost of time as the purchase number of materials shouldn't have decimal number.
                  // The loss don't allow the decimal ditigal, the smallest number is 1, round up all the decimal number.
                  // const celiedRequiredMQty = Math.ceil(cspt.requiredMQty);
                  // const ceiledLossQtySumUp = Math.ceil(purchaseLossQtySumUp);

                  const celiedRequiredMQty = Math.ceil(unitConvertedRequiredMQty);
                  const ceiledLossQtySumUp = Math.ceil(unitConvertedLossQtySumUp);

                  // New caseMtrls
                  caseMtrls.push({
                    checkCaseMtrlCode: uuidv4() + myModule.generateId(), // Notice: This code, or say id, must have, for checking the duplicated Materials right before mongoDB give it an _id
                    cases: [theCase.cNo],
                    supplier: supplier,
                    ref_no: ref_no,
                    mColor: cspt.mColor,
                    mSizeSPEC: cspt.mSizeSPEC,
                    purchaseQtySumUp: celiedRequiredMQty,
                    // purchaseQtySumUp: cspt.requiredMQty,
                    purchaseLossQtySumUp: ceiledLossQtySumUp,
                    // purchaseLossQtySumUp: purchaseLossQtySumUp,
                    purchaseMoqQty: 0,
                    hsCode: null,
                    item: itemNameOfTheMtrl,
                  });
                  // Resolve for promise "csptLoops"
                  console.log("the promise, csptLoops resolved, in new caseMtrl")
                  resolve();
                } else {
                  // existCaseMtrl.purchaseQtySumUp += cspt.requiredMQty;
                  const currentCaseMtrlCode = existCaseMtrl[0].checkCaseMtrlCode;
                  caseMtrls.map((caseMtrl) => {
                    if (caseMtrl.checkCaseMtrlCode === currentCaseMtrlCode) {
                      if (!caseMtrl.cases.includes(theCase.cNo)) {
                        caseMtrl.cases.push(theCase.cNo);
                      }
                      ;
                      ;
                      // Round it number to 2 decimal
                      // Round the number in the final, so the number rounded will be closer to original number.
                      // caseMtrl.purchaseQtySumUp = Math.round((caseMtrl.purchaseQtySumUp + Number.EPSILON) * 100) / 100;
                      // caseMtrl.purchaseLossQtySumUp = Math.round((caseMtrl.purchaseLossQtySumUp + Number.EPSILON) * 100) / 100;
                      // @ 2020/11/04 - I think it is convinent and save cost of time as the purchase number of materials shouldn't have decimal number.
                      // Convert Unit 
                      const unitConvertedRequiredMQty = cspt.requiredMQty / theConvertRatio;
                      const unitConvertedLossQtySumUp = purchaseLossQtySumUp / theConvertRatio
                      caseMtrl.purchaseQtySumUp = Math.ceil(caseMtrl.purchaseQtySumUp + unitConvertedRequiredMQty)
                      caseMtrl.purchaseLossQtySumUp = Math.ceil(caseMtrl.purchaseLossQtySumUp + unitConvertedLossQtySumUp);
                    }
                  });
                  // console.log('csptNum', csptNum, 'csptLength', cspts.length);
                  // console.log('mtrlNum', mtrlNum, 'mtrlsLength', mtrls.length);
                  // console.log('caseNum', caseNum, 'caseLength', selectedCNos.length);

                  // Resolve for promise "csptLoops"
                  console.log("the promise, csptLoops resolved, in existing caseMtrl")
                  resolve()
                }
              });
            })
            Promise.all(csptLoops).then(() => {
              // Resolve for promise "loopMtrls"
              console.log("the promise, loopMtrls resolved")
              resolve();
            })
          })
        })
        Promise.all(loopMtrls).then(() => {
          //     // Resolve for promise "insertCaseMtrls"
          console.log("the promise, insertCaseMtrls resolved")
          resolve();
        })
      }
    }).catch((err) => {
      return reject(err);
    });
  });

  const convertUnit = new Promise((resolve) => {
    Promise.all(insertCaseMtrls).then(() => {
      const convertUnitForThreads = caseMtrls.map((csMtrl) => {
        return new Promise(async (resolve) => {
          if (csMtrl.item === 'thread') {
            console.log("the caseMtrl in thread is detected.")
            const theSrMtrl = await SRMtrl.findOne({ supplier: csMtrl.supplier, ref_no: csMtrl.ref_no })
            const theRatio = theSrMtrl.unitConvertRatio

            csMtrl.purchaseQtySumUp = csMtrl.purchaseQtySumUp !== 0 || theRatio !== 0 ?
              Math.ceil(csMtrl.purchaseQtySumUp / theRatio) : csMtrl.purchaseQtySumUp
            csMtrl.purchaseLossQtySumUp = csMtrl.purchaseLossQtySumUp !== 0 || theRatio !== 0 ?
              Math.ceil(csMtrl.purchaseLossQtySumUp / theRatio) : csMtrl.purchaseLossQtySumUp

            // console.log("theSrMtrl", theSrMtrl)
            // console.log("the ratio", theRatio)
            // console.log("the caseMtrl.qty", csMtrl.purchaseQtySumUp)

            // Resolve for promise convertUnitForThreads
            resolve()
          } else {
            // console.log("the caseMtrl in .")
            // Resolve for promise convertUnitForThreads
            resolve()
          }
        })
      })

      Promise.all(convertUnitForThreads).then(() => {
        // Resolve for promise "convertUnit"
        console.log("the promise, convertUnit resolved")
        resolve();
      })
    });
  })

  //@ Create an Order Summary to OS collection -------------------------------------------------
  Promise.all([makingOsNumber, convertUnit])
    .then(() => {
      const finalPromise = new Promise(async (resolve) => {
        console.log('The finalPromise start');
        const orderSummary = new OS({
          company: comId,
          osNo: newOsNO,
          caseList: caseList,
          suppliers: supplierList,
          caseMtrls: caseMtrls,
        });

        await orderSummary.save();
        resolve();
        console.log('The order summary is generated');

      }).then(async () => {
        //Update the poDate and osNo for the case.
        selectedCNos.map(async (cNo) => {
          await Case.updateOne(
            { company: comId, cNo: cNo },
            { $currentDate: { poDate: Date }, $set: { osNo: newOsNO } }
          );
        });
      })

      Promise.all([finalPromise]).then(async () => {
        const result = await OS.find(
          { company: comId },
          { company: 0 }
        );
        // This is returned to the frontEnd
        console.log('OsList is returned');
        res.json(result)
      }).then(async () => {
        const inserMtrls = caseList.map(async (c) => {
          console.log("caseLsit map", c.cNo);
          return await Case.findOne({ _id: c.caseId }).then((result) => {
            const theCase = result
            c.cWays = theCase.cWays
            c.sizes = theCase.sizes
            c.gQtys = theCase.gQtys
            c.mtrls = theCase.mtrls
            return c
          })
        })
        Promise.all(inserMtrls).then(async (results) => {
          const csCaseList = results
          const completeSet = new CS({
            company: comId,
            osNo: newOsNO,
            csOrder: [],
            osLtConfirmDate: null,
            caseMtrls: caseMtrls,
            caseList: csCaseList,
          });
          await completeSet.save();
        })
      })

    })
    .catch((err) => {
      console.log(err);
    });
  // })
  //@ Loop through the cases and lock up all these cases, preventing merchandisor updating anything.
  //The price refs to srMtrl, and since other case, which not be put into order summary may still use same srMtrl, so we can't and no necessary to lock up the srMtrl.
});

// @route   GET api/purchase/materialprice
// @desc    Read the compnay's srMtrl from database
// @access  Private
// Result   Return an array named "materialPriceList"
router.post('/materialprice', authUser, async (req, res) => {
  console.log('Start getting material Price'); // Test Code
  let user = await User.findById(req.user.id);
  if (!user.po) {
    return res.status(400).json({ msg: 'Out of authority' });
  }
  const comId = req.user.company;
  const { currentPo, caseMtrls } = req.body;
  const supplier = currentPo.supplier
  // the currentPo is the name of the supplier

  const materialPriceList = [];

  if (!supplier) {
    //If the supplier is empty, do nothing
    console.log('The currentPo with no supplier, so return nothing.')
    return res.json([]);
  } else {
    //If the currentPO with supplier, then start to return the priceList.
    const filteredCaseMtrls = caseMtrls.filter((mtrl) => {
      return mtrl.supplier === currentPo.supplier;
    });
    // console.log('filterdCaseMtrls in getting price', filteredCaseMtrls); // Test Code

    let caseMtrlsCount = 0;
    const insertSrPrice = new Promise(async (resolve) => {
      filteredCaseMtrls.map(async (mtrl) => {
        const { _id, ref_no, mColor, mSizeSPEC } = mtrl;

        const caseMtrlId = _id
        const srMtrl = await SRMtrl.findOne({
          company: comId,
          supplier: currentPo.supplier,
          ref_no: ref_no,
        });
        if (!srMtrl || srMtrl.mPrices.length === 0) {
          console.log(
            "No such material or the material dosen't have any price built in the srMtrl database"
          );
          materialPriceList.push({
            osMtrlId: caseMtrlId,
            poUnit: 'no srMtrl',
            currency: 0,
            mPrice: 0,
            moq: 0,
            moqPrice: 0,
          });
        } else {
          // extract the mPrice that match to the current material with name of supplier, ref_no, mColor and mSizeSPEC
          const { mPrices } = srMtrl;
          const mainPrice = srMtrl.mainPrice;
          const currentSrMtrlPrice = mPrices.filter((i, idx) => {
            if (i.mColor === mColor && i.sizeSPEC === mSizeSPEC) {
              return i;
            } else if (mainPrice) {
              return i.id === mainPrice;
            } else {
              return i.id === mPrices[0].id;
            }
          });
          // console.log('the mPrice selected', currentSrMtrlPrice); // Test code

          const itemNames = ['unit', 'currency', 'mPrice', 'moq', 'moqPrice'];
          const theValues = itemNames.map((i, idx) => {
            if (!currentSrMtrlPrice[0][i]) {
              return { [i]: undefined };
            } else {
              return { [i]: currentSrMtrlPrice[0][i] };
            }
          });

          // console.log(theValues); // Test code

          materialPriceList.push({
            osMtrlId: caseMtrlId,
            poUnit: theValues[0].unit,
            currency: theValues[1].currency,
            mPrice: theValues[2].mPrice,
            moq: theValues[3].moq,
            moqPrice: theValues[4].moqPrice,
          });
        }
        caseMtrlsCount = caseMtrlsCount + 1;
        if (caseMtrlsCount === filteredCaseMtrls.length) {
          resolve();
        }
      });
    }).catch((err) => {
      console.log(err);
    });

    Promise.all([insertSrPrice])
      .then(() => {
        // console.log('the mtaterialPriceList', materialPriceList); // Test Code
        console.log('the material Price is returned!');
        return res.json(materialPriceList);
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

// @route   GET api/purchase/materialprice
// @desc    Read the compnay's srMtrl from database
// @access  Private
// Result   Return an array named "materialPriceList"
router.delete('/deleteos/:osId', authUser, async (req, res) => {
  let user = await User.findById(req.user.id);
  //Check if multiple login, if yes, do nothing
  const token = req.header('x-auth-token');
  if (user.sKey !== token) {
    const msg = { err: 'multiple user login, please login again.' }
    console.log(msg)
    return res.json([msg])
  }
  //Check if the user have the right
  if (!user.po) {
    return res.status(400).json({ msg: 'Out of authority' });
  }

  const comId = req.user.company;
  const osId = req.params.osId;
  const theOS = await OS.findOne(
    { company: comId, _id: osId },
    { osNo: 1, caseList: 1, osConfirmDate: 1, }
  );

  console.log(osId); // Test Code
  //@ Turn the poDate of cases back to "null"
  // Don't need return any of this result immediately, so don't make any promise here.
  const caseList = theOS.caseList;
  const osConfirmDate = theOS.osConfirmDate;
  const osNo = theOS.osNo
  if (!osConfirmDate) {
    caseList.map(async (c) => {
      await Case.updateOne({ _id: c.caseId, cNo: c.cNo }, { poDate: null, osNo: null });
    });

    await CS.findOneAndDelete({ company: comId, osNo: osNo })

    await OS.findOneAndDelete({ company: comId, _id: osId }).then(async () => {

      const returnMsg = `The order summary ${osId} is deleted.`;
      console.log(returnMsg);
      return res.json({
        msg: returnMsg,
      });
    });

  } else {
    const returnMsg = `The order summary ${osId} is confirmed, It can't be delete, for deleting the OS, please cancel all the poConfirmDate in the Po of the os.`;
    console.log(returnMsg);
    return res.json({
      msg: returnMsg,
    });
  }
});

// @route   POST api/purchase/updatecondition/:osId
// @desc    Update the conditions in the suppliers of OS and return the suppliers
// @access  Private
router.post('/purchaseorder/:osId', authUser, async (req, res) => {
  console.log('Start upload Po'); // Test Code
  let user = await User.findById(req.user.id);
  //Check if multiple login, if yes, do nothing
  const token = req.header('x-auth-token');
  if (user.sKey !== token) {
    const msg = { err: 'multiple user login, please login again.' }
    console.log(msg)
    return res.json([msg])
  }
  //Check if the user have right
  if (!user.po) {
    return res.status(400).json({ msg: 'Out of authority' });
  }
  const comId = req.user.company;
  const osId = req.params.osId;
  const { supplier, priceList, inputCaseMtrls } = req.body;
  console.log('The priceList', priceList);
  // console.log('the body', req.body); // test Code
  // the currentPo is the name of the supplier
  const checkIfPoFromBodyConfirmed = supplier.poConfirmDate;
  const existingOS = await OS.findOne({ company: comId, _id: osId })
  // const checkIfExistingPoConfirmed = true // for test
  const checkIfExistingPoConfirmed = existingOS.suppliers.find(({ _id }) => _id == supplier._id).poConfirmDate;
  console.log("the existing OS", existingOS.suppliers.find(({ _id }) => { console.log("type of _id in suppliers ", typeof _id); return (_id == supplier._id) }))
  console.log('the type of id', typeof supplier._id)

  // console.log('the id of the supplier', supplier._id); // test Code
  // console.log('The conditions of the supplier', supplier.conditions); // Test Code

  try {
    if (checkIfExistingPoConfirmed && checkIfPoFromBodyConfirmed) {
      //If the po in cloud and the pushed po both confirmed, update nothing.
      console.log('Since the existing Po alread confirmed, nothing updated.');
      return res.json(existingOS);
    } else if (checkIfExistingPoConfirmed === null && checkIfPoFromBodyConfirmed) {
      //If the po in cloud not confirmed yet and the pushed Po confirmed, insert price array to the caseMtrls of the supplier and update the poCinfrimDate.
      const updatedSuppliers = await OS.findOneAndUpdate(
        { company: comId, _id: osId, 'suppliers._id': supplier._id },
        {
          $set: {
            'suppliers.$.address': supplier.address,
            'suppliers.$.attn': supplier.attn,
            'suppliers.$.email': supplier.email,
            'suppliers.$.tel': supplier.tel,
            'suppliers.$.conditions': supplier.conditions,
            'suppliers.$.transitTime': supplier.newTransitTime,
            caseMtrls: inputCaseMtrls,
          },
          $currentDate: { 'suppliers.$.poConfirmDate': Date },
        },
        { new: true }
        // { projection: { _id: 0, suppliers: 1 } }
      );
      if (priceList) {
        const orderSummary = await OS.findOne(
          {
            company: comId,
            _id: osId,
          },
          { caseMtrls: 1, suppliers: 1 }
        );
        const caseMtrls = inputCaseMtrls;
        const suppliers = orderSummary.suppliers;

        // console.log('the caseMtrls', caseMtrls); // Test code
        // console.log('The priceList', priceList); // test code
        const insertPrice = new Promise(async (resolve) => {
          let newCaseMtrl = [];
          await caseMtrls.map(async (mtrl, idx) => {
            const thePrice = await priceList.filter(
              (p) => p.osMtrlId === mtrl._id
            );
            if (thePrice.length > 0) {
              // console.log('the Price is found', thePrice); // test code
              mtrl.price = thePrice[0];
              // console.log('the mtrl should have price', mtrl); // test Code
              newCaseMtrl.push(mtrl);
            } else {
              newCaseMtrl.push(mtrl);
            }
            if (idx + 1 === caseMtrls.length) {
              return resolve(newCaseMtrl);
            }
          });
        });

        const checkSuppliersOsDate = new Promise(async (resolve) => {
          const poConfirmDateNulls = suppliers.filter(
            (s) => s.poConfirmDate === null
          ).length;
          console.log(poConfirmDateNulls);
          if (poConfirmDateNulls) {
            // If any po of supplier is not confirmed, then return null, not set the osConfirm Date
            resolve(null);
          } else {
            //If all po of suppliers is confirmed the po date, then set the os as confirmed.
            resolve(Date.now());
          }
        });

        Promise.all([insertPrice, checkSuppliersOsDate]).then(
          async (result) => {
            const newCaseMtrl = result[0];
            const osConfirmDate = result[1];
            console.log('the newCaseMtrl', newCaseMtrl);
            console.log('The osConfirm Date', osConfirmDate);
            await OS.findOneAndUpdate(
              {
                company: comId,
                _id: osId,
              },
              {
                $set: {
                  caseMtrls: newCaseMtrl,
                  osConfirmDate: osConfirmDate,
                },
              },
              { new: true }
            ).then((result) => {
              // const results = {
              //   updatedSuppliers: updatedSuppliers.suppliers,
              //   updateCaseMtrl: result.caseMtrls,
              //   os: result,
              // };
              console.log('The result with suppliers and caseMtrl is returned');
              // console.log('the result', results);
              return res.json(result);
            });
          }
        );
      } else {
        console.log('The priceList is empty, return the suppliers only');
        const result = updatedSuppliers;
        return res.json(result);
      }
    } else {
      //If both cloud po and pushed po is not confirmed then only update condifions information of the po.
      const caseMtrls = inputCaseMtrls;
      // console.log('the caseMTrls', caseMtrls);

      const deletePrice = new Promise(async (resolve) => {
        let newCaseMtrl = [];
        await caseMtrls.map(async (mtrl, idx) => {
          if (mtrl.supplier === supplier.supplier) {
            delete mtrl.price;
            newCaseMtrl.push(mtrl);
            // console.log('The mtrl is delete price', mtrl);
          } else {
            newCaseMtrl.push(mtrl);
          }
          if (idx + 1 === caseMtrls.length) {
            return resolve(newCaseMtrl);
          }
        });
      }).catch((err) => {
        console.log(err)
      });

      Promise.all([deletePrice]).then(async (result) => {
        const newCaseMtrl = result[0];
        await OS.findOneAndUpdate(
          {
            company: comId,
            _id: osId,
            'suppliers._id': supplier._id
          },
          {
            $set: {
              'suppliers.$.address': supplier.address,
              'suppliers.$.attn': supplier.attn,
              'suppliers.$.email': supplier.email,
              'suppliers.$.tel': supplier.tel,
              'suppliers.$.conditions': supplier.conditions,
              'suppliers.$.poConfirmDate': null,
              'suppliers.$.transitTime': supplier.newTransitTime,
              caseMtrls: newCaseMtrl,
              osConfirmDate: null,
            },
          },
          { new: true }
          // { projection: { caseMtrls: 1 } }
        ).then((result) => {
          // const results = {
          //   updatedSuppliers: updatedSuppliers.suppliers,
          //   updateCaseMtrl: result.caseMtrls,
          //   os: result,
          // };
          console.log('The result with suppliers is returned');
          // console.log('The result', results);
          return res.json(result);
        });
      });
    }
  } catch (err) {
    console.log(err);
  }
});

// @route   POST api/purchase/updatecasemtrl/:osId
// @desc    Update the HS-CODE in the caseMtrls of the orderSummary
// @desc    Update the leadtime in the caseMtrls of the orderSummary by upload entire caseMtrls 
// @access  Private
router.post('/updatecasemtrl/:osId', authUser, async (req, res) => {
  console.log('Start upload Po'); // Test Code
  let user = await User.findById(req.user.id);
  //Check if multiple login, if yes, do nothing
  const token = req.header('x-auth-token');
  if (user.sKey !== token) {
    const msg = { err: 'multiple user login, please login again.' }
    console.log(msg)
    return res.json([msg])
  }
  //Check if the user have the right
  if (!user.po) {
    return res.status(400).json({ msg: 'Out of authority' });
  }
  const comId = req.user.company;
  const osId = req.params.osId;
  console.log('the OSId', osId);
  const { updateFor, inputCaseMtrls } = req.body;
  console.log('the caseMtrls', inputCaseMtrls[0]);
  const checkLTComplete = await inputCaseMtrls.filter((cs) => {
    return cs.leadTimeComplete === false
  })

  let msg = ''
  try {
    if (updateFor === 'leadTime') {
      if (checkLTComplete.length > 0) {
        const resultOs = await OS.findOneAndUpdate(
          {
            company: comId,
            _id: osId,
          },
          {
            $set: {
              osLtConfirmDate: null,
              caseMtrls: inputCaseMtrls,
            },
          },
          { new: true }
        );
        msg = 'The leadTime is uploaded.';
        console.log(msg);
        return res.json(resultOs);
      } else {
        const existingOs = await OS.findOne({ _id: osId })
        const existingCaseMtrls = existingOs.caseMtrls
        const checkIfCaseMtrlsUpdated = JSON.stringify(existingCaseMtrls) == JSON.stringify(inputCaseMtrls)
        console.log('the checkIfCaseMtrlsUpdate', checkIfCaseMtrlsUpdated)

        if (checkIfCaseMtrlsUpdated) {
          //If the existing CaseMtrls is same don't make any update, just return the existingOs.
          msg = 'No leadTime updated, return an the existing OS';
          console.log(msg);
          return res.json(existingOs);
        } else {
          const resultOs = await OS.findOneAndUpdate(
            {
              company: comId,
              _id: osId,
            },
            {
              $currentDate: { osLtConfirmDate: Date },
              $set: {
                caseMtrls: inputCaseMtrls,
              },
            },
            { new: true }
          );
          msg = 'The caseMtrl is uploaded and the leadTime compleate date is updated.';
          console.log(msg);
          return res.json(resultOs);
        }
      }
    } else {
      const resultOs = await OS.findOneAndUpdate(
        {
          company: comId,
          _id: osId,
        },
        {
          $set: {
            caseMtrls: inputCaseMtrls,
          },
        },
        { new: true }
      );
      msg = 'The HS-Code is uploaded.';
      console.log(msg);
      return res.json(resultOs);
    }
  } catch (err) {
    console.log(err);
  }


});
module.exports = router;

// @route   POST api/purchase/updatecasemtrl/:osId
// @desc    Update the leadtime in the caseMtrls of the orderSummary by upload entire caseMtrls 
// @access  Private
// router.post('/updateleadtime/:osId', authUser, async (req, res) => {
//   console.log('Start upload Po leadTime'); // Test Code
//   let user = await User.findById(req.user.id);
//   //Check if multiple login, if yes, do nothing
//   const token = req.header('x-auth-token');
//   if (user.sKey !== token) {
//     const msg = { err: 'multiple user login, please login again.' }
//     console.log(msg)
//     return res.json([msg])
//   }
//   //Check if the user have the right
//   if (!user.po) {
//     return res.status(400).json({ msg: 'Out of authority' });
//   }
//   const comId = req.user.company;
//   const osId = req.params.osId;
//   console.log('the OSId', osId);
//   const { inputCaseMtrls } = req.body;
//   console.log('the caseMtrls', inputCaseMtrls[0]);
//   try {
//     await OS.updateOne(
//       {
//         company: comId,
//         _id: osId,
//       },
//       {
//         $set: {
//           caseMtrls: inputCaseMtrls,
//         },
//       }
//     );
//     const msg = 'The hs-code is uploaded.';
//     console.log(msg);
//     return res.json({ msg: msg });
//   } catch (err) {
//     console.log(err);
//   }
// });
// module.exports = router;