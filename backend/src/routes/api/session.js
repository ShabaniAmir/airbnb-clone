const express = require("express");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");
const { setTokenCookie, restoreUser } = require("../../utils/auth");
const { User } = require("../../../db/models");
const { requireAuth } = require("../../utils/auth");

const router = express.Router();

const validateLogin = [
  check("credential")
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage("Please provide a valid email or username."),
  check("password")
    .exists({ checkFalsy: true })
    .withMessage("Please provide a password."),
  handleValidationErrors,
];

// Log in
router.post("/", validateLogin, async (req, res, next) => {
  const { credential, password } = req.body;

  const user = await User.login({ credential, password });

  if (!user) {
    return res.status(401).json({
      message: "Invalid credentials",
      statusCode: 401,
    });
  }

  const token = await setTokenCookie(res, user);
  user.dataValues["token"] = token;

  return res.json({
    user: { ...user.dataValues },
  });
});

// Get current user
router.get("/", requireAuth, async (req, res) => {
  const { user } = req;
  const userRecord = await User.findByPk(user.id);
  // TODO: remove unwanted fields from user object
  return res.json({
    user: userRecord,
  });
});

// Log out
router.delete("/", (_req, res) => {
  res.clearCookie("token");
  return res.json({ message: "success" });
});

// Restore session user
router.get("/", restoreUser, (req, res) => {
  const { user } = req;
  if (user) {
    return res.json({
      user: user.toSafeObject(),
    });
  } else return res.json({ user: null });
});

module.exports = router;
