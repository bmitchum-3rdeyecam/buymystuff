"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = __importDefault(require("../db/index"));
const body_parser_1 = __importDefault(require("body-parser"));
const decodeJWT_1 = __importDefault(require("../utils/decodeJWT"));
const ordersRouter = express_1.default.Router();
ordersRouter.use(body_parser_1.default.json());
ordersRouter.use(body_parser_1.default.urlencoded({
    extended: true,
}));
ordersRouter.get('/', async (req, res) => {
    const token = req.headers.authorization;
    const user = (0, decodeJWT_1.default)(token);
    const selectObject = await index_1.default.query('SELECT id FROM users WHERE username = $1', [user]);
    const userID = selectObject.rows[0].id;
    const results = await index_1.default.query('SELECT orders.id, orders.date, SUM(products_orders.amount*products_orders.price) AS total FROM orders, products_orders WHERE user_id = $1 AND orders.id=products_orders.order_id GROUP BY orders.id, orders.date;', [userID]);
    res.status(200).send(results.rows);
});
ordersRouter.get('/:id', async (req, res) => {
    const id = req.params.id;
    const token = req.headers.authorization;
    const user = (0, decodeJWT_1.default)(token);
    const selectObject = await index_1.default.query('SELECT id FROM users WHERE username = $1', [user]);
    const userID = selectObject.rows[0].id;
    const results = await index_1.default.query('SELECT orders.id, orders.date, products.name, products_orders.amount, products_orders.price FROM orders, products, products_orders WHERE user_id = $1 AND orders.id = $2 AND orders.id=products_orders.order_id AND products_orders.product_id=products.id;', [userID, id]);
    res.status(200).send(results.rows);
});
exports.default = ordersRouter;
