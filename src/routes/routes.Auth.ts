import express from 'express';
import controller from '../controllers/controller.User';
import { loginValidator } from '../validators/validators.User';
import service from '../controllers/controller.Auth';

const router = express.Router();

/** Program Block CRUD */
router.post('/login', loginValidator, service.login); // create data inside db
router.get('/logout', controller.readAllUserController); // read or view all data inside db

export default router;
