import express from 'express';
import controller from '../controllers/controller.Like';
import { createCommentValidator } from '../validators/validators.User';
import { authenticateToken } from '../middleware/middleware.authMiddleware';

const router = express.Router();

router.post(
  '/like-post/:postId',
  createCommentValidator,
  authenticateToken,
  controller.likePostController
); // create data inside db

router.delete(
    '/unlike-post/:postId',
    authenticateToken,
    controller.unlikePostController
  );

router.get(
    '/list/:postId',
    authenticateToken,
    controller.readAllPostLikeController
  );

export default router;
