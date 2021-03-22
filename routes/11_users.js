const express = require('express');
const router = express.Router();
const { check, body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const authCom = require('../middleware/authCom');

// Schema
const Company = require('../models/00_Company');
const User = require('../models/10_User');

// @route   GET api/users
// @desc    Get the list of all user
// @access  Private
router.get('/', authCom, async (req, res) => {
  try {
    const users = await User.find({ company: req.company.id }, { company: 0 })
      .select('-password')
      .sort({
        date: -1,
      });
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/users
// @desc    Register a user
// @access  Public
router.post(
  '/',
  // 1st middleware
  //The [] is a middleware 'express-validator' for checking the values the user enter is in right format or not
  [
    check('name', 'Please add name').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 6 or more characters'
    ).isLength({ min: 6 }),
    // body('password2').custom((value, { req }) => {
    //   if (value !== req.body.password) {
    //     throw new Error('Password confirmation does not match password');
    //   }
    //   return true;
    // }),
  ],
  // 2nd middleware - Only the authrized company can register a new user
  authCom,
  async (req, res) => {
    // check if the user number is out of limit of the company -------------------
    let isUserFull = false;
    await Company.find({ _id: req.company.id }, function (err, obj) {
      const userNumLimit = obj[0].userNumLimit;
      const userNum = obj[0].userNum;
      try {
        if (userNum >= userNumLimit) {
          return (isUserFull = true);
        }
      } catch (err) {
        console.log(err);
      }
    });
    if (isUserFull) {
      console.log('Hit User nubmer Limit');
      return res.status(400).json({ msg: 'User is full' });
    }

    // Generate user --------------------------------------------------------------
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation problem');
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, cases, mtrl, cspt, mp, quo, po, language } = req.body;

    try {
      const theLanquage = language === 'english' || 'vietnamese' || 'japanese' || 'chinese' ? language : 'english';
      let user = await User.findOne({ email });
      if (user) {
        console.log('User already exist');
        return res.status(400).json({ msg: 'User already exists' });
      }

      //Company Id get from token of the company
      const comId = req.company.id;
      //Insert comSymbol to new user

      const existingUser = await User.findOne({ company: comId });
      const com = await Company.findOne({ _id: comId });

      //Setting Loss
      let loss = {
        sets: [
          { set1: 70 },
          { set2: 200 },
          { set3: 500 },
          { set4: 1000 },
          { set5: 3000 },
        ],
        // set1: 70,
        // set2: 200,
        // set3: 500,
        // set4: 1000,
        // set5: 3000,
        elastic: {
          loss1: 5,
          loss2: 5,
          loss3: 5,
          loss4: 5,
          loss5: 5,
          loss6: 5,
        },
        fabric: {
          loss1: 4,
          loss2: 2.5,
          loss3: 2,
          loss4: 1.5,
          loss5: 1,
          loss6: 1,
        },
        insulation: {
          loss1: 3,
          loss2: 2,
          loss3: 1.5,
          loss4: 1,
          loss5: 1,
          loss6: 1,
        },
        interfacing: {
          loss1: 3,
          loss2: 2,
          loss3: 1.5,
          loss4: 1,
          loss5: 1,
          loss6: 1,
        },
        knit: {
          loss1: 6,
          loss2: 4,
          loss3: 3.5,
          loss4: 3,
          loss5: 2,
          loss6: 2,
        },
        label: {
          loss1: 1,
          loss2: 1,
          loss3: 1,
          loss4: 1,
          loss5: 1,
          loss6: 1,
        },
        thread: {
          loss1: 5,
          loss2: 5,
          loss3: 5,
          loss4: 5,
          loss5: 5,
          loss6: 5,
        },
        woven: {
          loss1: 4,
          loss2: 2.5,
          loss3: 2,
          loss4: 1.5,
          loss5: 1,
          loss6: 1,
        },
        zipper: {
          loss1: 5,
          loss2: 3,
          loss3: 2,
          loss4: 1,
          loss5: 1,
          loss6: 1,
        },
        other: {
          loss1: 1,
          loss2: 1,
          loss3: 1,
          loss4: 1,
          loss5: 1,
          loss6: 1,
        },
      };
      if (existingUser) {
        loss = existingUser.loss;
      }


      user = new User({
        name: name.toLowerCase(),
        email: email.toLowerCase(),
        password: password.toLowerCase(),
        company: comId,
        comName: com.comName,
        comSymbol: com.comSymbol,
        cases,
        mtrl,
        cspt,
        mp,
        quo,
        po,
        loss: loss,
        language: theLanquage,
        sKey: null,
      });

      //bcrypt the password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      // JWT
      const payload = {
        user: {
          id: user.id,
          company: req.company.id,
        },
      };

      // Generate JWT
      jwt.sign(
        payload,
        config.get('jwtSecret'),
        {
          expiresIn: 36000,
        },
        (err, token) => {
          if (err) throw err;
          // res.json({ token });
          // This res.json is for test when in the frontend to get token
        }
      );

      res.json({ msg: 'New User is added' });
      // Update the userNum in Company -------------------------------------------
      // If the user added, add 1 for the userNum of the company to restrict the number of user.
      await Company.find({ _id: req.company.id }, function (err, obj) {
        const userNum = obj[0].userNum + 1;
        Company.findOneAndUpdate(
          { _id: req.company.id },
          { $set: { userNum: userNum } },
          function (err, results) {
            if (err) {
              return res.status(500).json({
                msg: 'Server Error, In setting userNum',
              });
            }
          }
        );
        console.log(`New user is set up, userNum is now ${userNum}`);
      });
    } catch (err) {
      // console.log(err.message);
      res.status(500).send('Server Error, Make new user failed');
      // dispatch({
      //   type: REGISTER_FAIL,
      //   payload: err.response.data.msg,
      // });
    }
  }
);

// @route   PUT api/users/:id
// @desc    Update a user
// @Steve   Don't allow the company to update the password of the user. It will prevent some dispution. Whereas the user miss his password, the account will not lock down any function, the company jsut need to create a new account to take care the cases of the order missing accout. Or use another account with same right to take care the cases.
// @access  Private
router.put('/:id', authCom, async (req, res) => {
  let userForm = req.body;
  if (userForm.password === '' && userForm.password2 === '') {
    //No password update
    delete userForm.password;
    delete userForm.password2;
    console.log('No password update');
  } else {
    //Update the password
    delete userForm.password2;
    userForm.password = userForm.password.toLowerCase();
    const salt = await bcrypt.genSalt(10);
    userForm.password = await bcrypt.hash(userForm.password, salt);
  }

  try {
    // Get the id from URL by params
    // The method .select('-password) is for not showing the password on result
    let user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Make sure company own this user
    if (user.company.toString() !== req.company.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: userForm },
      // Return the updated one.
      { new: true }
      // The method .select('-password) is for not showing the password on result
    ).select('-password');
    // console.log(user);
    // res.json(user);
    const userName = user.name;
    console.log(`User ${userName} Update succssed!`);
    res.json({ msg: `User ${userName} Update succssed!` });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/users/:id
// @desc    Delete User
// @access  Private
router.delete('/:id/', authCom, async (req, res) => {
  // Get the id from URL by params
  let user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ msg: 'User not found' });
  // Make sure company own this user --------------------------------------
  if (user.company.toString() !== req.company.id) {
    return res.status(401).json({ msg: 'Not authorized' });
  }

  try {
    // Get the id of the case from URL by params
    let user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Delete the User
    await User.deleteOne({ _id: req.params.id }, async function (err) {
      if (err) {
        console.log(err);
      } else {
        // Update the userNum in Company -------------------------------------------
        // If the user deleted, minus 1 for the userNum of the company for restriction of user quantity.
        await Company.find({ _id: req.company.id }, function (err, obj) {
          const userNum = obj[0].userNum - 1;
          Company.findOneAndUpdate(
            { _id: req.company.id },
            { $set: { userNum: userNum } },
            function (err, results) {
              if (err) {
                return res.status(500).json({
                  msg: 'Server Error, In setting userNum',
                });
              }
            }
          );
          console.log(`New user is set up, userNum is now ${userNum}`);
        });
        console.log('Removed the User');
      }
    });

    res.json({
      msg: 'the User is removed from Bom',
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/users/uploadloss
// @desc    load loss of all the User
// @access  Private
router.post('/uploadloss', authCom, async (req, res) => {
  // Get the id from URL by params

  let company = await Company.findById(req.company.id);
  if (!company) {
    console.log('company User not found');
    return res.status(404).json({ msg: 'company User not found' });
  }
  const comId = req.company.id;
  const loss = req.body;

  const checkNum = new Promise((resolve) => {
    console.log('Promise is calling');
    loss.sets.map((i, idx2) => {
      console.log('The start of the map');
      switch (idx2) {
        case 0:
          break;
        case 1:
        case 2:
        case 3:
        case 4:
          if (i[`set${idx2 + 1}`] <= loss.sets[idx2 - 1][`set${idx2}`]) {
            i[`set${idx2 + 1}`] =
              loss.sets[idx2 - 1][`set${idx2}`] +
              Number(
                idx2 === 1
                  ? 130
                  : idx2 === 2
                    ? 300
                    : idx2 === 3
                      ? 500
                      : idx2 === 4
                        ? 2000
                        : 7
              );
          }
          break;
        default:
      }
      if (idx2 + 1 === loss.sets.length) {
        resolve();
      }
    });
  });

  return Promise.all([checkNum]).then(async () => {
    console.log('Promise all is triggered');
    try {
      await User.updateMany({ company: comId }, { $set: { loss: loss } });
      const users = await User.find({ company: comId }, { company: 0 })
        .select('-password')
        .sort({
          date: -1,
        });
      console.log('The loss uploaded');
      res.json(users);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });
});
module.exports = router;
