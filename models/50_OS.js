const mongoose = require('mongoose');
// Make Mongoose use `findOneAndUpdate()`. Note that this option is `true`
// Check : https://mongoosejs.com/docs/deprecations.html#findandmodify
// by default, you need to set it to false.
mongoose.set('useFindAndModify', false);

// @desc    Materal belong to cases.
// Steve    The material will be generated after case is created, each materal in the bom (case) will generate 1 material in this collection by this schema. Each materal will be inserted the ID of the case, after the case are moved to purchase order, the materal in this collection of the case should be all deleted. Because we will have another collection to hold all the data of the materals by it MIC, the spec, supplier, and ref_no. 2020/05/26
const OSSchema = mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'company',
  },
  osNo: {
    type: String,
    unique: true,
  },
  caseList: [
    {
      caseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'case'
      },
      cNo: {
        type: String
      },
      style: {
        type: String
      },
      client: {
        type: String
      },
      caseType: {
        type: String
      }
    },
  ],
  suppliers: [
    {
      supplier: {
        type: String,
      },
      address: {
        type: String,
      },
      attn: {
        type: String,
      },
      email: {
        type: String,
      },
      tel: {
        type: String,
      },
      conditions: {
        type: Array,
      },
      poConfirmDate: {
        //This confirm date is for the staff of purchase dapartment to confirm the po is correct in qty, price, conditions, all the information in the po. once it confirmed, it can't be updated and changed.
        type: Date,
        default: null,
      },
      transitTime: {
        type: Number,
        default: 2
      }
    },
  ],
  caseMtrls: [
    {
      checkCaseMtrlCode: {
        type: String
      },
      cases: {
        type: Array
      },
      supplier: {
        type: String
      },
      ref_no: {
        type: String
      },
      mColor: {
        type: String
      },
      mSizeSPEC: {
        type: String
      },
      purchaseQtySumUp: {
        type: Number
      },
      purchaseLossQtySumUp: {
        type: Number
      },
      purchaseMoqQty: {
        type: Number
      },
      hsCode: {
        type: String,
        default: null
      },
      item: {
        type: String,
      },
      price: {
        type: Object,
        default: null
      },
      leadTimes: {
        type: Array,
        default: null
      },
      leadTimeComplete: {
        type: Boolean,
        default: false
      }
    }
  ],
  date: {
    type: Date,
    default: Date.now,
  },
  osConfirmDate: {
    // As the osConfirmDate is made, the accounting department receive a applying for payment of this os.
    // This is to check if the PO is correct. In practice, if you confirmed the PO means it's available to send to supplier and also submit to accounting department.
    type: Date,
    default: null,
  },
  osLtConfirmDate: {
    // As the ltConfirmDate is made, the setup of style can be start. lt = LeadTime.
    // This attribute update every time if user save the date and all the leadtime of mtrls are confirmed.
    type: Date,
    default: null,
  },
});
module.exports = mongoose.model('os', OSSchema);
