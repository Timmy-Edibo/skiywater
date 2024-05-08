import { Response, Request } from 'express';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import userRepository from '../repository/repository.User';

import {
  createSuccessResponse,
  createErrorResponse
} from '../config/config.error';

interface IUserExistence {
  message?: string;
  exists: boolean;
}

const userAlreadyExist = async (
  email: string
): Promise<IUserExistence> => {
  const userByEmail = await userRepository.getUserByEmail(email);
  if (userByEmail) {
    return { message: 'Email or username are already in use', exists: true };
  } else if (userByEmail) {
    return { message: 'Email already in use', exists: true };
  } else {
    return { exists: false };
  }
};

const isAdmin = async (current_user: string) => {
  const user = await userRepository.getUserById(current_user);
  if (user?.is_admin || user?.is_superuser) { return true; } else { return false; }
};

/** create new schedule */
const createUserController = async (req: Request, res: Response) => {
  const { user } = req.body;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const userExistence = await userAlreadyExist(user?.email);
    if (userExistence.exists && userExistence.message) {
      return res.status(401).json(createErrorResponse(userExistence.message));
    }

    const userToDb = await userRepository.createUser({
      _id: new mongoose.Types.ObjectId(),
      fullname: user.name,
      email: user.email,
      sub: user.sub,
      is_active: true,
      is_admin: false,
      is_superuser: false
    });

    res.status(201).json(createSuccessResponse(userToDb));
  } catch (error) {
    console.error(createErrorResponse(`Error creating user ${error}`));
    res.status(500).json(createErrorResponse(`Internal server error ${error}`));
  }
};

/** read specific schedule */
const readUserController = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const user = await userRepository.getUserById(userId);
    const current_user = req.user;

    if (user) {
      const checkUser = await isAdmin(current_user);
      if (checkUser || user._id === current_user) {
        return res.status(200).json(createSuccessResponse({ user }));
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error reading user:', error);
    res.status(500).json({ error: 'Internal server error' }); // Show error
  }
};

/** read all schedule that exist */
const readAllUserController = async (req: Request, res: Response) => {
  try {
    const current_user = req.user;
    const checkUser = await isAdmin(current_user);

    if (!checkUser) {
      return res
        .status(401)
        .json(createErrorResponse('Unauthorized!, Admin user only'));
    }
    const users = await userRepository.getAllUsers();
    res.status(200).json(createSuccessResponse(users));
  } catch (error) {
    console.error('Error reading all users:', error);
    res.status(500).json(createErrorResponse('Internal server error'));
  }
};

/** update schedule details */
const updateUserController = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    const user = await userRepository.getUserById(userId);
    if (!user) { return res.status(404).json({ message: 'User not found' }); }

    const updatedUser = await user.set(req.body).save();
    // const updatedUser = await userRepository.updateUser(userId, req.body);

    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' }); // Error response
  }
};

const deleteUserController = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const deletedUser = await userRepository.deleteUser(userId);

    if (deletedUser) {
      return res
        .status(204)
        .json(createSuccessResponse('User deleted successfully'));
    } else { return res.status(404).json(createSuccessResponse('User not found')); }
  } catch (error: any) {
    return res.status(500).json(createErrorResponse('Internal server error'));
  }
};

export default {
  readUserController,
  createUserController,
  readAllUserController,
  updateUserController,
  deleteUserController
};
