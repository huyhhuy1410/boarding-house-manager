import { Request, Response, NextFunction } from 'express';
// import { ZodObject, ZodError } from 'zod';

/**
 * Middleware validate request body/query/params bằng Zod Schema
 */
export const validate = (schema: any) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Parse dữ liệu gửi lên. Nếu hợp lệ, tự động gán dữ liệu đã validate ngược lại vào req
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) req.query = parsed.query as any;
      if (parsed.params !== undefined) req.params = parsed.params as any;
      
      next(); // Cho phép request đi tiếp vào Controller
    } catch (error) {
      next(error);
    }
  };
};
