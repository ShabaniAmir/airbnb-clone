const express = require("express");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
const {
  setTokenCookie,
  requireAuth,
  requireSpotOwnership,
} = require("../../utils/auth");
const {
  User,
  Spot,
  Review,
  Booking,
  SpotImage,
  ReviewImage,
} = require("../../../db/models");
const reviewsRouter = require("./reviews");
const bookingsRouter = require("./bookings");
const router = express.Router({ mergeParams: true });
const Sequelize = require("sequelize");

// Get All Bookings for a Spot By Id
// GET /api/spots/:id/bookings
router.get("/:id/bookings", async (req, res) => {
  const spotId = req.params.id;
  const spot = await Spot.findByPk(spotId);
  if (!spot) {
    return res.status(404).json({
      message: "Spot couldn't be found",
      statusCode: 404,
    });
  }

  const bookings = await Booking.findAll({
    where: { spotId },
    attributes: ["id", "startDate", "endDate"],
  });
  return res.json({ Bookings: bookings });
});

// Get all reviews for a spot
// GET /api/spots/:id/reviews
router.get("/:id/reviews", async (req, res) => {
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
    include: [
      { model: User, as: "User", attributes: ["id", "firstName", "lastName"] },
      {
        model: ReviewImage,
        as: "ReviewImages",
        attributes: ["id", "url"],
      },
    ],
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
router.post("/:id/reviews", [requireAuth, validateReview], async (req, res) => {
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

  const newReview = await Review.create({
    userId,
    spotId,
    review: req.body.review,
    stars: req.body.stars,
  });

  return res.json(newReview);
});

// Create a booking
// POST /api/spots/:id/bookings
router.post("/:id/bookings", requireAuth, async (req, res) => {
  const errors = [];
  const { user } = req;
  const spotId = req.params.id;
  const spot = await Spot.findByPk(spotId);
  if (!spot) {
    return res.status(404).json({
      message: "Spot couldn't be found",
      statusCode: 404,
    });
  }

  // Check if endDate is before startDate
  if (req.body.endDate < req.body.startDate) {
    return res.status(400).json({
      message: "Validation error",
      statusCode: 400,
      errors: ["endDate cannot be on or before startDate"],
    });
  }

  try {
    const booking = await Booking.create({
      userId: user.id,
      spotId,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
    });
    return res.json(booking);
  } catch (e) {
    // console.log(e.errors);
    for (let error of e.errors) {
      console.log(error);
      if (error.type === "unique violation") {
        if (error.path === "endDate" || error.path === "startDate") {
          errors.push("End date conflicts with an existing booking");
          errors.push("Start date conflicts with an existing booking");
        }
      }
    }
    return res.status(403).json({
      message: "Sorry, this spot is already booked for the specified dates",
      statusCode: 403,
      errors,
    });
  }
});

// Get all spots
// GET /api/spots
router.get("/", async (req, res) => {
  const { page, size } = req.query;

  const spots = await Spot.findAll({
    limit: size || 10,
    offset: page * size || 0,
  });

  return res.json({ Spots: spots, page, size });
});

// Get all spots owned by current user
// GET /api/spots/current
router.get("/current", requireAuth, async (req, res) => {
  const { user } = req;
  const spots = await Spot.findAll({
    where: {
      ownerId: user.id,
    },
    include: [
      {
        model: Review,
        as: "Reviews",
        attributes: ["id", "review", "stars"],
      },
    ],
    attributes: [
      [Sequelize.fn("AVG", Sequelize.col("reviews.stars")), "avgRating"],
    ],
  });
  return res.json({
    Spots: spots,
  });
});

// Get a single spot
// GET /api/spots/:id
router.get("/:id", async (req, res) => {
  const spot = await Spot.findByPk(req.params.id, {
    include: [
      {
        model: User,
        as: "Owner",
        attributes: ["id", "firstName", "lastName"],
      },
      {
        model: Review,
        as: "Reviews",
      },
      {
        model: SpotImage,
        as: "SpotImages",
        attributes: ["id", "url", "preview"],
      },
    ],
    attributes: [
      [Sequelize.fn("AVG", Sequelize.col("reviews.stars")), "avgStarRating"],
      [Sequelize.fn("COUNT", Sequelize.col("reviews.id")), "numReviews"],

      "id",
      "ownerId",
      "address",
      "city",
      "state",
      "country",
      "lat",
      "lng",
      "name",
      "description",
      "price",
      "createdAt",
      "updatedAt",
    ],
  });

  delete spot.dataValues["Reviews"];

  return res.json(spot);
});

// Create a spot
// POST /api/spots
const validateSpot = [
  check("name")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a name for the spot."),
  check("description")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a description for the spot."),
  check("price")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a price for the spot.")
    .isFloat({ min: 0 })
    .withMessage("Please provide a float value greater than 0 for the price."),
  check("lat")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a latitude for the spot.")
    .isFloat()
    .withMessage("Please provide a float value for the latitude."),
  check("lng")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a longitude for the spot.")
    .isFloat()
    .withMessage("Please provide a float value for the latitude."),
  check("address")
    .exists({ checkFalsy: true })
    .withMessage("Please provide an address for the spot."),
  check("city")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a city for the spot."),
  check("state")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a state for the spot."),
  check("country")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a country for the spot."),
  handleValidationErrors,
];
router.post("/", [requireAuth, validateSpot], async (req, res) => {
  const attributes = req.body;
  attributes.ownerId = req.user.id;
  const spot = await Spot.create(attributes);
  return res.json(spot);
});

// Create an Image for a Spot
// POST /api/spots/:id/images
const validateSpotImage = [
  check("url")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a url for the image."),
  handleValidationErrors,
];
router.post(
  "/:id/images",
  [handleValidationErrors, requireAuth],
  async (req, res) => {
    const { user } = req;
    const spot = await Spot.findByPk(req.params.id);
    if (!spot) {
      return res.status(404).json({
        message: "Spot couldn't be found",
        statusCode: 404,
      });
    }
    if (spot.ownerId !== user.id) {
      return res.status(403).json({
        message: "Forbidden",
        statusCode: 403,
      });
    }

    const image = await SpotImage.create({
      spotId: spot.id,
      url: req.body.url,
    });
    return res.json(image);
  }
);

// Delete image from a spot
// DELETE /api/spots/:id/images/:imageId
// TODO: Implement

// Update a spot
// PUT /api/spots/:id
router.put(
  "/:id",
  [requireAuth, requireSpotOwnership, validateSpot],
  async (req, res) => {
    const spot = await Spot.findByPk(req.params.id);
    const attributes = req.body;
    await spot.update(attributes);
    return res.json(spot);
  }
);

// Delete a spot
// DELETE /api/spots/:id
router.delete("/:id", [requireAuth, requireSpotOwnership], async (req, res) => {
  const spot = await Spot.findByPk(req.params.id);
  if (!spot) {
    return res.status(404).json({
      message: "Spot couldn't be found",
      statusCode: 404,
    });
  }
  await spot.destroy();
  return res.json({
    message: "Successfully deleted",
    statusCode: 200,
  });
});

// Get all spots based on filter
// GET /api/spots/filter
// TODO: Implement

module.exports = router;
