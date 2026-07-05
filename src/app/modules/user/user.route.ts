import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
const router = express.Router();

router
  .route('/profile')
  .get(auth(USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.EMPLOYEE), UserController.getUserProfile)
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.EMPLOYEE),
    fileUploadHandler(),
    (req: Request, res: Response, next: NextFunction) => {
      if (req.body.data) {
        req.body = UserValidation.updateUserSchema.parse(
          JSON.parse(req.body.data)
        );
      }
      return UserController.updateProfile(req, res, next);
    }
  );

router
  .route('/')
  .post(
    validateRequest(UserValidation.createUserSchema),
    UserController.createUser
  );

router
  .route('/create-staff')
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    validateRequest(UserValidation.createStaffSchema),
    UserController.createStaff
  );

export const UserRoutes = router;
