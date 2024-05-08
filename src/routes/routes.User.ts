import express from 'express';
import controller from '../controllers/controller.User';
import {
  createUserValidator,
  updateUserValidator
} from '../validators/validators.User';

const router = express.Router();

/** Program Block CRUD */
router.post('/create', createUserValidator, controller.createUserController);
router.get('/list', controller.readAllUserController);
router.get('/:userId', controller.readUserController);
router.put(
  '/:userId',

  updateUserValidator,
  controller.updateUserController
); // update user
router.delete('/:userId', controller.deleteUserController); // delete user

export default router;
