import express from 'express';
import controller from '../controllers/controller.Follow';
import {
  createFollowtValidator,
  createPostValidator,
  loginValidator
} from '../validators/validators.User';
import { authenticateToken } from '../middleware/middleware.authMiddleware';

const router = express.Router();

/** Program Block CRUD */
router.post(
  '/create',
  createFollowtValidator,
  authenticateToken,
  controller.createFollowController
); // create data inside db
router.get('/list', authenticateToken, controller.readAllFollowController); // read or view all data inside db

router.get('/:followId', authenticateToken, controller.readFollowController); // read or view all data inside db
router.delete(
  '/:followId',
  authenticateToken,
  controller.deleteFollowController
); // read or view all data inside db

export default router;
