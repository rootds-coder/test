import { Request, Response, NextFunction } from 'express';

export const validateResource = (schema: any) => (req: Request, res: Response, next: NextFunction) => next();