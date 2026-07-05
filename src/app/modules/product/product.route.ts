import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { ProductController } from './product.controller';
import { ProductValidation } from './product.validation';

const router = express.Router();

const parseBodyData = (req: Request, res: Response, next: NextFunction) => {
  if (req.body.data) {
    try {
      req.body = JSON.parse(req.body.data);
    } catch (error) {
      // Ignore JSON parse error, let validation schema handle errors
    }
  }
  next();
};

router
  .route('/')
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    fileUploadHandler(),
    parseBodyData,
    validateRequest(ProductValidation.createProductSchema),
    ProductController.createProduct
  )
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.EMPLOYEE),
    ProductController.getAllProducts
  );

router
  .route('/:id')
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.EMPLOYEE),
    ProductController.getSingleProduct
  )
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    fileUploadHandler(),
    parseBodyData,
    validateRequest(ProductValidation.updateProductSchema),
    ProductController.updateProduct
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.MANAGER),
    ProductController.deleteProduct
  );

export const ProductRoutes = router;
