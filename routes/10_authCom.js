// For company to loggin the app
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authCom = require('../middleware/authCom');

// Schema
const Company = require('../models/00_Company');

// Import for ENV file in node.js
require('dotenv').config();


// @route   Get api/auth
// @desc    Get logged in as a company
// @access  Private
router.get('/', authCom, async (req, res) => {
  try {
    const company = await Company.findById(req.company.id).select('-password');
    res.json(company);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/auth for company
// @desc    Auth company & get token
// @access  Public
router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
      // Check if database has this company
      let company = await Company.findOne({ email });
      if (!company) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }

      // Check the password
      const isMatch = await bcrypt.compare(password, company.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid Credentials' });
      }

      // JWT
      // payload : Waht we send to generate a JWT
      const payload = {
        company: {
          id: company.id,
        },
      };

      // Generate JWT
      jwt.sign(
        payload,
        process.env.JWTSECRET,
        {
          // The JWT expires in 1 hour
          expiresIn: 36000,
        },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Server Error');
    }
  }
);
module.exports = router;
