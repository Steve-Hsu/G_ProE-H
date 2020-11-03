const express = require('express');
const router = express.Router();

const authUser = require('../middleware/authUser');

const User = require('../models/10_User');
const Case = require('../models/20_Case');
const SRMtrl = require('../models/30_SRMtrl');
const OS = require('../models/50_OS');

// @route   GET api/completeset/
// @desc    Read the complete set situation's for all cases.
//          Os collections has an attribute, "osUpdateDate", 
//          and the CompleteSet also has the same attribute. 
//          If both values not matched, this router should recalculate the result of completeset and return to the user
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
    if (!user.po) {
        return res.status(400).json({ msg: 'Out of authority' });
    }
    const comId = req.user.company;
    const osList = await OS.find({ company: comId }, { company: 0 }).sort({ osNo: 1 });
    // console.log('the osList', osList) // test code
    if (osList.length === 0) {
        console.log('No os Found')

        return res.json([])
    } else {
        console.log('osList is returned')
        return res.json(osList);
    }
});

module.exports = router;