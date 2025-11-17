import express, { Request, Response } from 'express';
import db from '../db/index';
import bodyParser from 'body-parser';
import decodeJWT from '../utils/decodeJWT';
import Stripe from 'stripe';

const stripe = new Stripe('sk_test_51MpCyhDoFFCpZ0bnGFzsp5fR5mWc7Zi6wN5HadQs99Iwwi6VGCHbZQJD4FPqNk6QrI8cQzxUl1XfMXIU5Q5KyuBa00Cgy3yrXJ', {
  apiVersion: '2024-11-20.acacia',
});

const checkoutRouter = express.Router();

checkoutRouter.use(bodyParser.json());
checkoutRouter.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

interface CartTotal {
  total: string;
}

interface ProductAmount {
  product_id: string;
  amount: number;
}

interface ProductForOrder {
  id: string;
  price: string;
  amount: number;
}

interface CreateOrderBody {
  first: string;
  last: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  idArray?: string[];
}

interface UpdateProductsBody {
  idArray?: string[];
}

interface DeleteCartBody {
  idArray?: string[];
}

const calculateOrderTotal = async (userID: number): Promise<number> => {

  const results = await db.query<CartTotal>('SELECT SUM(carts.amount*products.price) AS total FROM carts, products WHERE user_id = $1 AND products.id=carts.product_id', [userID]);
  const total = (Number(results.rows[0].total.slice(1)).toFixed(2))*100;
  return total;
};

const nologinTotal = async (idArray: string[]): Promise<number> => {
  let totalArray: number[] = [];
  for (let item of idArray){
    const results = await db.query<CartTotal>('SELECT SUM(carts.amount*products.price) AS total FROM carts, products WHERE carts.id = $1 AND products.id=carts.product_id', [item]);
    let itemTotal = (Number(results.rows[0].total.slice(1)).toFixed(2))*100;
    totalArray.push(itemTotal);
  }

  const total = totalArray.reduce((x,y) => x+y)
  return(total)
}


checkoutRouter.put('/', async (req: Request<{}, {}, UpdateProductsBody>, res: Response) => {
//Get products
  const token = req.headers.authorization;
  let userID: number | undefined;
  let products: ProductAmount[] = [];
  if(token!=='1') {
    const user = decodeJWT(token as string); 
    const selectObject = await db.query<{ id: number }>('SELECT id FROM users WHERE username = $1', [user]);
    userID = selectObject.rows[0].id;
    const results = await db.query<ProductAmount>('SELECT product_id, amount FROM carts WHERE user_id = $1', [userID]);
    products = results.rows;
  } else {
      const idArray = req.body.idArray as string[]
      for (let item of idArray){
        const results = await db.query<ProductAmount>('SELECT product_id, amount FROM carts WHERE carts.id = $1', [item]);
        products.push(results.rows[0]);
      }
  }

//Update products
  let updatedProducts: any[] = [];
  for (const item of products) {
    const results = await db.query('UPDATE products SET inventory = inventory - $1 WHERE id = $2 RETURNING *', [item.amount, item.product_id])
    updatedProducts.push(results.rows[0])
    };
  res.status(200).send(updatedProducts);
})

checkoutRouter.post('/', async (req: Request<{}, {}, CreateOrderBody>, res: Response) => {
//Add to orders
  const { first, last, email, address, city, state, zip } = req.body;

  const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
  const id = "id" + Math.random().toString(16).slice(2);

  const token = req.headers.authorization;
  let userID: number | undefined;
  if(token!=='1'){
    const user = decodeJWT(token as string); 
    const selectObject = await db.query<{ id: number }>('SELECT id FROM users WHERE username = $1', [user]);
    userID = selectObject.rows[0].id;

    await db.query('INSERT INTO orders (id, date, user_id, first_name, last_name, email, address, city, state, zip) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *', [id, date, userID, first, last, email, address, city, state, zip]);
  } else {
      await db.query('INSERT INTO orders (id, date, first_name, last_name, email, address, city, state, zip) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *', [id, date, first, last, email, address, city, state, zip]);
    }


//Add to products-orders 
  let products: ProductForOrder[] = [];
  if(token!=='1') {
    const results = await db.query<ProductForOrder>('SELECT products.id, products.price, carts.amount FROM carts, products WHERE user_id = $1 AND products.id=carts.product_id', [userID]);
    products = results.rows;
  } else {
      const idArray = req.body.idArray as string[];
      console.log(idArray)
      for (let item of idArray){
        const results = await db.query<ProductForOrder>('SELECT products.id, products.price, carts.amount FROM carts, products WHERE carts.id = $1 AND products.id=carts.product_id', [item]);
        products.push(results.rows[0]);
      }
  }

  for (const item of products) {
    await db.query('INSERT INTO products_orders (order_id, product_id, amount, price) VALUES ($1, $2, $3, $4) RETURNING *', [id, item.id, item.amount, item.price]);
    } 
  res.status(200).send({id: id});
})

checkoutRouter.delete('/', async (req: Request<{}, {}, DeleteCartBody>, res: Response) => {
  const token = req.headers.authorization;
  let userID: number | undefined;
  if(token!=='1') {
    const user = decodeJWT(token as string); 
    const selectObject = await db.query<{ id: number }>('SELECT id FROM users WHERE username = $1', [user]);
    userID = selectObject.rows[0].id;
    await db.query('DELETE FROM carts WHERE user_id = $1', [userID]);
    return res.status(200).send({ error: false, message: "Items deleted from user cart" })
  }
  return res.status(200).send({ error: false, message: "no-login carts deleted from database" })
})

checkoutRouter.post("/create-payment-intent", async (req: Request, res: Response) => {
  const token = req.headers.authorization;
  let userID: number | undefined;
  if(token!=='1'){
    const user = decodeJWT(token as string); 
    const selectObject = await db.query<{ id: number }>('SELECT id FROM users WHERE username = $1', [user]);
    userID = selectObject.rows[0].id;
  }

  const idArray = req.body as string[]

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: userID ? await calculateOrderTotal(userID) : await nologinTotal(idArray),
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});


export default checkoutRouter;
