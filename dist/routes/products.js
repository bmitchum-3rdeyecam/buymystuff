"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = __importDefault(require("../db/index"));
const body_parser_1 = __importDefault(require("body-parser"));
const decodeJWT_1 = __importDefault(require("../utils/decodeJWT"));
const uuid_1 = require("uuid");
const productsRouter = express_1.default.Router();
productsRouter.use(body_parser_1.default.json());
productsRouter.use(body_parser_1.default.urlencoded({
    extended: true,
}));
productsRouter.get('/', (req, res) => {
    index_1.default.query('SELECT * FROM products', [], (error, results) => {
        if (error) {
            console.log('error');
            throw error;
        }
        res.status(200).json(results.rows);
    });
});
productsRouter.post('/', async (req, res) => {
    const id = (0, uuid_1.v4)();
    const { name, category, price, inventory } = req.body;
    const text = 'INSERT INTO products (id, name, category, price, inventory) VALUES($1, $2, $3, $4, $5) RETURNING *';
    const values = [id, name, category, price, inventory];
    index_1.default.query(text, values, (error, results) => {
        if (error) {
            console.log('error');
            throw error;
        }
        res.status(200).json(results.rows[0]);
    });
});
productsRouter.get('/c/:category', (req, res) => {
    const category = req.params.category;
    index_1.default.query('SELECT * FROM products WHERE category = $1', [category], (error, results) => {
        if (error) {
            console.log('error');
            throw error;
        }
        res.status(200).json(results.rows);
    });
});
productsRouter.get('/:product', async (req, res) => {
    const name = req.params.product;
    const results = await index_1.default.query('SELECT * FROM products WHERE name = $1', [name]);
    if (!results.rows[0]) {
        return res.status(400).send({ error: true, message: "Product does not exist" });
    }
    res.status(200).json(results.rows[0]);
});
productsRouter.get('/:product/price', (req, res) => {
    const name = req.params.product;
    index_1.default.query('SELECT price FROM products WHERE name = $1', [name], (error, results) => {
        if (error) {
            console.log('error');
            throw error;
        }
        const price = results.rows[0].price.slice(1);
        res.status(200).json(price);
    });
});
productsRouter.post('/:product', async (req, res) => {
    const name = req.params.product;
    const amount = req.body.amount;
    let userID;
    const token = req.headers.authorization;
    if (token) {
        const user = (0, decodeJWT_1.default)(token);
        const selectObject = await index_1.default.query('SELECT id FROM users WHERE username = $1', [user]);
        userID = selectObject.rows[0].id;
    }
    const product = await index_1.default.query('select * from products where name = $1', [name]);
    const productID = product.rows[0].id;
    const productInCart = await index_1.default.query('select * from carts where product_id = $1 AND user_id = $2', [productID, userID]);
    if (token && productInCart.rows[0]) {
        await index_1.default.query('UPDATE carts SET amount = amount + $1 WHERE product_id = $2 RETURNING *', [amount, productID], (error, results) => {
            if (error) {
                console.log('error');
                throw error;
            }
            res.status(200).json(results.rows);
        });
        return;
    }
    if (token) {
        const id = (0, uuid_1.v4)();
        await index_1.default.query('INSERT INTO carts (id, user_id, product_id, amount)VALUES($1, $2, $3, $4) RETURNING *', [id, userID, productID, amount], (error, results) => {
            if (error) {
                console.log('error');
                throw error;
            }
            res.status(200).json(results.rows[0]);
        });
        return;
    }
    const id = (0, uuid_1.v4)();
    await index_1.default.query('INSERT INTO carts (id, product_id, amount)VALUES($1, $2, $3) RETURNING *', [id, productID, amount], (error, results) => {
        if (error) {
            console.log('error');
            throw error;
        }
        return res.status(200).json(results.rows[0].id);
    });
});
exports.default = productsRouter;
