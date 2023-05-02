// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const config = require('../config');
const ResponseFormat = require('../responseFormat');

const register = async (req, res) => {
    try {
        const { name, email, password, phoneNumber } = req.body;

        // Checking whether user registering with same email or not
        const userExists = await User.findOne({ email });

        // if already exists then returning the msg already registered...
        if (userExists) {
            return res.status(400).json(ResponseFormat(false, "User with this email already exists"));
        }
        else if (phoneNumber.length < 10) {
            return res.json(ResponseFormat(false, "Phone number must be at least 10 digits"));
        }
        else {

            // Hashing the password bycrypt lib...
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create new user
            const user = new User({
                name,
                email,
                phoneNumber,
                password: hashedPassword
            });

            await user.save();
            return res.status(200).json(ResponseFormat(true, "User registered successfully", user))
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json(ResponseFormat(false, "Internal server error"));

    }
};


const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json(ResponseFormat(false, "Authentication failed user not found.."));
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json(ResponseFormat(false, "Authentication failed wrong password and email entered..."));
        }

        const token = jwt.sign({ id: user._id }, config.secretKey, {
            expiresIn: config.expiresIn
        });

        // res.json({ token });
        res.status(200).json(ResponseFormat(true, "User logged in successfully...", {
            token, user: {
                name: user.name,
                email: user.email,
            },
        }))
    }
    catch (err) {
        console.error(err);
        res.status(500).json(ResponseFormat(false, "Internal server error"));
    }
};

module.exports = { register, login };


