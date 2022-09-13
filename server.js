//requiring mongoose for using mongoDB database efficiently
const mongoose = require('mongoose');
const dotenv = require('dotenv');

//HANDLING UNCAUGHT EXCEPTIONS USING EVENT LISTENER
process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

//linking config.env to our app using dotenv module for setting values of node environment variables
dotenv.config({ path: './config.env' });

const app = require('./app');

//connecting to the database
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    //added this attribute due to a warning in the terminal
    useUnifiedTopology: true
  })
  .then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 5000;

//INITIALISING SERVER
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

//HANDLING UNHANDLED PROMISE REJECTIONS
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

//LISTENING HEROKU SIGTERM EVENT
process.on('SIGTERM', () => {
  console.log('SIGTERM recieved! 💥 Shutting down...');
  server.close(() => {
    console.log('Process Terminated')
  });
});
