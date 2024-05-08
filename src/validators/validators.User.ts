import { body } from 'express-validator';

export const createUserValidator = [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 5 }).withMessage('Password must be at least 6 characters long')
];

export const updateUserValidator = [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 5 }).withMessage('Password must be at least 6 characters long')
];

export const loginValidator = [
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 5 }).withMessage('Password must be at least 6 characters long')
];

export const createPostValidator = [
  body('title').notEmpty().withMessage('Title is requirew'),
  body('description').notEmpty().withMessage('Description is requirew')
];

export const createFollowtValidator = [
  body('follower').notEmpty().withMessage('Follower is required'),
  body('following').notEmpty().withMessage('Following is required')
];

export const createCommentValidator = [
  body('content').notEmpty().withMessage('Content is required'),
  body('post').notEmpty().withMessage('postId is required')
];
