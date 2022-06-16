const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

//creating a new express router for /api/v1/reviews & /api/v1/tours/:tourId/reviews
const router = express.Router({ mergeParams: true });

//Protecting all routes related to reviews
router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'), //restricting roles other than user from writing reviews
    reviewController.setTourUserIds, //setting the tour and user ids for this review
    reviewController.createReview //creating the actual review
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  );

module.exports = router;
