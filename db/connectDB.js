// this for establishing connection with the database.
const mongoose = require("mongoose")

const connectDB = () => {
    return mongoose.connect("mongodb://localhost:27017/cabBooking")
        .then(() => {
            console.log("Connected Successfully...")
        })
        .catch((err) => {
            console.log(err);
        })
}
module.exports = connectDB