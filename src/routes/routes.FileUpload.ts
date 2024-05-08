import express from "express";
import controller from "../controllers/controller.FileUpload";
import {
  createPostValidator,
  loginValidator,
} from "../validators/validators.User";
import upload from "../middleware/middleware.ImageConfig";

const router = express.Router();


/** Program Block CRUD */
router.post(
  "/upload-file",
  // createPostValidator,

  upload.single("file"),
  controller.createFileUploadController
); // create data inside db

router.get("/list", controller.readAllPostController); // read or view all data inside db
router.get("/:fileId", controller.getFileController); // read or view all data inside db
router.delete("/:fileId", controller.deleteFileController); // read or view all data inside db
export default router;
