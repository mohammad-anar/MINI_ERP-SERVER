import { z } from 'zod';
import {
  withBody,
  zodEmail,
  zodOptionalString,
  zodPassword,
  zodPhone,
  zodString,
  zodUrl,
} from '../../../shared/zodValidators';

/**
 * POST /user  — create new user
 */
const createUserSchema = withBody({
  name: zodString('Name'),
  email: zodEmail(),
  password: zodPassword(),
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

export const UserValidation = {
  createUserSchema,
  updateUserSchema,
};
