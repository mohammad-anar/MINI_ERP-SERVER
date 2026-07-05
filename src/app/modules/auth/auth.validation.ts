import {
  withBody,
  zodEmail,
  zodOTP,
  zodPassword,
} from '../../../shared/zodValidators';

/**
 * POST /auth/login
 */
const loginSchema = withBody({
  email: zodEmail(),
  password: zodPassword(),
});

/**
 * POST /auth/verify-email
 */
const verifyEmailSchema = withBody({
  email: zodEmail(),
  oneTimeCode: zodOTP(),
});

/**
 * POST /auth/forgot-password
 */
const forgotPasswordSchema = withBody({
  email: zodEmail(),
});

/**
 * POST /auth/reset-password  (requires reset token in query/header)
 * Note: newPassword === confirmPassword check is handled in the service layer.
 */
const resetPasswordSchema = withBody({
  newPassword: zodPassword(),
  confirmPassword: zodPassword(),
});


/**
 * PATCH /auth/change-password
 */
const changePasswordSchema = withBody({
  currentPassword: zodPassword(),
  newPassword: zodPassword(),
  confirmPassword: zodPassword(),
});

export const AuthValidation = {
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
};
