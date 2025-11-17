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
const generateToken_1 = __importDefault(require("../utils/generateToken"));
const registerRouter = express_1.default.Router();
registerRouter.use(body_parser_1.default.json());
registerRouter.use(body_parser_1.default.urlencoded({
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
registerRouter.post('/', [
    (0, express_validator_1.check)('password').isLength({ max: 20, min: 5 }),
    (0, express_validator_1.check)('email').isEmail()
], async (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const selectObject = await index_1.default.query('SELECT COUNT(*) FROM users');
    const totalUsers = Number(selectObject.rows[0].count);
    const id = totalUsers + 1;
    let first = req.body.first;
    let last = req.body.last;
    let email = req.body.email;
    let username = req.body.username;
    let password = req.body.password;
    if (!first || !last || !email || !username || !password) {
        return res.status(400).send({ error: true, message: "Missing one or more required fields" });
    }
    first = validator_1.default.escape(first);
    last = validator_1.default.escape(last);
    email = validator_1.default.escape(email);
    username = validator_1.default.escape(username);
    password = validator_1.default.escape(password);
    let emailExists = await index_1.default.query('SELECT * FROM users WHERE email = $1', [email]);
    const emailExistsRows = emailExists.rows;
    if (emailExistsRows?.length) {
        console.log("email already exists!");
        return res.status(400).send({ error: true, message: "The provided email is linked to an existing account." });
    }
    try {
        const selectText = 'SELECT * FROM users WHERE username = $1';
        const values = [username];
        await index_1.default.query(selectText, values, async (error, results) => {
            if (error) {
                console.log('error');
                throw error;
            }
            const user = results.rows[0];
            if (user) {
                console.log("User already exists!");
                return res.status(400).send({ error: true, message: "Username already exists. Please choose another username" });
            }
            const insertText = 'INSERT INTO users (id, first_name, last_name, email, username, password)VALUES($1, $2, $3, $4, $5, $6) RETURNING *';
            const hashedPassword = await passwordHasher(password, 10);
            const values = await [id, first, last, email, username, hashedPassword];
            let newUser = await index_1.default.query(insertText, values);
            let newUsername = await newUser.rows[0].username;
            const token = (0, generateToken_1.default)({ username: newUsername });
            return res.status(200).send({ error: false, token, message: "User created" });
        });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.default = registerRouter;
