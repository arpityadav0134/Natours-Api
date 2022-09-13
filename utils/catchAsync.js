//catchAsync takes an async function "fn" as an arguement and returns a function that takes (req,res,next) as arguements,
//and inside itself, it executes the promise returned by "fn", the async function which it recieved as an arguement. Also
//it catches if there will be any error, and call the next() method with that error as an arguement, which will then call
//our global error handling middleware
//DETAILS EXPLAINED IN THE VIDEO NUMBER 115 INSIDE FOLDER NUMBER 09 OF THE UDEMY COURSE

module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); //will work same as below line
    // fn(req, res, next).catch(err => next(err));
  };
};
