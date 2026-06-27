/**
 * Custom AppError class extending native Error.
 * Allows throwing errors with dynamic HTTP status codes.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    // Maintain proper stack trace (only available in V8 engines like Node.js)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
