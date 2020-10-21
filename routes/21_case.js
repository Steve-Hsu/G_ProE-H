const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authUser = require('../middleware/authUser');
const { check, validationResult } = require('express-validator');

const User = require('../models/10_User');
const Case = require('../models/20_Case');
const SRMtrl = require('../models/30_SRMtrl');

// @route   GET api/case/
// @desc    Read the user's cases from database
// @access  Private
router.get('/', authUser, async (req, res) => {
  const token = req.header('x-auth-token');
  const user = await User.findById(req.user.id);
  if (user.sKey !== token) {
    const msg = { err: 'Multiple user login, please login again.' }
    console.log(msg)
    return res.json([msg])
  }
  // console.log(token) // Test code
  // let user = await User.findById(req.user.id);
  // if (!user.quo) {
  //   return res.status(400).json({ msg: 'Out of authority' });
  // }
  let caseList = await Case.aggregate([
    {
      $match: { company: mongoose.Types.ObjectId(req.user.company) },
    },
    {
      $project: {
        user: 1,
        cNo: 1,
        caseType: 1,
        style: 1,
        client: 1,
        poDate: 1,
        merchandiser: '',
        quoNo: '',
      },
    },
  ]).sort({ date: -1 });

  let insertList = await new Promise((resolve, reject) => {
    if (caseList.length > 0) {
      let n = 0;

      caseList.map(async (c) => {
        await User.findOne(
          { company: req.user.company, _id: c.user },
          { _id: 0, name: 1 }
        )
          .then(async (result) => {
            if (result) {
              c.merchandiser = await result.name;
            }
            n = n + 1;
            return n;
          })
          .then((n) => {
            if (n === caseList.length) {
              resolve();
            }
          });
      });
    } else {
      resolve()
    }
  });

  try {
    Promise.all([caseList, insertList]).then(async () => {
      if (caseList.length === 0) {
        return res.json([])
      } else {
        console.log('caseList is sent out', caseList);
        return res.json(caseList);
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/case/user
// @desc    Read the user's cases from database
// @access  Private
router.get('/user', authUser, async (req, res) => {
  try {
    const cases = await Case.find({ user: req.user.id }, { company: 0 }).sort({
      date: -1,
    });
    console.log('yes')
    res.json(cases);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/case/company
// @desc    Read the company's cases from database
// @access  Private
router.get('/company', authUser, async (req, res) => {
  try {
    const cases = await Case.find({ company: req.user.company }).sort({
      date: -1,
    });
    res.json(cases);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/case/existingcase
// @desc    Read specific case by _id of the case
// @access  Private
router.get('/existingcase/:id', authUser, async (req, res) => {

  //Check if multiple login, if yes, do nothing
  const token = req.header('x-auth-token');
  const user = await User.findById(req.user.id);
  if (user.sKey !== token) {
    const msg = { err: 'Multiple user login, please login again.' }
    console.log(msg)
    return res.json([msg])
  }

  try {
    const cases = await Case.findOne({ _id: req.params.id }, { company: 0 });
    res.json(cases);


  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }

});

// @route   POST api/case/user/case/:caseId
// @desc    Add a new case or update the existing case to dataBase
// @access  Private
router.post(
  '/upload/:caseId',
  [authUser, [check('style', 'Style is required')]],
  async (req, res) => {

    let user = await User.findById(req.user.id);

    //Check if multiple login, if yes, do nothing
    const token = req.header('x-auth-token');
    if (user.sKey !== token) {
      const msg = { err: 'Multiple user login, please login again.' }
      console.log(msg)
      return res.json([msg])
    }

    // Check if the user has authority to add a new case --------------------------
    if (!user.cases) {
      return res.status(400).json({ msg: 'Out of authority' });
    }

    // Generate case --------------------------------------------
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    console.log('The upload newcase is called in backend'); // Test Code

    const userName = user.name;
    const {
      cNo,
      caseType,
      style,
      client,
      cWays,
      sizes,
      gQtys,
      mtrls,
      isImportedExcel,
      caseConfirmDate,
    } = req.body;

    const caseId = req.params.caseId;
    //@ Delete the white space from strings of array items in the body, the cWays, sizes, and mtrls
    let trimedStyle = '';
    let trimedClient = '';
    // For limit the maxium of the number passed in
    const MaxNum = 99999;

    if (style) {
      //Only trim the string, later in search user regex with flag "i", the case insensitive flag.
      trimedStyle = style.trim();
    }
    if (client) {
      //Only trim the string, later in search user regex with flag "i", the case insensitive flag.
      trimedClient = client.trim();
    }
    const trimedcWays = new Promise((resolve) => {
      console.log('Promise start- trimedcWays'); // Test Code
      if (cWays.length > 0) {
        let num = 0;
        cWays.map((cWay) => {
          const trimTheCWay = new Promise((resolve) => {
            //Trim the gClr
            if (cWay.gClr === '' || cWay.gClr === null) {
              cWay.gClr = 'Empty-ColorWay';
              resolve();
            } else {
              cWay.gClr = cWay.gClr.toUpperCase().trim();
              resolve();
            }
          }).catch((err) => {
            console.error(err.message);
            res.status(500).send('Server Error');
          });;

          // Prevent duplicated empty colorWay
          const preventDuplicatedCWay = new Promise((resolve) => {
            Promise.all([trimTheCWay]).then(() => {
              const currentcWay = cWay.gClr;
              const numOfDuplicatedThecWay = cWays.filter(
                (el) => el.gClr === currentcWay
              ).length;
              if (numOfDuplicatedThecWay > 1) {
                let count = 0;
                let num = 0;
                cWays.map((cWay) => {
                  num++;
                  if (cWay.gClr === currentcWay) {
                    count++;
                    cWay.gClr =
                      currentcWay + '_Duplicated-ColorWay-' + String(count);
                  }

                  if (num === cWays.length) {
                    resolve();
                  }
                });
              } else {
                resolve();
              }
            }).catch((err) => {
              console.error(err.message);
              res.status(500).send('Server Error');
            });;
          }).catch((err) => {
            console.error(err.message);
            res.status(500).send('Server Error');
          });;

          Promise.all([preventDuplicatedCWay]).then(() => {
            num = num + 1;
            if (num === cWays.length) {
              console.log('Promise trimedcWays');
              return resolve();
            }
          }).catch((err) => {
            console.error(err.message);
            res.status(500).send('Server Error');
          });;
        });
      } else {
        return resolve();
      }
    }).catch((err) => {
      console.log(err)
    });

    // Since Size is selected by built-in selector, the string dosen't need to be trimed or change the format
    // const trimedSizes = new Promise((resolve) => {
    //   console.log('Promise start- trimedSizes'); // Test Code
    //   if (sizes.length > 0) {
    //     let sizeCounter = 0;
    //     sizes.map((size) => {
    //       size.gSize = size.gSize.toUpperCase().trim();
    //       sizeCounter = sizeCounter + 1;
    //       if (sizeCounter === sizes.length) {
    //         console.log('Promise resolve- trimedSizes'); // Test Code
    //         return resolve();
    //       }
    //     });
    //   } else {
    //     console.log('Promise resolve- not built sizes yet - trimedSizes'); // Test Code
    //     return resolve();
    //   }
    // });

    //@Steve:  I can set schema to prevent this sring or number problem, however it is a hole for how still code form frontEnd
    const numberThegQty = new Promise((resolve) => {
      if (gQtys.length > 0) {
        let num = 0;
        gQtys.map((gQty) => {
          gQty.gQty = Number(gQty.gQty);
          //Limit the length of the number in cspt
          if (String(gQty.gQty).length > String(MaxNum).length) {
            gQty.gQty = MaxNum;
          }
          num = num + 1;
          if (num === gQtys.length) {
            console.log('Promise resolve- numberThegQty'); // Test Code
            return resolve();
          }
        });
      } else {
        console.log('Promise resolve- not built gQty yet - numberThegQty'); // Test Code
        return resolve();
      }
    }).catch((err) => {
      console.error(err.message);
      res.status(500).send('Server Error');
    });;

    const trimedMtrls = new Promise((resolve, reject) => {
      console.log('Promise start- trimedMtrls'); // Test Code
      if (mtrls.length > 0) {
        let trimCounter = 0;
        mtrls.map((mtrl) => {
          if (mtrl['item']) {
            mtrl['item'] =
              mtrl['item'].charAt(0).toUpperCase() +
              mtrl['item'].slice(1).toLowerCase();
          }
          const mtrlList = [
            'supplier',
            'ref_no',
            // We don't need to transform the position and description into lowerCase.
            // 'position',
            // 'descriptions',
          ];
          mtrlList.map((x) => {
            // if (mtrl[x] !== '' || mtrl[x] !== null) {
            if (mtrl[x]) {
              mtrl[x] = mtrl[x].toUpperCase().trim();
            }
          });

          const mtrlColorPromise = new Promise((resolve) => {
            console.log('Promise start- mtrlColorPromise'); // Test Code
            if (mtrl.mtrlColors.length > 0) {
              let num = 0;
              mtrl.mtrlColors.map((mtrlColor) => {
                if (mtrl.multipleColor == true) {
                  if (mtrlColor.mColor) {
                    mtrlColor.mColor = mtrlColor.mColor.toLowerCase().trim();
                  }
                } else {
                  if (mtrl.mtrlColors[0].mColor) {
                    mtrlColor.mColor = mtrl.mtrlColors[0].mColor
                      .toLowerCase()
                      .trim();
                  }
                }

                num = num + 1;
                if (num === mtrl.mtrlColors.length) {
                  console.log('Promise resolve- mtrlColorPromise'); // Test Code
                  return resolve();
                }
              });
            } else {
              console.log(
                "Promise resolve- mtrlColorPromise, the mtrl dosen't have mtrlColors"
              ); // Test Code
              return resolve();
            }
          }).catch((err) => {
            console.error(err.message);
            res.status(500).send('Server Error');
          });;

          const mtrlSPECPromise = new Promise((resolve) => {
            if (mtrl.sizeSPECs.length > 0) {
              console.log('Promise start- mtrlSPECPromise'); // Test Code
              let num = 0;
              mtrl.sizeSPECs.map((sizeSPEC) => {
                if (mtrl.multipleSPEC == true) {
                  sizeSPEC.mSizeSPEC = sizeSPEC.mSizeSPEC.toLowerCase().trim();
                } else {
                  sizeSPEC.mSizeSPEC = mtrl.sizeSPECs[0].mSizeSPEC
                    .toLowerCase()
                    .trim();
                }

                num = num + 1;
                if (num === mtrl.sizeSPECs.length) {
                  console.log('Promise resolve- mtrlSPECPromise'); // Test Code
                  return resolve();
                }
              });
            } else {
              console.log(
                "Promise resolve- mtrlSPECPromise, the mtrl dosen't have mtrlSPECs"
              ); // Test Code
              return resolve();
            }
          }).catch((err) => {
            console.error(err.message);
            res.status(500).send('Server Error');
          });;

          const mtrlCsptPromise = new Promise((resolve) => {
            console.log('Promise start- mtrlCsptPromise'); // Test Code
            let num = 0;
            if (mtrl.cspts.length > 0) {
              mtrl.cspts.map((cspt) => {
                if (mtrl.multipleColor == true) {
                  if (cspt.mColor) {
                    cspt.mColor = cspt.mColor.toLowerCase().trim();
                  }
                } else {
                  if (mtrl.mtrlColors[0].mColor) {
                    cspt.mColor = mtrl.mtrlColors[0].mColor
                      .toLowerCase()
                      .trim();
                  }
                }

                if (mtrl.multipleSPEC == true) {
                  if (cspt.mSizeSPEC) {
                    cspt.mSizeSPEC = cspt.mSizeSPEC.toLowerCase().trim();
                  }
                } else {
                  if (mtrl.sizeSPECs[0].mSizeSPEC) {
                    cspt.mSizeSPEC = mtrl.sizeSPECs[0].mSizeSPEC
                      .toLowerCase()
                      .trim();
                  }
                }

                if (mtrl.multipleCSPT == true) {
                  if (cspt.cspt) {
                    cspt.cspt = Number(cspt.cspt);
                  }
                } else {
                  if (mtrl.cspts[0].cspt) {
                    cspt.cspt = Number(mtrl.cspts[0].cspt);
                  }
                }

                //Limit the length of the number in cspt
                if (String(cspt.cspt).length > String(MaxNum).length) {
                  cspt.cspt = MaxNum;
                }

                if (gQtys.length > 0) {
                  cspt.requiredMQty =
                    cspt.cspt * gQtys.find(({ id }) => id === cspt.gQty).gQty;
                }

                cspt.unit = cspt.unit.toLowerCase().trim();
                num = num + 1;
                if (num === mtrl.cspts.length) {
                  console.log('Promise resolve- mtrlCsptPromise'); // Test Code
                  return resolve();
                }
              });
            } else {
              return resolve();
            }
          }).catch((err) => {
            console.error(err.message);
            res.status(500).send('Server Error');
          });;

          Promise.all([
            mtrlColorPromise,
            mtrlSPECPromise,
            mtrlCsptPromise,
          ]).then(() => {
            console.log('1st Promise all start- '); // Test Code
            trimCounter = trimCounter + 1;
            if (trimCounter === mtrls.length) {
              console.log('1st Promise All resolve'); // Test Code
              return resolve();
            }
          }).catch((err) => {
            console.error(err.message);
            res.status(500).send('Server Error');
          });;
        });
      } else {
        console.log('Promise trimedMtrls resolve - no mtrls '); // Test Code
        return resolve();
      }
    }).catch((err) => {
      console.error(err.message);
      res.status(500).send('Server Error');
    });;

    const comSymbol = user.comSymbol;

    //Generator newCaseNumber
    // Notice in here !!
    // In the front end, if it is a new case, the caseId will be default as string 'newCase'.
    // Whereas it is a existing case, the caseId will hold the _id of the case
    if (caseId !== 'newCase') {
      Promise.all([trimedcWays, numberThegQty, trimedMtrls])
        .then(async () => {
          let updatedcNo = '';
          if (cNo) {
            // If the cNo is true, it imply that the case is the existing one
            let caseTypeSymbol = cNo.slice(-1);
            switch (caseType) {
              case 'Bulk':
                caseTypeSymbol = 'B';
                break;
              case 'Salesman Sample':
                caseTypeSymbol = 'S';
                break;
              case 'Test Sample':
                caseTypeSymbol = 'T';
                break;
              default:
            }
            updatedcNo = cNo.slice(0, -1) + caseTypeSymbol;

            const caseFields = {
              cNo: updatedcNo,
              caseType: caseType,
              style: trimedStyle,
              client: trimedClient,
              cWays,
              sizes,
              gQtys,
              mtrls,
              isImportedExcel,
              lastUpdateBy: userName,
              updateDate: Date.now(),
              caseConfirmDate: caseConfirmDate,
            };
            console.log('The Finall PromiseAll');
            // if (!cases){}
            //   return res.status(404).json({
            //     msg: 'Case not found',
            //   });

            const updatedCase = await Case.findOneAndUpdate(
              // poDate must be null, it means the Case is not being made a PO, so it allows to be updated
              { _id: caseId, poDate: null },
              {
                $set: caseFields,
              },
              { new: true }
            );
            return updatedCase;
          }
          // method .updateOne() will not return the case it self, so here make a one, named "updateCases" and return to the fronend client.
        })
        .then((result) => {
          console.log('The existing Case is updated'); // Test Code
          return res.json(result);
        })
        .catch((err) => {
          console.error(err.message);
          res.status(500).send('Server Error');
        });
    } else {
      // Get the id of case from URL by params
      //Get last 2 digits of year
      let strDate = new Date(); // By default Date empty constructor give you Date.now
      let shortYear = strDate.getFullYear();
      let twoDigitYear = shortYear.toString().substr(-2); // Add this line

      const cases = await Case.find({
        $and: [
          { company: req.user.company },
          { cNo: { $regex: comSymbol + twoDigitYear + 'C', $options: 'i' } }, // Query the same cases in same year by cNo, It promises return cases of same company in same year
        ],
      }).sort({
        date: -1,
      });
      let caseQty = 1;
      if (cases.length < 1) {
      } else {
        caseQty = Number(caseQty + cases.length);
      }

      const digits = 5 - caseQty.toString().length;

      const caseNumber = [];
      for (let i = 1; i <= digits; i++) {
        caseNumber.push('0');
      }

      caseNumber.push(caseQty);

      //Define caseType
      let caseTypeSymbol = 'T';
      switch (caseType) {
        case 'Bulk':
          caseTypeSymbol = 'B';
          break;
        case 'Salesman Sample':
          caseTypeSymbol = 'S';
          break;
        case 'Test Sample':
          caseTypeSymbol = 'T';
          break;
        default:
      }

      let newCaseNumber = caseNumber.toString().split(',').join('');
      let newCNO =
        comSymbol +
        twoDigitYear +
        'C' +
        '_' +
        newCaseNumber +
        '_' +
        caseTypeSymbol;

      // Promise.all([trimedcWays, numberThegQty, trimedSizes, trimedMtrls])
      Promise.all([trimedcWays, numberThegQty, trimedMtrls])
        .then(async () => {
          const newCase = new Case({
            user: req.user.id,
            company: req.user.company,
            cNo: newCNO,
            caseType,
            style: trimedStyle,
            client: trimedClient,
            cWays,
            sizes,
            gQtys,
            mtrls,
            isImportedExcel,
            merchandiser: userName,
            lastUpdateBy: userName,
            updateDate: Date.now(),
          });
          // name variable "case" will cause problem, so here name it "nCase"
          const nCase = await newCase.save();
          console.log('The new Case is created'); // Test Code
          console.log('The caseId', caseId);
          res.json(nCase);
        })
        .catch((err) => {
          console.error(err.message);
          res.status(500).send('Server Errors');
        });
    }
  }

);

// @route   DELETE api/case/:id
// @desc    Delete case
// @Steve   Only the creator of the case have the right to delete the case.
// @access  Private
router.delete('/:id', authUser, async (req, res) => {
  let user = await User.findById(req.user.id);

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
  // Get the id of the case from URL by params
  const comId = req.user.company;
  const caseId = req.params.id;
  const cases = await Case.findById(req.params.id);
  const mtrls = cases.mtrls;
  // Make sure user owns contact
  if (cases.user.toString() !== req.user.id) {
    return res.status(401).json({ msg: 'Not authorized to delete this case' });
  }
  try {
    await Case.findByIdAndRemove(caseId);
    // Delete the caseMaterials belong to the case
    // await CaseMtrl.deleteMany({ caseId: req.params.id });

    // mtrls.map(async (mtrl) => {
    //   if (mtrl.supplier) {
    // Steve / 2020/09/05 : This part sametimes works well, sometimes don't.
    await SRMtrl.updateMany(
      {
        company: comId,
      },
      {
        $pull: {
          'mtrlColors.$[].refs': { caseId: caseId },
          'sizeSPECs.$[].refs': { caseId: caseId },
        },
      }
    );

    await SRMtrl.updateMany(
      { company: comId },
      {
        $pull: {
          mtrlColors: { refs: { $size: 0 } },
          sizeSPECs: { refs: { $size: 0 } },
        },
      }
    );

    await SRMtrl.deleteMany({
      company: comId,
      mtrlColors: { $size: 0 },
      sizeSPECs: { $size: 0 },
    });

    res.json({
      msg: 'Case removed',
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/case/delete/casId/subjectId
// @desc    Delete gClr, gSize,
// @Steve
// @access  Private
router.put('/delete/:caseId/:subjectId', authUser, async (req, res) => {
  // Check if the user has authority to update case ---------------------------
  // console.log('The router triggered'); // Test Code
  let user = await User.findById(req.user.id);

  //Check if multiple login, if yes, do nothing
  const token = req.header('x-auth-token');
  if (user.sKey !== token) {
    const msg = { err: 'Multiple user login, please login again.' }
    console.log(msg)
    return res.json([msg])
  }
  //Check if the user have the right to manage case
  if (!user.cases) {
    return res.status(400).json({
      msg: 'Out of authority',
    });
  }

  const caseId = req.params.caseId;
  const comId = req.user.company;
  const subjectId = req.params.subjectId;
  const subject = req.body.subject;
  console.log('the caseId', caseId); // Test Code
  console.log('the subjectId', subjectId); // Test Code
  console.log('the subject', subject); // Test Code

  const theCase = await Case.findOne({ _id: caseId, company: comId });

  if (theCase.length === 0) {
    console.log('No such case');
    return res.status(404).json({
      msg: 'No such case',
    });
  }

  const mtrls = theCase.mtrls;

  const deleteSrMtrl = new Promise((resolve) => {
    let numOfdeleteRef = 0;
    const deleteRef = new Promise((resolve) => {
      mtrls.map(async (mtrl) => {
        const supplier = mtrl.supplier;
        const ref_no = mtrl.ref_no;
        const mtrlId = mtrl.id;
        if (subject === 'gClr') {
          const mColor = mtrl.mtrlColors.find(({ cWay }) => cWay === subjectId)
            .mColor;
          const checkMColor = mtrl.mtrlColors.filter(
            (mtrlColor) => mtrlColor.mColor === mColor
          );
          // If the mColor is refed by not only one colorway of the material, then we shouldn't delete it from the srMtrls.
          if (checkMColor.length == 1) {
            await SRMtrl.updateOne(
              {
                company: comId,
                supplier: supplier,
                ref_no: ref_no,
                'mtrlColors.mColor': mColor,
              },
              {
                $pull: {
                  'mtrlColors.$.refs': { caseId: caseId, mtrlId: mtrlId },
                },
              }
            );
          }
          numOfdeleteRef = numOfdeleteRef + 1;
        }
        if (subject === 'gSize') {
          const mSizeSPEC = mtrl.sizeSPECs.find(
            ({ size }) => size === subjectId
          ).mSizeSPEC;
          const checkMSizeSPEC = mtrl.sizeSPECs.filter(
            (sizeSPEC) => sizeSPEC.mSizeSPEC === mSizeSPEC
          );
          // If the mSizeSPEC is refed by not only one colorway of the material, then we shouldn't delete it from the srMtrls.
          if (checkMSizeSPEC.length == 1) {
            await SRMtrl.updateOne(
              {
                company: comId,
                supplier: supplier,
                ref_no: ref_no,
                'sizeSPECs.mSizeSPEC': mSizeSPEC,
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

          numOfdeleteRef = numOfdeleteRef + 1;
        }
        if (numOfdeleteRef === mtrls.length) {
          resolve();
        }
      });
    });
    Promise.all([deleteRef]).then(async () => {
      console.log('the promise all of deleteRef');
      let num = 0;
      mtrls.map(async (mtrl) => {
        const supplier = mtrl.supplier;
        const ref_no = mtrl.ref_no;

        //The mongoDB code below, will only delete item in the array "mtrlColors" or item in the array "sizeSPECs".
        await SRMtrl.updateOne(
          {
            company: comId,
            supplier: supplier,
            ref_no: ref_no,
          },
          {
            $pull: {
              mtrlColors: { refs: { $size: 0 } },
              sizeSPECs: { refs: { $size: 0 } },
            },
          }
        );

        num = num + 1;
        if (num === mtrls.length) {
          return resolve();
        }
      });
    });
    // });
  });

  // Delete the srMtrl if the mtrlColors and sizeSPECs of which is empty
  Promise.all([deleteSrMtrl]).then(async () => {
    mtrls.map(async (mtrl) => {
      const supplier = mtrl.supplier;
      const ref_no = mtrl.ref_no;
      await SRMtrl.deleteOne({
        company: comId,
        supplier: supplier,
        ref_no: ref_no,
        // 'mtrlColors.mColor': mColor,
        mtrlColors: { $size: 0 },
        sizeSPECs: { $size: 0 },
      });
    });
  });
  try {
    //@_Step_1 Delete gClr and gQty
    const deleteItem = new Promise(async (resolve) => {
      if (subject === 'gClr') {
        console.log('Should Delete cWay'); // Test Code
        await Case.updateOne(
          { _id: caseId, company: comId },
          {
            $pull: {
              cWays: { id: subjectId },
              gQtys: { cWay: subjectId },
              'mtrls.$[].mtrlColors': { cWay: subjectId },
              'mtrls.$[].cspts': { cWay: subjectId },
            },
          }
        )
          .then(() => {
            resolve();
          })
          .catch((err) => {
            console.log(err);
            return err;
          });
      }
      //@_Step_1 Delete gSize and gQty
      if (subject === 'gSize') {
        console.log('Should Delete size'); // Test Code
        await Case.updateOne(
          { _id: caseId, company: comId },
          {
            $pull: {
              sizes: { id: subjectId },
              gQtys: { size: subjectId },
              'mtrls.$[].sizeSPECs': { size: subjectId },
              'mtrls.$[].cspts': { size: subjectId },
            },
          }
        )
          .then(() => {
            resolve();
          })
          .catch((err) => {
            console.log(err);
            return err;
          });
      }
    });

    Promise.all([deleteItem]).then(async () => {
      const result = await Case.findOne({
        _id: caseId,
        company: comId,
      });

      return res.json(result);
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// // @route   PUT api/case/deletemtrl/caseId/mtrlId
// // @desc    Delete gClr, gSize, or mtrl
// // @Steve
// // @access  Private
router.put('/deletemtrl/:caseId/:mtrlId', authUser, async (req, res) => {
  // Check if the user has authority to update case ---------------------------
  // console.log('The router triggered'); // Test Code
  let user = await User.findById(req.user.id);

  //Check if multiple login, if yes, do nothing
  const token = req.header('x-auth-token');
  if (user.sKey !== token) {
    const msg = { err: 'Multiple user login, please login again.' }
    console.log(msg)
    return res.json([msg])
  }
  // Check if the user have the right o manage case
  if (!user.cases) {
    return res.status(400).json({
      msg: 'Out of authority',
    });
  }

  const caseId = req.params.caseId;
  const comId = req.user.company;
  const mtrlId = req.params.mtrlId;
  console.log('the caseId', caseId); // Test Code
  console.log('the subjectId', mtrlId); // Test Code

  const theCase = await Case.findOne({ _id: caseId, company: comId });
  if (theCase.length === 0) {
    console.log('No such case');
    return res.status(404).json({
      msg: 'No such case',
    });
  }

  await Case.findOneAndUpdate(
    { _id: caseId, company: comId },
    { $pull: { mtrls: { id: mtrlId } } }
  ).then(() => {
    console.log('The mtrl is deleted');
    return res.json({ msg: 'The mtrl is deleted' });
  });
});

module.exports = router;
