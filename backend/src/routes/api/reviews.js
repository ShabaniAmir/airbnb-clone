const express = require("express");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
const { setTokenCookie, requireAuth } = require("../../utils/auth");
const { User } = require("../../../db/models");

const router = express.Router({ mergeParams: true });

// Get all reviews for a spot
// GET /api/spots/:id/reviews
// TODO: Implement

// Create a review for a spot
// POST /api/spots/:id/reviews
// TODO: implemenet

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
