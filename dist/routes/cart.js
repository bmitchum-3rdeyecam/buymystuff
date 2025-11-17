"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = __importDefault(require("../db/index"));
const body_parser_1 = __importDefault(require("body-parser"));
const decodeJWT_1 = __importDefault(require("../utils/decodeJWT"));
const cartRouter = express_1.default.Router();
cartRouter.use(body_parser_1.default.json());
cartRouter.use(body_parser_1.default.urlencoded({
    extended: true,
}));
cartRouter.get('/total', async (req, res) => {
    const token = req.headers.authorization;
    const user = (0, decodeJWT_1.default)(token);
    const selectObject = await index_1.default.query('SELECT id FROM users WHERE username = $1', [user]);
    const userID = selectObject.rows[0].id;
    const results = await index_1.default.query('SELECT SUM(carts.amount*products.price) AS total FROM carts, products WHERE user_id = $1 AND products.id=carts.product_id', [userID]);
    if (!results.rows[0].total)
        return;
    const total = results.rows[0].total.slice(1);
    res.status(200).send(total);
});
cartRouter.get('/', async (req, res) => {
    const token = req.headers.authorization;
    const user = (0, decodeJWT_1.default)(token);
    const selectObject = await index_1.default.query('SELECT id FROM users WHERE username = $1', [user]);
    const userID = selectObject.rows[0].id;
    const results = await index_1.default.query('SELECT carts.id, carts.amount, products.name FROM carts, products WHERE user_id = $1 AND products.id=carts.product_id;', [userID]);
    res.status(200).send(results.rows);
});
cartRouter.put('/:id', (req, res) => {
    const id = req.params.id;
    const amount = Number(req.body.amount);
    index_1.default.query('UPDATE carts SET amount = $2 WHERE id = $1 RETURNING *', [id, amount], (error, results) => {
        if (error) {
            console.log('error');
            throw error;
        }
        res.status(200).json(results.rows[0]);
    });
});
cartRouter.delete('/:id', (req, res) => {
    const id = req.params.id;
    index_1.default.query('DELETE FROM carts WHERE id = $1', [id], (error, results) => {
        if (error) {
            console.log('error');
            throw error;
        }
        res.status(200).send();
    });
});
exports.default = cartRouter;
