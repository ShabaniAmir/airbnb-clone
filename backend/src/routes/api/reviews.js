const express = require("express");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
const {
  setTokenCookie,
  requireAuth,
  requireReviewOwnership,
} = require("../../utils/auth");
const { User, Spot, Review } = require("../../../db/models");

const router = express.Router({ mergeParams: true });

// Get all reviews for a spot
// GET /api/spots/:id/reviews
// TODO: Implement

// Create a review for a spot
// POST /api/spots/:id/reviews
const validateReview = [
  check("review")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a review."),
  check("stars")
    .exists({ checkFalsy: true })
    .isInt({ min: 1, max: 5 })
    .withMessage("Please provide a number of stars between 1 and 5."),
  handleValidationErrors,
];
router.post("/", [requireAuth, validateReview], async (req, res) => {
  const userId = req.user.id;
  const spotId = req.params.id;

  const spot = await Spot.findByPk(spotId);
  if (!spot) {
    return res.status(404).json({
      message: "Spot couldn't be found",
      statusCode: 404,
    });
  }

  const review = await Review.findOne({ where: { userId, spotId } });
  if (review) {
    return res.status(403).json({
      message: "User already has a review for this spot",
      statusCode: 403,
    });
  }

  const newReview = await Review.create({ ...req.body, userId, spotId });

  return res.status(201).json({ newReview });
});

// Delete a review for a spot
// DELETE /api/spots/:id/reviews/:reviewId
// TODO: implemenet

// Add an image to a review
// POST /api/spots/:id/reviews/:reviewId/images
// TODO: implemenet

// Update a review
// PUT /api/spots/:id/reviews/:reviewId
// TODO: implemenet

// Delete an image from a review
// DELETE /api/spots/:id/reviews/:reviewId/images/:imageId
// TODO: implemenet

module.exports = router;
