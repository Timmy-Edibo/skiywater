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


describe('Test cases for authentication controller', () => {
  let user:any;
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

  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    // Create the user in the database
    const password = await hashPassword(mockUser.password);
    user = await UserRepository.createUser({
      _id: new mongoose.Types.ObjectId(),
      username: mockUser.username,
      email: mockUser.email,
      password: password,
      is_active: true,
      is_admin: true,
      is_superuser: true
    });

  });

  it('GET /login should return status 200', async () => {
    // Login to get the access token
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: mockUser.email,
        password: mockUser.password
      })
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  })

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });
});
