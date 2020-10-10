const express = require('express');
const router = express.Router();
const authUser = require('../middleware/authUser');
// Not set up yet, for check the value entered by user at the some specific column
const { check, validationResult } = require('express-validator');

const Case = require('../models/20_Case');

// @route   GET api/case/query
// @desc    Sent back 10 record possible results, and return the style, client, userName, and cNo.
// @access  Private
router.post('/', authUser, async (req, res) => {
  // Extract the value of the variable "query" in the form body
  const companyId = req.user.company;
  const searchKeyword = req.body.query;
  try {
    // This query you may check : https://stackoverflow.com/questions/26814456/how-to-get-all-the-values-that-contains-part-of-a-string-using-mongoose-find
    // Search for style
    const styles = await Case.find(
      {
        $and: [
          { style: { $regex: searchKeyword, $options: 'i' } },
          { company: companyId },
        ],
      },
      { style: 1, client: 1, userName: 1, cNo: 1 }
    )
      .sort({ date: -1 })
      .limit(10);

    if (styles.length > 0) {
      return res.json(styles);
    }

    const clients = await Case.find(
      {
        $and: [
          { client: { $regex: searchKeyword, $options: 'i' } },
          { company: companyId },
        ],
      },
      { style: 1, client: 1, userName: 1, cNo: 1 }
    )
      .sort({ date: -1 })
      .limit(10);

    if (clients.length > 0) {
      return res.json(clients);
    }

    const userNames = await Case.find(
      {
        $and: [
          { userName: { $regex: searchKeyword, $options: 'i' } },
          { company: companyId },
        ],
      },
      { style: 1, client: 1, userName: 1, cNo: 1 }
    )
      .sort({ date: -1 })
      .limit(10);

    if (userNames.length > 0) {
      return res.json(userNames);
    }

    const caseNumber = await Case.find(
      {
        $and: [
          { cNo: { $regex: searchKeyword, $options: 'i' } },
          { company: companyId },
        ],
      },
      { style: 1, client: 1, userName: 1, cNo: 1 }
    )
      .sort({ date: -1 })
      .limit(10);

    if (caseNumber.length > 0) {
      return res.json(caseNumber);
    }

    return res.json([{ style: 'Noting found' }]);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

module.exports = router;
