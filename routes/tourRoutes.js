const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

//Creating a new express router for /api/v1/tours
const router = express.Router();

/*************************Miscellaneous Routes********************************/

//1) Redirecting requests related to reviews to review router
router.use('/:tourId/reviews', reviewRouter);

//2) Returning top 5 tours
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

//3) Statistics of the current tours in the DB
router.route('/tour-stats').get(tourController.getTourStats);

//4) Monthly plan for business owners
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

//5) Routes within a given distance from a center
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);

//6) Distance of all tours from a center
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

/*************************************************************************************/

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    //allowing only admin and lead-guide to create new tours
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    //allowing only admin and lead-guide to edit tours
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    //allowing only admin and lead-guide to delete tours
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
