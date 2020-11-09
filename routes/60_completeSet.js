const express = require('express');
const router = express.Router();

const authUser = require('../middleware/authUser');

const User = require('../models/10_User');
const Case = require('../models/20_Case');
const SRMtrl = require('../models/30_SRMtrl');
const OS = require('../models/50_OS');
const CS = require('../models/60_CS');



// @route   GET api/
// @desc    Get osList
// @access  Private
router.get('/', authUser, async (req, res) => {
   let user = await User.findById(req.user.id);
   //Check if multiple login, if yes, do nothing
   const token = req.header('x-auth-token');
   if (user.sKey !== token) {
      const msg = { err: 'Multiple user login, please login again.' }
      console.log(msg)
      return res.json([msg])
   }
   //Check if the user have the right
   //Here set the right for case, the reason relates to the management science and my management philosophy.
   if (!user.cases) {
      return res.status(400).json({ msg: 'Out of authority' });
   }
   const comId = req.user.company;
   const completeSets = await CS.find({ company: comId }, { company: 0, caseMtrls: 0 }).sort({ osNo: 1 });
   // console.log('the osList', osList) // test code
   if (completeSets.length === 0) {
      console.log('No os Found')

      return res.json([])
   } else {
      console.log('osList is returned')
      return res.json(completeSets);
   }
});

// @route   GET api/completeset/
// @desc    Get single complete set data by osNo
// @access  Private
router.get('/getcs/:osNo', authUser, async (req, res) => {
   let user = await User.findById(req.user.id);
   const osNo = req.params.osNo
   console.log(osNo)
   //Check if multiple login, if yes, do nothing
   const token = req.header('x-auth-token');
   if (user.sKey !== token) {
      const msg = { err: 'Multiple user login, please login again.' }
      console.log(msg)
      return res.json(msg)
   }
   //Check if the user have the right
   //Here set the right for case, the reason relates to the management science and my management philosophy.
   if (!user.cases) {
      return res.status(400).json({ msg: 'Out of authority' });
   }
   const comId = req.user.company;
   const completeSet = await CS.findOne({ company: comId, osNo: osNo }, { company: 0 });
   // console.log('the osList', osList) // test code
   if (completeSet) {
      console.log('completeSet is returned')
      return res.json(completeSet);
   } else {
      console.log('No cs Found')
      return res.json({})
   }
});

