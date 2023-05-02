const Booking = require('../models/bookingModel')
const ResponseFormat = require('../responseFormat')
const User = require('../models/userModel');
const Cab = require('../models/cabModel');
const logger = require('../logger');
const fs = require('fs');
const { Parser } = require('json2csv');
// const PDFDocument = require('pdfkit');
const ObjectId = require('mongoose').Types.ObjectId;

const createBooking = async (req, res) => {
    try {
        const { cabId, dropOffLat, dropOffLong, dropOffName } = req.body;
        const { pickUpLat, pickUpLong, pickUpName } = req.query;
        // getting the user details fby user ID which I got from jwt token of the logged in user.

        const user = await User.findById(req.user.id);
        if (!user) {
            logger.error("User not found", { user });
            return res.status(404).json({ message: 'User not found' });
        }

        // getting all the cab details on the basis of cab ID.
        const cab = await Cab.findById({ _id: cabId });
        if (!cab) {
            logger.error("Cab not found", { cab });
            return res.json(ResponseFormat(false, "Cab not found..."));
        }

        const pickUpLocation = { latitude: pickUpLat, longitude: pickUpLong, name: pickUpName };
        const dropOffLocation = { latitude: dropOffLat, longitude: dropOffLong, name: dropOffName };

        // Check if cab is already booked
        const existingBooking = await Booking.findOne({
            cab: cabId,
            "pickUpLocation.latitude": pickUpLat,
            "pickUpLocation.longitude": pickUpLong,
            "dropOffLocation.latitude": dropOffLat,
            "dropOffLocation.longitude": dropOffLong
        });

        if (existingBooking) {
            logger.error("Cab already booked with same locations", { cabId });
            return res.status(400).json(ResponseFormat(false, "Cab already booked for the selected pickUp and dropOff location"));
        }

        // this is for calculating the distance between pickUp and Drop Location..
        const distance = Math.sqrt(
            Math.pow(pickUpLat - dropOffLat, 2) + Math.pow(pickUpLong - dropOffLong, 2)
        );

        // the above one returns the distsance in degrees to convert it to km we need to multiply it by earths radius distanceInDegrees * 6371.
        let rideCharges = 0;
        if (distance <= 5) {
            rideCharges = distance * 10; // Rs. 10 per km for first 5 km
        } else if (distance <= 10) {
            rideCharges = 50 + (distance - 5) * 8; // Rs. 8 per km after 5 km
        } else if (distance <= 20) {
            rideCharges = 90 + (distance - 10) * 6; // Rs. 6 per km after 10 km
        } else {
            rideCharges = 150 + (distance - 20) * 5; // Rs. 5 per km after 20 km
        }

        // converting distance and rideCharges to numbers
        const rideDistance = parseFloat(distance.toFixed(2)) + "km";
        const rideCost = parseFloat(rideCharges.toFixed(2)) + "Rs";

        const newBooking = new Booking({
            user: { _id: user._id },
            cab: { _id: cab._id },
            pickUpLocation: {
                name: pickUpLocation.name,
                latitude: pickUpLocation.latitude,
                longitude: pickUpLocation.longitude
            },
            dropOffLocation: {
                name: dropOffLocation.name,
                latitude: dropOffLocation.latitude,
                longitude: dropOffLocation.longitude
            },
            distance: rideDistance,
            rideCharges: rideCost
        });
        await newBooking.save();
        logger.info("Cab booked successfully", { cabId });
        res.json(ResponseFormat(true, "Cab booked successfully", newBooking));
    }

    catch (err) {
        logger.error("Error adding cab", { error: err.message });
        res.status(500).json({ message: "Server Error" });
    }
};

// get all the bookings of the current logged in user ->
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
        res.json(ResponseFormat(true, "All bookings are...", bookings));
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
};

// get booking by bookingId
const getBookingById = async (req, res) => {
    try {
        const bookingId = ObjectId.isValid(req.params.id);
        if (!bookingId) {
            return res.json(ResponseFormat(false, "Invalid Id..."));
        }
        const booking = await Booking.findById({ _id: req.params.id })
            .populate('user', '-__v')
            .select('-__v')
        if (!booking) {
            return res.json(ResponseFormat(false, "Booking not found with given Id..."));
        }
        else {
            return res.json(ResponseFormat(true, "Booking Found...", booking));
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
};

const updateBooking = async (req, res) => {
    try {
        const id = ObjectId.isValid(req.params.id);
        const update = req.body;
        if (!id) {
            return res.json(ResponseFormat(false, "Invalid Id..."));
        }
        const updatedBooking = await Booking.findByIdAndUpdate(
            { _id: req.params.id },
            update,
            { new: true }
        );
        if (!updatedBooking) {
            res.json(ResponseFormat(false, "Id not found to update..."));
        }
        else {
            res.json(ResponseFormat(true, "Booking updated Successfully...", updatedBooking));
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json(ResponseFormat(false, "Internal server error"));
    }
};

const deleteBooking = async (req, res) => {
    try {
        const id = ObjectId.isValid(req.params.id);
        if (!id) {
            console.log('isValidOrNot', id);
            return res.json(ResponseFormat(false, "Invalid Id..."));
        }
        // Delete the booking
        const deletedBooking = await Booking.findByIdAndDelete({ _id: req.params.id });
        if (!deletedBooking) {
            res.json(ResponseFormat(false, "Id not found to delete booking..."));
        }
        else {
            res.json(ResponseFormat(true, "Booking deleted successfully...", deletedBooking));
        }
    } catch (err) {
        console.error(err);
        res.status(500).json(ResponseFormat(false, "Internal server error"));
    }
}

const getBookingByMonth = async (req, res) => {
    try {
        const { year, month } = req.params;
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);
        const bookings = await Booking.find({
            bookingDate: { $gte: start, $lte: end }
        });

        const fields = ['Booking ID', 'Customer Name', 'Pickup Location', 'Drop Location', 'Booking Date'];
        const data = bookings.map(booking => {
            return {
                'Booking ID': booking._id,
                'Customer Name': booking.user.name,
                'Pickup Location': booking.pickUpLocation.name,
                'Drop Location': booking.dropOffLocation.name,
                'Booking Date': booking.bookingDate.toDateString()
            };
        });

        const json2csvParser = new Parser({ fields });
        const csvData = json2csvParser.parse(data);

        fs.writeFile(`bookings/booking-report-${month}-${year}.csv`, csvData, (err) => {
            if (err) throw err;
            console.log(`booking-report-${month}-${year}.csv file saved`);
        });

        res.setHeader('Content-disposition', `attachment; filename=booking-report-${month}-${year}.csv`);
        res.set('Content-Type', 'text/csv');
        res.status(200).send(ResponseFormat(true, "File saved successfully..."));

    } catch (err) {
        console.error(err);
        res.status(500).json(ResponseFormat(false, "Internal server error"));
    }
};

module.exports = {
    getAllBookings, getBookingById, createBooking, updateBooking, deleteBooking, getBookingByMonth
}
