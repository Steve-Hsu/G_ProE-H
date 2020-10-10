const express = require('express');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB (Database)
connectDB();

// Init Middleware for testing to send body in JSON
// # Due to the Error : PayloadTooLargeError: request entity too large
// Instead of the code :
// app.use(express.json({ extended: false }));
// Solve the problem by setting the limit
app.use(express.json({ extended: false, limit: '50mb' }));

// // For Cors issue Setting
// app.use((req, res, next) => {
//   // Allows to specific source you send your request.
//   // 特殊值 *，設置所有 origin 都被允許。
//   // 但使用特殊值 * 要格外小心，因為這會使 Server 容易受到跨站請求的偽需求攻擊
//   // You'd set the '*' to your domain after you push the app to heroku
//   res.header(
//     'Access-Control-Allow-Origin',
//     '*'
//     // 'http://127.0.0.1:5000/m-list, http://localhost:3000'
//   );
//   // Allow to some specific header you send out, use * represents all kind of header you send out is ok.
//   // res.header('Access-Control-Allow-Headers', '*');
//   // Allows to this request method you send out
//   if (req.method === 'OPTIONS') {
//     res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, PATCH, DELETE');
//   }
// });

//EndPoint
app.get('/', (req, res) =>
  res.json({
    msg:
      "Welcome to the World Steve, I'm so exciting for this wonderful project",
  })
);

// Defines Routes ---------------------------------------------------------------
// Authentication -------------------------
// @Steve   --------------
// Only me access  - Register a company
app.use('/registercom', require('./routes/00_company'));

// @COMPANY --------------
// Compnay login
app.use('/api/auth/company', require('./routes/10_authCom'));
// Register a User
app.use('/api/users', require('./routes/11_users'));

// @Users   --------------
// User login
app.use('/api/auth/user', require('./routes/20_authUser'));
// Cases
app.use('/api/case', require('./routes/21_case'));
// Bom, it treat bom in the case and materials
app.use('/api/case/query', require('./routes/22_queryCase'));
// mPrice, extract materials & MIC from mtrl
app.use('/api/srmtrl', require('./routes/30_srMtrl'));
// mPrice Query
app.use('/api/srmtrl/query', require('./routes/31_querySrMtrl'));
// Quotations
app.use('/api/quogarment', require('./routes/40_quo'));
// Purchase
app.use('/api/purchase', require('./routes/50_pur'));
// Query cases of Purchase
app.use('/api/purchase/query', require('./routes/51_queryPur'));

/// Server static assets in production
if (process.env.NODE_ENV === 'production') {
  //Set static folder
  app.use(express.static('client/build'));
  //Set the route
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  );
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
// app.listen('', () => console.log(`Server started on port ${PORT}`));
