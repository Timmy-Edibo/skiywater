import express from "express";
import controller from "../controllers/controller.Post";
import {
  createPostValidator,
  loginValidator,
} from "../validators/validators.User";
import { authenticateToken } from "../middleware/middleware.authMiddleware";

const router = express.Router();

/** Program Block CRUD */
router.post(
  "/create",
  createPostValidator,
  authenticateToken,
  controller.createPostController
); // create data inside db
router.get("/list", authenticateToken, controller.readAllPostController); // read or view all data inside db
router.get(
  "/list/:Id/followed-posts",
  authenticateToken,
  controller.readAllPostByFollowersController
); // read or view all data inside db

router.get("/:postId", authenticateToken, controller.readPostController); // read or view all data inside db
router.delete("/:postId", authenticateToken, controller.deletePostController); // read or view all data inside db
export default router;
