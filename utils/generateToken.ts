import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const generateAccessToken = (username: { username: string }): string => {
  return jwt.sign(username, process.env.TOKEN_SECRET as string, { expiresIn: "24h" });
};

export default generateAccessToken;
