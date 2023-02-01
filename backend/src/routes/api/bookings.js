const express = require("express");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
const { setTokenCookie, requireAuth } = require("../../utils/auth");
const { User } = require("../../../db/models");

const router = express.Router({ mergeParams: true });

// Create a booking
// POST /api/spots/:id/bookings
// TODO: Implement

// Update a booking
// PUT /api/spots/:id/bookings/:bookingId
// TODO: Implement

// Delete a booking
// DELETE /api/spots/:id/bookings/:bookingId
// TODO: Implement

module.exports = router;
