const nodeMailer = require("nodemailer");
const { getMaxListeners } = require("../models/user");
require("dotenv").config();

const defaultEmailData = { from: "noreply@gibble.me" };

exports.sendEmail = (emailData) => {
    const transporter = nodeMailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: "kenmaready@gmail.com",
            pass: process.env.GOOGLE_EMAIL_PW,
        },
    });
    return transporter
        .sendMail(emailData)
        .then((info) =>
            console.log(`Reset password email sent: ${info.response}`)
        )
        .catch((err) =>
            console.log(`Problem sending reset password email: ${err}`)
        );
};
