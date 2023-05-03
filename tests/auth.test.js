const request = require("supertest");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const app = require("../app");
const config = require('../config');
const User = require("../models/userModel");

// for registering user...
describe("POST /api/auth/register", () => {
    // create a new user to test registration
    const newUser = {
        name: "Arvind Tomar",
        email: "arvindtomar@gmail.com",
        phoneNumber: "1234567890",
        password: "123456"
    };

    // clear the database before each test
    beforeEach(async () => {
        await User.deleteMany({});
    });

    it("should register a new user", async () => {
        const response = await request(app)
            .post("/api/auth/register")
            .send(newUser);

        expect(response.status).toBe(200);
        expect(response.body.status).toBe(true);
        expect(response.body.message).toBe("User registered successfully");

        // check that user was saved to the database
        const user = await User.findOne({ email: newUser.email });
        expect(user).toBeDefined();
        expect(user.name).toBe(newUser.name);
        expect(user.email).toBe(newUser.email);
        expect(user.phoneNumber).toBe(newUser.phoneNumber);
    });

    it("should return an error if user with same email already exists", async () => {
        // create a user with the same email as newUser
        const existingUser = new User({
            name: "Existing User",
            email: newUser.email,
            phoneNumber: "1234567890",
            password: "password456"
        });
        await existingUser.save();

        const response = await request(app)
            .post("/api/auth/register")
            .send(newUser);

        expect(response.status).toBe(400);
        expect(response.body.status).toBe(false);
        expect(response.body.message).toBe("User with this email already exists");
    });

    it("should return an error if phone number is less than 10 digits", async () => {
        const invalidUser = { ...newUser, phoneNumber: "123456789" };
        const response = await request(app)
            .post("/api/auth/register")
            .send(invalidUser);
        expect(response.status).toBe(200);
        expect(response.body.status).toBe(false);
        expect(response.body.message).toBe("Phone number must be at least 10 digits");

        // check that user was not saved to the database
        const user = await User.findOne({ email: invalidUser.email });
        expect(user).toBeNull();
    });
});

// user login...
describe("POST /api/auth/login", () => {
    let user;
    beforeAll(async () => {
        // create a test user and hash their password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password", salt);
        user = new User({
            name: "Praful",
            email: "praful@test.com",
            password: hashedPassword,
            phoneNumber: "1234567890",
        });
        await user.save();
    });

    afterAll(async () => {
        // delete the test user after all tests are done
        await User.deleteOne({ email: "praful@test.com" });
    });

    it("should return 200 with token if credentials are valid", async () => {
        const res = await request(app).post("/api/auth/login").send({
            email: "praful@test.com",
            password: "password",
        });
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(true);
        expect(res.body.message).toBe("User logged in successfully...");
        expect(res.body.data.token).toBeDefined();
        const decodedToken = jwt.verify(
            res.body.data.token,
            config.secretKey
        );
        expect(decodedToken.id).toBe(user._id.toString());
    });


    it("should return an error if user enters incorrect email or password", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({ email: "praful@test.com", password: "wrongpassword123" });

        expect(response.status).toBe(401);
        expect(response.body.status).toBe(false);
        expect(response.body.message).toBe("Authentication failed wrong password and email entered...");
    });

    it("should return an error if user does not exist", async () => {
        const response = await request(app)
            .post("/api/auth/login")
            .send({ email: "nonexistentuser@test.com", password: "testpassword123" });

        expect(response.status).toBe(401);
        expect(response.body.status).toBe(false);
        expect(response.body.message).toBe("Authentication failed user not found..");
    });

});
