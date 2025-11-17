import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface DecodedToken {
  username: string;
  iat?: number;
  exp?: number;
}

const decodeJWT = (token: string): string => {
  const user = jwt.verify(token, process.env.TOKEN_SECRET as string) as DecodedToken;
  return user.username;
};

export default decodeJWT;
