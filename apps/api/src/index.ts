import { config } from "dotenv";
import path from "path";

// Load environment variables FIRST before any other imports
// In a monorepo, load from root .env file
config({ path: path.join(process.cwd(), ".env") });

import Fastify from "fastify";
import cors from "@fastify/cors";
import { initSchema } from "@mirfa/db";
import { encryptHandler, getRecordHandler, decryptHandler } from "./handlers";

const PORT = parseInt(process.env.PORT || "3001", 10);
const HOST = process.env.HOST || "0.0.0.0";

const fastify = Fastify({
    logger: true,
});

// Register CORS
fastify.register(cors, {
    origin: process.env.CORS_ORIGIN || "*",
});

// Health check
fastify.get("/", async () => {
    return { status: "ok", service: "mirfa-secure-transactions-api" };
});

fastify.get("/health", async () => {
    return { status: "healthy", timestamp: new Date().toISOString() };
});

// Transaction routes
fastify.post("/tx/encrypt", encryptHandler);
fastify.get("/tx/:id", getRecordHandler);
fastify.post("/tx/:id/decrypt", decryptHandler);

/**
 * Start server
 */
async function start() {
    try {
        // Initialize database schema
        await initSchema();
        fastify.log.info("Database schema initialized");

        // Start server
        await fastify.listen({ port: PORT, host: HOST });
        fastify.log.info(`Server listening on ${HOST}:${PORT}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

start();
