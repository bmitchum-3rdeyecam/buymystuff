import express, { Request, Response, NextFunction } from 'express';
import db from '../db/index';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import validator from 'validator';
import { check, validationResult } from 'express-validator';
import generateToken from '../utils/generateToken';

const registerRouter = express.Router();

registerRouter.use(bodyParser.json());
registerRouter.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const passwordHasher = async (password: string, saltRounds: number): Promise<string | null> => {
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch(err){
    console.log(err);
  }
  return null;
};

interface RegistrationBody {
  first: string;
  last: string;
  email: string;
  username: string;
  password: string;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
}

registerRouter.post('/', [
  check('password').isLength({ max: 20, min: 5 }),
  check('email').isEmail()], async (req: Request<{}, {}, RegistrationBody>, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
  return res.status(422).json({ errors: errors.array() });
  }

  const selectObject = await db.query<{ count: string }>('SELECT COUNT(*) FROM users');
  const totalUsers = Number(selectObject.rows[0].count);
  const id = totalUsers+1;

  let first = req.body.first; 
  let last = req.body.last; 
  let email = req.body.email; 
  let username = req.body.username; 
  let password = req.body.password;

  if (!first || !last || !email || !username || !password) {
    return res.status(400).send({ error: true, message: "Missing one or more required fields"});
  }

  first = validator.escape(first); 
  last = validator.escape(last); 
  email = validator.escape(email); 
  username = validator.escape(username); 
  password = validator.escape(password);

  let emailExists = await db.query<User>('SELECT * FROM users WHERE email = $1', [email]) 
  const emailExistsRows = emailExists.rows
  if (emailExistsRows?.length) {
    console.log("email already exists!");
    return res.status(400).send({ error: true, message: "The provided email is linked to an existing account."});
  }

  try {
    const selectText = 'SELECT * FROM users WHERE username = $1'
    const values = [username];
    await db.query<User>(selectText, values, async (error, results) => {
      if (error) {
        console.log('error')
        throw error
        }
      const user = results.rows[0];
      if (user) {
        console.log("User already exists!");
        return res.status(400).send({ error: true, message: "Username already exists. Please choose another username"});
      }
      const insertText = 'INSERT INTO users (id, first_name, last_name, email, username, password)VALUES($1, $2, $3, $4, $5, $6) RETURNING *';
      const hashedPassword = await passwordHasher(password, 10);
      const values = await [id, first, last, email, username, hashedPassword];
      let newUser = await db.query<User>(insertText, values)
      let newUsername = await newUser.rows[0].username;
      const token = generateToken({ username: newUsername })
      return res.status(200).send({ error: false, token, message: "User created" })
      }) 
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});


export default registerRouter;
