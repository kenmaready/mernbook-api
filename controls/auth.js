const expressJwt = require("express-jwt");
const jwt = require("jsonwebtoken");
const _ = require("lodash");
const User = require("../models/user");
const { sendEmail } = require("../utils/email");
require("dotenv").config();

exports.generateToken = (user) => {
    const token = jwt.sign(
        { _id: user._id, role: user.role },
        process.env.JWT_SECRET
    );
    // console.log(token);
    return token;

    // persist the token in  cookie with expiry date
};

exports.signup = async (req, res) => {
    var { name, email, password } = req.body;
    email = email.toLowerCase();
    const userExists = await User.findOne({
        email,
    });

    if (userExists) {
        return res
            .status(409)
            .json({ error: "A user with that email address already exists." });
    }

    try {
        const user = await new User({ name, email, password });
        await user.save();

        const token = this.generateToken(user);
        res.cookie("jwt", token, { expire: Date.now() + 720000 });
        res.status(201);
        return res.json({
            user: user.info(),
            token,
            success: true,
        });
    } catch (err) {
        res.status(500);
        res.json({ error: err });
    }
};

exports.login = async (req, res) => {
    var { email, password } = req.body;
    email = email.toLowerCase();

    try {
        // try to find user by email
        const user = await User.findOne({
            email,
        });

        if (!user) {
            res.status(404);
            return res.json({ error: "No user found with that email." });
        }

        // authenticate password
        if (!user.authenticate(password)) {
            res.status(401);
            return res.json({ error: "Invalid login credentials." });
        }

        // return response with user and token to front end
        const token = this.generateToken(user);
        res.cookie("jwt", token, { expire: Date.now() + 720000 });
        return res.json({ user: user.info(), token, success: true });
    } catch (err) {
        res.status(500);
        res.json({ error: err });
    }
};

exports.socialLogin = async (req, res) => {
    try {
        let user = await User.findOne({ email: req.body.email });

        if (!user) {
            user = new User(req.body);
            req.profile = user;
            await user.save();
        } else {
            req.profile = user;
            user = _.extend(user, req.body);
            await user.save();
        }

        const token = this.generateToken(user);
        res.cookie("jwt", token, { expire: Date.now() + 720000 });
        res.json({ user: user.info(), token, success: true });
    } catch (err) {
        res.status(400);
        res.json({ message: err });
    }
};

exports.logout = async (req, res) => {
    res.clearCookie("jwt");
    return res.json({ message: "User signed out." });
};

exports.requireLogin = expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"],
    // if the toekn is valid, then append verified user's id
    // to an auth key in user object:
    userProperty: "auth",
});

exports.forgotPassword = async (req, res) => {
    if (!req.body) return res.status(400).json({ error: "No request body." });
    if (!req.body.email)
        return res.status(400).json({ error: "No valid email in request." });

    const { email } = req.body;

    try {
        // fimd user
        const user = await User.findOne({ email });
        if (!user) {
            return res
                .status(404)
                .json({ message: "No account found with that email." });
        }

        console.log("found user:", user.name, user._id);
        // generate a jwt
        const token = this.generateToken(user);
        console.log("generated token:", token);

        // email data to user
        const emailData = {
            from: "noreply@gibble.co",
            to: email,
            subject: "Reset Your Gibble Password",
            text: `Please use the following link to reset your password: ${process.env.CLIENT_URL}/reset/${token}`,
            html: `<p>Please use the following link to reset your password:</p> <p>${process.env.CLIENT_URL}/reset/${token}</p>`,
        };

        const updatedUser = await User.updateOne({ resetPasswordLink: token });
        sendEmail(emailData);
        return res.status(200).json({
            message: `Reset link has been sent to ${email}. Follow the instructions to reset your password.`,
        });
    } catch (err) {
        return res.status(401).json({ error: err });
    }
};

exports.resetPassword = async (req, res) => {
    const { resetPasswordLink, newPassword } = req.body;

    try {
        let user = await User.findOne({ resetPasswordLink });
        if (!user) {
            res.status(401);
            return res.json({ message: "Invalid password reset link." });
        }

        const updatedFields = {
            password: newPassword,
            resetPasswordLink: "",
        };

        user = _.extend(user, updatedFields);

        await user.save();
        res.json({
            message:
                "Your password has been reset. You may now login with your new password.",
        });
    } catch (err) {
        res.status(400);
        res.json({ error: err });
    }
};
