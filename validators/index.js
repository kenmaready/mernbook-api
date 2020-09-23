exports.createPostValidator = (req, res, next) => {
    //  title validation
    req.check("title", "Post must include title.").notEmpty().trim();
    req.check("title", "Title must be between 4 and 150 characters")
        .isLength({
            min: 4,
            max: 150,
        })
        .trim();

    // body validation
    req.check("body", "Post must include a body.").notEmpty().trim();
    req.check("body", "Body must be between 4 and 2,000 characters.")
        .isLength({
            min: 4,
            max: 2000,
        })
        .trim();

    // check for errors
    const errors = req.validationErrors();
    if (errors) {
        const firstError = errors.map((e) => e.msg)[0];
        return res.status(400).json({ error: firstError });
    }

    next();
};

exports.userSignupValidator = (req, res, next) => {
    // name validation
    req.check("name", "New user must include a name.").notEmpty().trim();
    req.check("name", "Name must be between 1 and 32 characters.")
        .isLength({
            min: 1,
            max: 32,
        })
        .trim();

    // email validation
    req.check("email", "New user must include an email address")
        .notEmpty()
        .trim();
    req.check("email", "Email provided was not a valid email address.")
        .isEmail()
        .normalizeEmail();
    req.check("email", "Email must be between 4 and 96 characters.")
        .isLength({ min: 4, max: 96 })
        .trim();

    // password validation
    req.check("password", "Password is required").notEmpty().trim();
    req.check("password", "Password must contain at least 6 characters.")
        .isLength({ min: 6 })
        .trim();

    // check for errors
    const errors = req.validationErrors();
    if (errors) {
        const firstError = errors.map((e) => e.msg)[0];
        console.log(firstError);
        return res.status(400).json({ error: firstError });
    }

    next();
};

exports.profileUpdateValidator = (req, res, next) => {
    // TODO: This is currently not doing anything because
    // the body of update requests are formdata.  Need to restructure
    // so that this can access the adata and test it.
    //console.log(req.body);
    if (req.body.name || req.body.name === "") {
        console.log("updating name...");
        req.check("name", "Cannot remove name.").notEmpty().trim();
        req.check("name", "Name must be between 1 and 32 characters.")
            .isLength({
                min: 1,
                max: 32,
            })
            .trim();
    } else {
        console.log("not updating name...");
    }

    if (req.body.email || req.body.email === "") {
        console.log("updating email...");
        // email validation
        req.check("email", "Cannot remove email address from profile.")
            .notEmpty()
            .trim();
        req.check("email", "Email provided was not a valid email address.")
            .isEmail()
            .normalizeEmail();
        req.check("email", "Email must be between 4 and 96 characters.")
            .isLength({ min: 4, max: 96 })
            .trim();
    } else {
        console.log("not updating email...");
    }

    // password validation
    if (req.body.password || req.body.password === "") {
        console.log("updating password...");
        req.check("password", "Cannot remove password from account.")
            .notEmpty()
            .trim();
        req.check("password", "Password must contain at least 6 characters.")
            .isLength({ min: 6 })
            .trim();
    } else {
        console.log("not updating password...");
    }

    // check for errors
    const errors = req.validationErrors();
    if (errors) {
        const firstError = errors.map((e) => e.msg)[0];
        return res.status(400).json({ error: firstError });
    }

    next();
};

exports.passwordResetValidator = (req, res, next) => {
    // check for password
    req.check("newPassword", "Password is required").notEmpty();
    req.check("newPassword")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long.")
        .matches(/\d/)
        .withMessage("Password must contain a number");

    // check for errors
    const errors = req.validationErrors();
    if (errors) {
        const firstError = errors.map((err) => err.msg)[0];
        return res.status(400).json({ error: firstError });
    }

    next();
};
