const crypto = require("crypto");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
const { v4: uuidv4 } = require("uuid");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: "User name is required",
            trim: true,
            minLength: 1,
            maxlength: 32,
        },
        email: {
            type: String,
            required: "Email is required",
            trim: true,
            unique: true,
            minLength: 4,
            maxlength: 96,
        },
        about: { type: String, trim: true },
        encrypted_password: {
            type: String,
            required: "Password is required",
        },
        salt: String,
        photo: {
            data: Buffer,
            contentType: String,
        },
        following: [{ type: ObjectId, ref: "User" }],
        followers: [{ type: ObjectId, ref: "User" }],
        role: { type: String, default: "subscriber" },
        resetPasswordLink: { data: String, default: "" },
    },
    { timestamps: true }
);

// virtual field:
userSchema
    .virtual("password")
    .set(function (password) {
        this._password = password;
        // generate a timestamp
        this.salt = uuidv4();
        // encrypt password
        this.encrypted_password = this.encryptPassword(password);
    })
    .get(function () {
        return this._password;
    });

// document methods:
userSchema.methods = {
    authenticate: function (plainText) {
        return this.encryptPassword(plainText) === this.encrypted_password;
    },
    encryptPassword: function (password) {
        if (!password) return "";
        try {
            return crypto
                .createHmac("sha1", this.salt)
                .update(password)
                .digest("hex");
        } catch (err) {
            return "";
        }
    },
    info: function () {
        return {
            name: this.name,
            email: this.email,
            about: this.about,
            followers: this.followers,
            following: this.following,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            role: this.role,
            _id: this._id,
        };
    },
};

// static (collection) methods:
userSchema.statics = {
    sanitize: (user) => {
        user.encryptPassword = null;
        user.salt = null;
        return user;
    },
};

module.exports = mongoose.model("User", userSchema);
