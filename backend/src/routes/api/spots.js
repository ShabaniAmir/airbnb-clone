const express = require("express");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
const { setTokenCookie, requireAuth } = require("../../utils/auth");
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
// TODO: Implement

// Create a spot
// POST /api/spots
// TODO: Implement

// Add image to a spot
// POST /api/spots/:id/images
// TODO: Implement

// Delete image from a spot
// DELETE /api/spots/:id/images/:imageId
// TODO: Implement

// Update a spot
// PUT /api/spots/:id
// TODO: Implement

// Delete a spot
// DELETE /api/spots/:id
// TODO: Implement

// Get all spots based on filter
// GET /api/spots/filter
// TODO: Implement

module.exports = router;
