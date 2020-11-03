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
    const completeSet = await OS.find({ company: comId }, { company: 0, suppliers: 0, caseMtrls: 0 });
    // console.log('the osList', osList) // test code
    if (completeSet.length === 0) {
        console.log('No os Found')

        return res.json([])
    } else {
        console.log('osList is returned')
        return res.json(completeSet);
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
    const completeSet = await CS.findOne({ company: comId, osNo }, { company: 0 });
    // console.log('the osList', osList) // test code
    if (completeSet.length === 0) {
        console.log('No cs Found')

        return res.json({})
    } else {
        console.log('completeSet is returned')
        return res.json(completeSet);
    }
});

module.exports = router;