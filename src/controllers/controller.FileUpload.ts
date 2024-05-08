import { Response, Request } from "express";
import mongoose, { Types } from "mongoose";
import { validationResult } from "express-validator";
import userRepository from "../repository/repository.User";
import fileUploadRepository from "../repository/repository.FileUpload";
import postRepository from "../repository/repository.Post";

import {
  createSuccessResponse,
  createErrorResponse,
} from "../config/config.error";
import { bucketName, s3Client } from "../services/services.FileUploader";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';


const isAdmin = async (current_user: string) => {
  const user = await userRepository.getUserById(current_user);
  console.log("user data", user);
  if (user?.is_admin || user?.is_superuser) {
    return true;
  } else {
    return false;
  }
};


const createFileUploadController = async (req: Request, res: Response) => {
  console.log(req.user)

  try {
    if (!req.file) return res.status(400).json({ success: false, error: "No files uploaded" });

    console.log(req.file)
    const file = req.file

    const fileName = `${uuidv4()}-${file.originalname}`
    const fileUrl = `uploads/${uuidv4()}-${file.originalname}`

    const param = {
      Bucket: bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype
    }
    const command = new PutObjectCommand(param);
    await s3Client.send(command)

    const dbFile = await fileUploadRepository.uploadFile({
      _id: new mongoose.Types.ObjectId(),
      name: fileName,
      url: fileUrl,
      user: req.user,
    });

    res.status(200).json({ success: true, data: dbFile, message: "Files uploaded successfully" });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};





// const createMultipleFileUploadController = async (req: Request, res: Response) => {
//   console.log("inside the endpoiint..........", typeof req.files, req.files);

//   try {
//     const params = {
//       Bucket: bucketName,
//       Key: req.files.originalname,
//       Body: req.file.buffer,
//     };

//     s3.upload(params, (err, data) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).send('Error uploading file');
//       }

//       res.send('File uploaded successfully');
//     });

//     // const errors = validationResult(req);
//     // if (!errors.isEmpty()) {
//     //   return res.status(400).json({ success: false, errors: errors.array() });
//     // }

//     // const post = await postRepository.createPost({
//     //   _id: new mongoose.Types.ObjectId(),
//     //   title,
//     //   description,
//     //   author: req.user,
//     // });
//     res.status(201).json(createSuccessResponse(post));
//   } catch (error) {
//     console.error(createErrorResponse("Error creating post"), error);
//     res.status(500).json(createErrorResponse(`Internal server error ${error}`));
//   }
// };




const getFileController = async (req: Request, res: Response) => {
  try {
    const fileId = req.params.fileId;
    const file = await fileUploadRepository.getFileById(fileId);


    if (file) return res.status(200).json(file);
    return res.status(404).json({ "message": "File not found" });

  } catch (error) {
    console.error("Error reading file:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};



const deleteFileController = async (req: Request, res: Response) => {
  try {
    const currentUser = req.user
    const fileId = req.params.fileId;
    if (!fileId) return res.status(400).json({ success: false, error: "fileId not supplied" });

    const fileToDelete = await fileUploadRepository.getFileById(fileId);
    if (!fileToDelete) return res.status(200).json({ "message": "File not Found" });

    if (fileToDelete && fileToDelete?.user !== currentUser) return res.status(403).json({ "message": "UnAuthorized to perform operation" });

    const file = await fileUploadRepository.deleteFile(fileId)

    const param = {
      Bucket: bucketName,
      Key: file?.name,
    }
    const command = new DeleteObjectCommand(param);
    await s3Client.send(command)
    res.status(204).json({ success: true, message: "Files deleted successfully" });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};



const readAllPostController = async (req: Request, res: Response) => {
  const userId = req.params.userId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  // console.log("caledd.......................")
  const io = req.app.get("io");

  try {
    const isAdminUser = await isAdmin(req.user);

    if (!isAdminUser) {
      return res
        .status(401)
        .json(createErrorResponse("Unauthorized! Admin user only"));
    }

    // console.log("all post:..........")
    let posts = await (isAdminUser
      ? postRepository.getAllPosts(page, limit)
      : postRepository.getAllPostByUser(req.user, page, limit));
    io.emit("notify", { posts });

    return res.status(200).json(createSuccessResponse(posts));
  } catch (error) {
    console.error("Error reading all posts:", error);
    return res.status(500).json(createErrorResponse("Internal server error"));
  }
};

const readAllPostByFollowersController = async (
  req: Request,
  res: Response
) => {
  try {
    let posts = await postRepository.getAllPostByFollowers(req.user);
    return res.status(200).json(createSuccessResponse(posts));
  } catch (error) {
    console.error("Error reading all posts:", error);
    return res.status(500).json(createErrorResponse("Internal server error"));
  }
};

const updatePostController = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;
    const postData = req.body;
    const current_user = req.user;

    // Check if the user exists
    const post = await postRepository.getPostById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isAdminUser = await isAdmin(current_user);
    if (!isAdminUser && post.author !== current_user) {
      return res.status(401).json(createErrorResponse("Unauthorized!"));
    }

    // Update the user with the provided data
    post.set(postData);
    const updatedUser = await post.save();

    // Return the updated user
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deletePostController = async (req: Request, res: Response) => {
  try {
    const postId = req.params.postId;
    const currentUserId = req.user;

    const deletedPost = await postRepository.deletePost(postId);
    if (!deletedPost) {
      return res.status(404).json(createErrorResponse("Post not found"));
    }

    const isAdminUser = await isAdmin(currentUserId);
    if (!isAdminUser && deletedPost.author !== currentUserId) {
      return res.status(401).json(createErrorResponse("Unauthorized!"));
    }

    return res
      .status(204)
      .json(createSuccessResponse("Post deleted successfully"));
  } catch (error) {
    console.error("Error deleting post:", error);
    return res.status(500).json(createErrorResponse("Internal server error"));
  }
};

export default {
  createFileUploadController,
  getFileController,
  deleteFileController,
  readAllPostController,
  updatePostController,
  readAllPostByFollowersController,
};



