const request = require('supertest');
const app = require('../app');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const Cab = require('../models/cabModel');
const Booking = require('../models/bookingModel');

// bookCab api...
describe("POST /api/bookings", () => {
    let user, cab, token
    beforeAll(async () => {
        // create a test user and generate a JWT token
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password", salt);
        user = new User({
            name: "John Doe",
            email: "johndoe@test.com",
            phoneNumber: "1234567890",
            password: hashedPassword,
        });
        await user.save();

        // login the user to get the jwt token
        const response = await request(app)
            .post("/api/auth/login")
            .send({ email: user.email, password: "password" });

        token = response.body.data.token;

        // Create a test cab
        cab = new Cab({
            registrationNumber: 'HR50D1234',
            driverName: 'Pankaj',
            driverPhoneNumber: '0987654321',
            cabType: 'SUV',
        });
        await cab.save();
    });

    afterAll(async () => {
        // Remove the test user and cab
        await User.findByIdAndDelete(user._id);
        await Cab.findByIdAndDelete(cab._id);
        await Booking.findByIdAndDelete({_id});
    });
    it("should create a new booking", async () => {
        // Define the request body and query params
        const requestBody = {
            cabId: cab._id,
            dropOffLat: 12.9716,
            dropOffLong: 77.5946,
            dropOffName: "Test Dropoff Location",
        };
        const queryParams = {
            pickUpLat: 12.9719,
            pickUpLong: 77.6412,
            pickUpName: "Test Pickup Location",
        };

        // Send the API request
        const response = await request(app)
            .post("/api/bookings")
            .set('x-auth-token', token)
            .send(requestBody)
            .query(queryParams);

        // Check that the response status code is 200
        expect(response.status).toBe(200);
        // Check that the response body contains the booking details
        expect(response.body.status).toBe(true);
        expect(response.body.message).toBe("Cab booked successfully");
        expect(response.body.data.user._id).toEqual(user._id.toString());
        expect(response.body.data.cab._id).toEqual(cab._id.toString());
        expect(response.body.data.pickUpLocation.latitude).toBe(
            queryParams.pickUpLat
        );
        expect(response.body.data.pickUpLocation.longitude).toBe(
            queryParams.pickUpLong
        );
        expect(response.body.data.pickUpLocation.name).toBe(queryParams.pickUpName);
        expect(response.body.data.dropOffLocation.latitude).toBe(
            requestBody.dropOffLat
        );
        expect(response.body.data.dropOffLocation.longitude).toBe(
            requestBody.dropOffLong
        );
        expect(response.body.data.dropOffLocation.name).toBe(
            requestBody.dropOffName
        );
        expect(response.body.data.distance).toMatch(/^\d+(\.\d{1,2})?km$/);
        expect(response.body.data.rideCharges).toMatch(/^\d+(\.\d{1,2})?Rs/);
    });
});
