const express = require('express');
const router = express.Router();
const authUser = require('../middleware/authUser');
// Not set up yet, for check the value entered by user at the some specific column
const { check, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const myModule = require('../myModule/myModule');

const User = require('../models/10_User');
const Case = require('../models/20_Case');
const SRMtrl = require('../models/30_SRMtrl');

// @route   GET api/srmtrl
// @desc    Read the compnay's srMtrl from database
// @access  Private
router.get('/', authUser, async (req, res) => {

  const user = await User.findById(req.user.id)
  //Check if multiple login, if yes, do nothing
  const token = req.header('x-auth-token');
  if (user.sKey !== token) {
    const msg = { err: 'Multiple user login, please login again.' }
    console.log(msg)
    return res.json([msg])
  }

  const srMtrls = await SRMtrl.find(
    { company: req.user.company },
    {
      CSRIC: 0,
      company: 0,
      'mtrlColors.refs': 0,
      'sizeSPECs.refs': 0,
    }
  ).sort({
    supplier: 1,
    date: -1,
  });

  if (srMtrls.length > 0) {
    res.json(srMtrls);
  } else {
    res.json([])
  }
});

// @route   GET api/srmtrl/queryresult
// @desc    Response to the queried obj
// @access  Private
router.put('/queryresult', authUser, async (req, res) => {
  const user = await User.findById(req.user.id)
  //Check if multiple login, if yes, do nothing
  const token = req.header('x-auth-token');
  if (user.sKey !== token) {
    const msg = { err: 'Multiple user login, please login again.' }
    console.log(msg)
    return res.json([msg])
  }

  let body = req.body;
  delete body._id;
  const filed = Object.keys(body);
  const value = Object.values(body);
  const srMtrls = await SRMtrl.find(
    {
      company: req.user.company,
      [filed[0]]: [value[0]],
    },
    {
      CSRIC: 0,
      company: 0,
      'mtrlColors.refs': 0,
      'sizeSPECs.refs': 0,
    }
  ).sort({
    supplier: 1,
    date: -1,
  });

  try {
    res.json(srMtrls);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/srmtrl/:caseId
// @desc    Update refs in srMtrls
// @access  Private
router.put('/:caseId', authUser, async (req, res) => {
  // Check if the user has authority to update case ---------------------------
  const userId = req.user.id;
  const comId = req.user.company;
  const caseId = req.params.caseId;
  let user = await User.findById(userId);
  //Check if multiple login, if yes, do nothing
  const token = req.header('x-auth-token');
  if (user.sKey !== token) {
    const msg = { err: 'Multiple user login, please login again.' }
    console.log(msg)
    return res.json([msg])
  }

  if (!user.cases) {
    return res.status(400).json({
      msg: 'Out of authority',
    });
  }

  // // Check if the user have the authority to update the case -------------------
  // let existingCases = await Case.findById(caseId);
  // // If the user is case creator, pass !
  // if (existingCases.user.toString() === userId) {
  //   // if the user's id is added to authorizedUser of this case, pass !
  // } else if (existingCases.authorizedUser.includes(userId)) {
  // } else {
  //   return res.status(400).json({ msg: 'Not an authorized user.' });
  // }

  // Update srMtrl ---------------------------------------------------------------
  const { cases, comName, comSymbol } = req.body;
  let mLists = [];
  let mtrls = cases.mtrls;

  console.log("Start making srMtrl") // Test Code
  const makeMLists = mtrls.map(async (mtrl, idx) => {
    console.log("makeMList loop - ", idx)
    return new Promise((resolve) => {
      //@ Check if the mtrl is alread have srMtrl, if have , it must be srMtrl with different supplier and ref_no, how ever have both same caseId and mtrlId in the refs in either mtrlColors and sizeSPECs
      if (mtrl.supplier) {
        //Only the mtrl with supplier need to be made srMtrl
        console.log("the mtrl has supplier - ", idx)
        const checkDuplicatedSrMtrl = new Promise(async (resolve) => {
          // let checkNum = 0;
          // Delete the refs of mtrlColors in the duplicated SrMtrl
          let mColorRefMtrlId = ''
          let mSPECReffMtrlId = ''
          let SrMtrlId = '';

          const checkRefInExistingMtrlColor = new Promise(async (resolve) => {
            const existingMtrlColorRef = await SRMtrl.find({
              supplier: { $ne: mtrl.supplier },
              ref_no: { $ne: mtrl.ref_no },
              'mtrlColors.refs': { caseId: caseId, mtrlId: mtrl.id },
            });

            if (existingMtrlColorRef.length > 0) {
              // If the srMtrl only have one item in mtrlColors, then delete the item.
              console.log('the existingRef', existingMtrlColorRef); // Test Code
              await SRMtrl.findOneAndUpdate(
                {
                  supplier: { $ne: mtrl.supplier },
                  ref_no: { $ne: mtrl.ref_no },
                  'mtrlColors.refs': { caseId: caseId, mtrlId: mtrl.id },
                },
                {
                  $pull: {
                    'mtrlColors.$.refs': { caseId: caseId, mtrlId: mtrl.id },
                  },
                }
              ).then(() => {
                // mColorRefMtrlId = existingMtrlColorRef[0]._id;
                // checkNum = checkNum + 1;
                console.log("delete the refs in mtrlColor of the mtrl - ", idx)
                // resolve for promise : "checkRefInExistingMtrlColor"
                console.log("the existingMtrlColorRef[0]._id", existingMtrlColorRef[0]._id)
                resolve(existingMtrlColorRef[0]._id)
              });
            } else {
              // checkNum = checkNum + 1;
              console.log("No delete the refs in mtrlColor of the mtrl - ", idx)
              // resolve for promise : "checkRefInExistingMtrlColor"
              resolve()
            }
          })

          const checkRefInExistingMtrlSPEC = new Promise(async (resolve) => {
            // Delete the refs of sizeSPECs in the duplicated SrMtrl
            const existingSizeSPECRef = await SRMtrl.find({
              supplier: { $ne: mtrl.supplier },
              ref_no: { $ne: mtrl.ref_no },
              'sizeSPECs.refs': { caseId: caseId, mtrlId: mtrl.id },
            });

            if (existingSizeSPECRef.length > 0) {
              // console.log('the existingRef', existingSizeSPECRef); // Test Code
              await SRMtrl.findOneAndUpdate(
                {
                  supplier: { $ne: mtrl.supplier },
                  ref_no: { $ne: mtrl.ref_no },
                  'sizeSPECs.refs': { caseId: caseId, mtrlId: mtrl.id },
                },
                {
                  $pull: {
                    'sizeSPECs.$.refs': { caseId: caseId, mtrlId: mtrl.id },
                  },
                }
              ).then(() => {
                // mSPECReffMtrlId = existingSizeSPECRef[0]._id;
                // checkNum = checkNum + 1;
                console.log("Delete the refs in spec of the srMtrl - ", idx)
                // resolve for promise : "checkRefInExistingMtrlSPEC"
                console.log("existingSizeSPECRef[0]._id ", existingSizeSPECRef[0]._id)
                resolve(existingSizeSPECRef[0]._id)
              });
            } else {
              // checkNum = checkNum + 1;
              console.log("No delete the refs in spec of the srMtrl - ", idx)
              // resolve for promise : "checkRefInExistingMtrlSPEC"
              resolve()
            }
          })

          Promise.all([checkRefInExistingMtrlColor, checkRefInExistingMtrlSPEC]).then((result) => {
            console.log("the result[0]", result[0])
            console.log("the result[1]", result[1])
            SrMtrlId = result[0] || result[1] || null
            // if (checkNum >= 2) {
            console.log("the Promise checkRefInExistingMtrlColor and checkRefInExistingMtrlSPEC solved - ", idx);
            // console.log(
            //   'The promise checkDuplicatedSrMtrl is resolved',
            //   'and it is the result the id ',
            //   SrMtrlId, 'and the idx - ', idx
            // ); // Test Code
            // resolve for promise : "checkDuplicatedSrMtrl"
            resolve(SrMtrlId);
            // }
          })
        });

        const checkIfDeleteSrMtrl = new Promise((resolve) => {
          Promise.all([checkDuplicatedSrMtrl]).then(async (result) => {
            // console.log(
            //   'The promise all of checkDuplicatedSrMtrl is called',
            //   'and the result',
            //   result
            // ); // test Code
            const targetId = result[0];
            console.log("the targetId", targetId)
            if (targetId) {
              // Delete the object in mtrlColors and sizeSPECs, which with refs.length === 0, in other words, no any case and mtrl ref to this object.
              const targetSrMtrl = await SRMtrl.findOne({ _id: targetId });
              const deleteTopObj = new Promise((resolve) => {
                // console.log('The targetSrMtrl', targetSrMtrl); // Test Code
                let num1 = 0;
                let num2 = 0;
                targetSrMtrl.mtrlColors.map(async (m) => {
                  if (m.refs.length === 0) {
                    // console.log('I got you, the mtrlColor !');  // Test Code
                    await SRMtrl.updateOne(
                      { _id: targetId },
                      { $pull: { mtrlColors: { id: m.id } } }
                    );
                  }
                  num1 = num1 + 1;
                  if (
                    num1 === targetSrMtrl.mtrlColors.length &&
                    num2 === targetSrMtrl.sizeSPECs.length
                  ) {
                    // Promise for promise : "deleteTopObj"
                    resolve(targetId);
                  }
                });

                targetSrMtrl.sizeSPECs.map(async (s) => {
                  if (s.refs.length === 0) {
                    // console.log('I got you, the sizeSPEC !'); // Test Code
                    await SRMtrl.updateOne(
                      { _id: targetId },
                      { $pull: { sizeSPECs: { id: s.id } } }
                    );
                  }
                  num2 = num2 + 1;
                  if (
                    num1 === targetSrMtrl.mtrlColors.length &&
                    num2 === targetSrMtrl.sizeSPECs.length
                  ) {
                    // Promise for promise : "deleteTopObj"
                    resolve(targetId);
                  }
                });
              });

              Promise.all([deleteTopObj]).then(async (result) => {
                // Delete the srMtrl that has both mtrlColors and sizeSPECs with length === 0. In other words, no any case and mtrl ref to this srMtrl
                const targetId = result[0];
                const finalTargetSrMtrl = await SRMtrl.findOne({ _id: targetId });
                const mtrlColorLength = finalTargetSrMtrl.mtrlColors.length;
                const sizeSPECLength = finalTargetSrMtrl.sizeSPECs.length;
                // const checkNum = mtrlColorLength + sizeSPECLength;
                if (mtrlColorLength === 0 || sizeSPECLength === 0) {
                  await SRMtrl.findByIdAndRemove({ _id: targetId });
                  // resolve for promise : "checkIfDeleteSrMtrl"
                  resolve()
                } else {
                  // resolve for promise : "checkIfDeleteSrMtrl"
                  resolve()
                }
              });
            } else {
              // resolve for promise : "checkIfDeleteSrMtrl"
              resolve()
            }
          });
        })

        //@ Start update refs
        Promise.all([checkIfDeleteSrMtrl]).then(async () => {
          console.log('Start update refs', idx)

          const newCSRIC = (comName + comSymbol + mtrl.supplier + mtrl.ref_no)
            .toLowerCase()
            .replace(/[^\da-z]/gi, '');
          // console.log('comsymbo', comSymbol); // Test Code
          // console.log('newCSRIC', newCSRIC); // Test Code
          let existingSrMtrlObj = mLists.find(({ CSRIC }) => CSRIC === newCSRIC);
          //If the srMtrl is not existing in the mLists then generete a new one
          //This line makes sure the mList never contain duplicated srMtrl with same CSRIC
          // console.log('this is existingSrMtrlObj', existingSrMtrlObj);

          let mtrlObj = {};
          // console.log('Check the if', !existingSrMtrlObj);
          if (!existingSrMtrlObj) {
            mtrlObj = {
              supplier: mtrl.supplier,
              ref_no: mtrl.ref_no,
              item: mtrl.item ? mtrl.item : '',
              CSRIC: newCSRIC,
              mtrlColors: [],
              sizeSPECs: [],
              caseUnit: mtrl.unit,
              mPrices: [],
              company: cases.company,
              mainPrice: null,
            };
          } else {
            mtrlObj = existingSrMtrlObj;
          }

          // Insert mtrlColors to newSrMtrlObj
          const inserMtrlColorsTonewSrMtrlObj = mtrl.mtrlColors.map((mtrlColor, index) => {
            return new Promise(async (resolve) => {
              const idx = mtrl.mtrlColors
                .map((item) => {
                  return item.mColor;
                })
                .indexOf(mtrlColor.mColor);
              if (idx !== index) {
                // Here means the mColor is duplicated. It appears more than once.
                resolve()
              } else {
                //@ New CSRIC mtrl
                if (!existingSrMtrlObj) {
                  mtrlObj.mtrlColors.push({
                    id: uuidv4() + myModule.generateId(),
                    mColor: mtrlColor.mColor,
                    refs: [
                      {
                        caseId: cases._id,
                        mtrlId: mtrl.id,
                      },
                    ],
                  });
                  resolve()
                } else {
                  //@ Old CSRIC
                  let mtrlObjHaveTheColor = await mtrlObj.mtrlColors.find(
                    ({ mColor }) => mColor == mtrlColor.mColor
                  );

                  if (!mtrlObjHaveTheColor) {
                    //Old CSRIC don't have the mColor
                    mtrlObj.mtrlColors.push({
                      id: uuidv4() + myModule.generateId(),
                      mColor: mtrlColor.mColor,
                      refs: [
                        {
                          caseId: cases._id,
                          mtrlId: mtrl.id,
                        },
                      ],
                    });
                    resolve()
                  } else {
                    //Old CSRIC have the mColor
                    let sameMtrlInSameColor = await mtrlObjHaveTheColor.refs.find(
                      ({ caseId, mtrlId }) =>
                        caseId === cases._id && mtrlId === mtrl.id
                    );
                    if (sameMtrlInSameColor) {
                      //Same case same mtrl with same mColor don't need to insert refs.
                      resolve()
                    } else {
                      //Insert refs for new Case
                      mtrlObjHaveTheColor.refs.push({
                        caseId: cases._id,
                        mtrlId: mtrl.id,
                      });
                      resolve()
                    }
                  }
                }
              }
            })
          });

          Promise.all(inserMtrlColorsTonewSrMtrlObj).then(() => {
            //Insert sizeSPEC to newSrMtrlObj
            const inserSPECtoNewSrMtrlObj = mtrl.sizeSPECs.map((sizeSPEC, index) => {
              return new Promise(async (resolve) => {
                const idx = mtrl.sizeSPECs.map((item) => {
                  return item.mSizeSPEC;
                }).indexOf(sizeSPEC.mSizeSPEC);
                if (idx !== index) {
                  // Here means the mSizeSPEC is duplicated in the mtrl. It appears more than once.
                  // resolve for promise : "inserSPECtoNewSrMtrlObj"
                  resolve()
                } else {
                  //@ New CSRIC mtrl
                  if (!existingSrMtrlObj) {
                    mtrlObj.sizeSPECs.push({
                      id: uuidv4() + myModule.generateId(),
                      mSizeSPEC: sizeSPEC.mSizeSPEC,
                      refs: [
                        {
                          caseId: cases._id,
                          mtrlId: mtrl.id,
                        },
                      ],
                    });
                    // resolve for promise : "inserSPECtoNewSrMtrlObj"
                    resolve()
                  } else {
                    //@ Old CSRIC
                    let existingsSPEC = mtrlObj.sizeSPECs.find(
                      ({ mSizeSPEC }) => mSizeSPEC === sizeSPEC.mSizeSPEC
                    );

                    if (!existingsSPEC) {
                      //Old CSRIC don't have this mSizeSPEC
                      mtrlObj.sizeSPECs.push({
                        id: uuidv4() + myModule.generateId(),
                        mSizeSPEC: sizeSPEC.mSizeSPEC,
                        refs: [
                          {
                            caseId: cases._id,
                            mtrlId: mtrl.id,
                          },
                        ],
                      });
                      // resolve for promise : "inserSPECtoNewSrMtrlObj"
                      resolve()
                    } else {
                      //Old CSRIC have the mSizeSPEC
                      let sameSizeSPECInSameSPEC = existingsSPEC.refs.find(
                        ({ caseId, mtrlId }) =>
                          caseId === cases._id && mtrlId === mtrl.id
                      );
                      if (sameSizeSPECInSameSPEC) {
                        //Same case same mtrl with same mSizeSPEC don't need to insert refs.
                        // resolve for promise : "inserSPECtoNewSrMtrlObj"
                        resolve()
                      } else {
                        //Insert refs for new Case
                        existingsSPEC.refs.push({
                          caseId: cases._id,
                          mtrlId: mtrl.id,
                        });
                        // resolve for promise : "inserSPECtoNewSrMtrlObj"
                        resolve()
                      }
                    }
                  }
                }
              });
            })
            Promise.all(inserSPECtoNewSrMtrlObj).then(() => {
              if (!existingSrMtrlObj) {
                //Only push when the mtrlObj is a new CSRIC mtrl,
                // console.log("The mtrlObj", mtrlObj, "the idx - ", idx)
                mLists.push(mtrlObj);
                resolve()
              } else {
                resolve()
              }
              // console.log("the mLists - in Promise.all (inserSPECtoNewSrMtrlObj)", mLists, "the idx - ", idx) // Test code
            })
          })
        })
      } else {
        // The mtrl don't have supplier, so skip this mtrls.
        // console.log("This material don't have supplier, so skipper this materiasl", idx) // Test Code
        resolve()
        // return null;
      }
    })
  });

  // console.log(mLists);

  // Compare with the existing List

  Promise.all(makeMLists).then(async () => {
    console.log("the mLists - in promise makeMLists", mLists)
    console.log("after mLists is made, start treat newSrMtrlObj")
    const loopMLists = mLists.map(async (mList, mListIdx) => {
      return new Promise(async (resolve) => {
        if (mList.CSRIC === '' || mList.CSRIC === null || mList.mtrlColors.length === 0 || mList.sizeSPECs.length === 0) {
          console.log('do nothing');
          //IF thie mList dosen't have CSRIC, then do nothing.
          // reolve for promise : "loopMLists"
          resolve()
        } else {
          //Check if any item in mtrl is matched to refs in the srMtrl database
          await SRMtrl.findOne({
            company: comId,
            CSRIC: mList.CSRIC,
          }).then(async (srMtrl) => {
            if (srMtrl === null) {
              // If dont have the srMtrl then generate a new srMtrl
              const newSRMtrl = new SRMtrl(mList);
              await newSRMtrl.save();
              resolve();
            } else {
              // If the srMtrl exists
              //@_step_1 Insert mtrlColor
              // let insertMtrlColor = new Promise(async (resolve, reject) => {
              // console.log('This should be 1 start', mList.CSRIC);
              // let counterOfLoopOfInsertMtrlColor = 0;
              const insertMtrlColor = mList.mtrlColors.map((mtrlColor) => {
                return new Promise(async (resolve) => {
                  await SRMtrl.findOne(
                    {
                      company: comId,
                      CSRIC: mList.CSRIC,
                      'mtrlColors.mColor': mtrlColor.mColor,
                    },
                    { mtrlColors: 1, CSRIC: 1 }
                  )
                    .then(async (srMtrl) => {
                      // console.log(
                      //   `this is the color : ${mtrlColor.mColor}'s srMtrl`,
                      //   srMtrl
                      // );
                      if (srMtrl === null) {
                        // if no such mColor in the srMtrl.mtrlColors
                        await SRMtrl.updateOne(
                          {
                            company: comId,
                            CSRIC: mList.CSRIC,
                          },
                          {
                            $addToSet: {
                              mtrlColors: mtrlColor,
                            },
                          }
                        );
                        console.log(
                          `${mList.CSRIC} in color ${mtrlColor.mColor} is generated`
                        );
                        resolve()
                      } else {
                        // if dose have such mColor in the srMtrl.mtrlColors, insert the ref to the existing mtrlColor
                        const inserExistingReftoMtrlColor = mtrlColor.refs.map(async (ref) => {
                          // $addToSet, the operatoer only push a unique item to the array. It prevent duplicated value be pushed to the refs
                          return await SRMtrl.updateOne(
                            {
                              company: comId,
                              CSRIC: mList.CSRIC,
                              'mtrlColors.mColor': mtrlColor.mColor,
                            },
                            {
                              $addToSet: {
                                'mtrlColors.$.refs': ref,
                              },
                            }
                          );
                        });
                        Promise.all(inserExistingReftoMtrlColor).then(() => {
                          resolve()
                        })
                      }
                    })
                  // .then(() => {
                  //   counterOfLoopOfInsertMtrlColor++;
                  //   const num_1 = counterOfLoopOfInsertMtrlColor;
                  //   if (num_1 === mList.mtrlColors.length) {
                  //     // console.log('This should be 1 end', mList.CSRIC);
                  //     return resolve();
                  //   }
                  // });
                })
              });
              // });

              //@_step_2 Clear the extra refs in mColor
              const clearColorRef = new Promise((resolve, reject) => {
                Promise.all(insertMtrlColor).then(async () => {
                  // console.log('This should be 2 start', mList.CSRIC);
                  await SRMtrl.findOne(
                    { company: comId, CSRIC: mList.CSRIC },
                    { _id: 0, mtrlColors: 1 }
                  ).then(async (srMtrl) => {
                    const deleteExtraRefs = srMtrl.mtrlColors.map(async (mtrlColor) => {
                      return new Promise(async (resolve) => {
                        let matchedColor = await mList.mtrlColors.find(
                          ({ mColor }) => mColor === mtrlColor.mColor
                        );
                        if (!matchedColor) {
                          const caseId = cases._id;
                          const mtrlId = mList.mtrlColors[0].refs[0].mtrlId;
                          await SRMtrl.updateOne(
                            {
                              company: comId,
                              CSRIC: mList.CSRIC,
                              mtrlColors: {
                                $elemMatch: {
                                  mColor: mtrlColor.mColor,
                                  refs: {
                                    caseId: caseId,
                                    mtrlId: mtrlId,
                                  },
                                },
                              },
                            },
                            {
                              $pull: {
                                'mtrlColors.$.refs': {
                                  caseId: caseId,
                                  mtrlId: mtrlId,
                                },
                              },
                            }
                          )
                          resolve()
                        } else {
                          resolve()
                        }
                      })

                    });
                    Promise.all(deleteExtraRefs).then(() => {
                      resolve();
                    })
                  });
                });
              });

              //@_step_3 Delete the mtrlColor in mtrlColors, if the refs of which is 0, means no case ref to it.
              // This Promise.all will wait for the async method, in this case (clearRef), finished all job, then start to do things.
              const deleteExtraMtrlColor = new Promise((resolve) => {
                Promise.all([clearColorRef]).then(() => {
                  // console.log('This should be 3 start', mList.CSRIC);
                  SRMtrl.findOne(
                    {
                      company: comId,
                      CSRIC: mList.CSRIC,
                    },
                    { _id: 0, mtrlColors: 1 }
                  ).then((srMtrl) => {
                    // let mtrlColorLoop = 0;
                    const checkMtrlColors = srMtrl.mtrlColors.map((mtrlColor) => {
                      return new Promise(async (resolve) => {
                        let checkPoint = mtrlColor.refs.length;
                        if (checkPoint < 1) {
                          await SRMtrl.updateOne(
                            {
                              company: comId,
                              CSRIC: mList.CSRIC,
                            },
                            {
                              $pull: {
                                mtrlColors: {
                                  id: mtrlColor.id,
                                },
                              },
                            }
                          );
                          resolve()
                        } else {
                          resolve()
                        }
                      })
                    });
                    Promise.all(checkMtrlColors).then(() => {
                      console.log('srMtrl, The mtrlColors 3 end', mList.CSRIC);
                      resolve()
                    })
                  });
                });
              })

              //@_step_1 Inser SizeSPECS
              const insertMtrlSPEC = new Promise((resolve, reject) => {
                Promise.all([deleteExtraMtrlColor]).then(() => {
                  console.log("th promise insertMtrlSPEC, in the mLists loop", mListIdx) // Test code
                  // console.log('SPEC 1 start', mList.CSRIC);
                  const loopSizeSPEC = mList.sizeSPECs.map(async (sizeSPEC) => {
                    return new Promise(async (resolve) => {
                      // console.log('This is the sizeSPEC', sizeSPEC); // Test Code
                      await SRMtrl.findOne({
                        company: comId,
                        CSRIC: mList.CSRIC,
                        'sizeSPECs.mSizeSPEC': sizeSPEC.mSizeSPEC,
                      })
                        .then(async (srMtrl) => {
                          if (srMtrl === null) {
                            // if no such mSizeSPEC in the srMtrl.sizeSPECs
                            await SRMtrl.updateOne(
                              {
                                company: comId,
                                CSRIC: mList.CSRIC,
                              },
                              {
                                $addToSet: {
                                  sizeSPECs: sizeSPEC,
                                },
                              }
                            );
                            resolve();
                          } else {
                            // if dose have such sizeSPEC in the srMtrl.sizeSPECs, insert the ref to the existing sizeSPEC
                            const loopSizeSPECrefs = sizeSPEC.refs.map(async (ref) => {
                              // $addToSet, the operatoer only push a unique item to the array. It prevent duplicated value be pushed to the refs
                              return await SRMtrl.updateOne(
                                {
                                  company: comId,
                                  CSRIC: mList.CSRIC,
                                  'sizeSPECs.mSizeSPEC': sizeSPEC.mSizeSPEC,
                                },
                                {
                                  $addToSet: {
                                    'sizeSPECs.$.refs': ref,
                                  },
                                }
                              );
                            });
                            Promise.all(loopSizeSPECrefs).then(() => {
                              resolve()
                            })
                          }
                        })
                    })
                  });
                  Promise.all(loopSizeSPEC).then(() => {
                    resolve();
                  })
                })
              });

              //@_step_2 Clear the extra refs in sizeSPEC
              const clearSPECRef = new Promise((resolve, reject) => {
                Promise.all([insertMtrlSPEC]).then(async () => {
                  // console.log('SPEC 2 start', mList.CSRIC);
                  await SRMtrl.findOne(
                    {
                      company: comId,
                      CSRIC: mList.CSRIC,
                    },
                    {
                      _id: 0,
                      sizeSPECs: 1,
                    }
                  ).then((srMtrl) => {
                    const clearSPECRefLoopSPECs = srMtrl.sizeSPECs.map(async (dbSizeSPEC) => {
                      return new Promise(async (resolve) => {
                        let matchedSPEC = mList.sizeSPECs.find(
                          ({ mSizeSPEC }) => mSizeSPEC === dbSizeSPEC.mSizeSPEC
                        );

                        if (!matchedSPEC) {
                          const caseId = cases._id;
                          const mtrlId = mList.sizeSPECs[0].refs[0].mtrlId;
                          await SRMtrl.updateOne(
                            {
                              company: comId,
                              CSRIC: mList.CSRIC,
                              sizeSPECs: {
                                $elemMatch: {
                                  mSizeSPEC: dbSizeSPEC.mSizeSPEC,
                                  refs: {
                                    caseId: caseId,
                                    mtrlId: mtrlId,
                                  },
                                },
                              },
                            },
                            {
                              $pull: {
                                'sizeSPECs.$.refs': {
                                  caseId: caseId,
                                  mtrlId: mtrlId,
                                },
                              },
                            }
                          );
                          // resolve for promise :"clearSPECRefLoopSPECs"
                          resolve()
                        } else {
                          // resolve for promise :"clearSPECRefLoopSPECs"
                          resolve()
                        }
                      })
                    });

                    Promise.all(clearSPECRefLoopSPECs).then(() => {
                      //resolve for promise 'clearSPECRef'
                      resolve();
                    })
                  });
                });
              });

              //@_step_3 Delete the mtrlColor in mtrlColors, if the refs of which is 0, means no case ref to it.
              // This Promise.all will wait for the async method, in this case (clearRef), finished all job, then start to do things.
              Promise.all([clearSPECRef]).then(() => {
                // console.log('SPEC 3 start', mList.CSRIC);
                SRMtrl.findOne(
                  {
                    company: comId,
                    CSRIC: mList.CSRIC,
                  },
                  { _id: 0, sizeSPECs: 1 }
                ).then((srMtrl) => {
                  const finalLoop = srMtrl.sizeSPECs.map(async (sizeSPEC) => {
                    return new Promise(async (resolve) => {
                      let checkPoint = sizeSPEC.refs.length;
                      if (checkPoint < 1) {
                        await SRMtrl.updateOne(
                          {
                            company: comId,
                            CSRIC: mList.CSRIC,
                          },
                          {
                            $pull: {
                              sizeSPECs: {
                                id: sizeSPEC.id,
                              },
                            },
                          }
                        );
                        resolve()
                      } else {
                        resolve()
                      }
                    })
                  });
                  Promise.all(finalLoop).then(() => {
                    console.log('srMtrl, SPEC 3 end');
                    // reolve for promise : "loopMLists"
                    resolve()
                  })
                });
              });
            }
          });
        }
      })
    });

    Promise.all(loopMLists).then(() => {
      console.log("The srMtrl is updated")

      return res.json({ msg: 'srMtrl is updated' });
    }).catch((err) => {
      console.error(err.message);
      return res.status(500).send('Server Error');
    })
  }).catch((err) => {
    console.error(err.message);
    return res.status(500).send('Server Error');
  })


});

// @route   PUT api/srmtrl/update/mpricevalues
// @desc    Update the value in srMtrl and mPrice
// @access  Private
router.put('/update/mpricevalues', authUser, async (req, res) => {
  const srMtrlList = req.body;
  const comId = req.user.company;
  const userId = req.user.id;
  let user = await User.findById(userId);
  //Check if multiple login, if yes, do nothing
  const token = req.header('x-auth-token');
  if (user.sKey !== token) {
    const msg = { err: 'Multiple user login, please login again.' }
    console.log(msg)
    return res.json([msg])
  }

  // Check the authority of the user
  if (!user) {
    return res.status(400).json({
      msg: 'Invalid user',
    });
  } else if (!user.mp) {
    return res.status(400).json({
      msg: 'Out of authority',
    });
  }

  // Start update

  await srMtrlList.map(async (srMtrl) => {
    const mainPrice = srMtrl.mainPrice;
    console.log('The mainPrice', mainPrice); // Test Code
    if (srMtrl.mPrices.length == 0) {
      await SRMtrl.updateOne(
        {
          _id: srMtrl.id,
        },
        {
          $set: {
            item: srMtrl.item,
            unitConvertRatio: srMtrl.unitConvertRatio,
            mainPrice: mainPrice,
          },
        }
      );

      // console.log('No mPrice'); // Test Code
    } else {
      srMtrl.mPrices.map(async (mPrice) => {
        let checkID = await SRMtrl.find({
          _id: srMtrl.id,
          company: comId,
          mPrices: {
            $elemMatch: {
              id: mPrice.id,
            },
          },
        });

        if (checkID.length > 0) {
          // If the mPrice is existing One, update it.
          // For Thread force the unit in mPrice to be 'pcs'
          const mPriceUnit = srMtrl.item === 'Thread' ? 'pcs' : mPrice.unit.trim();
          await SRMtrl.updateOne(
            {
              _id: srMtrl.id,
              company: comId,
              mPrices: {
                $elemMatch: {
                  id: mPrice.id,
                },
              },
            },
            {
              $set: {
                item: srMtrl.item,
                unitConvertRatio: srMtrl.unitConvertRatio,
                mainPrice: mainPrice,
                'mPrices.$.mColor': mPrice.mColor.trim(),
                'mPrices.$.sizeSPEC': mPrice.sizeSPEC.trim(),
                'mPrices.$.unit': mPriceUnit,
                'mPrices.$.currency': mPrice.currency.trim(),
                'mPrices.$.mPrice': Number(mPrice.mPrice),
                'mPrices.$.moq': Number(mPrice.moq),
                'mPrices.$.moqPrice': Number(mPrice.moqPrice),
              },
            }
          );
        } else {
          // if it is a new mPrice, push whole mPrice to this srMtrl in database
          await SRMtrl.updateOne(
            {
              _id: srMtrl.id,
              company: comId,
            },
            {
              item: srMtrl.item,
              unitConvertRatio: srMtrl.unitConvertRatio,
              $push: { mPrices: mPrice },
            }
          );
        }

        // old code ------------------------
        // Check I
        // let checkICS = await SRMtrl.find(
        //   {
        //     _id: srMtrl.id,
        //     company: comId,
        //     mPrices: {
        //       $elemMatch: {
        //         id: mPrice.id,
        //         mColor: mPrice.mColor,
        //         sizeSPEC: mPrice.sizeSPEC,
        //       },
        //     },
        //   },
        //   { _id: 0, mPrices: 1 }
        // );
        // if (checkICS.length > 0) {
        //   // IF the mPrice (id, mColor and sizeSPEC duplicated) exisitng, update by replacing with new mPrice
        //   // console.log('Step_1 triggered'); // Test Code
        //   await SRMtrl.updateOne(
        //     {
        //       _id: srMtrl.id,
        //       company: comId,
        //       mPrices: {
        //         $elemMatch: {
        //           id: mPrice.id,
        //           mColor: mPrice.mColor,
        //           sizeSPEC: mPrice.sizeSPEC,
        //         },
        //       },
        //     },
        //     {
        //       $set: {
        //         mainPrice: mainPrice,
        //         'mPrices.$.unit': mPrice.unit.trim(),
        //         'mPrices.$.currency': mPrice.currency.trim(),
        //         'mPrices.$.mPrice': Number(mPrice.mPrice),
        //         'mPrices.$.moq': Number(mPrice.moq),
        //         'mPrices.$.moqPrice': Number(mPrice.moqPrice),
        //       },
        //     }
        //   );
        // } else {
        //   // If the mPrice (id, mColor ,sizeSPEC  duplicated) not exisitng, Check C.S
        //   // console.log('Step_2 triggered'); // Test Code
        //   let checkCS = await SRMtrl.find(
        //     {
        //       _id: srMtrl.id,
        //       company: comId,
        //       mPrices: {
        //         $elemMatch: {
        //           mColor: mPrice.mColor,
        //           sizeSPEC: mPrice.sizeSPEC,
        //         },
        //       },
        //     },
        //     { _id: 0, mPrices: 1 }
        //   );
        //   if (checkCS.length > 0) {
        //     // If mColor and sizeSPEC is repeated then discard the mPrice by doing nothing.
        //   } else {
        //     // If the mPrice (mColor and sizeSPEC duplicated) not exisitng, Check ID
        //     let checkI = await SRMtrl.find(
        //       {
        //         _id: srMtrl.id,
        //         company: comId,
        //         mPrices: {
        //           $elemMatch: {
        //             id: mPrice.id,
        //           },
        //         },
        //       },
        //       { _id: 0, mPrices: 1 }
        //     );
        //     if (checkI.length > 0) {
        //       // console.log('Step_3 triggered'); // Test Code
        //       // If the mPrice is existing item, then update by replacing with new one.
        //       await SRMtrl.updateOne(
        //         {
        //           _id: srMtrl.id,
        //           company: comId,
        //           mPrices: {
        //             $elemMatch: {
        //               id: mPrice.id,
        //             },
        //           },
        //         },
        //         {
        //           $set: {
        //             mainPrice: mainPrice,
        //             'mPrices.$.unit': mPrice.unit.trim(),
        //             'mPrices.$.currency': mPrice.currency.trim(),
        //             'mPrices.$.mPrice': Number(mPrice.mPrice),
        //             'mPrices.$.moq': Number(mPrice.moq),
        //             'mPrices.$.moqPrice': Number(mPrice.moqPrice),
        //           },
        //         }
        //       );
        //     } else {
        //       // console.log('Step_4 triggered'); // Test Code
        //       // If the mPrice is not existing item, then push mPrice to be new one
        //       await SRMtrl.updateOne(
        //         {
        //           _id: srMtrl.id,
        //           company: comId,
        //         },
        //         {
        //           // $set: { multiplePrice: multiplePrice },
        //           $push: { mPrices: mPrice },
        //         }
        //       );
        //     }
        //   }
        // }
      });
      // console.log('with mPrice'); // Test Code
    }
  });

  // console.log('middle'); // Test Code

  try {
    // The the internet time log, here don't send back the result, as it always return the previous version.
    console.log('Bend: Upload mPrice succeed');
    return res.json({ msg: 'Upload mPrice succeed' });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

// @route   PUT api/srmtrl/caseId/mtrlId
// @desc    Delete the refs of rsMtrl by Mtrl
// @access  Private
router.put('/:caseId/deletesrmtrl', authUser, async (req, res) => {
  const { comName, comSymbol, mtrl } = req.body;
  const userId = req.user.id;
  const comId = req.user.company;
  const caseId = req.params.caseId;
  // Check if the user has authority to update case ---------------------------
  console.log('The delete srMtrl by mtrl is triggered');
  console.log('The caseId in the delete srMtrl', caseId);
  let user = await User.findById(userId);
  if (!user.mp) {
    return res.status(400).json({
      msg: 'Out of authority',
    });
  }

  // Check if the user have the authority to update the case -------------------
  let cases = await Case.findById(caseId);
  if (cases) {
    // If the user is case creator, pass !
    if (cases.user.toString() === userId) {
      // if the user's id is added to authorizedUser of this case, pass !
    } else if (cases.authorizedUser.includes(userId)) {
    } else {
      return res.status(400).json({ msg: 'Not an authorized user.' });
    }

    const mtrlId = mtrl.id;
    const csr = comName + comSymbol + mtrl.supplier + mtrl.ref_no;
    const lowerCasecsr = csr.toLowerCase();
    const CSRIC = lowerCasecsr.replace(/[^\da-z]/gi, ''); // Only read from "0" to "9" & "a" to "z"

    const deleteRefs = async (callback) => {
      let srMtrl = await SRMtrl.findOne({
        CSRIC: CSRIC,
        company: comId,
      });

      if (!srMtrl) {
        // return res.status(400).json({ msg: 'The srMtrl dose not exist.' });
        // return res.json({
        //   msg: 'The srMtrl dose not exist',
        // });
      } else {
        //@_step_1 Delete the ref from srMtrl.mtrlColors.refs, if more than one matched to the condition of $pull, after my test, this method will delete them all.
        let clearColorRef = await srMtrl.mtrlColors.map(async (mtrlColor) => {
          await SRMtrl.updateOne(
            {
              CSRIC: CSRIC,
              'mtrlColors.refs.': {
                caseId: caseId,
                mtrlId: mtrlId,
              },
            },
            {
              $pull: {
                'mtrlColors.$.refs': {
                  caseId: caseId,
                  mtrlId: mtrlId,
                },
              },
            }
          );
          return null;
        });

        //@_step_2 Delete the mtrlColor in mtrlColors, if the refs of which is 0, means no case ref to it.
        // This Promise.all will wait for the async method, in this case (clearRef), finished all job, then start to do things.
        let deleteSrMColor = await Promise.all(clearColorRef).then(async () => {
          let dbSrColor = await SRMtrl.findOne(
            {
              company: comId,
              CSRIC: CSRIC,
            },
            { _id: 0, mtrlColors: 1 }
          );
          await dbSrColor.mtrlColors.map(async (mtrlColor) => {
            let checkPoint = mtrlColor.refs.length;
            // console.log('this is mtrlColor ref chekcpoint', checkPoint);
            if (checkPoint < 1) {
              await SRMtrl.updateOne(
                {
                  company: comId,
                  CSRIC: CSRIC,
                },
                {
                  $pull: {
                    mtrlColors: {
                      id: mtrlColor.id,
                    },
                  },
                }
              );
            }
          });
        });

        //@_Step_1 Delete ref_This method do things as method above
        let clearSPECRef = await srMtrl.sizeSPECs.map(async (sizeSPEC) => {
          await SRMtrl.updateOne(
            {
              CSRIC: CSRIC,
              'sizeSPECs.refs': {
                caseId: caseId,
                mtrlId: mtrlId,
              },
            },
            {
              $pull: {
                'sizeSPECs.$.refs': {
                  caseId: caseId,
                  mtrlId: mtrlId,
                },
              },
            }
          );
          return null;
        });
        //@_Step_2 Delete the sizeSPEC in sizeSPECs, if the refs of which is 0, means no case ref to it.
        // This Promise.all will wait for the async method, in this case (clearRef), finished all job, then start to do things.
        let deleteSrSPEC = await Promise.all(clearSPECRef).then(async () => {
          let dbSrSPEC = await SRMtrl.findOne(
            {
              company: comId,
              CSRIC: CSRIC,
            },
            { _id: 0, sizeSPECs: 1 }
          );
          await dbSrSPEC.sizeSPECs.map(async (sizeSPEC) => {
            let checkPoint = sizeSPEC.refs.length;
            // console.log('this is sizeSPEC ref chekcpoint', checkPoint);
            if (checkPoint < 1) {
              await SRMtrl.updateOne(
                {
                  company: comId,
                  CSRIC: CSRIC,
                },
                {
                  $pull: {
                    sizeSPECs: {
                      id: sizeSPEC.id,
                    },
                  },
                }
              );
            }
          });
        });
        await Promise.all([deleteSrMColor, deleteSrSPEC])
          .then(() => {
            setTimeout(() => {
              callback();
            }, 5000);
          })
          .catch((err) => {
            console.log('Delete srMtrl by mtrl have problem', err);
          });
      }
    };

    const deleteSrMtrl = async () => {
      let srMtrl = await SRMtrl.findOne({
        company: comId,
        CSRIC: CSRIC,
      });
      // console.log('srMtrl', srMtrl);
      // console.log('srMtrl.mtrlColors', srMtrl.mtrlColors);
      const colorNum = srMtrl.mtrlColors.length;
      const specNum = srMtrl.sizeSPECs.length;
      const checkPoint = colorNum + specNum;
      // console.log('checkpoint of deleSrMtrl', checkPoint);

      if (checkPoint === 0) {
        await SRMtrl.deleteOne({
          company: comId,
          CSRIC: CSRIC,
        });
        console.log(`The srMtrl ${srMtrl} is deleted`);
      }
    };

    deleteRefs(deleteSrMtrl).catch((err) => {
      console.log(err);
    });

    try {
      // await Promise.all([deleteSrMColor, deleteSrSPEC]).then(async () => {});

      return res.json({
        msg: 'The srMtrl is deleted',
      });
    } catch (err) {
      console.log('The delete srMtrl is failed');
      console.log(err);
      return res.json(err);
    }
  } else {
    console.log("No such case, therefore can't delete srMtrl");
    return res.json({ msg: "No such case, therefore can't delete srMtrl" });
  }
});

// @route   PUT api/srmtrl/update/mpricevalues/quotation
// @desc    Update the value in mPrice
// @access  Private
router.put('/update/mpricevalues/quotation', authUser, async (req, res) => {
  console.log('the mPrice quotation is starting to update'); // Test Code
  const srMtrlList = req.body;
  const userId = req.user.id;
  let user = await User.findById(userId);
  //Check if multiple login, if yes, do nothing
  const token = req.header('x-auth-token');
  if (user.sKey !== token) {
    const msg = { err: 'Multiple user login, please login again.' }
    console.log(msg)
    return res.json([msg])
  }
  // Check the authority of the user
  if (!user) {
    return res.status(400).json({
      msg: 'Invalid user',
    });
  } else if (!user.quo) {
    return res.status(400).json({
      msg: 'Out of authority',
    });
  }

  // Start update

  await srMtrlList.map(async (srMtrl) => {
    srMtrl.mPrices.map(async (mPrice) => {
      // Check I.C.S
      let checkICS = await SRMtrl.find(
        {
          _id: srMtrl.id,
          mPrices: {
            $elemMatch: {
              id: mPrice.id,
              // mColor: mPrice.mColor,
              // sizeSPEC: mPrice.sizeSPEC,
            },
          },
        },
        { _id: 0, mPrices: 1 }
      );
      if (checkICS.length > 0) {
        // IF the mPrice (id, mColor and sizeSPEC duplicated) exisitng, update by replacing with new mPrice
        await SRMtrl.updateOne(
          {
            _id: srMtrl.id,
            mPrices: {
              $elemMatch: {
                id: mPrice.id,
                // mColor: mPrice.mColor,
                // sizeSPEC: mPrice.sizeSPEC,
              },
            },
          },
          {
            $set: {
              'mPrices.$.quotation': Number(mPrice.quotation),
            },
          }
        );
      } else {
        // If the mPrice (id, mColor ,sizeSPEC  duplicated) not exisitng, Check C.S
        let checkCS = await SRMtrl.find(
          {
            _id: srMtrl.id,
            mPrices: {
              $elemMatch: {
                mColor: mPrice.mColor,
                sizeSPEC: mPrice.sizeSPEC,
              },
            },
          },
          { _id: 0, mPrices: 1 }
        );
        if (checkCS.length > 0) {
          // If mColor and sizeSPEC is repeated then discard the mPrice by doing nothing.
        } else {
          // If the mPrice (mColor and sizeSPEC duplicated) not exisitng, Check ID
          let checkI = await SRMtrl.find(
            {
              _id: srMtrl.id,
              mPrices: {
                $elemMatch: {
                  id: mPrice.id,
                },
              },
            },
            { _id: 0, mPrices: 1 }
          );
          if (checkI.length > 0) {
            // If the mPrice is existing item, then update by replacing with new one.
            await SRMtrl.updateOne(
              {
                _id: srMtrl.id,
                mPrices: {
                  $elemMatch: {
                    id: mPrice.id,
                  },
                },
              },
              {
                $set: {
                  'mPrices.$.quotation': Number(mPrice.quotation),
                },
              }
            );
          } else {
            // If the mPrice is not existing item, then push mPrice to be new one
            await SRMtrl.updateOne(
              {
                _id: srMtrl.id,
              },
              {
                $push: { mPrices: mPrice },
              }
            );
          }
        }
      }
    });
  });

  try {
    // The the internet time log, here don't send back the result, as it always return the previous version.
    console.log('Bend: Upload quotation of material of mPrice succeed');
    return res.json({ msg: 'Upload quotation of material of mPrice succeed' });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

// @route   PUT api/srmtrl/deleteprice/srmtrlid/mpriceid
// @desc    Delete the refs of rsMtrl by Mtrl
// @access  Private
router.put('/deleteprice/:srmtrlId/:mpriceId', authUser, async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user.cases) {
    return res.status(400).json({
      msg: 'Out of authority',
    });
  }
  const comId = req.user.company;
  const srmId = req.params.srmtrlId;
  const mprice = req.params.mpriceId;
  console.log('The srMtrlId', srmId);
  console.log('The Material price', mprice);

  try {
    await SRMtrl.updateOne(
      { _id: srmId, company: comId },
      { $pull: { mPrices: { id: mprice } } }
    );
    res.json({ msg: 'The Price is deleted' });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
