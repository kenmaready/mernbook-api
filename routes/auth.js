const express = require("express");
const controls = require("../controls");
const {
    userSignupValidator,
    passwordResetValidator,
} = require("../validators");

const router = express.Router();

router.post("/signup", userSignupValidator, controls.auth.signup);
router.post("/login", controls.auth.login);
router.get("/logout", controls.auth.logout);
router.patch("/forgotpassword", controls.auth.forgotPassword);
router.patch("/resetpassword", controls.auth.resetPassword);
router.post("/social-login", controls.auth.socialLogin);

// any route containing :userId will trigger this middleware
router.param("userId", controls.middle.addUserProfileToRequest);

module.exports = router;
