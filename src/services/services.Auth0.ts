import dotenv from "dotenv";
dotenv.config()

const { auth, requiresAuth } = require('express-openid-connect');

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET_KEY,
  baseURL: 'http://localhost:3000',
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: 'https://dev-yglnn35w.us.auth0.com'
};

export const authZero = auth(config)
