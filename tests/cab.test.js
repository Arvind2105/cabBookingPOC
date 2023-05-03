const request = require('supertest');
const app = require('../app');
const bcrypt = require('bcrypt')
const User = require('../models/userModel')
const Cab = require('../models/cabModel');

// this is for getAllCabs api...
describe("GET /api/cabs", () => {
    let token;
    let cabId;

    beforeAll(async () => {
        // create a test user and generate a JWT token
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password", salt);
        const user = new User({
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

        // create a test cab
        const cab = new Cab({
            registrationNumber: "KA01AB1234",
            driverName: "Kapil Kumar",
            driverPhoneNumber: "0987654321",
            cabType: "SUV",
        });
        await cab.save();
        cabId = cab._id.toString();
    });

    afterAll(async () => {
        // delete the test user and cab
        await User.deleteOne({ email: "johndoe@test.com" });
        await Cab.findByIdAndDelete(cabId);
    });

    it('should return all cabs if a valid JWT token is provided', async () => {
        const res = await request(app)
            .get('/api/cabs')
            .set('x-auth-token', token) // Set the JWT token in the header
            .send();

        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body.message).toBe('All cabs are...');
        expect(res.body.data[0]._id).toBe(cabId);
    });

    it('should return 401 if JWT token is not provided', async () => {
        const res = await request(app).get('/api/cabs').send();

        expect(res.status).toBe(401);
        expect(res.body.status).toBe(false);
        expect(res.body.message).toBe('Access denied. No token provided...');
    });

    it('should return 401 if an invalid JWT token is provided', async () => {
        const res = await request(app)
            .get('/api/cabs')
            .set('x-auth-token', 'invalidtoken')
            .send();

        expect(res.status).toBe(401);
        expect(res.body.status).toBe(false);
        expect(res.body.message).toBe('Invalid token...');
    });
});

// getCabByRegistrationNumber api...
describe('GET /api/cabs/:registrationNumber', () => {
    let token;
    let cab;

    beforeAll(async () => {
        // create a test user and generate a JWT token
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password", salt);
        const user = new User({
            name: 'Kapil Kumar',
            email: 'kapil@test.com',
            phoneNumber: '1234567890',
            password: hashedPassword,
        });
        await user.save();

        // login the user to get the jwt token
        const response = await request(app)
            .post("/api/auth/login")
            .send({ email: user.email, password: "password" });

        token = response.body.data.token;

        // create a test cab
        cab = new Cab({
            registrationNumber: 'KA01AB1234',
            driverName: 'Pankaj',
            driverPhoneNumber: '0987654321',
            cabType: 'SUV',
        });
        await cab.save();
    });

    afterAll(async () => {
        // delete the test user and cab
        await User.deleteOne({ email: 'kapil@test.com' });
        await Cab.deleteOne({ registrationNumber: 'KA01AB1234' });
    });

    it('should return the cab with the given registration number', async () => {
        const res = await request(app)
            .get(`/api/cabs/${cab.registrationNumber}`)
            .set('x-auth-token', token);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body.message).toBe('Cab Found...');
        expect(res.body.data).toHaveProperty('_id');
        expect(res.body.data.registrationNumber).toBe('KA01AB1234');
        expect(res.body.data.driverName).toBe('Pankaj');
        expect(res.body.data.driverPhoneNumber).toBe('0987654321');
        expect(res.body.data.cabType).toBe('SUV');
    });

    it('should return 404 if no cab is found with the given registration number', async () => {
        const res = await request(app)
            .get(`/api/cabs/HR50D1234`)
            .set('x-auth-token', token);

        expect(res.status).toBe(404);
        expect(res.body.status).toBe(false);
        expect(res.body.message).toBe('Cab not found with given registrationNumber...');
    });

    it('should return 401 if no JWT token is provided', async () => {
        const res = await request(app).get(`/api/cabs/${cab.registrationNumber}`);

        expect(res.status).toBe(401);
        expect(res.body.status).toBe(false);
        expect(res.body.message).toBe('Access denied. No token provided...');
    });

    it('should return 401 if an invalid JWT token is provided', async () => {
        const res = await request(app)
            .get(`/api/cabs/${cab.registrationNumber}`)
            .set('x-auth-token', 'invalid-token');

        expect(res.status).toBe(401);
        expect(res.body.status).toBe(false);
        expect(res.body.message).toBe('Invalid token...');
    });
});

