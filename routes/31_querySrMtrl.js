const express = require('express');
const router = express.Router();
const authUser = require('../middleware/authUser');
// Not set up yet, for check the value entered by user at the some specific column
const { check, validationResult } = require('express-validator');

// const User = require('../models/10_User');
// const Case = require('../models/20_Case');
const SRMtrl = require('../models/30_SRMtrl');

// @route   POST api/srmtrl/query
// @desc    Query the srMtrl
// @access  Private
router.post('/', authUser, async (req, res) => {
  const companyId = req.user.company;
  const searchKeyword = req.body.query;

  //@1 Search supplir
  const suppliers = await SRMtrl.find(
    {
      supplier: { $regex: searchKeyword, $options: 'i' },
      company: companyId,
    },
    { supplier: 1 }
  )
    .sort({ date: -1 })
    .limit(10);

  // If the have result
  if (suppliers.length > 0) {
    // return distinct item, don't duplicately return same supplier.
    const distinctedSupplier = suppliers.filter(function (item, currentIndex) {
      let i = suppliers
        .map((s) => {
          return s.supplier;
        })
        .indexOf(item.supplier);
      return i == currentIndex;
    });
    return res.json(distinctedSupplier);
  }

  //@1 Search ref_no
  const refNos = await SRMtrl.find(
    {
      ref_no: { $regex: searchKeyword, $options: 'i' },
      company: companyId,
    },
    { ref_no: 1 }
  )
    .sort({ date: -1 })
    .limit(10);

  if (refNos.length > 0) {
    return res.json(refNos);
  }
});

module.exports = router;
