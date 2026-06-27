import { Request, Response, NextFunction } from "express";

/**
 * A utility wrapper to catch errors from async Express routes and forward them to the next error middleware.
 * This eliminates the need for repetitive try-catch blocks in controllers.
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
