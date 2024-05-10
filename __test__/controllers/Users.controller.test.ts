import mongoose from "mongoose";
import routing from "../../src/constants/routes";
const request = require('supertest');

import { app } from "../../src/services/services.Socket";
import UserRepository from "../../src/repository/repository.User";
import { MongoMemoryServer } from "mongodb-memory-server"
import { hashPassword } from '../../src/services/services.Auth';


import express from "express";
app.use(express.json());
routing(app);

const userId = new mongoose.Types.ObjectId().toString();


describe('User Controller Endpoints', () => {
  let accessToken: string;
  let user: any;
  let user2: any;
  interface User {
    _id: string;
    username: string;
    email: string;
    is_admin: boolean;
    is_superuser: boolean;
    is_active: boolean;
    createdAt: Date;
    updatedAt: Date;
    __v: number;
  }



  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // Mock user data for testing
    const mockUser = {
      _id: userId,
      username: 'saniuser',
      email: 'saniuser@example.com',
      password: "sanipassword",
      is_admin: true,
      is_superuser: true,
      is_active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockUser2 = {
      _id: userId,
      username: 'johndoe',
      email: 'johndoe@example.com',
      password: "johndoe",
      is_admin: true,
      is_superuser: true,
      is_active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };



    // Create the user in the database
    const password = await hashPassword('sanipassword');
    const password2 = await hashPassword(mockUser2.password);

    user = await UserRepository.createUser({
      _id: new mongoose.Types.ObjectId(),
      username: mockUser.username,
      email: mockUser.email,
      password: password,
      is_active: true,
      is_admin: true,
      is_superuser: true
    });

    user2 = await UserRepository.createUser({
      // _id: new mongoose.Types.ObjectId(),
      username: mockUser2.username,
      email: mockUser2.email,
      password: password2,
      is_active: true,
      is_admin: false,
      is_superuser: false
    });

    // Login to get the access token
    const loginResponse = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: mockUser.email,
        password: mockUser.password
      })
      .set('Accept', 'application/json');

    accessToken = loginResponse.body.accessToken;
  });

  // Test retrieveAllUserController
  it('should retrieve  all users', async () => {
    const response = await request(app)
      .get(`/api/v1/users/list`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Assert response status and data
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data.length).toBe(2);

    (response.body.data as User[]).forEach((user: User) => {
      expect(user).toHaveProperty('_id');
      expect(user).toHaveProperty('username');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('is_admin');
      expect(user).toHaveProperty('is_superuser');
      expect(user).toHaveProperty('is_active');
      expect(user).toHaveProperty('createdAt');
      expect(user).toHaveProperty('updatedAt');
    });
  });

  // Test retrieveUserController
  it('should retrieve user details', async () => {
    const response = await request(app)
      .get(`/api/v1/users/detail/${user._id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Assert response status and data
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.username).toBe(user.username);
    expect(response.body.data.user.email).toBe(user.email);
  });



  // Test updateUserController
  it('should update user', async () => {
    // Update user details here
    const response = await request(app)
      .put(`/api/v1/users/${user2._id}`)
      .send({ username: 'updatedUsername', is_active: false })
      .set('Authorization', `Bearer ${accessToken}`);

    // console.log(response.body)
    // Assert response status and data
    expect(response.status).toBe(200);
    expect(response.body.user.username).toEqual("updatedUsername");
    expect(response.body.user.is_active).toEqual(false);

    // Check if the user still exists in the database
  });


  // Test deleteUserController
  it('should delete user', async () => {
    const response = await request(app)
      .delete(`/api/v1/users/${user2._id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Assert response status and data
    expect(response.status).toBe(204);
    expect(response.body).toEqual({});

    // Check if the user still exists in the database
    const deletedUser = await UserRepository.getUserById(user2._id);
    expect(deletedUser).toBeNull();
  });



  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });
});
