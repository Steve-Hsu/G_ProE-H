const mongoose = require('mongoose');
// Make Mongoose use `findOneAndUpdate()`. Note that this option is `true`
// Check : https://mongoosejs.com/docs/deprecations.html#findandmodify
// by default, you need to set it to false.
mongoose.set('useFindAndModify', false);

// @desc    Materal belong to cases.
//          This is for complete set, means check the materials leadtime for each cases to see which one can be put in production frist.
const CsSchema = mongoose.Schema({
   // ColorWay, for which colorWay to use this material
   //Company name, comSymbol , supplier & Ref_no
   company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'company',
   },
   osNo: {
      type: String,
   },
   csOrder: {
      //The calculating will follow this order of array, and this will contains the cNo of the case.
      type: Array,
   },
   osLtConfirmDate: {
      type: Date,
      default: null
   },
   // completeSets: {
   //    type: Array,
   // },

   caseMtrls: [
      //Inherited from OS, Actually the caseMtrls is the mtrls from each cases and converted to be an po items.
      {
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
         },
         //below 4 arraies inherited from Case, and the cspt in mtrl.cspt will have a new attribute "fulfillQty" inserted in frontEnd.
         cWays: {
            type: Array
         },
         sizes: {
            type: Array
         },
         gQtys: {
            type: Array
         },
         mtrls: {
            type: Array
         }
      },
   ],


   date: {
      type: Date,
      default: Date.now,
   },

});
module.exports = mongoose.model('cs', CsSchema);
