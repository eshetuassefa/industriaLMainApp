import { Request, Response, NextFunction, RequestHandler } from 'express';

export const login: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {

    res.status(200).json({ token: 'your-jwt-token' });
  } catch (error) {
    next(error);
  }
};