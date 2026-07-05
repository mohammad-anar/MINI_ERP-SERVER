import { IErrorMessage } from '../types/errors.types';

interface MongoServerError {
  code: number;
  keyValue: Record<string, unknown>;
}

/**
 * Handles MongoDB duplicate key error (error code 11000).
 * Thrown when a unique-indexed field (e.g. email) already exists in the DB.
 */
const handleDuplicateError = (error: MongoServerError) => {
  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field];

  const errorMessages: IErrorMessage[] = [
    {
      path: field,
      message: `"${value}" already exists. Please use a different ${field}.`,
    },
  ];

  return {
    statusCode: 409,
    message: 'Duplicate Entry',
    errorMessages,
  };
};

export default handleDuplicateError;
