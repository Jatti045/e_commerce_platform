const {
  registerUser,
  loginUser,
  logoutUser,
  checkAuth,
  googleAuthCallback,
} = require("../controllers/auth-controller");
const express = require("express");
const passport = require("passport");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// Google OAuth endpoints:
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/" }),
  googleAuthCallback
);

router.post("/logout", logoutUser);
router.get("/check-auth", checkAuth);

module.exports = router;
