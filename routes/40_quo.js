const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authUser = require('../middleware/authUser');
// Not set up yet, for check the value entered by user at the some specific column
// const { check, validationResult, Result } = require('express-validator');
// const { v4: uuidv4 } = require('uuid');
// const myModule = require('../myModule/myModule');

const User = require('../models/10_User');
const Case = require('../models/20_Case');
const SRMtrl = require('../models/30_SRMtrl');
const QuoHead = require('../models/40_QuoHead');
const QuoForm = require('../models/41_QuoForm');

//##### This may move to 21_case.js
// @route   GET api/quogarment/
// @desc    Read the compnay's case List from database
// @access  Private
// router.get('/', authUser, async (req, res) => {
//   let user = await User.findById(req.user.id);
//   //Check if multiple login, if yes, do nothing
//   const token = req.header('x-auth-token');
//   if (user.sKey !== token) {
//     const msg = { err: 'Multiple user login, please login again.' }
//     console.log(msg)
//     return res.json([msg])
//   }

//   if (!user.quo) {
//     return res.status(400).json({ msg: 'Out of authority' });
//   }
//   let caseList = await Case.aggregate([
//     {
//       $match: { company: mongoose.Types.ObjectId(req.user.company) },
//     },
//     {
//       $project: {
//         user: 1,
//         cNo: 1,
//         caseType: 1,
//         style: 1,
//         client: 1,
//         merchandiser: '',
//         quoNo: '',
//       },
//     },
//   ]).sort({ date: -1 });

//   let insertList = await new Promise((resolve, reject) => {
//     let n = 0;

//     caseList.map(async (c) => {
//       await User.findOne(
//         { company: req.user.company, _id: c.user },
//         { _id: 0, name: 1 }
//       )
//         .then(async (result) => {
//           if (result) {
//             c.merchandiser = await result.name;
//           }
//           n = n + 1;
//           return n;
//         })
//         .then((n) => {
//           if (n === caseList.length) {
//             resolve();
//           }
//         });
//     });
//   });

//   try {
//     Promise.all([caseList, insertList]).then(async () => {
//       console.log('caseList is sent out', caseList);
//       return res.json(caseList);
//     });
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send('Server Error');
//   }
// });

