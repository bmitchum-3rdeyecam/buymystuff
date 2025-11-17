"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const decodeJWT = (token) => {
    const user = jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET);
    return user.username;
};
exports.default = decodeJWT;
