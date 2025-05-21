import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';

const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      path: (err as any).path || req.path
    });
    return;
  }

  // Handle mongoose validation errors
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      message: Object.values((err as any)?.errors || {}).map((error: any) => error.message),
      path: req.path
    });
    return;
  }

  // Handle mongoose duplicate key errors
  if (err.name === 'MongoError' && (err as any).code === 11000) {
    res.status(400).json({
      success: false,
      message: 'Duplicate field value entered',
      path: req.path
    });
    return;
  }

  console.error('Error:', err);

  res.status(500).json({
    success: false,
    message: 'Internal server error',
    path: req.path
  });
};

export default errorHandler; 