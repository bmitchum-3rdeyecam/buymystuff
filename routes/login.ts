import express, { Request, Response } from 'express';
import db from '../db/index';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import validator from 'validator';
import { check, validationResult } from 'express-validator';
import generateToken from '../utils/generateToken';

const loginRouter = express.Router();

loginRouter.use(bodyParser.json());
loginRouter.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

interface LoginBody {
  username: string;
  password: string;
}

interface User {
  id: number;
  username: string;
  password: string;
}

declare module 'express-session' {
  interface SessionData {
    authenticated: boolean;
    user: {
      id: number;
      username: string;
      password: string;
    };
  }
}

loginRouter.post("/", [check('password').isLength({ max: 20 })], async (req: Request<{}, {}, LoginBody>, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  const username = validator.escape(req.body.username);
  const password = validator.escape(req.body.password);
  const selectText = 'SELECT * FROM users WHERE username = $1'
  const values = [username];
  try {
    const results = await db.query<User>(selectText, values);
    const user = await results.rows[0];
    if (!user) {
      console.log("User does not exist!");
      return res.status(400).send({ error: true, message: "User does not exist"});
    }
    const id = user.id;
    const matchedPassword = await bcrypt.compare(password, user.password);
    if (!matchedPassword) {
      console.log("Password did not match!");
      return res.status(400).send({ error: true, message: "Invalid password"});
    }
    console.log('Password matches!');
    req.session.authenticated = true;
    req.session.user = {
      id,
      username,
      password
    }
    const token = generateToken({ username: req.session.user.username })
    return res.status(200).send({ error: false, token, message: "Logged in sucessfully" })
    } catch (err: any) {
        res.status(500).json({ message: err.message });
      }
});

export default loginRouter;