// @route   GET api/quogarment/quohead/cNo
// @desc    Read the compnay's srMtrl from database, and if the quo not existing, create a new one
// @access  Private
router.get('/quohead/:cNo', authUser, async (req, res) => {
  const user = await User.findById(req.user.id);
  //Check if multiple login, if yes, do nothing
  const token = req.header('x-auth-token');
  if (user.sKey !== token) {
    const msg = { err: 'Multiple user login, please login again.' }
    console.log(msg)
    return res.json([msg])
  }
  // Check if the user have the right to manage quotation
  if (!user.quo) {
    return res.status(400).json({ msg: 'Out of authority' });
  }

  const comId = req.user.company;
  const cNo = req.params.cNo;
  await QuoHead.findOne({ cNo: cNo, company: comId })
    .then(async (result) => {
      const cases = await Case.findOne(
        { cNo: cNo, company: comId },
        { mtrls: 1 }
      );
      const mtrls = cases.mtrls;
      // console.log('The cases', cases); // Test Code
      if (mtrls.length > 0) {
        //@ Part_1 getTheResult
        const getTheResult = new Promise(async (resolve, reject) => {
          // console.log('Start Promise - getTheResult '); // Test Code
          let theResult = {};
          if (result) {
            // console.log('get existing quo'); // Test Code

            theResult = {
              // quoForms: result.quoForms,
              versionNum: result.versionNum,
              _id: result._id,
              cNo: result.cNo,
              date: result.date,
              quoForms: [],
            };
            // console.log('resolve Promise - getTheResult - exist Quo'); // Test Code
            return resolve(theResult);
          } else {
            // console.log('start create new quo');
            theResult = await Case.aggregate([
              {
                $match: {
                  cNo: cNo,
                  company: mongoose.Types.ObjectId(req.user.company),
                },
              },
              {
                $project: {
                  totalGarmentQty: { $sum: '$gQtys.gQty' },
                },
              },
            ]);
            const totalGarmentQty = theResult[0].totalGarmentQty;
            const newQuo = await new QuoHead({
              company: comId,
              cNo: cNo,
              // quoForms: [],
              gTQty: totalGarmentQty,
            });
            newQuo.save();

            const finalResult = {
              // quoForms: result.quoForms,
              versionNum: newQuo.versionNum,
              _id: newQuo._id,
              cNo: newQuo.cNo,
              date: newQuo.date,
              quoForms: [],
            };
            return resolve(finalResult);

            // .then(async (totalQtySum) => {

            //   return newQuo;
            // })
            // .then(async (newQuo) => {
            //   const theQuoHead = await QuoHead.findOne(
            //     { _id: newQuo._id },
            //     { company: 0 }
            //   );

            // });
            // theResult = await Case.aggregate([
            //   {
            //     $match: {
            //       cNo: cNo,
            //       company: mongoose.Types.ObjectId(req.user.company),
            //     },
            //   },
            //   {
            //     $project: {
            //       totalGarmentQty: { $sum: '$gQtys.gQty' },
            //     },
            //   },
            // ])
            //   .then((totalQtySum) => {
            //     // console.log('the totalQtySum', totalQtySum); // Test Code
            //     return totalQtySum;
            //   })
            //   .then(async (totalQtySum) => {
            //     const totalGarmentQty = totalQtySum[0].totalGarmentQty;
            //     const newQuo = new QuoHead({
            //       company: comId,
            //       cNo: cNo,
            //       // quoForms: [],
            //       gTQty: totalGarmentQty,
            //     });
            //     newQuo.save();
            //     return newQuo;
            //   })
            //   .then(async (newQuo) => {
            //     const theQuoHead = await QuoHead.findOne(
            //       { _id: newQuo._id },
            //       { company: 0 }
            //     );
            //     const theResult = {
            //       // quoForms: result.quoForms,
            //       versionNum: theQuoHead.versionNum,
            //       _id: theQuoHead._id,
            //       cNo: theQuoHead.cNo,
            //       date: theQuoHead.date,
            //       quoForms: [],
            //     };
            //     return resolve(theResult);
            //   });
          }
        });

        //@ Part_2 insertMPrice // 07/25 Steve: I think we don't need inserMPrice.
        // Promise.all([getTheResult]).then(async (result) => {
        //   let theResult = result[0];

        //   // console.log('the theResult', theResult); // Test Code
        //   const comName = user.comName;
        //   const comSymbol = user.comSymbol;
        //   let num = 0;
        //   const insertMPrice = new Promise(async (resolve) => {
        //     await mtrls.map(async (mtrl) => {
        //       const supplier = mtrl.supplier;
        //       const ref_no = mtrl.ref_no;
        //       // console.log('The supplier', supplier, 'The ref_no', ref_no); // Test Code
        //       const csr = comName + comSymbol + supplier + ref_no;
        //       const lowerCasecsr = csr.toLowerCase();
        //       const CSRIC = lowerCasecsr.replace(/[^\da-z]/gi, ''); // Only read from "0" to "9" & "a" to "z"
        //       console.log('The CSRIC', CSRIC); // Test Code
        //       await SRMtrl.findOne({ CSRIC: CSRIC }, { mPrices: 1 })
        //         .then((mPrices) => {
        //           // console.log('the mPrices', mPrices); // Test Code
        //           theResult.materialPrice.push(mPrices);
        //           return theResult;
        //         })
        //         .then((theResult) => {
        //           num = num + 1;
        //           if (num === mtrls.length) {
        //             console.log('Promise - insertMPrice - resolve()'); // Test Code
        //             return resolve(theResult);
        //           }
        //         })
        //         .catch((err) => {
        //           console.log(err);
        //           return 'The Srmtrl problem';
        //         });
        //     });
        //   });

        /////////////////////////////
        //@ Part_3 insert quoForm and Case
        Promise.all([getTheResult])
          .then(async (result) => {
            const quoHead = result[0];
            const quoHeadId = quoHead._id;

            // Mtrls
            const findCase = await Case.findOne(
              { company: comId, cNo: cNo },
              { _id: 0, company: 0 }
            );

            // QuoForm
            const quoForms = await QuoForm.find(
              {
                company: comId,
                quoHead: quoHeadId,
              },
              { company: 0 }
            );

            if (findCase) {
              quoHead.theCase = findCase;
            } else {
              quoHead.theCase = 'No Case is found for this case';
            }

            if (quoForms) {
              quoHead.quoForms = quoForms;
            }
            // console.log('this is the quoHead', quoHead); // Test Code
            return quoHead;
          })
          .then((result) => {
            console.log('The Promise.all result - return the quotation'); // Test Code
            return res.json(result);
          })
          .catch((err) => {
            console.log(err);
            return res.json({ error: err, quoForms: [] });
          });
        // });
      } else {
        const err = 'Please create the mtrl for the case before quotation.';
        console.log(err);
        return res.json({ error: err, quoForms: [] });
      }
    })
    .catch((err) => {
      console.log("MongoDB or internet problem, can't find quoForm", err);
      return res.json({ error: err, quoForms: [] });
    });
});

