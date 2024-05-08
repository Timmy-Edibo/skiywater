import { Response, Request } from "express";
import mongoose, { Types } from "mongoose";
import { validationResult } from "express-validator";
import userRepository from "../repository/repository.User";
import commentRepository from "../repository/repository.Comment";
import {
  createSuccessResponse,
  createErrorResponse,
} from "../config/config.error";

const isAdmin = async (current_user: string) => {
  const user = await userRepository.getUserById(current_user);
  console.log("user data", user);
  if (user?.is_admin || user?.is_superuser) {
    return true;
  } else {
    return false;
  }
};

/** create new schedule */
const createCommentController = async (req: Request, res: Response) => {
  const { content, post } = req.body;
  const user = req.user;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const comment = await commentRepository.createComment({
      _id: new mongoose.Types.ObjectId(),
      post,
      content,
      user,
    });

    res.status(201).json(createSuccessResponse(comment));
  } catch (error) {
    console.error(createErrorResponse("Error creating a comment"), error);
    res.status(500).json(createErrorResponse(`Internal server error ${error}`));
  }
};
const readCommentController = async (req: Request, res: Response) => {
  try {
    const commentId = req.params.commentId;
    const comment = await commentRepository.getCommentById(commentId);
    return comment
      ? res.status(200).json(createSuccessResponse({ comment }))
      : res.status(404).json(createErrorResponse("Comment not found"));
  } catch (error) {
    console.error("Error reading post:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const readAllPostCommentController = async (req: Request, res: Response) => {
  try {
    const isAdminUser = await isAdmin(req.user);

    if (!isAdminUser) {
      return res
        .status(401)
        .json(createErrorResponse("Unauthorized! Admin user only"));
    }

    let follows = await (isAdminUser
      ? commentRepository.getAllComments()
      : commentRepository.getCommentsByUserId(req.user));
    console.log("all follow:..........", follows);
    return res.status(200).json(createSuccessResponse(follows));
  } catch (error) {
    console.error("Error reading all posts:", error);
    return res.status(500).json(createErrorResponse("Internal server error"));
  }
};

const readAllCommentController = async (req: Request, res: Response) => {
  try {
    const isAdminUser = await isAdmin(req.user);

    if (!isAdminUser) {
      return res
        .status(401)
        .json(createErrorResponse("Unauthorized! Admin user only"));
    }

    let follows = await (isAdminUser ? commentRepository.getAllComments() : []);
    return res.status(200).json(createSuccessResponse(follows));
  } catch (error) {
    console.error("Error reading all posts:", error);
    return res.status(500).json(createErrorResponse("Internal server error"));
  }
};

const deleteCommentController = async (req: Request, res: Response) => {
  try {
    const commentId = req.params.commentId;
    const currentUserId = req.user;

    const getComment = await commentRepository.getCommentById(commentId);
    const isAdminUser = await isAdmin(currentUserId);
    if (!isAdminUser && getComment?.user !== currentUserId) {
      return res.status(401).json(createErrorResponse("Unauthorized!"));
    }

    const deletedComment = await commentRepository.deleteComment(commentId);
    if (!deletedComment) {
      return res.status(404).json(createErrorResponse("Comment not found"));
    }
    return res
      .status(204)
      .json(createSuccessResponse("Comment successfully deleted"));
  } catch (error) {
    console.error("Error deleting post:", error);
    return res.status(500).json(createErrorResponse("Internal server error"));
  }
};

export default {
  readCommentController,
  createCommentController,
  readAllCommentController,
  deleteCommentController,
};
