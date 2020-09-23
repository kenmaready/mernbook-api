const _ = require("lodash");
const formidable = require("formidable");
const fs = require("fs");
const Post = require("../models/post");

exports.getPosts = async (req, res) => {
    Post.find({})
        .populate("owner", "name")
        .populate("comments", "text createdAt")
        .populate("comments.owner", "name")
        .select("_id title body createdAt updatedAt likes")
        .sort({ createdAt: -1 })
        .then((posts) => {
            res.send({ posts, success: true });
        })
        .catch((err) => {
            res.status(500);
            res.json({ error: err });
        });
};

exports.getPostsByUser = async (req, res) => {
    try {
        const posts = await Post.find({ owner: req.profile._id })
            .populate("owner", "name")
            .populate("comments", "text createdAt")
            .populate("comments.owner", "name")
            .select("_id title body createdAt updatedAt likes")
            .sort({ createdAt: -1 });

        return res.json({ posts, success: true });
    } catch (err) {
        res.status(500);
        return res.json({ error: err });
    }
};

exports.getPost = (req, res) => {
    if (req.post) {
        return res.json({ post: req.post, success: true });
    } else res.json({ error: "Unable to locate post." });
};

exports.getImage = async (req, res, next) => {
    if (req.post.photo.data) {
        res.set("Content-Type", req.post.photo.contentType);
        return res.send(req.post.photo.data);
    }
    next();
};

exports.createPost = (req, res, next) => {
    if (!req.profile._id.equals(req.auth._id)) {
        res.status(401);
        return res.json({
            message:
                "User is not authorized to create a post for another user.",
        });
    }

    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {
        if (err) {
            res.status(400);
            return res.json({ error: "Image could not be uploaded." });
        }

        let post = new Post(fields);
        post.owner = req.profile._id;

        if (files.photo) {
            post.photo.data = fs.readFileSync(files.photo.path);
            post.photo.contentType = files.photo.type;
        }

        post.save((err, results) => {
            if (err) {
                res.status(400);
                return res.json({ error: err });
            }
            res.json({ post: results, success: true });
        });
    });
};

exports.isOwner = (req, res, next) => {
    const isOwner =
        req.post && req.auth && req.post.owner._id.equals(req.auth._id);
    console.log("isOwner():", isOwner);
    if (!isOwner) {
        res.status(401);
        return res.json({
            error: "User not authorized to modify or delete this post.",
        });
    }

    next();
};

exports.updatePost = async (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: "Photo could not be uploaded",
            });
        }

        let post = req.post;
        post = _.extend(post, fields);

        if (files.photo) {
            post.photo.data = fs.readFileSync(files.photo.path);
            post.photo.contentType = files.photo.type;
        }

        try {
            const updatedPost = await post.save();
            res.send({ post: updatedPost, success: true });
        } catch (err) {
            res.status(500);
            res.json({ error: err });
        }
    });
};

exports.likePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.body.postId,
            {
                $push: { likes: req.body.userId },
            },
            { new: true }
        );

        res.json({ post, success: true });
    } catch (err) {
        res.status(500);
        res.json({ error: err });
    }
};

exports.unlikePost = async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.body.postId,
            {
                $pull: { likes: req.body.userId },
            },
            { new: true }
        );

        res.json({ post, success: true });
    } catch (err) {
        res.status(500);
        res.json({ error: err });
    }
};

exports.addComment = async (req, res) => {
    let comment = req.body.comment;
    comment.owner = req.body.userId;

    try {
        const post = await Post.findByIdAndUpdate(
            req.body.postId,
            {
                $push: { comments: comment },
            },
            { new: true }
        )
            .populate("comments.owner", "name")
            .populate("owner", "name");

        res.json({ post, success: true });
    } catch (err) {
        res.status(500);
        res.json({ error: err });
    }
};

exports.removeComment = async (req, res) => {
    let comment = req.body.comment;

    try {
        const post = await Post.findByIdAndUpdate(
            req.body.postId,
            {
                $pull: { comments: { _id: comment._id } },
            },
            { new: true }
        )
            .populate("comments.owner", "name")
            .populate("owner", "name");

        res.json({ post, success: true });
    } catch (err) {
        res.status(500);
        res.json({ error: err });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const deletedPost = await req.post.remove();

        res.json({
            message: "Post has been deleted",
            success: true,
        });
    } catch (err) {
        res.status(500);
        res.json({ error: err });
    }
};
