import request from "supertest";
import mongoose from "mongoose";
import app from "../index.js";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";

let mongoServer;
let user1, user2;
let token1, token2;

beforeAll(async () => {
   mongoServer = await MongoMemoryServer.create();
   const mongoUri = mongoServer.getUri();
   await mongoose.connect(mongoUri);

   // Create two users
   user1 = await request(app).post("/api/auth/signup").send({
      email: "user1@example.com",
      password: "password123",
      firstName: "User1",
      lastName: "One"
   });
   
   user2 = await request(app).post("/api/auth/signup").send({
      email: "user2@example.com",
      password: "password123",
      firstName: "User2",
      lastName: "Two"
   });

   // Log in both users to get their tokens
   token1 = (await request(app).post("/api/auth/login").send({
      email: "user1@example.com",
      password: "password123"
   })).headers['set-cookie'].find(cookie => cookie.startsWith('jwt='));

   token2 = (await request(app).post("/api/auth/login").send({
      email: "user2@example.com",
      password: "password123"
   })).headers['set-cookie'].find(cookie => cookie.startsWith('jwt='));

});

afterAll(async () => {
   await mongoose.connection.close();
   await mongoServer.stop();
});

describe("Contacts API", () => {
   it("should search for contacts successfully", async () => {
      const response = await request(app).post("/api/contacts/search").set("Cookie", token1).send({
         searchTerm: "User2"
      });
      expect(response.status).toBe(200);
      expect(response.body.contacts.length).toBeGreaterThan(0);
   });

   it("should return an error for search without a search term", async () => {
      const response = await request(app).post("/api/contacts/search").set("Cookie", token1).send({});
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Search query is required");
   });


   it("should return an error if invalid token", async () => {
      const response = await request(app).get("/api/contacts/get-contacts-for-list");
      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Not authenticated");
   });

   it("should retrieve all contacts except current user", async () => {
      const response = await request(app).get("/api/contacts/all-contacts").set("Cookie", token1);
      expect(response.status).toBe(200);
      expect(response.body.contacts.length).toBeGreaterThan(0);
   });

   it("should return an error for all contacts request without authentication", async () => {
      const response = await request(app).get("/api/contacts/all-contacts");
      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Not authenticated");
   });

   it("should return an error for deleting DM without valid ID", async () => {
      const response = await request(app).delete("/api/contacts/delete-dm/").set("Cookie", token1);
      expect(response.status).toBe(404);
   });

   it("should return an error for deleting DM without authentication", async () => {
      const response = await request(app).delete(`/api/contacts/delete-dm/${user2.body._id}`);
      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Not authenticated");
   });
});
