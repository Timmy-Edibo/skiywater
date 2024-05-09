import express from 'express';
import controller from '../controllers/controller.User';
import {
  createUserValidator,
  updateUserValidator
} from '../validators/validators.User';
import { authenticateToken } from '../middleware/middleware.AuthMiddleware';

const router = express.Router();

/** Program Block CRUD */
router.post('/create', createUserValidator, controller.createUserController);
router.get('/list', authenticateToken, controller.readAllUserController);
router.get('/detail/:userId', authenticateToken, controller.readUserController);
router.put(
  '/:userId',

  updateUserValidator,
  authenticateToken,
  controller.updateUserController
); // update user
router.delete('/:userId', authenticateToken, controller.deleteUserController); // delete user

export default router;