// @route   PUT api/quogarment/quoform/cNo/updatequoForm
// @desc    Update or generate quoform
// @access  Private
// @result  return object contain the array "quoForms" and the object "versionNum" of QUO
router.put('/quoform/:cNo/uploadquoForm', authUser, async (req, res) => {
  let user = await User.findById(req.user.id);
  //Check if multiple login, if yes, do nothing
  const token = req.header('x-auth-token');
  if (user.sKey !== token) {
    const msg = { err: 'Multiple user login, please login again.' }
    console.log(msg)
    return res.json([msg])
  }
  //Check if the user have the right
  if (!user.quo) {
    return res.status(400).json({ msg: 'Out of authority' });
  }

  const comId = req.user.company;
  const cNo = req.params.cNo;
  const Cases = await Case.findOne({ cNo: cNo, company: comId });
  const sizesValue = Cases.sizes.map((s) => s.gSize);
  const cWayValue = Cases.cWays.map((c) => c.gClr);
  if (Cases.mtrls.length > 0) {
    console.log(cNo);
    const { isNewQuoForm } = req.body; // isNewQuoForm is a boolean
    const quoHead = await QuoHead.findOne(
      { cNo: cNo, company: comId },
      { quoForms: 1, versionNum: 1 }
    );

    if (quoHead) {
      console.log('Quo', quoHead); // Test Code
      const versionNum = quoHead.versionNum + 1;
      const quoHeadId = quoHead._id;
      const quoForms = await QuoForm.find({
        company: comId,
        quoHead: quoHeadId,
      });
      if (isNewQuoForm) {
        // console.log('Have isNewQuoForm from body'); // Test Code
        if (quoForms.length < 99) {
          // console.log('The quoForm is less then 99'); // Test Code

          const createMQuos = new Promise((resolve) => {
            console.log('Promise createMQuos start');
            const mtrls = Cases.mtrls;
            let num = 0;
            let newMQuos = [];
            mtrls.map((mtrl) => {
              newMQuos.push({
                mtrlId: mtrl.id,
                mQuoAddvised: 0,
                csptAddvised: 0,
                materialFinalQuotation: 0,
              });
              num = num + 1;
              // console.log('1st promise num', num); // Test Code
              if (num === mtrls.length) {
                console.log('Promised createMQuos');
                return resolve(newMQuos);
              }
            });
          });
          const quoNo = cNo + '_QV' + versionNum;

          Promise.all([createMQuos]).then(async (result) => {
            // console.log('Promise all'); // Test Code
            await QuoHead.updateOne(
              { cNo: cNo, company: comId },
              {
                $set: {
                  versionNum: versionNum,
                },
                // $push: {
                //   quoForms: {
                //     id: uuidv4() + myModule.generateId(),
                //     quoNo: quoNo,
                //     currency: '',
                //     quoSizes: [],
                //     quocWays: [],
                //     cmpts: [],
                //     mQuos: result[0],
                //     otherExpenses: [],
                //     fob: '',
                //     date: new Date(),
                //   },
                // },
              }
            );

            await QuoForm.create({
              company: comId,
              quoHead: quoHeadId,
              quoNo: quoNo,
              currency: 'USD',
              quoSizes: sizesValue,
              quocWays: cWayValue,
              quotatedQty: 0,
              cm: 0,
              mQuos: result[0],
              mQuosTotal: 0,
              otherExpenses: [],
              otherExpensesTotal: 0,
              fob: 0,
              conditions: [],
              useAsFinalQuotation: false,
              date: new Date(),
            })
              .then(async () => {
                const quoHead = await QuoHead.findOne(
                  { cNo: cNo, company: comId },
                  { _id: 0, versionNum: 1 }
                );
                let result = {
                  versionNum: quoHead.versionNum,
                  quoForms: [],
                };
                console.log('The result of the quoHead', result); // Test Code
                return result;
              })
              .then(async (result) => {
                const quoForms = await QuoForm.find(
                  {
                    company: comId,
                    quoHead: quoHeadId,
                  },
                  { company: 0 }
                );
                result.quoForms = quoForms;
                console.log('The result of insert QuoForms', result); // Test Code
                return result;
              })
              .then((result) => {
                console.log('the result of generate new quoform', result); // Test Code
                return res.json(result);
              });
          });
        } else {
          console.log('Over the number of quotation version');
          return res
            .status(400)
            .json({ msg: 'Over the number of quotation version' });
        }
      } else {
        //@ define element
        const { gQtys, sizes, cWays } = Cases;
        const {
          _id,
          quoNo,
          cm,
          currency,
          quoSizes,
          quocWays,
          mQuos,
          otherExpenses,
          useAsFinalQuotation,
          conditions,
        } = req.body.form;

        if (quoSizes.length === 0) {
          console.log('No sizes selected for quotating');
          return res.status(404).json({
            msg: 'No sizes selected for quotating',
          });
        }

        if (quocWays.length === 0) {
          console.log('No colorways selected for quotating');
          return res.status(404).json({
            msg: 'No colorways selected for quotating',
          });
        }

        //@ Get the quotatedQty
        const quotatedQtyCounting = new Promise(async (resolve) => {
          //Here the total gQtys means the sum of the quantity of the sizes and colors the user selexted, not the total quantity of the case
          const quoSizesInId = quoSizes.map((size) => {
            return sizes.find(({ gSize }) => gSize === size).id;
          });
          // console.log(quoSizesInId); // Test Code

          const quocWaysInId = quocWays.map((cWay) => {
            return cWays.find(({ gClr }) => gClr === cWay).id;
          });
          // console.log(quocWaysInId); // Test Code

          const quotatedQty = gQtys.reduce((result, currentItem) => {
            if (
              quoSizesInId.includes(currentItem.size) &&
              quocWaysInId.includes(currentItem.cWay)
            ) {
              result += currentItem.gQty;
            }
            return result;
          }, 0);
          resolve(quotatedQty);
        });

        const mQuosCounting = new Promise(async (resolve) => {
          let num = 0;
          let mQuosTotal = 0;
          mQuos.map((mQuo) => {
            num = num + 1;
            if (mQuo.mQuoAddvised === 0 || mQuo.csptAddvised === 0) {
              materialFinalQuotation = 0;
            } else {
              mQuo.materialFinalQuotation = Number(
                mQuo.mQuoAddvised * mQuo.csptAddvised
              ).toFixed(2);
            }
          });
          if (num === mQuos.length) {
            mQuosTotal = mQuos.reduce((res, curr) => {
              res = res + Number(curr.materialFinalQuotation);
              return res;
            }, 0);
            resolve(mQuosTotal);
          }
        });

        const otherExpensesCounting = new Promise(async (resolve) => {
          let num = 0;
          let otherExpensesTotal = 0;
          if (otherExpenses.length === 0) {
            resolve(otherExpensesTotal);
          } else {
            otherExpensesTotal = otherExpenses.reduce((res, curr) => {
              num = num + 1;
              res = res + Number(curr.cost);
              return res;
            }, 0);
            if (num === otherExpenses.length) {
              resolve(otherExpensesTotal);
            }
          }
        });

        Promise.all([quotatedQtyCounting, mQuosCounting, otherExpensesCounting])
          .then(async (result) => {
            const quotatedQty = result[0];
            const mQuosTotal = Math.round((result[1] + Number.EPSILON) * 100) / 100
            // const mQuosTotal = result[1];
            const otherExpensesTotal = Math.round((result[2] + Number.EPSILON) * 100) / 100
            // const otherExpensesTotal = result[2];
            const FOB = Math.round((Number(cm + mQuosTotal + otherExpensesTotal) + Number.EPSILON) * 100) / 100
            // const FOB = Number(cm + mQuosTotal + otherExpensesTotal).toFixed(2);
            // const FOB =
            //   Number(cm) + Number(mQuosTotal) + Number(otherExpensesTotal);
            console.log(cm, '-', mQuosTotal, '-', otherExpensesTotal);
            await QuoForm.updateOne(
              { company: comId, _id: _id, quoNo: quoNo },
              {
                $set: {
                  quoSizes: quoSizes,
                  quocWays: quocWays,
                  currency: currency,
                  quotatedQty: quotatedQty,
                  cm: cm,
                  mQuos: mQuos,
                  mQuosTotal: mQuosTotal,
                  otherExpenses: otherExpenses,
                  otherExpensesTotal: otherExpensesTotal,
                  // fob: Number(FOB).toFixed(2),
                  fob: FOB,
                  conditions: conditions,
                  useAsFinalQuotation: useAsFinalQuotation,
                },
              }
            );
          })
          .then(async () => {
            const quoHead = await QuoHead.findOne(
              { cNo: cNo, company: comId },
              { _id: 0, versionNum: 1 }
            );
            let result = {
              versionNum: quoHead.versionNum,
              quoForms: [],
            };
            console.log('The result of the quoHead', result); // Test Code
            return result;
          })
          .then(async (result) => {
            const quoForms = await QuoForm.find(
              {
                company: comId,
                quoHead: quoHeadId,
              },
              { company: 0 }
            );
            result.quoForms = quoForms;
            console.log('The result of insert QuoForms', result); // Test Code
            return result;
          })
          .then((result) => {
            console.log('the result of generate new quoform', result); // Test Code
            return res.json(result);
          });
      }
    } else {
      console.log('No such quotation data');
      return res.status(404).json({ msg: 'No such quotation data' });
    }
  } else {
    console.log("No such Case data, or the case don't have any mtrl yet ");
    return res.status(404).json({
      msg:
        "No such Case data, or case don't have any material. Please, create material for the case frist",
    });
  }
});

