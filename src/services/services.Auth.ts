
// authService.ts
import jwt from 'jsonwebtoken';
const bcrypt = require('bcryptjs');

export interface IJWTPayload {
  user: string;
  iat: number;
  exp: number;
}

export const generateAccessToken = (user: any) => {
  return jwt.sign({ user: user._id }, process.env.JWT_SECRET as string, {
    expiresIn: '2d'
  }); // Customize expiry as needed
};

export const generateRefreshToken = (user: any) => {
  return jwt.sign({ user: user._id }, process.env.JWT_SECRET as string, {
    expiresIn: '7d'
  }); // Customize expiry as needed
};

export const verifyToken = (token: string): IJWTPayload => {
  return jwt.verify(token, process.env.JWT_SECRET as string) as IJWTPayload;
};

export const hashPassword = async (password: string) => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
};

export const verifyPassword = (password: string, userPassword: string) => {
  return bcrypt.compareSync(password, userPassword); // true
};
