const express = require("express");
const { check, body } = require("express-validator");

const authController = require("../controllers/auth");
const User = require("../models/user");

const router = express.Router();

router.get("/login", authController.getLoginPage);
router.post(
  "/login",
  check("email")
    .isEmail()
    .withMessage("Please enter a valid email")
    .normalizeEmail(),
  authController.postLogin
);

router.post("/logout", authController.postLogout);

router.get("/signup", authController.getSignupPage);
router.post(
  "/signup",
  [
    body("username")
      .isLength({ max: 10 })
      .withMessage("Username is too long")
      .custom((value, { req }) => {
        return User.findOne({ username: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Username exists already");
          }
        });
      }),
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email exists already");
          }
        });
      })
      .normalizeEmail(),
    body("password", "Password must be at least 5 characters long")
      .isLength({
        min: 5,
      })
      .trim(),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords have to match!");
        }
        return true;
      }),
  ],
  authController.postSignup
);

router.get("/reset", authController.getResetPage);
router.post("/reset", authController.postReset);
router.get("/reset/:token", authController.getNewPasswordPage);
router.post(
  "/newPassword",
  [
    body("password", "Password must be at least 5 characters long")
      .isLength({
        min: 5,
      })
      .trim(),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords have to match!");
        }
        return true;
      }),
  ],
  authController.postNewPassword
);

module.exports = router;
