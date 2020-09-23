const unauthErrorMessage = (err, req, res, next) => {
    if (err.name === "UnauthorizedError") {
        res.status(401).json({ error: "No Token or Invalid Token Found." });
    }
};

module.exports = { unauthErrorMessage };