// addCab api...
describe('addCab', () => {
    let token;
    let user;

    beforeAll(async () => {
        // create a test user and generate a JWT token
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password", salt);
        user = new User({
            name: 'Puneet',
            email: 'puneet@example.com',
            phoneNumber: '1234567890',
            password: hashedPassword,
        });
        await user.save();

        // login the user to get the jwt token
        const response = await request(app)
            .post("/api/auth/login")
            .send({ email: user.email, password: "password" });

        token = response.body.data.token;
    });

    afterAll(async () => {
        await Cab.deleteMany({});
        await User.deleteMany({});
    });

    beforeEach(async () => {
        await Cab.deleteMany({});
    });

    it('should return 401 if user is not authorized', async () => {
        const res = await request(app)
            .post('/api/cabs/add')
            .send({
                registrationNumber: 'AB1234',
                driverName: 'Kush',
                driverPhoneNumber: '1234567890',
                cabType: 'Sedan',
            });
        expect(res.status).toBe(401);
        expect(res.body.status).toBe(false);
        expect(res.body.message).toBe('Access denied. No token provided...');
    });

    it('should return 400 if driverPhoneNumber is less than 10 digits', async () => {
        const res = await request(app)
            .post('/api/cabs/add')
            .send({
                registrationNumber: 'AB1234',
                driverName: 'Kush',
                driverPhoneNumber: '123456789',
                cabType: 'Sedan',
            })
            .set('x-auth-token', token);
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(false);
        expect(res.body.message).toBe('Driver phone number must be at least 10 digits');
    });

    it('should return 400 if registrationNumber is not unique', async () => {
        // Created a cab with the same registrationNumber as the one to be added
        const existingCab = new Cab({
            registrationNumber: 'AB1234',
            driverName: 'Kush',
            driverPhoneNumber: '0987654321',
            cabType: 'Sedan',
        });
        await existingCab.save();

        const res = await request(app)
            .post('/api/cabs/add')
            .send({
                registrationNumber: 'AB1234',
                driverName: 'Kush',
                driverPhoneNumber: '1234567890',
                cabType: 'Sedan',
            })
            .set('x-auth-token', token);
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(false);
        expect(res.body.message).toBe('Can not register with same cab number...');
    });

    it('should add a new cab if all inputs are valid', async () => {
        const res = await request(app)
            .post('/api/cabs/add')
            .send({
                registrationNumber: 'AB1234',
                driverName: 'Kush',
                driverPhoneNumber: '1234567890',
                cabType: 'Sedan',
            })
            .set('x-auth-token', token);
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body.message).toBe('Cab added successfully...');
        expect(res.body.data.registrationNumber).toBe('AB1234');
        expect(res.body.data.driverName).toBe('Kush');
        expect(res.body.data.driverPhoneNumber).toBe('1234567890');
        expect(res.body.data.cabType).toBe('Sedan');
    });
});

// deleteCab api...
describe("DELETE /api/cabs/:registrationNumber", () => {
    let token;
    let cab;
    beforeAll(async () => {
        // create a test user and generate a JWT token
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password", salt);
        const user = new User({
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

        // create a test cab
        cab = new Cab({
            registrationNumber: "KA01AB1234",
            driverName: "Kapil Kumar",
            driverPhoneNumber: "0987654321",
            cabType: "SUV",
        });
        await cab.save();
    });

    afterAll(async () => {
        // delete the test user and cab
        await User.deleteOne({ email: "johndoe@test.com" });
        await Cab.findByIdAndDelete(cab._id);
    });

    it("should return 401 if user is not authorized", async () => {
        const res = await request(app)
            .delete(`/api/cabs/${cab.registrationNumber}`)
            .send();
        expect(res.status).toBe(401);
        expect(res.body.status).toBe(false);
        expect(res.body.message).toBe("Access denied. No token provided...");
    });

    it("should return 200 if cab is not found", async () => {
        const res = await request(app)
            .delete(`/api/cabs/KL5678`)
            .set("x-auth-token", token)
            .send();
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(false);
        expect(res.body.message).toBe(
            "Cab not found with given registrationNumber please enter correct one..."
        );
    });

    it("should delete the cab if valid registration number and token is provided", async () => {
        const res = await request(app)
            .delete(`/api/cabs/${cab.registrationNumber}`)
            .set("x-auth-token", token)
            .send();
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body.message).toBe("Cab deleted successfully...");
        expect(res.body.data._id).toBe(`${cab._id}`);
    });
});

