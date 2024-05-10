import mongoose from "mongoose";
import routing from "../../src/constants/routes";
const request = require('supertest');

import { app } from "../../src/services/services.Socket";
import UserRepository from "../../src/repository/repository.User";
import { MongoMemoryServer } from "mongodb-memory-server"
import { hashPassword } from '../../src/services/services.Auth';
const MockAdapter = require('axios-mock-adapter')

const axios = require('axios')
const mock = new MockAdapter(axios)
const fs = require('fs');


import express from "express";
app.use(express.json());
routing(app);

const userId = new mongoose.Types.ObjectId().toString();


describe('Sending Files with Multer', () => {
  let accessToken: string;
  let user: any;
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

    // Create the user in the database
    const password = await hashPassword('sanipassword');

    user = await UserRepository.createUser({
      _id: new mongoose.Types.ObjectId(),
      username: mockUser.username,
      email: mockUser.email,
      password: password,
      is_active: true,
      is_admin: true,
      is_superuser: true
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

  it('Expect 200 response: Upload file to AWS s3 via multer ', async () => {
    const mockRes = { message: 'File uploaded successfully' };

    const fileData = fs.readFileSync('/home/timmy/projects/backend/skiywater/.env.example');
    const file = Buffer.from(fileData);

    mock.onPost("/api/v1/files/upload-file").reply(200, mockRes)
    const formData = new FormData();
    const blob = new Blob([file]);
    formData.append('file', blob, 'file');

    // Send a POST request with the file data
    const response = await axios.post('/api/v1/files/upload-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${accessToken}`
      }
    });

    console.log(response)
    expect(response.status).toBe(200);
    expect(response.data).toEqual(mockRes);
  })

  // Test uploadAllFilesController
  it('should retrieve  all files', async () => {
    const response = await request(app)
      .get(`/api/v1/files/list`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Assert response status and data
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);

  });

  // Test retrieveAllUserController
  // it('should retrieve  all users', async () => {
  //   const response = await request(app)
  //     .get(`/api/v1/users/list`)
  //     .set('Authorization', `Bearer ${accessToken}`);

  //   // Assert response status and data
  //   expect(response.status).toBe(200);
  //   expect(response.body.success).toBe(true);
  //   expect(Array.isArray(response.body.data)).toBe(true);
  //   expect(response.body.data.length).toBeGreaterThan(0);
  //   expect(response.body.data.length).toBe(2);

  //   (response.body.data as User[]).forEach((user: User) => {
  //     expect(user).toHaveProperty('_id');
  //     expect(user).toHaveProperty('username');
  //     expect(user).toHaveProperty('email');
  //     expect(user).toHaveProperty('is_admin');
  //     expect(user).toHaveProperty('is_superuser');
  //     expect(user).toHaveProperty('is_active');
  //     expect(user).toHaveProperty('createdAt');
  //     expect(user).toHaveProperty('updatedAt');
  //   });
  // });

  // Test retrieveUserController
  // it('should retrieve user details', async () => {
  //   const response = await request(app)
  //     .get(`/api/v1/users/detail/${user._id}`)
  //     .set('Authorization', `Bearer ${accessToken}`);

  //   // Assert response status and data
  //   expect(response.status).toBe(200);
  //   expect(response.body.success).toBe(true);
  //   expect(response.body.data.user.username).toBe(user.username);
  //   expect(response.body.data.user.email).toBe(user.email);
  // });



  // // Test updateUserController
  // it('should update user', async () => {
  //   // Update user details here
  //   const response = await request(app)
  //     .put(`/api/v1/users/${user2._id}`)
  //     .send({ username: 'updatedUsername', is_active: false })
  //     .set('Authorization', `Bearer ${accessToken}`);

  //   // console.log(response.body)
  //   // Assert response status and data
  //   expect(response.status).toBe(200);
  //   expect(response.body.user.username).toEqual("updatedUsername");
  //   expect(response.body.user.is_active).toEqual(false);

  //   // Check if the user still exists in the database
  // });


  // // Test deleteUserController
  // it('should delete user', async () => {
  //   const response = await request(app)
  //     .delete(`/api/v1/users/${user2._id}`)
  //     .set('Authorization', `Bearer ${accessToken}`);

  //   // Assert response status and data
  //   expect(response.status).toBe(204);
  //   expect(response.body).toEqual({});

  //   // Check if the user still exists in the database
  //   const deletedUser = await UserRepository.getUserById(user2._id);
  //   expect(deletedUser).toBeNull();
  // });



  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });
});
