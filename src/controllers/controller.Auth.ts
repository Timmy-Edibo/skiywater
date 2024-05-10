// authService.ts
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response } from 'express';
import UserRepository from '../repository/repository.User';
import {
  generateAccessToken,
  generateRefreshToken,
  hashPassword,
  verifyPassword
} from '../services/services.Auth';

// authController.ts
const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await UserRepository.getUserByEmail(email);

    if (!user) { return res.status(401).json({ error: 'Authentication failed' }); }

    const passwordMatch = await verifyPassword(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    // Generate JWT token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(200).json({ accessToken, refreshToken });
  } catch (error) {
    res.status(500).json({ error: `Login failed ${error}` });
  }
};

export default {
  login
};