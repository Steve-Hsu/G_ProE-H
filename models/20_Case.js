const mongoose = require('mongoose');
// Make Mongoose use `findOneAndUpdate()`. Note that this option is `true`
// Check : https://mongoosejs.com/docs/deprecations.html#findandmodify
// by default, you need to set it to false.
mongoose.set('useFindAndModify', false);

const CaseSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'companies',
  },
  cNo: {
    // Case number C + company symbol + year + _ + 00000
    type: String,
    unique: true,
  },
  caseType: {
    type: String,
  },
  style: {
    type: String,
    required: true,
  },
  client: {
    type: String,
  },
  cWays: {
    type: Array,
    // ColorWay
  },
  sizes: {
    type: Array,
  },
  gQtys: {
    type: Array,
  },
  mtrls: {
    type: Array,
  },
  isImportedExcel: {
    type: Boolean,
  },
  date: {
    // The date, this "case" established on the date base, it can be the register date of the case,
    type: Date,
    default: Date.now,
  },
  authorizedUser: [
    {
      // The user generate this case can draw in other users, so they can update this case.
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
  ],
  bomDate: {
    // The date, all material be established. As long as the material info is changed, this date will be dupdate.
    type: Date,
  },
  csptDate: {
    // The date, all the consumption of material be filled out.
    type: Date,
  },
  mpDate: {
    // The date, all the price of materials be filled out.
    type: Date,
  },
  poDate: {
    // The date, all the PO related to this case are completed.
    type: Date,
    default: null,
  },
  osNo: {
    // Case number C + company symbol + year + _ + 00000
    type: String,
    default: null,
  },
});

module.exports = mongoose.model('case', CaseSchema);
