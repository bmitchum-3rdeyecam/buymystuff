import express, { Request, Response } from 'express';
import db from '../db/index';
import bodyParser from 'body-parser';
import decodeJWT from '../utils/decodeJWT';
import { v4 as uuidv4 } from 'uuid';

const productsRouter = express.Router();

productsRouter.use(bodyParser.json());
productsRouter.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  inventory: number;
}

interface CreateProductBody {
  name: string;
  category: string;
  price: string;
  inventory: number;
}

interface AddToCartBody {
  amount: number;
}

interface CartItem {
  id: string;
  user_id?: number;
  product_id: string;
  amount: number;
}

productsRouter.get('/', (req: Request, res: Response) => {
  db.query<Product>('SELECT * FROM products', [], (error: Error, results: any) => {
    if (error) {
      console.log('error')
      throw error
    }
    res.status(200).json(results.rows)
  })
});

productsRouter.post('/', async (req: Request<{}, {}, CreateProductBody>, res: Response) => {

  const id = uuidv4();

  const { name, category, price, inventory } = req.body;
  const text = 'INSERT INTO products (id, name, category, price, inventory) VALUES($1, $2, $3, $4, $5) RETURNING *';
  const values = [id, name, category, price, inventory];
  db.query<Product>(text, values, (error, results) => {
    if (error) {
    console.log('error')
    throw error
    }
    res.status(200).json(results.rows[0])
  });
})

productsRouter.get('/c/:category', (req: Request<{ category: string }>, res: Response) => {
  const category = req.params.category;
  db.query<Product>('SELECT * FROM products WHERE category = $1', [category], (error, results) => {
    if (error) {
    console.log('error')
    throw error
    }
    res.status(200).json(results.rows)
  })
})

productsRouter.get('/:product', async (req: Request<{ product: string }>, res: Response) => {
  const name = req.params.product;
  const results = await db.query<Product>('SELECT * FROM products WHERE name = $1', [name])
  if(!results.rows[0]){
    return res.status(400).send({ error: true, message: "Product does not exist"});
  }
  res.status(200).json(results.rows[0])
})

productsRouter.get('/:product/price', (req: Request<{ product: string }>, res: Response) => {
  const name = req.params.product;
  db.query<{ price: string }>('SELECT price FROM products WHERE name = $1', [name], (error, results) => {
    if (error) {
    console.log('error')
    throw error
    }
    const price = results.rows[0].price.slice(1);
    res.status(200).json(price);
  })
})

productsRouter.post('/:product', async (req: Request<{ product: string }, {}, AddToCartBody>, res: Response) => {
  const name = req.params.product;
  const amount = req.body.amount;

  let userID: number | undefined;
  const token = req.headers.authorization;
  if(token){
    const user = decodeJWT(token); 
    const selectObject = await db.query<{ id: number }>('SELECT id FROM users WHERE username = $1', [user]);
    userID = selectObject.rows[0].id;
  }

  const product = await db.query<Product>('select * from products where name = $1', [name]);
  const productID = product.rows[0].id;

  const productInCart = await db.query<CartItem>('select * from carts where product_id = $1 AND user_id = $2', [productID, userID])

  if(token && productInCart.rows[0]) {
    await db.query('UPDATE carts SET amount = amount + $1 WHERE product_id = $2 RETURNING *', [amount, productID], (error, results) => {
      if (error) {
      console.log('error')
      throw error
    }
    res.status(200).json(results.rows)
    })
    return
  }

  if(token) {

    const id = uuidv4();

    await db.query<CartItem>('INSERT INTO carts (id, user_id, product_id, amount)VALUES($1, $2, $3, $4) RETURNING *', [id, userID, productID, amount], (error, results) => {
      if (error) {
      console.log('error')
      throw error
      }
      res.status(200).json(results.rows[0])
    })
    return
  }

  const id = uuidv4();

  await db.query<{ id: string }>('INSERT INTO carts (id, product_id, amount)VALUES($1, $2, $3) RETURNING *', [id, productID, amount], (error, results) => {
    if (error) {
    console.log('error')
    throw error
    }
    return res.status(200).json(results.rows[0].id)
  })
})


export default productsRouter;
