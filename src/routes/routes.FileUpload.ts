import express from "express";
import controller from "../controllers/controller.FileUpload";
import {
  createPostValidator,
  loginValidator,
} from "../validators/validators.User";
import { authenticateToken } from "../middleware/middleware.authMiddleware";
import upload from "../middleware/middleware.ImageConfig";

const router = express.Router();


/** Program Block CRUD */
router.post(
  "/upload-file",
  // createPostValidator,
  authenticateToken,
  upload.single("file"),
  controller.createFileUploadController
); // create data inside db

router.get("/list", authenticateToken, controller.readAllPostController); // read or view all data inside db
router.get("/:fileId", authenticateToken, controller.getFileController); // read or view all data inside db
router.delete("/:fileId", authenticateToken, controller.deleteFileController); // read or view all data inside db
export default router;
