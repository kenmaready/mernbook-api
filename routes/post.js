const express = require("express");
const controls = require("../controls");
const { createPostValidator } = require("../validators");

const router = express.Router();

router.get("/posts", controls.auth.requireLogin, controls.post.getPosts);
router.get(
    "/posts/:userId",
    controls.auth.requireLogin,
    controls.post.getPostsByUser
);
router.get("/post/:postId", controls.auth.requireLogin, controls.post.getPost);
router.get(
    "/posts/image/:postId",
    // controls.auth.requireLogin,
    controls.post.getImage
);
router.post(
    "/posts/:userId",
    controls.auth.requireLogin,
    controls.post.createPost,
    createPostValidator
);
router.patch("/posts/like", controls.auth.requireLogin, controls.post.likePost);
router.patch(
    "/posts/unlike",
    controls.auth.requireLogin,
    controls.post.unlikePost
);
router.patch(
    "/posts/comment",
    controls.auth.requireLogin,
    controls.post.addComment
);
router.patch(
    "/posts/uncomment",
    controls.auth.requireLogin,
    controls.post.removeComment
);
router.patch(
    "/posts/:postId",
    controls.auth.requireLogin,
    controls.post.isOwner,
    controls.post.updatePost
);
router.delete(
    "/posts/:postId",
    controls.auth.requireLogin,
    controls.post.isOwner,
    controls.post.deletePost
);

// any route containing :userId will trigger this middleware
router.param("userId", controls.middle.addUserProfileToRequest);
router.param("postId", controls.middle.addPostInfoToRequest);

module.exports = router;
