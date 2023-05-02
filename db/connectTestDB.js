// this for establishing connection with the database.
const mongoose = require("mongoose")

const connectTestDB = () => {
    return mongoose.connect("mongodb://localhost:27017/cabBookingTestDB")
        .then(() => {
            console.log("Connected Successfully...")
        })
        .catch((err) => {
            console.log(err);
        })
}
module.exports = connectTestDB