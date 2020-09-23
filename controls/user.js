const _ = require("lodash");
const formidable = require("formidable");
const fs = require("fs");
const User = require("../models/user");

exports.hasAuthorization = (req, res, next) => {
    const authorized =
        req.profile && req.auth && req.profile._id.equals(req.auth._id);

    if (!authorized) {
        res.status(400);
        return res.json({
            error: "User not authorized to perform this action.",
        });
    }
    next();
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json(
            users.map((u) => {
                return u.info();
            })
        );
    } catch (err) {
        res.status(500);
        res.json({ error: err });
    }
};

exports.getUser = async (req, res) => {
    return res.json({ user: req.profile.info(), success: true });
};

exports.getRecommendations = async (req, res) => {
    let excluded = req.profile.following.map((x) => x._id);
    excluded.push(req.profile._id);

    try {
        const users = await User.find({ _id: { $nin: excluded } }).select(
            "_id name email"
        );
        console.log(users);
        res.json(users);
    } catch (err) {
        res.status(400);
        res.json({ error: err });
    }
};

exports.getImage = (req, res, next) => {
    if (req.profile.photo.data) {
        res.set("Content-Type", req.profile.photo.contentType);
        return res.send(req.profile.photo.data);
    }
    next();
};

exports.updateProfile = async (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: "Photo could not be uploaded",
            });
        }

        let user = req.profile;
        user = _.extend(user, fields);

        if (files.photo) {
            user.photo.data = fs.readFileSync(files.photo.path);
            user.photo.contentType = files.photo.type;
        }

        try {
            const updatedUser = await user.save();
            res.send({ user: updatedUser.info(), success: true });
        } catch (err) {
            res.status(500);
            res.json({ error: err });
        }
    });
};

exports.addFollowing = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.body.userId, {
            $push: { following: req.body.followId },
        });
        next();
    } catch (err) {
        res.status(400);
        res.json({ error: err });
    }
};

exports.addFollower = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.body.followId,
            {
                $push: { followers: req.body.userId },
            },
            { new: true }
        )
            .populate("following", "_id name")
            .populate("followers", "_id name");
        res.json({ user: user.info(), success: true });
    } catch (err) {
        res.status(400);
        res.json({ error: err });
    }
};

exports.removeFollowing = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(req.body.userId, {
            $pull: { following: req.body.unfollowId },
        });
        next();
    } catch (err) {
        res.status(400);
        console.log(err);
        res.json({ error: err });
    }
};

exports.removeFollower = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.body.unfollowId,
            {
                $pull: { followers: req.body.userId },
            },
            { new: true }
        )
            .populate("following", "_id name")
            .populate("followers", "_id name");
        res.json({ user: user.info(), success: true });
    } catch (err) {
        res.status(400);
        console.log(err);
        res.json({ error: err });
    }
};

exports.deleteProfile = async (req, res) => {
    try {
        const deletedUser = await req.profile.remove();

        if (!deletedUser) {
            res.status(404);
            return res.json({ error: "No user found with that id." });
        }

        res.clearCookie("jwt");
        res.json({
            message: "User has been deleted.",
            user: deletedUser.info(),
            success: true,
        });
    } catch (err) {
        res.status(500);
        res.json({ error: err });
    }
};
