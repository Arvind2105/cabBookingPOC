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
            name: "Arvind Tomar",
            email: "arvindtomar@test.com",
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
        await Booking.deleteMany({});
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
        expect(response.statusCode).toBe(200);
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

        // Attempt to book the same cab again
        const response2 = await request(app)
            .post("/api/bookings")
            .set('x-auth-token', token)
            .send(requestBody)
            .query(queryParams);
        expect(response2.status).toBe(400);
        expect(response2.body.status).toBe(false);
        expect(response2.body.message).toBe("Cab already booked for the selected pickUp and dropOff location");
    });
});

// getAllBookings api.....
describe("GET /api/bookings", () => {
    let user, cab, token, bookingId;
    beforeAll(async () => {
        // create a test user and generate a JWT token
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password", salt);
        user = new User({
            name: "Arvind Tomar",
            email: "arvindtomar@test.com",
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

        // Create a booking for the user
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

        const booking = new Booking({
            user: user._id,
            cab: cab._id,
            pickUpLocation: {
                latitude: queryParams.pickUpLat,
                longitude: queryParams.pickUpLong,
                name: queryParams.pickUpName,
            },
            dropOffLocation: {
                latitude: requestBody.dropOffLat,
                longitude: requestBody.dropOffLong,
                name: requestBody.dropOffName,
            },
            distance: "5.00km",
            rideCharges: "150.00Rs",
        });
        await booking.save();
        bookingId = booking._id.toString();
    });

    afterAll(async () => {
        // Remove the test user, cab and booking
        await User.findByIdAndDelete(user._id);
        await Cab.findByIdAndDelete(cab._id);
        await Booking.findByIdAndDelete(bookingId);
    });

    it("should return all bookings for the user", async () => {
        const response = await request(app)
            .get("/api/bookings")
            .set('x-auth-token', token);

        // Check that the response status code is 200
        expect(response.status).toBe(200);

        // Check that the response body contains all bookings for the user
        expect(response.body.status).toBe(true);
        expect(response.body.message).toBe("All bookings are...");
        expect(response.body.data[0].user._id).toEqual(user._id.toString());
        expect(response.body.data[0].cab._id).toEqual(cab._id.toString());
        expect(response.body.data[0].pickUpLocation.latitude).toBe(12.9719);
        expect(response.body.data[0].pickUpLocation.longitude).toBe(77.6412);
        expect(response.body.data[0].pickUpLocation.name).toBe("Test Pickup Location");
        expect(response.body.data[0].dropOffLocation.latitude).toBe(12.9716);
        expect(response.body.data[0].dropOffLocation.longitude).toBe(77.5946);
        expect(response.body.data[0].dropOffLocation.name).toBe("Test Dropoff Location");
        expect(response.body.data[0].distance).toMatch(/^\d+(\.\d{1,2})?km$/);
        expect(response.body.data[0].rideCharges).toMatch(/^\d+(\.\d{1,2})?Rs/);
    })

    it("should return 401 if user is not authenticated", async () => {
        const response = await request(app)
            .get("/api/bookings")
            .send();
        expect(response.status).toBe(401);
    });
})
