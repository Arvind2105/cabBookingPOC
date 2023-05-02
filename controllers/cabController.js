const Cab = require('../models/cabModel')
const ResponseFormat = require('../responseFormat');
const logger = require('../logger');
// done
const addCab = async (req, res) => {
    try {
        const { registrationNumber, driverName, driverPhoneNumber, cabType } = req.body;
        // checking whether the cab is already registered or not...
        const existingCab = await Cab.findOne({ registrationNumber });

        if (driverPhoneNumber.length < 10) {
            logger.error("Incorrect phone number", { driverPhoneNumber });
            return res.json(ResponseFormat(false, "Driver phone number must be at least 10 digits"));
        }
        else if (existingCab) {
            logger.error("Cab already exists", { registrationNumber });
            return res.json(ResponseFormat(false, "Can not register with same cab number..."));
        }

        else {
            // Create new cab
            const cab = new Cab({
                registrationNumber,
                driverName,
                driverPhoneNumber,
                cabType
            });
            await cab.save();
            logger.info("Cab added successfully", { registrationNumber, driverName });
            res.json(ResponseFormat(true, "Cab added successfully...", cab));
        }
    }

    catch (err) {
        // console.error(err);
        logger.error("Error adding cab", { error: err.message });
        res.json(ResponseFormat(false, "Internal server error"));
    }
};

// done
const getAllCabs = async (req, res) => {
    try {
        const cabs = await Cab.find({});
        res.json(ResponseFormat(true, "All cabs are...", cabs));
        // res.json(cabs);
    }
    catch (err) {
        console.error(err);
        res.json(ResponseFormat(false, "Internal server error"));
    }
};

// done
const getCabByRegistrationNumber = async (req, res) => {
    try {
        const registrationNumber = req.params.registrationNumber;
        const cab = await Cab.findOne({ registrationNumber });
        if (!cab) {
            // return res.status(404).send('Cab not found');
            return res.status(404).json(ResponseFormat(false, "Cab not found with given registrationNumber..."));
        }
        else {
            // res.json(cab);
            res.json(ResponseFormat(true, "Cab Found...", cab));

        }
    }
    catch (err) {
        console.error(err);
        res.json(ResponseFormat(false, "Internal server error"));
    }
};

// Update a specific cab by registration number
const updateCab = async (req, res) => {
    const { registrationNumber } = req.params;
    const update = req.body;

    try {
        const updatedCab = await Cab.findOneAndUpdate(
            { registrationNumber: registrationNumber },
            update,
            { new: true }
        );

        if (!updatedCab) {
            return res.json(ResponseFormat(false, "Cab not found to update..."));
        }
        else {
            return res.json(ResponseFormat(true, "Cab updated successfully...", updatedCab));
        }
    }
    catch (err) {
        console.error(err);
        res.json(ResponseFormat(false, "Internal server error"));
    }
};

// Delete cab by Registration Number...
const deleteCab = async (req, res) => {
    try {
        const registrationNumber = req.params.registrationNumber;

        // Delete the cab
        const deletedCab = await Cab.findOneAndDelete({ registrationNumber });
        if (!deletedCab) {
            return res.json(ResponseFormat(false, "Cab not found with given registrationNumber please enter correct one..."));
        }
        else {
            res.json(ResponseFormat(true, "Cab deleted successfully...", deletedCab));
        }
    }

    catch (err) {
        console.error(err);
        res.json(ResponseFormat(false, "Internal server error"));
    }
};

module.exports = {
    getAllCabs, getCabByRegistrationNumber, addCab, updateCab, deleteCab
}
