import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { SalesController } from './sales.controller';
import { SalesValidation } from './sales.validation';

const router = express.Router();

router
  .route('/')
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.EMPLOYEE),
    validateRequest(SalesValidation.createSaleSchema),
    SalesController.createSale
  )
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.EMPLOYEE),
    SalesController.getSaleHistory
  );

export const SalesRoutes = router;
