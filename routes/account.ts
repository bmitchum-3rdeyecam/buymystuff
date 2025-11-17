import express, { Request, Response } from 'express';
import db from '../db/index';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import validator from 'validator';
import { check, validationResult } from 'express-validator';
import authenticateUser from '../utils/auth';
import decodeJWT from '../utils/decodeJWT';

const accountRouter = express.Router();

accountRouter.use(bodyParser.json());
accountRouter.use(
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

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

interface UpdateDetailsBody {
  first?: string;
  last?: string;
  email?: string;
  username?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
}

interface UpdatePasswordBody {
  currentPassword: string;
  password: string;
}

accountRouter.get('/', authenticateUser, (req: Request, res: Response) => {
  const token = req.headers.authorization;
  const username = decodeJWT(token as string);
  db.query<User>('SELECT * FROM users WHERE username = $1', [username], (error, results) => {
    if (error) {
    console.log('error')
    throw error
    }
    res.status(200).json(results.rows[0])
  })
})

accountRouter.put('/details', [
  check('email').isEmail()
], async (req: Request<{}, {}, UpdateDetailsBody>, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const token = req.headers.authorization;
  const user = decodeJWT(token as string); 
  const selectObject = await db.query<{ id: number }>('SELECT id FROM users WHERE username = $1', [user]);
  const id = selectObject.rows[0].id;

  let { first, last, email, username, address, city, state, zip } = req.body;
  let results;
  try {
    if(first) {
    first = validator.escape(first); 
    results = await db.query('update users set first_name = $1 where id = $2 RETURNING first_name', [first, id]);
  }
    if(last) { 
      last = validator.escape(last); 
      results = await db.query('update users set last_name = $1 where id = $2 RETURNING last_name', [last, id]);
    }
    if(email) {
      email = validator.escape(email);
      results = await db.query('update users set email = $1 where id = $2 RETURNING email', [email, id]);
    }
    if(username) {
      username = validator.escape(username);
      results = await db.query('update users set username = $1 where id = $2 RETURNING username', [username, id]);
    }
    if(address) {
      address = validator.escape(address);
      results = await db.query('update users set address = $1 where id = $2 RETURNING address', [address, id]);
    }
    if(city) {
      city = validator.escape(city);
      results = await db.query('update users set city = $1 where id = $2 RETURNING city', [city, id]);
    }
    if(state) {
      state = validator.escape(state);
      results = await db.query('update users set state = $1 where id = $2 RETURNING state', [state, id]);
    }
    if(zip) {
      zip = validator.escape(zip);
      results = await db.query('update users set zip = $1 where id = $2 RETURNING zip', [zip, id]);
    }
    await res.status(200).json(results.rows[0])
  } catch (err: any) {
    return err.stack;
  }
})

accountRouter.put('/password', [check('password').isLength({ max: 20, min: 5 })], async (req: Request<{}, {}, UpdatePasswordBody>, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
  return res.status(422).json({ errors: errors.array() });
  }

  const token = req.headers.authorization;
  const username = decodeJWT(token as string); 
  const selectObject = await db.query<User>('SELECT * FROM users WHERE username = $1', [username]);
  const user = selectObject.rows[0];
  const currentPassword = req.body.currentPassword;
  const password = req.body.password;

  const matchedPassword = await bcrypt.compare(currentPassword, user.password);
  if (!matchedPassword) {
    console.log("Password did not match!");
    return res.status(400).send({ error: true, message: "Invalid current password"});
  }

  if(password) {
  const updateText = 'update users set password = $1 where username = $2'
  const hashedPassword = await passwordHasher(password, 10);
  const values = await [hashedPassword, username];
  await db.query(updateText, values, (error) => {
    if (error) {
    console.log('error')
    throw error
    }
    res.status(200).send({ error: false, message: "Password updated successfully"})
    }) 
  }
})


export default accountRouter;
