require('dotenv').config();
require('express-async-errors');

const { createServer } = require('http');
const express = require('express');
const cors = require('cors');

const app = express();
const httpServer = createServer(app);

const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');

const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const fileUpload = require('express-fileupload');

const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// database
const connectDB = require('./db/connect');

// middlewares
const {
  authenticateUser,
  authorizeRoles,
} = require('./middleware/authentication-middleware');
const notFoundHandler = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

// routes
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const studentRoutes = require('./routes/studentRoutes');
const batchDeptRouter = require('./routes/batchDeptRoutes');
const noticeRouter = require('./routes/noticeRoutes');
const adminRouter = require('./routes/adminRoutes');
const companyRouter = require('./routes/companyRoutes');

const whitelist = [
  'https://placement-portal-react.netlify.app',
  'http://localhost:5173',
  undefined, // for postman
];

const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  // preflightContinue: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(cookieParser(process.env.JWT_SECRET));
app.use(morgan('tiny'));

app.use(express.json());
app.use(xss());
app.use(mongoSanitize());

app.use(fileUpload({ useTempFiles: true }));
app.use(express.static('./public'));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', [authenticateUser, userRouter]);
app.use('/api/v1/student', [
  authenticateUser,
  authorizeRoles('student'),
  studentRoutes,
]);
app.use('/api/v1/batchDept', [
  authenticateUser,
  batchDeptRouter,
]);
app.use('/api/v1/notice', [authenticateUser, noticeRouter]);
app.use('/api/v1/admin', [
  authenticateUser,
  authorizeRoles('admin'),
  adminRouter,
]);

app.use('/api/v1/company', [authenticateUser, companyRouter]);

app.use(notFoundHandler);
app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    httpServer.listen(PORT, () =>
      console.log(`Server is listening on PORT ${PORT} 🚀`)
    );
  } catch (error) {
    console.log('Connection Failed!', error);
  }
};

start();
