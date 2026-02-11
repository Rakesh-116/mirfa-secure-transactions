"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPool = getPool;
exports.closePool = closePool;
const pg_1 = require("pg");
let pool = null;
function getPool() {
    if (!pool) {
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error("DATABASE_URL environment variable is required");
        }
        pool = new pg_1.Pool({
            connectionString,
            ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
    }
    return pool;
}
async function closePool() {
    if (pool) {
        await pool.end();
        pool = null;
    }
}