// @route   GET api/quogarment/quotateadvise
// @desc    Get the mtrl quotation from srMtrl
// @access  Private
// @result  return an updated quoForms : Array object
router.put('/quotateadvise', authUser, async (req, res) => {
  const user = await User.findById(req.user.id);
  //Check if multiple login, if yes, do nothing
  const token = req.header('x-auth-token');
  if (user.sKey !== token) {
    const msg = { err: 'Multiple user login, please login again.' }
    console.log(msg)
    return res.json([msg])
  }

  if (!user.quo) {
    return res.status(400).json({ msg: 'Out of authority' });
  }

  //@ Declare needed elements ----------------------------------
  const comId = req.user.company;
  const comName = user.comName;
  const comSymbol = user.comSymbol;
  const { quoNo, quoFormId, quoSizes, quocWays } = req.body;
  // console.log(quoNo); // Test Code
  // console.log(quoFormId); // Test Code
  if (quoSizes.length === 0) {
    console.log('No sizes selected for quotating');
    return res.status(404).json({
      msg: 'No sizes selected for quotating',
    });
  }

  if (quocWays.length === 0) {
    console.log('No colorways selected for quotating');
    return res.status(404).json({
      msg: 'No colorways selected for quotating',
    });
  }

  const quoForm = await QuoForm.findOne({
    company: comId,
    quoNo: quoNo,
    _id: quoFormId,
  });

  // console.log(quo); // Test Code
  if (!quoForm) {
    console.log('No such quoForm ');
    return res.status(404).json({
      msg: 'No such quoForm',
    });
  }

  const quoHeadId = quoForm.quoHead;

  const quoHead = await QuoHead.findOne({ _id: quoHeadId });
  if (!quoHead) {
    console.log('No such quoHead ');
    return res.status(404).json({
      msg: 'No such quoHead',
    });
  }

  const cNo = quoHead.cNo;

  // console.log('the cNo from quoForm', cNo); // Test Code
  // console.log('The mQuos from quoForm', quo.quoForms[0]); // Test Code

  const mQuos = quoForm.mQuos;
  if (mQuos.length === 0 || !mQuos) {
    console.log('No such mQuos, build mQuos first ');
    return res.status(404).json({
      msg: 'No such mQuos, build mQuos first',
    });
  }

  const cases = await Case.findOne({ cNo: cNo, company: comId });
  if (!cases) {
    console.log('No such Case ');
    return res.status(404).json({
      msg: 'No such Case',
    });
  }
  const gQtys = cases.gQtys;
  if (gQtys.length === 0 || !gQtys) {
    console.log("The case don't have garment Quantity");
    return res.status(404).json({
      msg: "The case don't have garment Quantity",
    });
  }

  const sizes = cases.sizes;
  if (sizes.length === 0 || !sizes) {
    console.log("The case don't have garment sizes");
    return res.status(404).json({
      msg: "The case don't have garment sizes",
    });
  }

  const cWays = cases.cWays;
  if (cWays.length === 0 || !cWays) {
    console.log("The case don't have garment color way");
    return res.status(404).json({
      msg: "The case don't have garment color way",
    });
  }

  const mtrls = cases.mtrls;
  if (mtrls.length === 0 || !mtrls) {
    console.log("The case don't have material");
    return res.status(404).json({
      msg: "The case don't have material",
    });
  }

  //@ Declare needed total gQtys ----------------------------------
  //Here the total gQtys means the sum of the quantity of the sizes and colors the user selected, not the total quantity of the case
  const quoSizesInId = quoSizes.map((size) => {
    return sizes.find(({ gSize }) => gSize === size).id;
  });
  // console.log(quoSizesInId); // Test Code

  const quocWaysInId = quocWays.map((cWay) => {
    return cWays.find(({ gClr }) => gClr === cWay).id;
  });
  // console.log(quocWaysInId); // Test Code

  const totalgQty = gQtys.reduce((result, currentItem) => {
    if (
      quoSizesInId.includes(currentItem.size) &&
      quocWaysInId.includes(currentItem.cWay)
    ) {
      result += currentItem.gQty;
    }
    return result;
  }, 0);
  // console.log('The totalgQty of the color & size selected', totalgQty); // Test Code

  //@ Start main counting ------------------------------------------------
  const insertmtrlQuotation = new Promise(async (resolve, reject) => {
    await QuoForm.updateOne(
      { _id: quoFormId },
      { quoSizes: quoSizes, quocWays: quocWays }
    );
    let mQuoNum = 0;
    mQuos.map((mQuo) => {
      const mtrlId = mQuo.mtrlId;
      const mtrl = mtrls.find(({ id }) => id === mtrlId);
      if (!mtrl) {
        console.log('The mQuo have the material that not exist in the case');
        return reject('The mQuo have the material that not exist in the case');
      }
      const mtrlUnit = mtrl.unit;
      const supplier = mtrl.supplier;
      const ref_no = mtrl.ref_no;
      const CSRIC = (comName + comSymbol + supplier + ref_no)
        .toLowerCase()
        .replace(/[^\da-z]/gi, '');

      //@ The key value of this function, it will hold the final result
      let sizeAndColorWeightedPrice = 0;
      let sizeAndColorWeightedCSPT = 0;

      const getWeightedAVGPriceAndAVGCSPT = new Promise(
        async (resolve, reject) => {
          let quoSizesNum = 0;
          quoSizes.map(async (quoSize) => {
            const garmentSize = sizes.find(({ gSize }) => gSize === quoSize);
            if (!garmentSize) {
              console.log(
                'The mQuo have the garment size that not exist in the case'
              );
              return reject(
                'The mQuo have the garment size that not exist in the case'
              );
            }
            const gSizeId = garmentSize.id;
            const sizeSPEC = mtrl.sizeSPECs.find(
              ({ size }) => size === gSizeId
            );
            if (!sizeSPEC) {
              console.log(
                "The material don't have this size SPEC for this garment size"
              );

              return reject(
                "The material don't have this size SPEC for this garment size"
              );
            }
            const materialSPEC = sizeSPEC.mSizeSPEC;

            const gQtyOfTheSize = gQtys.filter((i) => {
              return i.size === gSizeId;
            });
            // console.log('475 gQtyOfTheSize', gQtyOfTheSize); // Test Code

            // The selected sum of quantity
            // We use the size to get this number, if the size is same as we selected, no matter what gClr it have, add it up.
            const selectedgQtyOfTheSize = gQtyOfTheSize.reduce(
              (result, currentItem) => {
                if (quocWaysInId.includes(currentItem.cWay)) {
                  result += currentItem.gQty;
                }
                return result;
              },
              0
            );
            // console.log('484 selectedgQtyOfTheSize', selectedgQtyOfTheSize); // Test Code

            if (selectedgQtyOfTheSize === 0) {
              console.log("The Size Don't have any quantity");
              return reject("The Size Don't have any quantity");
            }

            // console.log(
            //   'selectedgQtyOfTheSize of the size',
            //   quoSizesNum + 1,
            //   selectedgQtyOfTheSize
            // ); // Test Code

            // weithgOftheSize actually is the wieght of the selected quantity
            const wieghtOfTheSelectedgQty = selectedgQtyOfTheSize / totalgQty;

            const getColorWeightedPriceAndCSPT = new Promise(
              (resolve, reject) => {
                let quocWaysNum = 0;
                //@ The key value of the colorWeightedPrice
                let colorWeightedPrice = 0;
                let colorWeightedCSPT = 0;
                quocWays.map(async (gColor) => {
                  //@_colorWay Id
                  const garmentcWay = cWays.find(({ gClr }) => gClr === gColor);
                  // console.log('496, the garmentcWay ', garmentcWay); // Test Code
                  // console.log('497, the gColor', gColor); // Test Code
                  if (!garmentcWay) {
                    console.log(
                      'The mQuo have the garment color way that not exist in the case, These are expected being matched in internal of the system'
                    );
                    //For the counting not being stoped, use resolve
                    resolve([0, 0]);
                  } else {
                    const cWayId = garmentcWay.id;
                    // console.log('864, The cWayId', cWayId); // Test Code

                    //@_mtrlColor
                    const mtrlColor = mtrl.mtrlColors.find(
                      ({ cWay }) => cWay === cWayId
                    );
                    if (!mtrlColor) {
                      console.log("The material don't have this color way");
                      //For the counting not being stoped, use resolve
                      resolve([0, 0]);
                    } else {
                      //@_srMtrl mtrl quotation
                      // const materialColor = mtrlColor.mColor;
                      const srMtrl = await SRMtrl.findOne(
                        {
                          company: comId,
                          CSRIC: CSRIC,
                          // mPrices: {
                          //   $elemMatch: {
                          //     mColor: materialColor,
                          //     sizeSPEC: materialSPEC,
                          //   },
                          // },
                        }
                        // { 'mPrices.$': 1 }
                      );

                      if (!srMtrl) {
                        console.log("Don't have this srMtrl");
                        //For the counting not being stoped, use resolve
                        resolve([0, 0]);
                      } else {
                        if (srMtrl.mPrices.length === 0) {
                          console.log("The srMtrl doesn't have Price yet");
                          //For the counting not being stoped, use resolve
                          resolve([0, 0]);
                        } else {
                          const mPrices = srMtrl.mPrices;
                          const materialColor = mtrlColor.mColor;

                          // console.log('531, the srMtrl ', srMtrl); // Test Code
                          const colorAndSPECMatchedMPrice = mPrices.filter(
                            (mP) =>
                              mP.mColor === materialColor &&
                              mP.sizeSPEC === materialSPEC
                          );

                          //@ Define the price --------
                          let mPrice = null;
                          const mainPrice = srMtrl.mainPrice;
                          if (colorAndSPECMatchedMPrice.length === 0) {
                            //If no mPrice with matched mColor and spec
                            if (mainPrice) {
                              //if have the mainPrice, use the mainPrice
                              mPrice = mPrices.filter(
                                (i) => i.id === mainPrice
                              )[0];
                            } else {
                              //If don't have mainPrice, use the 1st price as its price
                              mPrice = mPrices[0];
                            }
                          } else {
                            mPrice = colorAndSPECMatchedMPrice[0];
                          }
                          // const mPrice = srMtrl.mPrices[0];

                          // console.log('531, the mPrice ', mPrice); // Test Code
                          // console.log('531, the CSRIC ', CSRIC); // Test Code

                          let materialQuotation = 0;

                          //Unit consform
                          const mPUnit = mPrice.unit;
                          if (mPUnit && mtrlUnit) {
                            //If you dont' set either the unit for purchase in srMtrl or the unit of cspt in the mtrl of case, then do nothing.
                            //In here, mPUnit = purchase unit in srMtrl
                            //In here, mtrlUnit = cspt unit in mtrl of Case.
                            if (mPUnit === mtrlUnit) {
                              //If unit of purchase and case is same, then return the price directly.
                              // Here set the price of materials, If no quotation of materials, then it return the purchase price of material.
                              materialQuotation = mPrice.quotation || mPrice.mPrice;
                            } else {
                              //If the unit is different, the convert it.
                              const thePrice = mPrice.quotation || mPrice.mPrice;
                              if (thePrice === 0) {
                                //If the materials don't have both the purchase price and quotation then do nothing. Since it is zero, you don't have to convert.
                              } else {
                                //Unit convert.
                                //Notice, the quotation form apply the unit from bom, the Case, since the unit is provided by customer.
                                switch (mPUnit) {
                                  case 'yds':
                                    switch (mtrlUnit) {
                                      case 'm':
                                        materialQuotation = Number(
                                          thePrice / 0.9144
                                        );
                                        break;
                                      case 'cm':
                                        materialQuotation = Number(
                                          thePrice / 91.44
                                        );
                                        break;
                                      case 'in':
                                        materialQuotation = Number(
                                          thePrice / 36
                                        );
                                        break;
                                      default:
                                    }
                                    break;
                                  case 'm':
                                    switch (mtrlUnit) {
                                      case 'yds':
                                        materialQuotation = Number(
                                          thePrice * 0.9144
                                        );
                                        break;
                                      case 'cm':
                                        materialQuotation = Number(
                                          thePrice / 100
                                        );
                                        break;
                                      case 'in':
                                        materialQuotation = Number(
                                          thePrice / 39.3701
                                        );
                                        break;
                                      default:
                                    }
                                    break;
                                  case 'cm':
                                    switch (mtrlUnit) {
                                      case 'yds':
                                        materialQuotation = Number(
                                          thePrice * 91.44
                                        );
                                        break;
                                      case 'm':
                                        materialQuotation = Number(
                                          thePrice * 100
                                        );
                                        break;
                                      case 'in':
                                        materialQuotation = Number(
                                          thePrice * 2.54
                                        );
                                        break;
                                      default:
                                    }
                                    break;
                                  case 'in':
                                    switch (mtrlUnit) {
                                      case 'yds':
                                        materialQuotation = Number(
                                          thePrice * 36
                                        );
                                        break;
                                      case 'm':
                                        materialQuotation = Number(
                                          thePrice * 39.3701
                                        );
                                        break;
                                      case 'cm':
                                        materialQuotation = Number(
                                          thePrice / 2.54
                                        );
                                        break;
                                      default:
                                    }
                                    break;
                                  case 'pcs':
                                    switch (mtrlUnit) {
                                      case 'gross':
                                        materialQuotation = Number(
                                          thePrice * 144
                                        );
                                        break;
                                      case 'doz':
                                        materialQuotation = Number(
                                          thePrice * 12
                                        );
                                        break;
                                      default:
                                    }
                                    break;
                                  case 'gross':
                                    switch (mtrlUnit) {
                                      case 'pcs':
                                        materialQuotation = Number(
                                          thePrice / 144
                                        );
                                        break;
                                      case 'doz':
                                        materialQuotation = Number(
                                          thePrice / 12
                                        );
                                        break;
                                      default:
                                    }
                                    break;
                                  case 'doz':
                                    switch (mtrlUnit) {
                                      case 'pcs':
                                        materialQuotation = Number(
                                          thePrice / 12
                                        );
                                        break;
                                      case 'gross':
                                        materialQuotation = Number(
                                          thePrice * 12
                                        );
                                        break;
                                      default:
                                    }
                                    break;
                                  default:
                                }
                              }
                            }
                          } else {
                            console.log(
                              "the srMtrl dosen't have unit or the mtrl dosen't have unit, so the price returned will be 0"
                            );
                          }
                          // if (!mPUnit) {
                          //   materialQuotation = 0;
                          // } else  {
                          //   switch(mPUnit){
                          //     case'':
                          //     mtrlUnit
                          //     break
                          //     default;
                          //   }
                          // }

                          //@_get CSPT --------
                          const cspts = mtrl.cspts;
                          const cspt = cspts.reduce((result, currentItem) => {
                            if (
                              currentItem.cWay === cWayId &&
                              currentItem.size === gSizeId
                            ) {
                              result = result + currentItem.cspt;
                            }
                            return result;
                          }, 0);

                          const gQty = gQtyOfTheSize.find(
                            ({ cWay }) => cWay === cWayId
                          );
                          // console.log(
                          //   'test code, the gQtyOftheSize',
                          //   gQtyOfTheSize,
                          //   'the cWayId',
                          //   cWayId
                          // ); // test Code
                          // console.log('617, the gQty', gQty); // Test Code
                          const qtyOfTheSizeAndcWay = gQty.gQty;
                          console.log(
                            '619, the qtyOfTheSizeAndcWay',
                            qtyOfTheSizeAndcWay,
                            'the',
                            quocWaysNum,
                            'time'
                          ); // Test Code

                          //Notcie
                          // gQtyOfTheSize : The subtotal qty of a specific size of this case.
                          // selectedgQtyOfTheSize : The subtotal qty of the selected specific size of this case. The selection is made by the user before make the request
                          // gtyOfTheSizeAndcWay : The qty of a specific colorway and sizepsec.
                          const weightOfThecWay =
                            qtyOfTheSizeAndcWay / selectedgQtyOfTheSize;

                          colorWeightedPrice =
                            colorWeightedPrice +
                            materialQuotation * weightOfThecWay;

                          colorWeightedCSPT =
                            colorWeightedCSPT + cspt * weightOfThecWay;

                          quocWaysNum = quocWaysNum + 1;

                          if (quocWaysNum === quocWays.length) {
                            // console.log(
                            //   'The colorWeightedPrice',
                            //   colorWeightedPrice
                            // ); // Test Code
                            // console.log(
                            //   'The colorWeightedPrice',
                            //   colorWeightedCSPT
                            // ); // Test Code
                            resolve([colorWeightedPrice, colorWeightedCSPT]);
                          }
                        }
                      }
                    }
                  }
                });
              }
            );

            Promise.all([getColorWeightedPriceAndCSPT])
              .then((result) => {
                const colorWeightedPrice = result[0][0];
                const colorWeightedCSPT = result[0][1];
                // console.log(
                //   'The Promise all_1 colorWeightedPrice',
                //   colorWeightedPrice
                // ); // Test Code
                // console.log(
                //   'The Promise all_1 colorWeightedCSPT',
                //   colorWeightedCSPT
                // ); // Test Code

                // If one of the 2 index equlas to zero, skip the calculating.
                if (colorWeightedPrice === 0 || wieghtOfTheSelectedgQty === 0) {
                } else {
                  sizeAndColorWeightedPrice =
                    sizeAndColorWeightedPrice +
                    colorWeightedPrice * wieghtOfTheSelectedgQty;
                }

                console.log(
                  'The Promise all_1 sizeAndColorWdightedPrice',
                  sizeAndColorWeightedPrice
                ); // Test Code

                // If one of the 2 index equlas to zero, skip the calculating.
                if (colorWeightedCSPT === 0 || wieghtOfTheSelectedgQty === 0) {
                } else {
                  sizeAndColorWeightedCSPT =
                    sizeAndColorWeightedCSPT +
                    colorWeightedCSPT * wieghtOfTheSelectedgQty;
                }

                return [sizeAndColorWeightedPrice, sizeAndColorWeightedCSPT];
              })
              .then((result) => {
                quoSizesNum = quoSizesNum + 1;
                // console.log(
                //   'The quoSizesNum',
                //   quoSizesNum,
                //   'the quoSizes.length',
                //   quoSizes.length
                // ); // Test Code
                if (quoSizesNum === quoSizes.length) {
                  return resolve(result);
                }
              })
              .catch((err) => {
                console.log(err);
              });
          });
        }
      ).catch((err) => {
        console.log(err);
        return err;
      });

      // Connect to mongoDB updload the AVGPRICE
      Promise.all([getWeightedAVGPriceAndAVGCSPT])
        .then(async (result) => {
          let AVGPrice = Number(result[0][0]); //Rounding number in 2nd decimal place
          let AVGCSPT = Number(result[0][1]);
          // const AVGPrice = result[0][0].toFixed(2); //Rounding number in 2nd decimal place
          // const AVGCSPT = result[0][1].toFixed(2);
          let mtrlPrice = 0;
          if (AVGPrice === 0 || AVGCSPT === 0) {
          } else {
            mtrlPrice = Number(AVGPrice * AVGCSPT)
          }

          console.log('The Promise all_2 AVGPrice ', AVGPrice); // Test Code
          console.log('The Promise all_2 AVGCSPT ', AVGCSPT); // Test Code

          //Fix the number to 2 decimal number
          const finalAVGPrice = AVGPrice !== 0 ? Math.round((AVGPrice + Number.EPSILON) * 100) / 100 : 0;
          const finalAVGCSPT = AVGCSPT !== 0 ? Math.round((AVGCSPT + Number.EPSILON) * 100) / 100 : 0;
          const finalMtrlPrice = mtrlPrice !== 0 ? Math.round((mtrlPrice + Number.EPSILON) * 100) / 100 : 0;

          console.log('The finalAVGPrice', finalAVGPrice) // Test Code
          console.log('The finalAVGCSPT', finalAVGCSPT) // Test Code
          console.log('The finalMtrlPrice', finalMtrlPrice) // Test Code

          await QuoForm.findOneAndUpdate(
            {
              company: comId,
              quoNo: quoNo,
              _id: quoFormId,
              'mQuos.mtrlId': mtrlId,
            },
            // { $set: { 'quoForms.$.mQuos.mQuoAddvised': AVGPrice } }
            {
              $set: {
                quotatedQty: Number(totalgQty),
                'mQuos.$.mQuoAddvised': finalAVGPrice,
                'mQuos.$.csptAddvised': finalAVGCSPT,
                'mQuos.$.materialFinalQuotation': finalMtrlPrice,
              },
            }
          );
        })
        .then(async () => {
          mQuoNum = mQuoNum + 1;
          if (mQuoNum === mQuos.length) {
            const addUp = await QuoForm.aggregate([
              {
                $match: {
                  quoNo: quoNo,
                  _id: mongoose.Types.ObjectId(quoFormId),
                  company: mongoose.Types.ObjectId(req.user.company),
                },
              },
              {
                $project: {
                  cm: 1,
                  mQuosAddUp: { $sum: '$mQuos.materialFinalQuotation' },
                  otherExpensesAddUp: { $sum: '$otherExpenses.cost' },
                },
              },
            ]);

            // const cm = addUp[0].cm;
            const cm = addUp[0] ?
              Math.round((addUp[0].cm + Number.EPSILON) * 100) / 100
              : 0
            // const mQuosTotal = addUp[0].mQuosAddUp;
            const mQuosTotal = addUp[0].mQuosAddUp ?
              Math.round((addUp[0].mQuosAddUp + Number.EPSILON) * 100) / 100
              : 0
            // const otherExpensesTotal = addUp[0].otherExpensesAddUp;
            const otherExpensesTotal = addUp[0].otherExpensesAddUpp ?
              Math.round((addUp[0].otherExpensesAddUpp + Number.EPSILON) * 100) / 100
              : 0
            const FOB =
              Number(cm) + Number(mQuosTotal) + Number(otherExpensesTotal);
            console.log(
              'cm_',
              cm,
              'mQuosTotal_',
              mQuosTotal,
              'otherExpensesTotal_',
              otherExpensesTotal,
              'FOB_',
              FOB
            ); // Test Code

            const quoForms = await QuoForm.findOneAndUpdate(
              {
                company: comId,
                _id: quoFormId,
              },
              {
                mQuosTotal: mQuosTotal,
                otherExpensesTotal: otherExpensesTotal,
                fob: Number(FOB).toFixed(3),
              },
              { new: true }
            );

            // const quoForms = await QuoForm.find(
            //   {
            //     company: comId,
            //     quoHead: quoHeadId,
            //   },
            //   { company: 0 }
            // );

            console.log('The Promise all_2 resolove '); // Test Code
            return resolve(quoForms);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }).catch((err) => {
    console.log(err);
    return err;
  });

  Promise.all([insertmtrlQuotation])
    .then((result) => {
      const resQuoForms = result[0];
      // console.log('The material quotation is finished ', resQuoForms); // Test Code
      console.log('The material quotation is finished and returned');
      return res.json(resQuoForms);
    })
    .catch((err) => {
      console.log("MongoDB or internet problem, can't find quoForm", err);
      return res.json({ error: err, quoForms: [] });
    });
});

// @route   DELETE api/quogarment/delete/quoform/cNo/quoFormId
// @desc    Delete the quoForm
// @access  Private
router.delete(
  '/delete/quoform/:quoNo/:quoFormId',
  authUser,
  async (req, res) => {
    console.log('delete quoForm is called in backEnd');
    let user = await User.findById(req.user.id);
    //Check if multiple login, if yes, do nothing
    const token = req.header('x-auth-token');
    if (user.sKey !== token) {
      const msg = { err: 'Delete failed. Multiple user login, please login again.' }
      console.log(msg)
      return res.json([msg])
    }
    //Check if the user have the right
    if (!user.quo) {
      return res.status(400).json({ msg: 'Out of authority' });
    }
    // const cNo = req.params.quoNo.slice(0, 14);
    // console.log('This is the cNo', cNo);
    const quoNo = req.params.quoNo;
    const quoFormId = req.params.quoFormId;
    const comId = req.user.company;
    await QuoForm.deleteOne({ quoNo: quoNo, company: comId, _id: quoFormId })
      .then(() => {
        console.log(`The quoForm ${req.params.quoNo} is deleted`);
        return res.json({ msg: 'Delete the quoForm' });
      })
      .catch((err) => {
        console.log(err);
        return res.json({ msg: 'Got problem to delete the quoForm' });
      });
  }
);

// @route   DELETE api/quogarment/delete/mquosbymtrl/cNo/mtrlId
// @desc    Delete the mQuos in the quoForms
// @access  Private
router.delete(
  '/delete/mquosbymtrl/:cNo/:mtrlId',
  authUser,
  async (req, res) => {
    console.log('The delete mQuo is triggered in backend');
    const comId = req.user.company;
    const cNo = req.params.cNo;
    const mtrlId = req.params.mtrlId;
    console.log('the comId in deletemquo backEnd', comId);
    console.log('the cNo in deletemquo backEnd', cNo);
    console.log('the mtrlId in deletemquo backEnd', mtrlId);

    const quo = await QUO.findOne({
      cNo: cNo,
      company: comId,
      'quoForms.mQuos.mtrlId': mtrlId,
    });
    if (quo) {
      const quoForms = quo.quoForms;
      const deleteQuo = new Promise((resolve) => {
        quoForms.map(async (quoForm) => {
          let num = 0;
          await QuoHead.updateOne(
            {
              cNo: cNo,
              company: comId,
              'quoForms.quoNo': quoForm.quoNo,
              'quoForms.mQuos.mtrlId': mtrlId,
            },
            { $pull: { 'quoForms.$.mQuos': { mtrlId: mtrlId } } }
          )
            .then((result) => {
              console.log('The mquo is deleted', result);
              num = num + 1;
              if (num === quoForms.length) {
                return resolve();
              }
            })
            .catch((err) => {
              console.log('The delete mQuo is failed,', err);
            });
        });
      });
      Promise.all([deleteQuo]).then(() => {
        console.log('The quos is deleted by mtrl');
        return res.json({ msg: 'the quos is deleted by mtrl' });
      });
    } else {
      console.log('No such quotation data');
      return res.status(404).json({ msg: 'No such quotation data' });
    }
  }
);

module.exports = router;
