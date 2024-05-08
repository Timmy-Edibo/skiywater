import express from 'express';
import controller from '../controllers/controller.Comment';
import { createCommentValidator } from '../validators/validators.User';
import { authenticateToken } from '../middleware/middleware.authMiddleware';

const router = express.Router();

router.post(
  '/create',
  createCommentValidator,
  authenticateToken,
  controller.createCommentController
); // create data inside db

router.get(
    '/list',
    authenticateToken,
    controller.readAllCommentController
  );

router.get(
  '/list/:postId',
  authenticateToken,
  controller.readAllCommentController
);

router.get(
  '/:postId/comments/:commentId',
  authenticateToken,
  controller.readCommentController
);
router.delete(
  '/:commentId',
  authenticateToken,
  controller.deleteCommentController
); // read or view all data inside db

export default router;
