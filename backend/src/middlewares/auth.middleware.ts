import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { userId: string };
}

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

export const authenticate = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error = new Error("Unauthorized: No token provided");
    (error as any).statusCode = 401;
    return next(error); // delegate to global error handler
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.user = { userId: decoded.userId };
    return next();
  } catch {
    const error = new Error("Unauthorized: Invalid token");
    (error as any).statusCode = 401;
    return next(error);
  }
};
