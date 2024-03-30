const express = require('express');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const compression = require("compression");
const helmet = require("helmet");

// Authentication imports
const passport = require('passport');
const jwtStrategy = require('./config/passport').jwtStrategy;

// Route imports
const indexRouter = require('./routes/index');
const postRouter = require('./routes/post');
const commentRouter = require('./routes/comment');
const userRouter = require('./routes/user');

const app = express();

// MongoDB connection
const mongoose = require('mongoose');

mongoose.set('strictQuery', false);

const mongoDB = process.env.MONGODB_URI;

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(mongoDB);
}

// Rate limiter: maximum of forty requests per minute
const RateLimit = require("express-rate-limit");
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000,
  max: 40,
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(compression());
app.use(helmet());
app.use(limiter);

// JWT authentication
passport.use(jwtStrategy);

// Routes
app.use('/', indexRouter);
app.use('/users', userRouter);
app.use('/posts', postRouter);
app.use('/posts/:id/comments', commentRouter);

// Error handler
app.use((err, req, res, next) => {
  return res.status(500).json({
    error: 'An error has occurred.',
    message: `ERROR: ${err.message}`,
  });
});

// Server listener
app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}...`);
});
