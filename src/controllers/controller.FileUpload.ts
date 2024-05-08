import { Response, Request } from "express";
import mongoose, { Types } from "mongoose";
import { validationResult } from "express-validator";
import userRepository from "../repository/repository.User";
import fileUploadRepository from "../repository/repository.FileUpload";

import {
  createSuccessResponse,
  createErrorResponse,
} from "../config/config.error";
import { bucketName, s3Client } from "../services/services.FileUploader";

import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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


const createPresignUrlController = async (req: Request, res: Response) => {
  try {
    const type = req.query.type
    const link = req.query.link

    if (!link) return res.status(400).json({ success: false, error: "No link is supplied" });
    if (!type || type !== "get") res.status(403).json({ success: false, error: "Operation not allowed" });

    const param = {
      Bucket: bucketName,
      Key: link.toString(),
    }
    const command = new GetObjectCommand(param);
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 * 20 });

    // Return the pre-signed URL to the client
    res.status(200).json({ success: true, presignedUrl });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};


const createFileUploadController = async (req: Request, res: Response) => {
  console.log(req.user, req.file)

  try {
    if (!req.file) return res.status(400).json({ success: false, error: "No files uploaded" });

    console.log(req.file)
    const file = req.file
    const dbUser = await userRepository.getUserById(req.user)
    const userIdentifier = dbUser?.email.split("@")[0]

    const fileName = `${uuidv4()}-${file.originalname}`
    const fileUrl = `${userIdentifier}/${uuidv4()}-${file.originalname}`

    const param = {
      Bucket: bucketName,
      Key: fileUrl,
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



const readAllFileController = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const io = req.app.get("io");

  try {
    const isAdminUser = await isAdmin(req.user);

    // if (!isAdminUser) {
    //   return res
    //     .status(401)
    //     .json(createErrorResponse("Unauthorized! Admin user only"));
    // }

    // console.log("all post:..........")
    let files = await fileUploadRepository.getAllFiles(page, limit)
    io.emit("notify", { files });

    return res.status(200).json(createSuccessResponse(files));
  } catch (error) {
    console.error("Error reading all posts:", error);
    return res.status(500).json(createErrorResponse("Internal server error"));
  }
};


const updateFileController = async (req: Request, res: Response) => {
  try {
    const fileId = req.params.postId;
    const postData = req.body;
    const current_user = req.user;

    // Check if the user exists
    const file = await fileUploadRepository.getFileById(fileId);
    if (!file) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isAdminUser = await isAdmin(current_user);
    if (!isAdminUser && file.user !== current_user) {
      return res.status(401).json(createErrorResponse("Unauthorized!"));
    }

    // Update the user with the provided data
    file.set(postData);
    const updatedUser = await file.save();

    // Return the updated user
    res.status(200).json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export default {
  createFileUploadController,
  createPresignUrlController,
  getFileController,
  deleteFileController,
  readAllFileController,
  updateFileController,
};



