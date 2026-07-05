import { z, ZodTypeAny } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// Primitive field builders
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Required trimmed string with a custom label used in error messages.
 * @example zodString('Name') → z.string with "Name is required"
 */
export const zodString = (label: string, opts?: { min?: number; max?: number }) => {
  let schema = z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(1, `${label} cannot be empty`);

  if (opts?.min !== undefined) {
    schema = schema.min(opts.min, `${label} must be at least ${opts.min} characters`);
  }
  if (opts?.max !== undefined) {
    schema = schema.max(opts.max, `${label} must be at most ${opts.max} characters`);
  }
  return schema;
};

/**
 * Valid email address — trimmed, lowercased, and format-validated.
 */
export const zodEmail = () =>
  z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .min(1, 'Email cannot be empty')
    .email('Please enter a valid email address');

/**
 * Password field with configurable minimum length (default: 8).
 */
export const zodPassword = (min = 8) =>
  z
    .string({ required_error: 'Password is required' })
    .min(min, `Password must be at least ${min} characters`)
    .max(128, 'Password is too long');

/**
 * Phone number validated against E.164 international format.
 * e.g. +8801XXXXXXXXX
 */
export const zodPhone = () =>
  z
    .string({ required_error: 'Phone number is required' })
    .trim()
    .regex(
      /^\+?[1-9]\d{6,14}$/,
      'Please enter a valid phone number (e.g. +8801XXXXXXXXX)'
    );

/**
 * MongoDB ObjectId — 24-character hex string.
 */
export const zodObjectId = (label = 'ID') =>
  z
    .string({ required_error: `${label} is required` })
    .regex(/^[a-f\d]{24}$/i, `Invalid ${label}: must be a 24-character hex string`);

/**
 * 6-digit numeric OTP.
 */
export const zodOTP = () =>
  z
    .number({ required_error: 'OTP is required' })
    .int('OTP must be an integer')
    .min(100000, 'OTP must be 6 digits')
    .max(999999, 'OTP must be 6 digits');

/**
 * URL string (http or https).
 */
export const zodUrl = (label = 'URL') =>
  z
    .string({ required_error: `${label} is required` })
    .url(`${label} must be a valid URL (http/https)`);

/**
 * Enum from a readonly tuple of string literals.
 * @example zodEnum(['ADMIN', 'USER'] as const)
 */
export const zodEnum = <T extends string>(
  values: readonly [T, ...T[]],
  label = 'Value'
) =>
  z.enum(values, {
    required_error: `${label} is required`,
    invalid_type_error: `${label} must be one of: ${values.join(', ')}`,
  });

/**
 * Positive integer (e.g. for page number, count).
 */
export const zodPositiveInt = (label = 'Number') =>
  z
    .number({ required_error: `${label} is required` })
    .int(`${label} must be an integer`)
    .positive(`${label} must be a positive number`);

/**
 * Optional string — returns undefined if blank, trims whitespace.
 */
export const zodOptionalString = () =>
  z.string().trim().optional().or(z.literal(''));

// ─────────────────────────────────────────────────────────────────────────────
// Schema wrapper helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Wraps a raw shape object in `{ body: z.object(shape) }` for use with
 * the `validateRequest` middleware.
 *
 * @example
 * validateRequest(withBody({ email: zodEmail(), password: zodPassword() }))
 */
export const withBody = <T extends Record<string, ZodTypeAny>>(shape: T) =>
  z.object({ body: z.object(shape) });

/**
 * Wraps a raw shape in `{ params: z.object(shape) }`.
 */
export const withParams = <T extends Record<string, ZodTypeAny>>(shape: T) =>
  z.object({ params: z.object(shape) });

/**
 * Wraps a raw shape in `{ query: z.object(shape) }`.
 */
export const withQuery = <T extends Record<string, ZodTypeAny>>(shape: T) =>
  z.object({ query: z.object(shape) });

/**
 * Combines body, params, and query wrappers into a single schema.
 */
export const withRequest = <
  B extends Record<string, ZodTypeAny>,
  P extends Record<string, ZodTypeAny>,
  Q extends Record<string, ZodTypeAny>
>(opts: {
  body?: B;
  params?: P;
  query?: Q;
}) =>
  z.object({
    ...(opts.body ? { body: z.object(opts.body) } : {}),
    ...(opts.params ? { params: z.object(opts.params) } : {}),
    ...(opts.query ? { query: z.object(opts.query) } : {}),
  });

// ─────────────────────────────────────────────────────────────────────────────
// Common password-pair refinement
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Adds a superRefine to a schema that checks `newPassword === confirmPassword`.
 * Attach this after defining a schema with both fields.
 *
 * @example
 * withBody({
 *   newPassword: zodPassword(),
 *   confirmPassword: zodPassword(),
 * }).superRefine(passwordMatch('newPassword', 'confirmPassword'))
 */
export const passwordMatch =
  (newField = 'newPassword', confirmField = 'confirmPassword') =>
  (data: Record<string, string>, ctx: z.RefinementCtx) => {
    if (data[newField] !== data[confirmField]) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [confirmField],
        message: 'Passwords do not match',
      });
    }
  };
