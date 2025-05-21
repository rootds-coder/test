import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import ApiError from '../utils/ApiError';
import Admin from '../models/Admin';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        userId: string;
      };
    }
  }
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    userId: string;
  };
}

export const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new ApiError(401, 'No token provided');
    }

    const decoded = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;

    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      userId: decoded.id // Using id as userId for consistency
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(401, 'Invalid token'));
    } else {
      next(error);
    }
  }
};

interface JwtPayload {
  id: string;
  role: string;
  email?: string;
}

export const authenticateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Authentication token required' });
      return;
    }

    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.user = {
      userId: decoded.id,
      email: decoded.email || '',
      id: decoded.id,
      role: decoded.role
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid authentication token' });
  }
};

export const authenticateAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return next(new ApiError(401, 'No token, authorization denied'));
    }

    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    Admin.findById(decoded.id).then(admin => {
      if (!admin) {
        return next(new ApiError(401, 'Token is not valid'));
      }
      req.user = {
        id: decoded.id,
        role: decoded.role,
        email: decoded.email || '',
        userId: decoded.id
      };
      next();
    }).catch(error => {
      console.error('Auth middleware error:', error);
      next(new ApiError(401, 'Token is not valid'));
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    next(new ApiError(401, 'Token is not valid'));
  }
}; 