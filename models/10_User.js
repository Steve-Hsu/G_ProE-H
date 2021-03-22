const mongoose = require('mongoose');
// Make Mongoose use `findOneAndUpdate()`. Note that this option is `true`
// Check : https://mongoosejs.com/docs/deprecations.html#findandmodify
// by default, you need to set it to false.
mongoose.set('useFindAndModify', false);

const UserSchema = mongoose.Schema({
  // Crendential of the User
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'companies',
  },
  comName: {
    type: String,
    required: true,
  },
  comSymbol: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  //This key is actually the token, generated and changed everytime when user login, for prevent mutiple login with one user account. Everytime user make a request, server will check if the token of user is matched to the one in mongoDb, if not, request will be refused.
  sKey: {
    type: String,
  },
  // Authorities of the user
  cases: {
    // case is a keyword in javaScript so here call case as cases.
    type: Boolean,
    // required: true,
    // default: false,
  },
  mtrl: {
    // Material,
    type: Boolean,
    // required: true,
    // default: false,
  },
  cspt: {
    // consumption of materials, for sample room to fill in
    type: Boolean,
    // required: true,
    // default: false,
  },
  mp: {
    // material price.
    type: Boolean,
    // required: true,
    // default: false,
  },
  quo: {
    // Quotation for garment and mtrls
    type: Boolean,
  },
  po: {
    // purchase order
    type: Boolean,
    // required: true,
    // default: false,
  },
  loss: {
    type: Object,
  },
  language: {
    // Default is english, japanese, chinese, vietnamese
    type: String,
    default: 'english',
  },
  // Date
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('user', UserSchema);
