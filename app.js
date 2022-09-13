/*****************************(1).REQUIRING THE PACKAGES THAT ARE PRESENT IN THE NODE MODULES **************************/

//path package to help with the path of files in the directory
const path = require('path');
const express = require('express');
//morgan package for logging important information on the console
const morgan = require('morgan');
//rateLimit to fix an upper limit on number of requests from the same ip in a given time
const rateLimit = require('express-rate-limit');
//to set security HTTP headers
const helmet = require('helmet');
//mongosanitize for data sanitization against NoSQL query injection
const mongoSanitize = require('express-mongo-sanitize');
//mongosanitize for data sanitization against xss (cross site scripting)
const xss = require('xss-clean');
//hpp to prevent parameter pollution in the http req query string
const hpp = require('hpp');
//http cookie parser
const cookieParser = require('cookie-parser');
const compression = require('compression');
//cors package to configure cross origin requests
const cors = require('cors');

//____________________________________________________________________________________________________________

/*****************************(2).REQUIRING THE FILES WHICH ARE SPECIFIC TO THE PROJECT **************************/

//AppError: custom error calss for throwing operational errors
const AppError = require('./utils/appError');
//globalErrorHandler: custom "global error handling" middleware
const globalErrorHandler = require('./controllers/errorController');
//Requiring routers for resources: tours and users
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

//____________________________________________________________________________________________________________

const app = express();

/***********************************(3).USING THE NECESSARY MIDDLEWARES ********************************************/

//Implement CORS (cross origin resource sharing) for allowing other websites to consume our api
app.use(cors({
  origin: [
    'https://natours-frontend.herokuapp.com',
    'http://localhost:3000',
    'http://192.168.29.106:3000'
  ],
  //credentials : true for allowing cookies 
  credentials: true
}));
//useful stuff about httpOnly cookie and cors configuration: 
//https://geekflare.com/enable-cors-httponly-cookie-secure-token/

//Serving the static files in the public folder. Example:  http://127.0.0.1:3000/overview.html
app.use(express.static(path.join(__dirname, 'public')));
// Set security HTTP headers
app.use(helmet());
// Development logging when the environment is set to development
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
// express.json() parser, for reading data from the body of the http request into req.body with a limit of 10 kb
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
// Data sanitization against NoSQL query injection
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss());
// Prevent html parameter pollution, allowing only genuine fields in the query
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
//to reduce response time
app.use(compression());

//____________________________________________________________________________________________________________//

/*********************************(4).Mounting the routers to their respective urls *********************************/

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

//Handling requests with invalid urls 
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//Whenever next() method is called with some args, globalErrorHandler will be called because express automatically recognise
//a function that takes (err,req,res,next) args, as an error handling middleware, which is exactly what globalErrorHandler is
app.use(globalErrorHandler);

module.exports = app;