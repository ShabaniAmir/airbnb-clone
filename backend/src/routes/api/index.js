const router = require("express").Router();
const sessionRouter = require("./session.js");
const usersRouter = require("./users.js");
const spotsRouter = require("./spots.js");
const reviewsRouter = require("./reviews.js");
const bookingsRouter = require("./bookings.js");
const {
  User,
  Spot,
  Review,
  Booking,
  SpotImage,
  ReviewImage,
} = require("../../../db/models");
const { restoreUser } = require("../../utils/auth.js");

// Connect restoreUser middleware to the API router
// If current user session is valid, set req.user to the user in the database
// If current user session is not valid, set req.user to null
router.use(restoreUser);

router.use("/session", sessionRouter);

router.use("/users", usersRouter);

router.use("/spots", spotsRouter);

router.use("/reviews", reviewsRouter);

router.use("/bookings", bookingsRouter);

router.post("/test", (req, res) => {
  res.json({ requestBody: req.body });
});

router.delete("/spot-images/:id", (req, res) => {
  const id = req.params.id;
  try {
    SpotImage.destroy({ where: { id } });
    res.json({ message: "Spot image deleted", statusCode: 200 });
  } catch (e) {
    res.json({ message: "Spot image not deleted", statusCode: 400 });
  }
});

router.delete("/review-images/:id", (req, res) => {
  const id = req.params.id;
  try {
    ReviewImage.destroy({ where: { id } });
    res.json({ message: "Spot image deleted", statusCode: 200 });
  } catch (e) {
    res.json({ message: "Spot image not deleted", statusCode: 400 });
  }
});

module.exports = router;
