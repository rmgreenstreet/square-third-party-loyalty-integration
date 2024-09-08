import request from "supertest";
import app from "../app.mjs";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

beforeAll(async () => {
  // Set up: Establish the MongoDB connection before running tests
  if (!process.env.DB_CONNECTION_STRING) {
    throw new Error("MONGO_URI environment variable is not defined/set");
  }

  await mongoose.connect(process.env.DB_CONNECTION_STRING);
});

afterAll(async () => {
  // Teardown: Close the MongoDB connection after all tests have completed
  await mongoose.connection.close();
});

// Unit test for testing initial route ("/")
describe("GET /", () => {
  it('responds with "Welcome to unit testing guide for nodejs, typescript and express!"', async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.text).toBe(
      "Welcome to unit testing guide for nodejs, typescript and express!"
    );
  });
});
