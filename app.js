const cors = require("cors");
const cookieParser = require("cookie-parser");
const express = require("express");
const fs = require("fs");
const middleware = require("./utils/middleware");
const morgan = require("morgan");
const validator = require("express-validator");
const postRouter = require("./routes/post");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const db = require("./db");

const port = process.env.PORT || 8080;

// set up express server
const app = express();

// middleware"
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(validator());
app.use(cors());
app.use("/", postRouter);
app.use("/", authRouter);
app.use("/", userRouter);
app.use(middleware.unauthErrorMessage);

app.get("/", (req, res) => {
    console.log("get has been called to '/'...");
    const file = fs.readFile("docs/apiDocs.json", (err, data) => {
        if (err) {
            res.status(400);
            return res.json({ error: err });
        }
        res.json(JSON.parse(data));
    });
    console.log(file);
});

app.listen(port, () => {
    console.log("nodeapi is listening on port " + port);
});
