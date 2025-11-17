import express, { Request, Response } from 'express';
import db from '../db/index';
import bodyParser from 'body-parser';
import decodeJWT from '../utils/decodeJWT';

const cartRouter = express.Router();

cartRouter.use(bodyParser.json());
cartRouter.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

interface CartTotal {
  total: string;
}

interface CartItem {
  id: string;
  amount: number;
  name: string;
}

interface UpdateCartBody {
  amount: number;
}

cartRouter.get('/total', async(req: Request, res: Response) => {
  const token = req.headers.authorization;
  const user = decodeJWT(token as string); 
  const selectObject = await db.query<{ id: number }>('SELECT id FROM users WHERE username = $1', [user]);
  const userID = selectObject.rows[0].id;
  const results = await db.query<CartTotal>('SELECT SUM(carts.amount*products.price) AS total FROM carts, products WHERE user_id = $1 AND products.id=carts.product_id', [userID]);
  if(!results.rows[0].total) return;
  const total = results.rows[0].total.slice(1);
  res.status(200).send(total);
})

cartRouter.get('/', async(req: Request, res: Response) => {
  const token = req.headers.authorization;
  const user = decodeJWT(token as string); 
  const selectObject = await db.query<{ id: number }>('SELECT id FROM users WHERE username = $1', [user]);
  const userID = selectObject.rows[0].id;
  const results = await db.query<CartItem>('SELECT carts.id, carts.amount, products.name FROM carts, products WHERE user_id = $1 AND products.id=carts.product_id;', [userID]);
  res.status(200).send(results.rows);
});

cartRouter.put('/:id', (req: Request<{ id: string }, {}, UpdateCartBody>, res: Response) => {
  const id = req.params.id;
  const amount = Number(req.body.amount);
  db.query('UPDATE carts SET amount = $2 WHERE id = $1 RETURNING *', [id, amount], (error, results) => {
    if (error) {
    console.log('error')
    throw error
    }
    res.status(200).json(results.rows[0])
  })
})

cartRouter.delete('/:id', (req: Request<{ id: string }>, res: Response) => {
  const id = req.params.id

  db.query('DELETE FROM carts WHERE id = $1', [id], (error, results) => {
    if (error) {
    console.log('error')
    throw error
    }
    res.status(200).send();
  })
})

export default cartRouter;
