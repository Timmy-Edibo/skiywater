import dotenv from "dotenv";
dotenv.config()

const { auth, requiresAuth } = require('express-openid-connect');

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET_KEY,
  baseURL: process.env.AUTH0_PROD_BASEURL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL:  process.env.AUTH0_PROD_DOMAIN
};

export const authZero = auth(config)
