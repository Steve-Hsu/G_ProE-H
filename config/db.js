const mongoose = require('mongoose');
// Import for ENV file in node.js
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useCreateIndex: true,

      //MongoDB recommand adding this line
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected !! Cheers !!');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
