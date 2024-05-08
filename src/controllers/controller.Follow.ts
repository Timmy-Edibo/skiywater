import { Response, Request } from 'express';
import mongoose, { Types } from 'mongoose';
import { validationResult } from 'express-validator';
import userRepository from '../repository/repository.User';
import followRepository from '../repository/repository.Follow';
import {
  createSuccessResponse,
  createErrorResponse
} from '../config/config.error';

const isAdmin = async (current_user: string) => {
  const user = await userRepository.getUserById(current_user);
  console.log('user data', user);
  if (user?.is_admin || user?.is_superuser) { return true; } else { return false; }
};

/** create new schedule */
const createFollowController = async (req: Request, res: Response) => {
  const { following, follower } = req.body;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const checkFollow = await followRepository.checkFollowExist(
      follower,
      following
    );
    console.log('followes', checkFollow);
    if (checkFollow) {
      return res
        .status(401)
        .json(createErrorResponse('Follow has already been created'));
    }

    const getFollower = await userRepository.getUserById(follower);
    const getFollowing = await userRepository.getUserById(following);

    if (!getFollower || !getFollowing) {
      return res.status(404).json(createErrorResponse('User not found'));
    }
    if (getFollower._id.toString() !== req.user || follower === following) {
      return res
        .status(404)
        .json(createErrorResponse('Oops! Bad request, Check follower\'s Id'));
    }

    console.log('post', req.user);
    const follow = await followRepository.createFollow({
      _id: new mongoose.Types.ObjectId(),
      following,
      follower,
      active: true
    });
    res.status(201).json(createSuccessResponse(follow));
  } catch (error) {
    console.error(createErrorResponse('Error creating a follow'), error);
    res.status(500).json(createErrorResponse(`Internal server error ${error}`));
  }
};
const readFollowController = async (req: Request, res: Response) => {
  try {
    const followId = req.params.postId;
    const currentUserId = req.user;
    const follow = await followRepository.getFollowById(followId);

    if (!follow) { return res.status(404).json({ message: 'Follow not found' }); }
    return res.status(200).json(createSuccessResponse({ follow }));
  } catch (error) {
    console.error('Error reading post:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const readAllFollowController = async (req: Request, res: Response) => {
  try {
    const isAdminUser = await isAdmin(req.user);

    if (!isAdminUser) {
      return res
        .status(401)
        .json(createErrorResponse('Unauthorized! Admin user only'));
    }

    let follows = await (isAdminUser
      ? followRepository.getAllFollow()
      : followRepository.getFollowsByFollowingId(req.user));
    console.log('all follow:..........', follows);
    return res.status(200).json(createSuccessResponse(follows));
  } catch (error) {
    console.error('Error reading all posts:', error);
    return res.status(500).json(createErrorResponse('Internal server error'));
  }
};

const deleteFollowController = async (req: Request, res: Response) => {
  try {
    const followId = req.params.followId;
    const currentUserId = req.user;

    const deletedFollow = await followRepository.getFollowById(followId);
    if (!deletedFollow) {
      return res.status(404).json(createErrorResponse('User not found'));
    }

    const isAdminUser = await isAdmin(currentUserId);
    if (!isAdminUser && deletedFollow.follower !== currentUserId) {
      return res.status(401).json(createErrorResponse('Unauthorized!'));
    }
    followRepository.deleteFollow(followId);

    return res
      .status(204)
      .json(createSuccessResponse('Unfollowed successfully'));
  } catch (error) {
    console.error('Error deleting post:', error);
    return res.status(500).json(createErrorResponse('Internal server error'));
  }
};

export default {
  readFollowController,
  createFollowController,
  readAllFollowController,
  deleteFollowController
};
