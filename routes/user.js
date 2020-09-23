const express = require("express");
const controls = require("../controls");
const { profileUpdateValidator } = require("../validators");

const router = express.Router();

router.get("/users", controls.auth.requireLogin, controls.user.getUsers);
router.get("/user/:userId", controls.auth.requireLogin, controls.user.getUser);
router.get(
    "/user/recommended/:userId",
    controls.auth.requireLogin,
    controls.user.getRecommendations
);
router.get(
    "/user/photo/:userId",
    //controls.auth.requireLogin,
    controls.user.getImage
);
router.patch(
    "/user/:userId",
    controls.auth.requireLogin,
    controls.user.hasAuthorization,
    profileUpdateValidator,
    controls.user.updateProfile
);
router.put(
    "/user/follow",
    controls.auth.requireLogin,
    controls.user.addFollowing,
    controls.user.addFollower
);
router.put(
    "/user/unfollow",
    controls.auth.requireLogin,
    controls.user.removeFollowing,
    controls.user.removeFollower
);
router.delete(
    "/user/:userId",
    controls.auth.requireLogin,
    controls.user.hasAuthorization,
    controls.user.deleteProfile
);

router.param("userId", controls.middle.addUserProfileToRequest);

module.exports = router;
