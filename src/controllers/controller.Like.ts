import { Response, Request } from "express";
import mongoose, { Types } from "mongoose";
import { validationResult } from "express-validator";
import userRepository from "../repository/repository.User";
import LikeRepository from "../repository/repository.Like";
import {
  createSuccessResponse,
  createErrorResponse,
} from "../config/config.error";

// Example controller method to like a post
const likePostController = async (req: Request, res: Response) => {
  const userId = req.user;
  const postId = req.params.postId;

  try {
    // Check if the user has already liked the post
    const existingLike = await LikeRepository.checkLikeExist(userId, postId);
    if (existingLike) {
      return res
        .status(400)
        .json({ message: "You have already liked this post" });
    }

    return res.status(200).json({ message: "Post liked successfully" });
  } catch (error) {
    console.error("Error liking post:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Example controller method to unlike a post
const unlikePostController = async (req: Request, res: Response) => {
  const userId = req.user;
  const postId = req.params.postId;

  try {
    // Check if the user has already liked the post
    const existingLike = await LikeRepository.checkLikeExist(userId, postId);
    if (!existingLike) {
      return res.status(400).json({ message: "You have not liked this post" });
    }

    // Delete the existing like
    await LikeRepository.deleteLike(userId, postId);

    return res.status(200).json({ message: "Post unliked successfully" });
  } catch (error) {
    console.error("Error unliking post:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const readAllPostLikeController = async (req: Request, res: Response) => {
  const postId = req.params.postId;

  try {
    // Check if the user has already liked the post
    const getLikes = await LikeRepository.findAllPostLikes(postId);
    return res.status(200).json(createSuccessResponse({ getLikes }));
  } catch (error) {
    console.error("Error getting post likes:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export default {
  likePostController,
  unlikePostController,
  readAllPostLikeController,
};
