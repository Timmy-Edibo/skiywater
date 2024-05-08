import express from "express";
import controller from "../controllers/controller.FileUpload";
import {
  createPostValidator,
  loginValidator,
} from "../validators/validators.User";
import upload from "../middleware/middleware.ImageConfig";
import { authenticateToken } from "../middleware/middleware.AuthMiddleware";


const router = express.Router();

/** Program Block CRUD */
router.post(
  "/upload-file",
  // createPostValidator,
  authenticateToken,
  upload.single("file"),
  controller.createFileUploadController
); // create data inside db

router.post("/presign/generate", 
authenticateToken, 
upload.single("file"),
controller.createPresignUrlController); 

router.get("/list", controller.readAllFileController); 
router.get("/:fileId", controller.getFileController); 
router.delete("/:fileId", controller.deleteFileController); 

export default router;
