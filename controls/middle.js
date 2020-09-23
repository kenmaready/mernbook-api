const User = require("../models/user");
const Post = require("../models/post");

exports.addUserProfileToRequest = async (req, res, next, id) => {
    console.log("controls/middle.js/addUserProfileToRequest()...");
    try {
        const user = await User.findById(id)
            .populate("followers", "_id name")
            .populate("following", "_id name");
        if (!user) {
            res.status(404);
            return res.json({ error: "No user found with that id." });
        }

        req.profile = user;
        next();
    } catch (err) {
        res.status(500);
        return res.json({ error: err });
    }
};

exports.addPostInfoToRequest = async (req, res, next, id) => {
    try {
        const post = await Post.findById(id)
            .populate("owner", "name")
            .populate("comments", "text createdAt")
            .populate("comments.owner", "name");
        if (!post) {
            res.status(404);
            return res.json({ error: "No post found with that id." });
        }
        console.log("adding post to req...");
        req.post = post;
        next();
    } catch (err) {
        res.status(500);
        res.json({ error: err });
    }
};
