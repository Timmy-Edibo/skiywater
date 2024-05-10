import { Response, Request } from 'express';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import userRepository from '../repository/repository.User';

import {
  createSuccessResponse,
  createErrorResponse
} from '../config/config.responses';
import { hashPassword } from '../services/services.Auth';

interface IUserExistence {
  message?: string;
  exists: boolean;
}



const userAlreadyExist = async (
  username: string,
  email: string
): Promise<IUserExistence> => {
  const userByEmail = await userRepository.getUserByEmail(email);
  const userByUsername = await userRepository.getUserByUsername(username);
  if (userByEmail || userByUsername) {
    return { message: 'Email or username are already in use', exists: true };
  } else if (userByEmail) {
    return { message: 'Email already in use', exists: true };
  } else if (userByUsername) {
    return { message: 'Username already in use', exists: true };
  } else {
    return { exists: false };
  }
};

const makeSuperuser = async () => {
  const users = await userRepository.getAllUsers();
  if (users.length == 0) return true
  return false

};

const isAdmin = async (current_user: string) => {
  const user = await userRepository.getUserById(current_user);
  if (user?.is_admin || user?.is_superuser) { return true; } else { return false; }
};

/** create new schedule */
const createUserController = async (req: Request, res: Response) => {
  const { username, password, email } = req.body;
  const hashedPassword = await hashPassword(password);

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const userExistence = await userAlreadyExist(username, email);
    if (userExistence.exists && userExistence.message) {
      return res.status(401).json(createErrorResponse(userExistence.message));
    }

    const isSuperuserEligible = await makeSuperuser()

    const user = await userRepository.createUser({
      _id: new mongoose.Types.ObjectId(),
      username,
      email,
      password: hashedPassword,
      is_active: true,
      is_admin: isSuperuserEligible,
      is_superuser: isSuperuserEligible
    });
    (user as any).password = undefined;

    res.status(201).json(createSuccessResponse(user));
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

    const checkUser = await isAdmin(current_user);
    if (user && (checkUser || user._id.toString() === current_user.toString())) {
      (user as any).password = undefined;
      return res.status(200).json(createSuccessResponse({ user }));
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
    const usersDb = await userRepository.getAllUsers();
    // Modify each user object in place to remove the password field
    usersDb.forEach(user => {
      (user as any).password = undefined;
    });

    // console.log(usersDb)
    res.status(200).json(createSuccessResponse(usersDb));
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
    const isAdminUser = await isAdmin(userId)

    if (isAdminUser) return res.status(403).json(createErrorResponse("Cannot delete Admin User"))

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