"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_session_1 = __importDefault(require("express-session"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const index_1 = __importDefault(require("./db/index"));
const registration_1 = __importDefault(require("./routes/registration"));
const login_1 = __importDefault(require("./routes/login"));
const products_1 = __importDefault(require("./routes/products"));
const account_1 = __importDefault(require("./routes/account"));
const cart_1 = __importDefault(require("./routes/cart"));
const checkout_1 = __importDefault(require("./routes/checkout"));
const orders_1 = __importDefault(require("./routes/orders"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const store = new express_session_1.default.MemoryStore();
const PORT = process.env.PORT || 4000;
app.use((0, cookie_parser_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({
    extended: true,
}));
app.use((0, morgan_1.default)('dev'));
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, express_session_1.default)({
    secret: "secret-key",
    cookie: { maxAge: 86400000,
        httpOnly: true, secure: false, sameSite: 'none', path: "/" },
    resave: false,
    saveUninitialized: false,
    store
}));
app.use('/register', registration_1.default);
app.use('/login', login_1.default);
app.use('/products', products_1.default);
app.use('/account', account_1.default);
app.use('/cart', cart_1.default);
app.use('/checkout', checkout_1.default);
app.use('/orders', orders_1.default);
app.get('/home', (req, res) => {
    res.send('This is the home page');
});
app.get('/', (req, res) => {
    index_1.default.query('SELECT * FROM users', [], (error, results) => {
        if (error) {
            console.log('error');
            throw error;
        }
        console.log(results.rows);
        res.status(200).json(results.rows);
    });
});
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log('error destroying session');
        }
    });
    res.redirect("/");
});
app.listen(PORT, () => {
    console.log('Server listening on port ' + PORT);
});
