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
    osUpdateDate: {
        type: Date,
        default: null
    },
    date: {
        type: Date,
        default: Date.now,
    },
    completeSets: {
        type: Array,
    }
});
module.exports = mongoose.model('cs', CsSchema);
