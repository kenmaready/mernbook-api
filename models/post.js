const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: "Title is required",
            trim: true,
            minLength: 4,
            maxlength: 150,
        },
        body: {
            type: String,
            required: "Body is required",
            trim: true,
            minLength: 4,
            maxlength: 2000,
        },
        photo: {
            data: Buffer,
            contentType: String,
        },
        owner: {
            type: ObjectId,
            ref: "User",
        },
        likes: [{ type: ObjectId, ref: "User " }],
        comments: [
            {
                text: String,
                createdAt: { type: Date, default: Date.now() },
                owner: { type: ObjectId, ref: "User" },
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
