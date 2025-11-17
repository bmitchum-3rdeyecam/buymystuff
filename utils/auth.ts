import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

interface DecodedToken {
  username: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

const authenticateToken = (req: Request, res: Response, next: NextFunction): Response | void => {
  const token = req.headers['authorization'];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.TOKEN_SECRET as string, (err, user) => {
    if (err) return res.sendStatus(403);

    req.user = user as DecodedToken;

    next();
  });
};

export default authenticateToken;
