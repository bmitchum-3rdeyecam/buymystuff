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
const loginRouter = express_1.default.Router();
loginRouter.use(body_parser_1.default.json());
loginRouter.use(body_parser_1.default.urlencoded({
    extended: true,
}));
loginRouter.post("/", [(0, express_validator_1.check)('password').isLength({ max: 20 })], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const username = validator_1.default.escape(req.body.username);
    const password = validator_1.default.escape(req.body.password);
    const selectText = 'SELECT * FROM users WHERE username = $1';
    const values = [username];
    try {
        const results = await index_1.default.query(selectText, values);
        const user = await results.rows[0];
        if (!user) {
            console.log("User does not exist!");
            return res.status(400).send({ error: true, message: "User does not exist" });
        }
        const id = user.id;
        const matchedPassword = await bcrypt_1.default.compare(password, user.password);
        if (!matchedPassword) {
            console.log("Password did not match!");
            return res.status(400).send({ error: true, message: "Invalid password" });
        }
        console.log('Password matches!');
        req.session.authenticated = true;
        req.session.user = {
            id,
            username,
            password
        };
        const token = (0, generateToken_1.default)({ username: req.session.user.username });
        return res.status(200).send({ error: false, token, message: "Logged in sucessfully" });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});
exports.default = loginRouter;
