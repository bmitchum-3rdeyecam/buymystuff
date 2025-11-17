"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
});
exports.default = {
    query: (text, params, callback) => {
        if (callback) {
            pool.query(text, params || [], callback);
            return Promise.resolve({});
        }
        return pool.query(text, params || []);
    },
};
