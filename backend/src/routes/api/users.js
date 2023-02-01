const express = require("express");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
const { setTokenCookie, requireAuth } = require("../../utils/auth");
const { User } = require("../../../db/models");

const router = express.Router({ mergeParams: true });

const validateSignup = [
  check("email")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a valid email."),
  check("firstName")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a firstName."),
  check("lastName")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a lastName."),

  check("username")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a username."),

  check("password")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a password."),
  handleValidationErrors,
];
// Sign up
// POST /api/users
router.post("/", validateSignup, async (req, res) => {
  const { email, password, username, firstName, lastName } = req.body;
  console.log({ email, password, username, firstName, lastName });
  const user = await User.signup({
    email,
    username,
    password,
    firstName,
    lastName,
  });

  await setTokenCookie(res, user);

  return res.json({
    user: user,
  });
});

// Get current user
// GET /api/users
router.get("/", requireAuth, async (req, res) => {
  const { user } = req;
  // TODO: remove unwanted fields from user object
  return res.json({
    user,
  });
});

// Login user
// POST /api/users/login
// TODO: Implement

// Logout user
// POST /api/users/logout
// TODO: Implement

// Get all spots owned by current user
// GET /api/users/spots
// TODO: Implement

// Get all reviews written by current user
// GET /api/users/reviews
// TODO: Implement

// Get all bookings made by current user
// GET /api/users/bookings
// TODO: Implement
module.exports = router;
