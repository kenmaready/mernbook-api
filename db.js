const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config();

// db connection
const dbConnectionString = process.env.ATLAS_DB_CONNECTION_STRING.replace(
    "<username>",
    process.env.ATLAS_DB_USER
)
    .replace("<password>", process.env.ATLAS_DB_PASSWORD)
    .replace("<dbname>", process.env.ATLAS_DB_NAME);

const db = mongoose
    .connect(dbConnectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("db connected..."))
    .catch();

mongoose.connection.on("error", (err) => {
    console.log(`db connection error: ${err}`);
});

module.exports = db;
