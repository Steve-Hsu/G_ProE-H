const express = require('express');
const router = express.Router();
const authUser = require('../middleware/authUser');
// Not set up yet, for check the value entered by user at the some specific column
const { check, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const myModule = require('../myModule/myModule');

const User = require('../models/10_User');
const Case = require('../models/20_Case');
const SRMtrl = require('../models/30_srMtrl');

// @route   GET api/srmtrl
// @desc    Read the compnay's srMtrl from database
// @access  Private
router.get('/', authUser, async (req, res) => {
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

  try {
    res.json(srMtrls);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/srmtrl/queryresult
// @desc    Response to the queried obj
// @access  Private
router.put('/queryresult', authUser, async (req, res) => {
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
  if (!user.cases) {
    return res.status(400).json({
      msg: 'Out of authority',
    });
  }

  // Check if the user have the authority to update the case -------------------
  let existingCases = await Case.findById(caseId);
  // If the user is case creator, pass !
  if (existingCases.user.toString() === userId) {
    // if the user's id is added to authorizedUser of this case, pass !
  } else if (existingCases.authorizedUser.includes(userId)) {
  } else {
    return res.status(400).json({ msg: 'Not an authorized user.' });
  }

  // Update srMtrl ---------------------------------------------------------------
  const { cases, comName, comSymbol } = req.body;
  let mLists = [];
  let mtrls = cases.mtrls;

  mtrls.map(async (mtrl) => {
    //@ Check if the mtrl is alread have srMtrl, if have , it must be srMtrl with different supplier and ref_no, how ever have both same caseId and mtrlId in the refs in either mtrlColors and sizeSPECs
    if (mtrl.supplier) {
      //Only the mtrl with supplier need to be made srMtrl
      const checkDuplicatedSrMtrl = new Promise(async (resolve) => {
        let checkNum = 0;
        // Delete the refs of mtrlColors in the duplicated SrMtrl
        let SrMtrlId = '';
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
            SrMtrlId = existingMtrlColorRef[0]._id;
            checkNum = checkNum + 1;
          });
        } else {
          checkNum = checkNum + 1;
        }

        // Delete the refs of sizeSPECs in the duplicated SrMtrl
        const existingSizeSPECRef = await SRMtrl.find({
          supplier: { $ne: mtrl.supplier },
          ref_no: { $ne: mtrl.ref_no },
          'sizeSPECs.refs': { caseId: caseId, mtrlId: mtrl.id },
        });

        if (existingSizeSPECRef.length > 0) {
          console.log('the existingRef', existingSizeSPECRef); // Test Code
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
            SrMtrlId = existingSizeSPECRef[0]._id;
            checkNum = checkNum + 1;
          });
        } else {
          checkNum = checkNum + 1;
        }

        if (checkNum >= 2) {
          console.log(
            'The promise checkDuplicatedSrMtrl is resolved',
            'and it is the result the id ',
            SrMtrlId
          ); // Test Code
          resolve(SrMtrlId);
        }
      });

      Promise.all([checkDuplicatedSrMtrl]).then(async (result) => {
        // console.log(
        //   'The promise all of checkDuplicatedSrMtrl is called',
        //   'and the result',
        //   result
        // ); // test Code
        const targetId = result[0];
        if (targetId !== '') {
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
            const checkNum = mtrlColorLength + sizeSPECLength;
            if (checkNum === 0) {
              await SRMtrl.findByIdAndRemove({ _id: targetId });
            }
          });
        }
      });

      //@ Start update refs
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
          CSRIC: newCSRIC,
          mtrlColors: [],
          sizeSPECs: [],
          mPrices: [],
          company: cases.company,
          mainPrice: null,
        };
      } else {
        mtrlObj = existingSrMtrlObj;
      }

      // Insert mtrlColors to newSrMtrlObj
      mtrl.mtrlColors.map((mtrlColor, index) => {
        const idx = mtrl.mtrlColors
          .map((item) => {
            return item.mColor;
          })
          .indexOf(mtrlColor.mColor);
        if (idx !== index) {
          // Here means the mColor is duplicated. It appears more than once.
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
          } else {
            //@ Old CSRIC
            let mtrlObjHaveTheColor = mtrlObj.mtrlColors.find(
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
            } else {
              //Old CSRIC have the mColor
              let sameMtrlInSameColor = mtrlObjHaveTheColor.refs.find(
                ({ caseId, mtrlId }) =>
                  caseId === cases._id && mtrlId === mtrl.id
              );
              if (sameMtrlInSameColor) {
                //Same case same mtrl with same mColor don't need to insert refs.
              } else {
                //Insert refs for new Case
                mtrlObjHaveTheColor.refs.push({
                  caseId: cases._id,
                  mtrlId: mtrl.id,
                });
              }
            }
          }
        }
      });

      //Insert sizeSPEC to newSrMtrlObj
      mtrl.sizeSPECs.map((sizeSPEC, index) => {
        const idx = mtrl.sizeSPECs
          .map((item) => {
            return item.mSizeSPEC;
          })
          .indexOf(sizeSPEC.mSizeSPEC);
        if (idx !== index) {
          // Here means the mSizeSPEC is duplicated in the mtrl. It appears more than once.
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
            } else {
              //Old CSRIC have the mSizeSPEC
              let sameSizeSPECInSameSPEC = existingsSPEC.refs.find(
                ({ caseId, mtrlId }) =>
                  caseId === cases._id && mtrlId === mtrl.id
              );
              if (sameSizeSPECInSameSPEC) {
                //Same case same mtrl with same mSizeSPEC don't need to insert refs.
              } else {
                //Insert refs for new Case
                existingsSPEC.refs.push({
                  caseId: cases._id,
                  mtrlId: mtrl.id,
                });
              }
            }
          }
        }
      });
      if (!existingSrMtrlObj) {
        //Only push when the mtrlObj is a new CSRIC mtrl,
        return mLists.push(mtrlObj);
      } else {
        return null;
      }
    }
  });

  // console.log(mLists);

  // Compare with the existing List
  try {
    mLists.map(async (mList) => {
      if (mList.CSRIC === '' || mList.CSRIC === null) {
        console.log('do nothing');
        //IF thie mList dosen't have CSRIC, then do nothing.
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
          } else {
            // If the srMtrl exists
            //@_step_1 Insert mtrlColor
            let insertMtrlColor = new Promise(async (resolve, reject) => {
              // console.log('This should be 1 start', mList.CSRIC);
              let counterOfLoopOfInsertMtrlColor = 0;
              await mList.mtrlColors.map(async (mtrlColor) => {
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
                    } else {
                      // if dose have such mColor in the srMtrl.mtrlColors, insert the ref to the existing mtrlColor
                      await mtrlColor.refs.map(async (ref) => {
                        // $addToSet, the operatoer only push a unique item to the array. It prevent duplicated value be pushed to the refs
                        await SRMtrl.updateOne(
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
                    }
                  })
                  .then(() => {
                    counterOfLoopOfInsertMtrlColor =
                      counterOfLoopOfInsertMtrlColor + 1;
                    const num_1 = counterOfLoopOfInsertMtrlColor;
                    if (num_1 === mList.mtrlColors.length) {
                      // console.log('This should be 1 end', mList.CSRIC);
                      return resolve();
                    }
                  });
              });
            });

            //@_step_2 Clear the extra refs in mColor
            let clearColorRef = new Promise((resolve, reject) => {
              Promise.all([insertMtrlColor]).then(async () => {
                // console.log('This should be 2 start', mList.CSRIC);
                await SRMtrl.findOne(
                  { company: comId, CSRIC: mList.CSRIC },
                  { _id: 0, mtrlColors: 1 }
                ).then(async (srMtrl) => {
                  let mtrlColorLoop = 0;
                  await srMtrl.mtrlColors.map(async (mtrlColor) => {
                    let matchedColor = mList.mtrlColors.find(
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
                      );
                    }
                    mtrlColorLoop = mtrlColorLoop + 1;
                    if (mtrlColorLoop === srMtrl.mtrlColors.length) {
                      // console.log('This should be 2 end', mList.CSRIC);
                      resolve();
                    }
                  });
                });
              });
            });

            //@_step_3 Delete the mtrlColor in mtrlColors, if the refs of which is 0, means no case ref to it.
            // This Promise.all will wait for the async method, in this case (clearRef), finished all job, then start to do things.
            Promise.all([clearColorRef]).then(() => {
              // console.log('This should be 3 start', mList.CSRIC);
              SRMtrl.findOne(
                {
                  company: comId,
                  CSRIC: mList.CSRIC,
                },
                { _id: 0, mtrlColors: 1 }
              ).then((srMtrl) => {
                let mtrlColorLoop = 0;
                srMtrl.mtrlColors.map(async (mtrlColor) => {
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
                  }
                  mtrlColorLoop = mtrlColorLoop + 1;
                  if (mtrlColorLoop === srMtrl.mtrlColors.length) {
                    console.log('srMtrl, The mtrlColors 3 end', mList.CSRIC);
                  }
                });
              });
            });

            //@_step_1 Inser SizeSPECS
            let insertMtrlSPEC = new Promise((resolve, reject) => {
              // console.log('SPEC 1 start', mList.CSRIC);
              let counterOfLoopInsertMtrlSPEC = 0;
              mList.sizeSPECs.map(async (sizeSPEC) => {
                console.log('This is the sizeSPEC', sizeSPEC); // Test Code
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
                    } else {
                      // if dose have such sizeSPEC in the srMtrl.sizeSPECs, insert the ref to the existing sizeSPEC
                      await sizeSPEC.refs.map(async (ref) => {
                        // $addToSet, the operatoer only push a unique item to the array. It prevent duplicated value be pushed to the refs
                        await SRMtrl.updateOne(
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
                    }
                  })
                  .then(() => {
                    counterOfLoopInsertMtrlSPEC =
                      counterOfLoopInsertMtrlSPEC + 1;
                    const num_2 = counterOfLoopInsertMtrlSPEC;
                    if (num_2 === mList.mtrlColors.length) {
                      // console.log('SPEC 1 end', mList.CSRIC);
                      return resolve();
                    }
                  });
              });
            });

            //@_step_2 Clear the extra refs in sizeSPEC
            let clearSPECRef = new Promise((resolve, reject) => {
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
                  let mtrlSPECLoop = 0;
                  srMtrl.sizeSPECs.map(async (dbSizeSPEC) => {
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
                    }
                    mtrlSPECLoop = mtrlSPECLoop + 1;
                    if (mtrlSPECLoop === srMtrl.sizeSPECs.length) {
                      // console.log('SPEC 2 end', mList.CSRIC);
                      resolve();
                    }
                  });
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
                let mtrlSPECLoop = 0;
                srMtrl.sizeSPECs.map(async (sizeSPEC) => {
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
                  }
                  mtrlSPECLoop = mtrlSPECLoop + 1;
                  if (mtrlSPECLoop === srMtrl.sizeSPECs.length) {
                    console.log('srMtrl, SPEC 3 end');
                  }
                });
              });
            });
          }
        });
      }
    });

    return res.json({ msg: 'srMtrl is updated' });
    // return res.json(mLists); // for test
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

// @route   PUT api/srmtrl/update/mpricevalues
// @desc    Update the value in mPrice
// @access  Private
router.put('/update/mpricevalues', authUser, async (req, res) => {
  const srMtrlList = req.body;
  const comId = req.user.company;
  const userId = req.user.id;
  let user = await User.findById(userId);
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
                mainPrice: mainPrice,
                'mPrices.$.mColor': mPrice.mColor.trim(),
                'mPrices.$.sizeSPEC': mPrice.sizeSPEC.trim(),
                'mPrices.$.unit': mPrice.unit.trim(),
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
