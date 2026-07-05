import { CastError } from 'mongoose';
import { IErrorMessage } from '../types/errors.types';

/**
 * Handles Mongoose CastError — typically thrown when an invalid
 * MongoDB ObjectId is passed to a query (e.g. `findById("bad-id")`).
 */
const handleCastError = (error: CastError) => {
  const errorMessages: IErrorMessage[] = [
    {
      path: error.path,
      message: `Invalid ${error.kind} value "${error.value}" for field "${error.path}". Expected a valid ${error.kind}.`,
    },
  ];

  return {
    statusCode: 400,
    message: 'Invalid ID Format',
    errorMessages,
  };
};

export default handleCastError;
