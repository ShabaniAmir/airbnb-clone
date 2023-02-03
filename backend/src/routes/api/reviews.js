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
router.get("/", async (req, res) => {
  const spotId = req.params.id;
  const spot = await Spot.findByPk(spotId);
  if (!spot) {
    return res.status(404).json({
      message: "Spot couldn't be found",
      statusCode: 404,
    });
  }
  const reviews = await Review.findAll({
    where: { spotId },
    include: User,
  });
  return res.json({ Reviews: reviews });
});

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
router.delete(
  "/:reviewId",
  [requireAuth, requireReviewOwnership],
  async (req, res) => {
    const reviewId = req.params.reviewId;
    const review = await Review.findByPk(reviewId);
    await review.destroy();
    return res.json({ review });
  }
);

// Add an image to a review
// POST /api/spots/:id/reviews/:reviewId/images
// TODO: implemenet

// Update a review
// PUT /api/spots/:id/reviews/:reviewId
router.put(
  "/:reviewId",
  [requireAuth, requireReviewOwnership, validateReview],
  async (req, res) => {
    const reviewId = req.params.reviewId;
    const review = await Review.findByPk(reviewId);
    await review.update(req.body);
    return res.json({ review });
  }
);

// Delete an image from a review
// DELETE /api/spots/:id/reviews/:reviewId/images/:imageId
// TODO: implemenet

module.exports = router;
