import mongoose from "mongoose";
import routing from "../../src/constants/routes";
const request = require('supertest');

import { app, io } from "../../src/services/services.Socket";
import UserRepository from "../../src/repository/repository.User";
import { MongoMemoryServer } from "mongodb-memory-server"
import { hashPassword } from '../../src/services/services.Auth';
const MockAdapter = require('axios-mock-adapter')

const axios = require('axios')
const mock = new MockAdapter(axios)
const fs = require('fs');


import express from "express";
import repositoryFileUpload from "../../src/repository/repository.FileUpload";
app.use(express.json());
app.set("io", io)
app.use(express.urlencoded({ extended: true }));
routing(app);

const userId = new mongoose.Types.ObjectId().toString();


describe('Sending Files with Multer', () => {
  let accessToken: string;
  let fileObtained: any;
  let user: any

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


  // Test uploadAllFileController
  it('Expect 201 response: Upload file to AWS s3 via multer ', async () => {
    const mockRes = 'File uploaded successfully';

    const fileData = fs.readFileSync('/home/timmy/projects/backend/skiywater/coding.jpeg');
    const file = Buffer.from(fileData);

    mock.onPost("/api/v1/files/upload-file").reply(200, mockRes)
    const formData = new FormData();
    const blob = new Blob([file]);
    formData.append('file', blob, 'file');


    const response = await request(app).post('/api/v1/files/upload-file')
      .set({
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data'
      }).attach('file', fileData, 'coding.jpeg')

    expect(response.status).toBe(200);
    expect(response.body.data.message).toEqual(mockRes);
  }, 100000)


  // Test retriveAllFilesController
  it('should retrieve  all files', async () => {
    const response = await request(app)
      .get(`/api/v1/files/list`)
      .set('Authorization', `Bearer ${accessToken}`);

    // console.log(response.body.data)
    fileObtained = response.body.data[0]

    // Assert response status and data
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);

  });


  // Test retrieveUserController
  it('should retrieve file details', async () => {
    const response = await request(app)
      .get(`/api/v1/files/${fileObtained._id}`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Assert response status and data
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.filename).toBe(fileObtained.filename);
    expect(response.body.data.user).toBe(fileObtained.user);
  });


  it('It should obtain presign url for downloading files securely', async () => {

    const response = await request(app)
      .get(`/api/v1/files/presign/download`)
      .set('Authorization', `Bearer ${accessToken}`)
      .query({
        type: 'get',
        namespace: fileObtained.namespace,
        filename: fileObtained.filename
      });

    // Assert response status and data
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('presignedUrl');
  });


  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

});
