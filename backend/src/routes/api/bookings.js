const express = require("express");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
const { setTokenCookie, requireAuth } = require("../../utils/auth");
const { User, Booking, Spot } = require("../../../db/models");

const router = express.Router({ mergeParams: true });

// Get All Current User's Bookings
// GET /api/bookings/current
router.get("/current", requireAuth, async (req, res) => {
  const { user } = req;
  const bookings = await Booking.findAll({
    where: { userId: user.id },
    include: {
      model: Spot,
      as: "Spot",
    },
  });
  return res.json({ Bookings: bookings });
});

// Update a booking
// PUT /api/bookings/:id
router.put("/:id", requireAuth, async (req, res) => {
  const { user } = req;
  const bookingId = req.params.id;
  const booking = await Booking.findByPk(bookingId);
  if (!booking) {
    return res.status(404).json({
      message: "Booking couldn't be found",
      statusCode: 404,
    });
  }
  if (booking.userId !== user.id) {
    return res.status(403).json({
      message: "You don't have permission to update this booking",
      statusCode: 403,
    });
  }
  const { startDate, endDate } = req.body;
  // Check if endDate is before startDate
  if (req.body.endDate < req.body.startDate) {
    return res.status(400).json({
      message: "Validation error",
      statusCode: 400,
      errors: ["endDate cannot be on or before startDate"],
    });
  }

  try {
    const updatedBooking = await booking.update({
      startDate,
      endDate,
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

// Delete a booking
// DELETE /api/bookings/:id
router.delete("/:id", requireAuth, async (req, res) => {
  const { user } = req;
  const bookingId = req.params.id;
  const booking = await Booking.findByPk(bookingId);
  if (!booking) {
    return res.status(404).json({
      message: "Booking couldn't be found",
      statusCode: 404,
    });
  }
  if (booking.userId !== user.id) {
    return res.status(403).json({
      message: "You don't have permission to delete this booking",
      statusCode: 403,
    });
  }
  // Make sure booking hasn't already started
  if (booking.startDate < new Date()) {
    return res.status(403).json({
      message: "Bookings that have been started can't be deleted",
      statusCode: 403,
    });
  }

  await booking.destroy();
  return res.json({ message: "Successfully deleted" });
});

module.exports = router;
