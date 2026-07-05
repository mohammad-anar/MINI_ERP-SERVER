import { z } from 'zod';
import {
  withBody,
  zodEmail,
  zodPassword,
  zodPhone,
  zodString,
  zodUrl,
} from '../../../shared/zodValidators';
import { USER_ROLES } from '../../../enums/user';

/**
 * POST /user  — create new user
 */
const createUserSchema = withBody({
  name: zodString('Name'),
  email: zodEmail(),
  password: zodPassword(),
  role: z.nativeEnum(USER_ROLES).optional(),
  contact: zodPhone().optional(),
  location: zodString('Location').optional(),
  image: zodUrl('Profile image').optional(),
});

/**
 * PATCH /user/:id  — update user profile
 */
const updateUserSchema = z.object({
  body: z.object({
    name: zodString('Name').optional(),
    contact: zodPhone().optional(),
    location: zodString('Location').optional(),
    image: zodUrl('Profile image').optional(),
  }),
});

const createStaffSchema = withBody({
  name: zodString('Name'),
  email: zodEmail(),
  password: zodPassword(),
  role: z.enum([USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.EMPLOYEE]),
  contact: zodPhone().optional(),
  location: zodString('Location').optional(),
  image: zodUrl('Profile image').optional(),
});

export const UserValidation = {
  createUserSchema,
  updateUserSchema,
  createStaffSchema,
};
