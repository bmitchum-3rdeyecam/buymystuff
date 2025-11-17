import express, { Request, Response } from 'express';
import { QueryResult } from 'pg';
import bodyParser from 'body-parser';
import session from 'express-session';
import logger from 'morgan';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import db from './db/index';

import registerRouter from './routes/registration';
import loginRouter from './routes/login';
import productsRouter from './routes/products';
import accountRouter from './routes/account';
import cartRouter from './routes/cart';
import checkoutRouter from './routes/checkout';
import ordersRouter from './routes/orders';

dotenv.config();

const app = express();
const store = new session.MemoryStore();

const PORT = process.env.PORT || 4000;

app.use(cookieParser());

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(logger('dev'));
app.use(cors());
app.use(helmet());

app.use(
  session({
    secret: "secret-key",
    cookie: { maxAge: 86400000, 
    httpOnly: true, secure: false, sameSite: 'none', path: "/" },
    resave: false,
    saveUninitialized: false,
    store
  })
);

app.use('/register', registerRouter);
app.use('/login', loginRouter);
app.use('/products', productsRouter);
app.use('/account', accountRouter);
app.use('/cart', cartRouter);
app.use('/checkout', checkoutRouter);
app.use('/orders', ordersRouter);

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

app.get('/home', (req: Request, res: Response) => {
    res.send('This is the home page');
})

app.get('/', (req: Request, res: Response) => {
  db.query<User>('SELECT * FROM users', [], (error: Error, results: QueryResult<User>) => {
    if (error) {
      console.log('error')
      throw error
    }
    console.log(results.rows)
    res.status(200).json(results.rows)
  })
});

app.get('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.log('error destroying session')
    }
  });
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log('Server listening on port ' + PORT);
})
