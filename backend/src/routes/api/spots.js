const express = require("express");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
const {
  setTokenCookie,
  requireAuth,
  requireSpotOwnership,
} = require("../../utils/auth");
const { User, Spot } = require("../../../db/models");
const reviewsRouter = require("./reviews");
const bookingsRouter = require("./bookings");
const router = express.Router({ mergeParams: true });

router.use("/:id/reviews", reviewsRouter);
router.use("/:id/bookings", bookingsRouter);

// Get all spots
// GET /api/spots
router.get("/", async (req, res) => {
  const spots = await Spot.findAll();
  return res.json(spots);
});

// Get a single spot
// GET /api/spots/:id
router.get("/:id", async (req, res) => {
  const spot = await Spot.findByPk(req.params.id);
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

// Add image to a spot
// POST /api/spots/:id/images
// TODO: Implement

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
