const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authUser = require('../middleware/authUser');
// Not set up yet, for check the value entered by user at the some specific column
const { check, validationResult } = require('express-validator');

const User = require('../models/10_User');
const Case = require('../models/20_Case');

// @route   post api/purchase/query
// @desc
// @access  Private
router.post('/', authUser, async (req, res) => {
  // Extract the value of the variable "query" in the form body
  const companyId = req.user.company;
  const searchKeyword = req.body.query;
  let arr = [];
  console.log(searchKeyword);

  // This query you may check : https://stackoverflow.com/questions/26814456/how-to-get-all-the-values-that-contains-part-of-a-string-using-mongoose-find

  //@ search case by user name
  const userId = await User.findOne(
    {
      name: { $regex: searchKeyword, $options: 'i' },
    },
    { _id: 1 }
  );
  if (userId) {
    console.log(userId);
    const userNames = await Case.find(
      {
        user: userId._id,
        company: companyId,
      },
      { cNo: 1, style: 1, client: 1, user: 1, merchandiser: '' }
    )
      .sort({ date: -1 })
      .limit(10)
      .catch((err) => {
        return err;
      });

    // console.log('the userNames', userNames); // test Code
    if (userNames.length > 0) {
      let n = 0;
      return userNames.map(async (c) => {
        await User.findOne(
          { company: companyId, _id: c.user },
          { _id: 0, name: 1 }
        )
          .then((result) => {
            if (result) {
              c.merchandiser = result.name;

              arr.push({
                cNo: c.cNo,
                style: c.style,
                client: c.client,
                merchandiser: c.merchandiser,
                _id: c._id,
              });
            }
            n = n + 1;
          })
          .catch((err) => {
            console.log('err in search userNames', err);
          });

        if (n === userNames.length) {
          console.log('return of userNames is triggered'); // Test Code
          return res.json(arr);
        }
      });
    }
  }

  const clients = await Case.find(
    {
      $and: [
        { client: { $regex: searchKeyword, $options: 'i' } },
        { company: companyId },
      ],
    },
    { cNo: 1, style: 1, client: 1, user: 1, merchandiser: '' }
  )
    .sort({ date: -1 })
    .limit(10)
    .catch((err) => {
      return err;
    });

  //   console.log('the clients', clients); // test Code
  if (clients.length > 0) {
    let n = 0;
    return clients.map(async (c) => {
      await User.findOne(
        { company: companyId, _id: c.user },
        { _id: 0, name: 1 }
      )
        .then((result) => {
          if (result) {
            c.merchandiser = result.name;

            arr.push({
              cNo: c.cNo,
              style: c.style,
              client: c.client,
              merchandiser: c.merchandiser,
              _id: c._id,
            });
          }
          n = n + 1;
        })
        .catch((err) => {
          console.log('err in search clients', err);
        });

      if (n === clients.length) {
        console.log('return of clients is triggered'); // Test Code
        return res.json(arr);
      }
    });
  }

  const caseNumber = await Case.find(
    {
      $and: [
        { cNo: { $regex: searchKeyword, $options: 'i' } },
        { company: companyId },
      ],
    },
    { cNo: 1, style: 1, client: 1, user: 1, merchandiser: '' }
  )
    .sort({ date: -1 })
    .limit(10)
    .catch((err) => {
      return err;
    });

  //   console.log('the caseNumber', caseNumber); // test Code
  if (caseNumber.length > 0) {
    let n = 0;
    return caseNumber.map(async (c) => {
      await User.findOne(
        { company: companyId, _id: c.user },
        { _id: 0, name: 1 }
      )
        .then((result) => {
          if (result) {
            c.merchandiser = result.name;

            arr.push({
              cNo: c.cNo,
              style: c.style,
              client: c.client,
              merchandiser: c.merchandiser,
              _id: c._id,
            });
          }
          n = n + 1;
        })
        .catch((err) => {
          console.log('err in search caseNumber', err);
        });

      if (n === caseNumber.length) {
        console.log('return of caseNumber is triggered'); // Test Code
        return res.json(arr);
      }
    });
  }

  const styles = await Case.find(
    {
      $and: [
        { style: { $regex: searchKeyword, $options: 'i' } },
        { company: companyId },
      ],
    },
    { cNo: 1, style: 1, client: 1, user: 1, merchandiser: '' }
  )
    .sort({ date: -1 })
    .limit(10)
    .catch((err) => {
      return err;
    });
  //   console.log('the styles', styles); // test Code
  if (styles.length > 0) {
    let n = 0;

    return styles.map(async (c) => {
      await User.findOne(
        { company: companyId, _id: c.user },
        { _id: 0, name: 1 }
      )
        .then((result) => {
          if (result) {
            console.log('the result');
            c.merchandiser = result.name;

            arr.push({
              cNo: c.cNo,
              style: c.style,
              client: c.client,
              merchandiser: c.merchandiser,
              _id: c._id,
            });
          }
          n = n + 1;
          // return n;
        })
        .catch((err) => {
          console.log('err in search styles', err);
        });

      if (n === styles.length) {
        console.log('return of styles is triggered'); // Test Code
        return res.json(arr);
      }
    });
  }

  return res.json([{ cNo: 'Noting found' }]);
});

module.exports = router;
