import { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';
import config from '../../config';
import ApiError from '../../errors/ApiError';
import handleCastError from '../../errors/handleCastError';
import handleDuplicateError from '../../errors/handleDuplicateError';
import handleValidationError from '../../errors/handleValidationError';
import handleZodError from '../../errors/handleZodError';
import { errorLogger } from '../../shared/logger';
import { IErrorMessage } from '../../types/errors.types';

/**
 * Global Express error handler.
 *
 * Catches all errors passed via `next(error)` and maps them to a
 * consistent JSON response shape:
 *
 * ```json
 * {
 *   "success": false,
 *   "statusCode": 400,
 *   "message": "...",
 *   "errorType": "ValidationError",
 *   "errorMessages": [{ "path": "email", "message": "..." }],
 *   "stack": "..." // only in development
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const globalErrorHandler: ErrorRequestHandler = (
  error: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  // ─── Logging ──────────────────────────────────────────────────────
  if (config.node_env === 'development') {
    console.error('🚨 [GlobalErrorHandler]', error);
  } else {
    errorLogger.error('🚨 [GlobalErrorHandler]', {
      message: error.message,
      url: req.originalUrl,
      method: req.method,
    });
  }

  // ─── Defaults ─────────────────────────────────────────────────────
  let statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = 'Something went wrong!';
  let errorType = 'ServerError';
  let errorMessages: IErrorMessage[] = [];

  // ─── Zod Validation ───────────────────────────────────────────────
  if (error instanceof ZodError) {
    const simplified = handleZodError(error);
    statusCode = simplified.statusCode;
    message = simplified.message;
    errorType = 'ZodValidationError';
    errorMessages = simplified.errorMessages;
  }

  // ─── Mongoose Validation ──────────────────────────────────────────
  else if (error.name === 'ValidationError') {
    const simplified = handleValidationError(error);
    statusCode = simplified.statusCode;
    message = simplified.message;
    errorType = 'MongooseValidationError';
    errorMessages = simplified.errorMessages;
  }

  // ─── Mongoose Cast Error (invalid ObjectId) ───────────────────────
  else if (error.name === 'CastError') {
    const simplified = handleCastError(error);
    statusCode = simplified.statusCode;
    message = simplified.message;
    errorType = 'CastError';
    errorMessages = simplified.errorMessages;
  }

  // ─── MongoDB Duplicate Key ────────────────────────────────────────
  else if (error.code === 11000) {
    const simplified = handleDuplicateError(error);
    statusCode = simplified.statusCode;
    message = simplified.message;
    errorType = 'DuplicateKeyError';
    errorMessages = simplified.errorMessages;
  }

  // ─── JWT Expired ──────────────────────────────────────────────────
  else if (error.name === 'TokenExpiredError') {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Your session has expired. Please log in again.';
    errorType = 'TokenExpiredError';
    errorMessages = [{ path: 'token', message }];
  }

  // ─── JWT Invalid ──────────────────────────────────────────────────
  else if (error.name === 'JsonWebTokenError') {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Invalid token. Please log in again.';
    errorType = 'JsonWebTokenError';
    errorMessages = [{ path: 'token', message }];
  }

  // ─── Request Body Parse Error ─────────────────────────────────────
  else if (error instanceof SyntaxError && 'body' in error) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Malformed JSON in request body.';
    errorType = 'SyntaxError';
    errorMessages = [{ path: 'body', message }];
  }

  // ─── Known Operational API Error ──────────────────────────────────
  else if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    errorType = 'ApiError';
    errorMessages = error.message ? [{ path: '', message: error.message }] : [];
  }

  // ─── Generic Error ────────────────────────────────────────────────
  else if (error instanceof Error) {
    message = error.message;
    errorType = 'Error';
    errorMessages = error.message ? [{ path: '', message: error.message }] : [];
  }

  // ─── Response ─────────────────────────────────────────────────────
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errorType,
    errorMessages,
    stack: config.node_env !== 'production' ? error?.stack : undefined,
  });
};

export default globalErrorHandler;
