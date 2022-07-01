const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

//AppError: custom error calss for throwing operational errors
const AppError = require('./utils/appError');
//globalErrorHandler: custom "global error handling" middleware
const globalErrorHandler = require('./controllers/errorController');

//Requiring routers for resources: tours and users
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
// const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES

//Implement CORS (cross origin resource sharing) for allowing other websites to consume our api
app.use(cors({
  origin: 'https://natours-frontend.herokuapp.com',
  credentials: true
  // origin: `http://${process.env.REACT_APP_SERVER_HOST}:${process.env.PORT}`
}));

//useful stuff about httpOnly cookie and cors configuration: https://geekflare.com/enable-cors-httponly-cookie-secure-token/

//Serving the static files in the public folder. Example:  http://127.0.0.1:3000/overview.html
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//Limit requests from an IP address in a certain time
const limiter = rateLimit({
  max: 100, //max number of requests
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

app.use(compression());

//Mounting the routers to their respective urls
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
// app.use('/api/v1/bookings', bookingRouter);

//Handling requests with invalid urls 
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//Whenever next() method is called with a parameter, globalErrorHandler will be called
app.use(globalErrorHandler);

module.exports = app;
