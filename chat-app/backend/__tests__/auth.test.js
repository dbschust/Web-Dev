import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import app from "../index.js";
import { MongoMemoryServer } from "mongodb-memory-server";

// Start an in-memory MongoDB server for testing
let mongoServer;
let userId = 1;
let token;

beforeAll(async () => {
   mongoServer = await MongoMemoryServer.create();
   const mongoUri = mongoServer.getUri();
   await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("Auth API", () => {
 
   it("should register a new user successfully", async () => {
      const response = await request(app)
        .post("/api/auth/signup")
        .send({
          _id: userId,
          email: "test@example.com",
          password: "password123",
        });
    
      // Check if the response status is 201 (Created)
      expect(response.status).toBe(201);
    
      // Check if the response includes the 'jwt' cookie
      expect(response.headers['set-cookie']).toBeDefined();
      token = response.headers['set-cookie'].find(cookie => cookie.startsWith('jwt='));
    
      expect(token).toBeDefined(); // Ensure that the JWT cookie is present
    });
    
 
   it("should not allow duplicate email registration", async () => {
     const response = await request(app)
       .post("/api/auth/signup")
       .send({
         email: "test@example.com",
         password: "password123",
       });
 
     expect(response.status).toBe(409);
     expect(response.body.message).toBe("The email is already in use");
   });

   it("should not registration with blank fields", async () => {
      const response = await request(app)
        .post("/api/auth/signup")
        .send({
          email: "",
          password: "",
        });
  
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Email and password are required");
    });
 
   it("should log in with valid credentials", async () => {
     const response = await request(app)
       .post("/api/auth/login")
       .send({
         email: "test@example.com",
         password: "password123",
       });
 
     token = response.headers['set-cookie'].find(cookie => cookie.startsWith('jwt='));
     expect(response.status).toBe(200);
     expect(response.body).toHaveProperty("token");
   });
 
   it("should not log in with invalid credentials", async () => {
     const response = await request(app)
       .post("/api/auth/login")
       .send({
         email: "test@example.com",
         password: "wrongpassword",
       });
 
     expect(response.status).toBe(400);
     expect(response.body.message).toBe("Invalid password");
   });

   it("should not login with blank fields", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: "",
          password: "",
        });
  
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Missing email or password");
    });

   it('should get user info with valid token', async () => {
      const response = await request(app)
          .get('/api/auth/userinfo')
          .set('Cookie', `${token}`); // Simulate the JWT token being sent as a cookie

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('email', 'test@example.com');
  });

  it('should reject access with invalid or expired token', async () => {
      const expiredToken = jwt.sign({ userId, email: 'test@example.com' }, process.env.SECRET_KEY, { expiresIn: '-1s' });

      const response = await request(app)
          .get('/api/auth/userinfo')
          .set('Cookie', `jwt=${expiredToken}`); // Simulate an expired token being sent

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Invalid or expired token.');
  });

  // Test for the update profile endpoint
   it("should update user profile successfully", async () => {
      const response = await request(app)
         .post("/api/auth/update-profile") 
         .set("Cookie", `${token}`)
         .send({
            _id: userId,
            firstName: "first",
            lastName: "last",
            color: "2",
         });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Profile successfully updated");
   });

   it("should reject profile update with missing first or last name", async () => {
      const response = await request(app)
         .post("/api/auth/update-profile")
         .set("Cookie", token)
         .send({
            firstName: "Another Name",
         });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Missing required fields");
   });

 });