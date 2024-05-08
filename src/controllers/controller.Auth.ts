// authService.ts
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response } from 'express';
import UserRepository from '../repository/repository.User';

// authController.ts
const login = async (req: Request, res: Response) => {
  try {
    const { sub } = req.body;
    const user = await UserRepository.getUserBySub(sub);
    if (!user) { return res.status(401).json({ error: 'Authentication failed' }); }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

export default {
  login
};
