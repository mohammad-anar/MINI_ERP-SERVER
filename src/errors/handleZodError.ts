import { ZodError } from 'zod';
import { IErrorMessage } from '../types/errors.types';

/**
 * Formats a ZodError into the standard API error shape.
 * Maps each issue to { path, message } — path is the deepest path segment.
 */
const handleZodError = (error: ZodError) => {
  const errorMessages: IErrorMessage[] = error.errors.map(issue => ({
    path: issue.path[issue.path.length - 1] ?? 'unknown',
    message: issue.message,
  }));

  return {
    statusCode: 422,
    message: 'Validation Error',
    errorMessages,
  };
};

export default handleZodError;
