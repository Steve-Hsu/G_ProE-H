const mongoose = require('mongoose');
// Make Mongoose use `findOneAndUpdate()`. Note that this option is `true`
// Check : https://mongoosejs.com/docs/deprecations.html#findandmodify
// by default, you need to set it to false.
mongoose.set('useFindAndModify', false);

// @desc    Materal belong to cases.
// Steve    The material will be generated after case is created, each materal in the bom (case) will generate 1 material in this collection by this schema. Each materal will be inserted the ID of the case, after the case are moved to purchase order, the materal in this collection of the case should be all deleted. Because we will have another collection to hold all the data of the materals by it MIC, the spec, supplier, and ref_no. 2020/05/26
const SRMtrlSchema = mongoose.Schema({
  // ColorWay, for which colorWay to use this material
  //Company name, comSymbol , supplier & Ref_no
  CSRIC: {
    type: String,
    required: true,
  },
  supplier: {
    type: String,
  },
  ref_no: {
    type: String,
  },
  item: {
    type: String,
  },
  mtrlColors: {
    type: Array,
  },
  sizeSPECs: {
    type: Array,
  },
  currency: {
    type: String,
  },
  caseUnit: {
    // Unit from case, for purchase unit in mPrice to reference
    type: String,
  },
  unitConvertRatio: {
    type: Number,
    default: 0,
  },
  mPrices: {
    type: Array,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'company',
  },
  mainPrice: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
module.exports = mongoose.model('srMtrl', SRMtrlSchema);