// @route   Post api/completeset/
// @desc    Calculate the leadTime of each styles in the os, by an array posted and save the result in mongoDB, then return the result
//          Take the caseMtrls from os, for updating it to the newset and default situation.
//          Then take caseMtrls as osMtrls, calculating and update the default with it ,then insert the osMtrls to the CS as it caseMtrls.
// @access  Private
router.post('/', authUser, async (req, res) => {
   let user = await User.findById(req.user.id);
   //Check if multiple login, if yes, do nothing
   const token = req.header('x-auth-token');
   if (user.sKey !== token) {
      const msg = { err: 'Multiple user login, please login again.' }
      console.log(msg)
      return res.json([msg])
   }

   const { osNo, newCsOrder } = req.body
   //Check if the user have the right
   //Here set the right for case, the reason relates to the management science and my management philosophy.
   if (!user.cases) {
      return res.status(400).json({ msg: 'Out of authority' });
   }
   const comId = req.user.company;
   const completeSet = await CS.findOne({ company: comId, osNo: osNo }, { company: 0 });
   const orderSummary = await OS.findOne({ company: comId, osNo: osNo }, { company: 0 });
   let newCaseList = completeSet.caseList
   let treatedMtrls = 0
   let treatedCspts = 0

   // console.log('the osList', osList) // test code
   if (completeSet) {
      const csOrder = completeSet.csOrder
      let osMtrls = orderSummary.caseMtrls
      const checkOrderArr = newCsOrder.filter((newCsOrderCNo, idx) => newCsOrderCNo === csOrder[idx])
      const check = checkOrderArr.length === newCsOrder.length ? true : false
      if (check) {
         // the order of array not changed, or return the original cs.
         console.log('completeSet is returned')
         return res.json(completeSet);
      } else {
         // The order of array changed, or it may be first time to calculate.
         const countCases = new Promise(async (resolve) => {
            newCsOrder.map(async (newCsOrderCNo, idx) => {

               const countMtrls = new Promise(async (resolve) => {

                  let currentCase = newCaseList.find(({ cNo }) => cNo === newCsOrderCNo)
                  let theMtrls = currentCase.mtrls
                  theMtrls.map((mtrl, idx) => {
                     treatedMtrls++
                     const supplier = mtrl.supplier
                     const ref_no = mtrl.ref_no
                     const theCSPT = mtrl.cspts
                     const countCSPTs = new Promise(async (resolve) => {
                        theCSPT.map((cspt, idx) => {
                           //Add 2 new attribute for cspt in CS and give it default value.
                           const checkLeadTime = Object.keys(cspt).includes("leadTime")
                           const checkDistriputedQty = Object.keys(cspt).includes("distriputedQty")
                           if (!checkLeadTime) {
                              console.log("New cspt, generate the leaTime attribute for it") // Test Code
                              cspt.leadTime = 'No found this materials in osMtrls, error in server'
                           }
                           if (!checkDistriputedQty) {
                              console.log("New cspt, generate the distriputedQty attribute for it") // Test Code
                              cspt.distriputedQty = 0
                           }
                           //
                           if (cspt.distriputedQty === cspt.requiredMQty) {
                              console.log("the requiredMQty is fulfilled,") // Test Code
                              if (theCSPT.length === idx + 1) {
                                 resolve()
                              }
                              // If the requestedMQty of this cspt is fulfilled, do nothing.
                           } else {
                              const mColor = cspt.mColor
                              const SPEC = cspt.mSizeSPEC
                              // let newOsMtrls = []
                              const checkOsMtrls = new Promise(async (resolve) => {
                                 // console.log("promise - 'checkOsMtrls' is called ") // Test Code
                                 // let haveFoundTheCSPTinOsMtrls = false
                                 for (let idx = 0; idx < osMtrls.length; idx++) {
                                    if (cspt.distriputedQty >= cspt.requiredMQty) {
                                       console.log("the requiredMQty is fulfilled, break the for loop") // Test Code
                                       resolve()
                                       break;
                                    }
                                    if (osMtrls[idx].supplier === supplier &&
                                       osMtrls[idx].ref_no === ref_no &&
                                       osMtrls[idx].mColor === mColor &&
                                       osMtrls[idx].mSizeSPEC === SPEC) {
                                       // if (osMtrls[idx].supplier === supplier) {
                                       console.log("the osMTrls", typeof osMtrls[idx].supplier)
                                       console.log("the supplier", typeof supplier)


                                       console.log("the cspt is matched one of the osMtrls - Promise 'checkLeadTimes'", mtrl.supplier) // Test Code
                                       if (cspt.distriputedQty >= cspt.requiredMQty) {
                                          // if the distriputedQty is fulfilled then do nothing
                                          console.log("The cspt is fulfilled")
                                          resolve()
                                          break;
                                       } else {
                                          if (osMtrls[idx].leadTimes) {
                                             const checkLeadTimes = osMtrls[idx].leadTimes.map((leadTime) => {
                                                new Promise((resolve) => {
                                                   if (leadTime.availableQty) {
                                                      if (cspt.distriputedQty < cspt.requiredMQty) {
                                                         const neededQty = cspt.requiredMQty - cspt.distriputedQty
                                                         const theNumber = leadTime.availableQty - neededQty
                                                         if (theNumber > 0) {
                                                            cspt.leadTime = leadTime.date
                                                            cspt.distriputedQty += neededQty
                                                            leadTime.availableQty = theNumber
                                                            if (currentCase.gQtys.find(({ id }) => id === cspt.gQty).leadTime) {
                                                               currentCase.gQtys.find(({ id }) => id === cspt.gQty).leadTime =
                                                                  currentCase.gQtys.find(({ id }) => id === cspt.gQty).leadTime < leadTime.date ? leadTime.date :
                                                                     currentCase.gQtys.find(({ id }) => id === cspt.gQty).leadTime
                                                               resolve();
                                                            } else {
                                                               currentCase.gQtys.find(({ id }) => id === cspt.gQty).leadTime = leadTime.date
                                                               resolve();
                                                            }
                                                         } else if (theNumber === 0) {
                                                            cspt.leadTime = leadTime.date
                                                            cspt.distriputedQty += neededQty
                                                            leadTime.availableQty = 0
                                                            if (currentCase.gQtys.find(({ id }) => id === cspt.gQty).leadTime) {
                                                               currentCase.gQtys.find(({ id }) => id === cspt.gQty).leadTime =
                                                                  currentCase.gQtys.find(({ id }) => id === cspt.gQty).leadTime < leadTime.date ? leadTime.date :
                                                                     currentCase.gQtys.find(({ id }) => id === cspt.gQty).leadTime
                                                               resolve();
                                                            } else {
                                                               currentCase.gQtys.find(({ id }) => id === cspt.gQty).leadTime = leadTime.date
                                                               resolve();
                                                            }
                                                         } else {
                                                            cspt.leadTime = leadTime.date
                                                            cspt.distriputedQty += leadTime.availableQty
                                                            leadTime.availableQty = 0
                                                            if (currentCase.gQtys.find(({ id }) => id === cspt.gQty).leadTime) {
                                                               currentCase.gQtys.find(({ id }) => id === cspt.gQty).leadTime =
                                                                  currentCase.gQtys.find(({ id }) => id === cspt.gQty).leadTime < leadTime.date ? leadTime.date :
                                                                     currentCase.gQtys.find(({ id }) => id === cspt.gQty).leadTime
                                                               resolve();
                                                            } else {
                                                               currentCase.gQtys.find(({ id }) => id === cspt.gQty).leadTime = leadTime.date
                                                               resolve();
                                                            }
                                                         }
                                                         console.log('the mtrl', mtrl, "the cspt", cspt.id, "the leadTime.date", leadTime.date) // Test Code
                                                      } else {
                                                         resolve()
                                                      }
                                                   } else {
                                                      resolve()
                                                   }
                                                })
                                             })

                                             Promise.all(checkLeadTimes).then(() => {
                                                treatedCspts++
                                                console.log("Promise all for - 'checkLeadTimes, resolve()") // Test Code
                                                resolve()
                                             })
                                          } else {
                                             treatedCspts++
                                             resolve()
                                             break;
                                          }
                                       }
                                    } else {
                                       console.log("no cspt matched the mtrl in OsMtrls")  // Test Code
                                       if (osMtrls.length === idx + 1) {
                                          resolve();
                                       }
                                    }
                                 }
                              })

                              Promise.all([checkOsMtrls]).then(() => {
                                 if (theCSPT.length === idx + 1) {
                                    resolve()
                                 }
                              })

                           }

                        })
                     })

                     Promise.all([countCSPTs]).then(() => {
                        if (theMtrls.length === idx + 1) {
                           resolve()
                        }
                     })
                  })
               })

               Promise.all([countMtrls]).then(() => {
                  if (newCsOrder.length === idx + 1) {
                     resolve()
                  }
               })


            })
         })

         Promise.all([countCases]).then(async () => {
            //Final result 
            console.log("the mtrls treated", treatedMtrls)
            console.log("the cspt treated", treatedCspts)
            const updateCs = await CS.findOneAndUpdate(
               { company: comId, osNo: osNo },
               {
                  $set: {
                     csOrder: newCsOrder,
                     caseMtrls: osMtrls,
                     caseList: newCaseList,
                  }
               },
               {
                  company: 0,
                  new: true
               },
            );
            console.log("updateCs is returned")
            return res.json(updateCs)
         })
      }

   } else {
      console.log('No cs Found')
      return res.json({})
   }
});

module.exports = router;