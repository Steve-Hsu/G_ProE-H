const mongoose = require('mongoose');
// Make Mongoose use `findOneAndUpdate()`. Note that this option is `true`
// Check : https://mongoosejs.com/docs/deprecations.html#findandmodify
// by default, you need to set it to false.
mongoose.set('useFindAndModify', false);

// @desc    Materal belong to cases.
// Steve    The material will be generated after case is created, each materal in the bom (case) will generate 1 material in this collection by this schema. Each materal will be inserted the ID of the case, after the case are moved to purchase order, the materal in this collection of the case should be all deleted. Because we will have another collection to hold all the data of the materals by it MIC, the spec, supplier, and ref_no. 2020/05/26
const QuoFormSchema = mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'company',
  },
  quoHead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'quoHead',
  },
  quoNo: {
    type: String,
  },
  currency: {
    type: String,
  },
  quoSizes: {
    type: Array,
  },
  quocWays: {
    type: Array,
  },
  quotatedQty: {
    type: Number,
  },
  cm: {
    type: Number,
  },
  mQuos: [
    {
      mtrlId: String,
      mQuoAddvised: Number,
      csptAddvised: Number,
      materialFinalQuotation: Number,
    },
  ],
  mQuosTotal: {
    type: Number,
  },
  otherExpenses: [
    {
      _id: false, // to prevent mess up and the object is generated from client so don't generate duplicated _id
      id: String,
      costName: String,
      costDescription: String,
      cost: Number,
    },
  ],
  conditions: [
    {
      _id: false, // to prevent mess up and the object is generated from client so don't generate duplicated _id
      id: String,
      condition: String,
      conditionDescription: String,
    },
  ],
  otherExpensesTotal: {
    type: Number,
  },
  fob: {
    type: Number,
  },
  useAsFinalQuotation: {
    type: Boolean,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model('quoForm', QuoFormSchema);
