// authMiddleware.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { verifyToken, IJWTPayload } from '../services/services.Auth';

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.header('Authorization');
    const getBearer = authHeader && authHeader.split(' ')[0];
    const token = authHeader && authHeader.split(' ')[1];

    if (getBearer !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Access denied, Invalid token' });
    }

    const decoded: IJWTPayload = verifyToken(token);
    const {user, iat, exp } = decoded;
    req.user = user;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};