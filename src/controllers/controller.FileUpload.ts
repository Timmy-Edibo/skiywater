import { Response, Request } from "express";
import mongoose, { Types } from "mongoose";
import userRepository from "../repository/repository.User";
import fileUploadRepository from "../repository/repository.FileUpload";

import {
  createSuccessResponse,
  createErrorResponse,
} from "../config/config.responses";
import { bucketName, s3Client } from "../config/config.FileUploader";

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


const DownloadPresignUrlController = async (req: Request, res: Response) => {
  try {
  
    const io = req.app.get("io")

    const type = req.query.type
    const namespace = req.query.namespace
    const filename = req.query.filename
    const link = `${namespace}/${filename}` 


    console.log("link from api", link)

    if (!link) return res.status(400).json({ success: false, error: "No link is supplied" });
    if (!type || type !== "get") res.status(403).json({ success: false, error: "Operation not allowed" });

    const fileDb = await fileUploadRepository.getFileByUrl(link.toString())
    if (!fileDb) return res.status(404).json(createErrorResponse("File not found"))

    const param = {
      Bucket: bucketName,
      Key: link.toString(),
    }
    const command = new GetObjectCommand(param);
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 * 20 });

    //get file with the link supplied
    const socketData = { message: `${req.user} viewed your file. Click to see file detail`, fileDb, ownerId: fileDb?.user, downloaderId: req.user }
    io.emit("fileDownloaded", socketData)
    console.log(socketData)

    // Return the pre-signed URL to the client
    res.status(200).json(createSuccessResponse({ success: true, presignedUrl }));
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json(createErrorResponse("Internal server error"));
  }
};


const UploadPresignUrlController = async (req: Request, res: Response) => {
  try {
    const io = req.app.get("io");

    const type = req.body.type
    const file = req.file

    if (!file) return res.status(400).json({ success: false, error: "No file is uploaded" });
    if (!type || type !== "put") res.status(403).json({ success: false, error: "Operation not allowed" });

    const dbUser = await userRepository.getUserById(req.user)
    const userIdentifier = dbUser?.email.split("@")[0]

    const fileName = `${uuidv4()}-${file.originalname}`
    const fileUrl = `${userIdentifier}/${fileName}`

    const param = {
      Bucket: bucketName,
      Key: fileUrl,
      ContentType: file.mimetype
    }
    const command = new PutObjectCommand(param);
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 * 20 });

    const dbFile = await fileUploadRepository.uploadFile({
      _id: new mongoose.Types.ObjectId(),
      filename: fileName,
      namespace: userIdentifier,
      url: fileUrl,
      user: req.user,
    });

    io.emit("fileUploaded", { mesage: `${userIdentifier} just upload a new file. Click to view detail`, dbFile });

    // Return the pre-signed URL to the client
    res.status(200).json(createSuccessResponse({ success: true, presignedUrl, dbFile }));
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json(createErrorResponse("Internal server error"));
  }
};



const createFileUploadController = async (req: Request, res: Response) => {
  console.log("User.......", req.user)

  try {
    const io = req.app.get("io");
    const file = req.file
    const uuid = uuidv4()

    if (!file) return res.status(400).json({ success: false, error: "No files uploaded" });

    const dbUser = await userRepository.getUserById(req.user.toString())
    if (!dbUser) return res.status(400).json({ success: false, error: "UnAuthorized request" });

    const userIdentifier = dbUser?.email.split("@")[0]

    const fileName = `${uuid}-${file.originalname}`
    const fileUrl = `${userIdentifier}/${fileName}`

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
      filename: fileName,
      namespace: userIdentifier,
      url: fileUrl,
      user: req.user,
    });

    io.emit("fileUploaded", { mesage: `${userIdentifier} just upload a new file. Click to view detail`, dbFile });


    res.status(200).json(createSuccessResponse({ success: true, data: dbFile, message: "File uploaded successfully" }));
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json(createErrorResponse(`Internal server error, ${error}`));
  }
};


const getFileController = async (req: Request, res: Response) => {
  try {
    const fileId = req.params.fileId;
    const file = await fileUploadRepository.getFileById(fileId);


    if (file) return res.status(200).json(createSuccessResponse(file));
    return res.status(404).json(createErrorResponse("File not found"));

  } catch (error) {
    console.error("Error reading file:", error);
    return res.status(500).json(createErrorResponse("Internal server error"));
  }
};


const searchFileController = async (req: Request, res: Response) => {
  try {
    const file = req.query.fileData?.toString();
    if (file) {
      const fileDb = await fileUploadRepository.searchFile(file);
      if (fileDb) return res.status(200).json(createSuccessResponse(file));
      return res.status(404).json(createErrorResponse("File not found"));
    }
  } catch (error) {
    console.error("Error reading file:", error);
    return res.status(500).json(createErrorResponse("Internal server error"));
  }
};


const searchUsersFileController = async (req: Request, res: Response) => {
  try {
    const fileId = req.params.fileId;
    const file = await fileUploadRepository.getFileById(fileId);


    if (file) return res.status(200).json(createSuccessResponse(file));
    return res.status(404).json(createErrorResponse("File not found"));

  } catch (error) {
    console.error("Error reading file:", error);
    return res.status(500).json(createErrorResponse("Internal server error"));
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
      Key: file?.filename,
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
  // const io = req.app.get("io");

  try {
    let files = await fileUploadRepository.getAllFiles(page, limit)
    // io.emit("notify", { files });
    console.log("length............", files.length)

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
  UploadPresignUrlController,
  DownloadPresignUrlController,
  getFileController,
  deleteFileController,
  readAllFileController,
  updateFileController,
  searchFileController,
  searchUsersFileController
};



