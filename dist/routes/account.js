"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = __importDefault(require("../db/index"));
const body_parser_1 = __importDefault(require("body-parser"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const validator_1 = __importDefault(require("validator"));
const express_validator_1 = require("express-validator");
const auth_1 = __importDefault(require("../utils/auth"));
const decodeJWT_1 = __importDefault(require("../utils/decodeJWT"));
const accountRouter = express_1.default.Router();
accountRouter.use(body_parser_1.default.json());
accountRouter.use(body_parser_1.default.urlencoded({
    extended: true,
}));
const passwordHasher = async (password, saltRounds) => {
    try {
        const salt = await bcrypt_1.default.genSalt(saltRounds);
        const hash = await bcrypt_1.default.hash(password, salt);
        return hash;
    }
    catch (err) {
        console.log(err);
    }
    return null;
};
accountRouter.get('/', auth_1.default, (req, res) => {
    const token = req.headers.authorization;
    const username = (0, decodeJWT_1.default)(token);
    index_1.default.query('SELECT * FROM users WHERE username = $1', [username], (error, results) => {
        if (error) {
            console.log('error');
            throw error;
        }
        res.status(200).json(results.rows[0]);
    });
});
accountRouter.put('/details', [
    (0, express_validator_1.check)('email').isEmail()
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const token = req.headers.authorization;
    const user = (0, decodeJWT_1.default)(token);
    const selectObject = await index_1.default.query('SELECT id FROM users WHERE username = $1', [user]);
    const id = selectObject.rows[0].id;
    let { first, last, email, username, address, city, state, zip } = req.body;
    let results;
    try {
        if (first) {
            first = validator_1.default.escape(first);
            results = await index_1.default.query('update users set first_name = $1 where id = $2 RETURNING first_name', [first, id]);
        }
        if (last) {
            last = validator_1.default.escape(last);
            results = await index_1.default.query('update users set last_name = $1 where id = $2 RETURNING last_name', [last, id]);
        }
        if (email) {
            email = validator_1.default.escape(email);
            results = await index_1.default.query('update users set email = $1 where id = $2 RETURNING email', [email, id]);
        }
        if (username) {
            username = validator_1.default.escape(username);
            results = await index_1.default.query('update users set username = $1 where id = $2 RETURNING username', [username, id]);
        }
        if (address) {
            address = validator_1.default.escape(address);
            results = await index_1.default.query('update users set address = $1 where id = $2 RETURNING address', [address, id]);
        }
        if (city) {
            city = validator_1.default.escape(city);
            results = await index_1.default.query('update users set city = $1 where id = $2 RETURNING city', [city, id]);
        }
        if (state) {
            state = validator_1.default.escape(state);
            results = await index_1.default.query('update users set state = $1 where id = $2 RETURNING state', [state, id]);
        }
        if (zip) {
            zip = validator_1.default.escape(zip);
            results = await index_1.default.query('update users set zip = $1 where id = $2 RETURNING zip', [zip, id]);
        }
        if (results) {
            await res.status(200).json(results.rows[0]);
        }
    }
    catch (err) {
        return err.stack;
    }
});
accountRouter.put('/password', [(0, express_validator_1.check)('password').isLength({ max: 20, min: 5 })], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const token = req.headers.authorization;
    const username = (0, decodeJWT_1.default)(token);
    const selectObject = await index_1.default.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = selectObject.rows[0];
    const currentPassword = req.body.currentPassword;
    const password = req.body.password;
    const matchedPassword = await bcrypt_1.default.compare(currentPassword, user.password);
    if (!matchedPassword) {
        console.log("Password did not match!");
        return res.status(400).send({ error: true, message: "Invalid current password" });
    }
    if (password) {
        const updateText = 'update users set password = $1 where username = $2';
        const hashedPassword = await passwordHasher(password, 10);
        const values = await [hashedPassword, username];
        await index_1.default.query(updateText, values, (error, results) => {
            if (error) {
                console.log('error');
                throw error;
            }
            res.status(200).send({ error: false, message: "Password updated successfully" });
        });
    }
});
exports.default = accountRouter;
