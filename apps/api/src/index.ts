// Load dotenv only in local development (Vercel injects env vars automatically)
if (!process.env.VERCEL) {
    const dotenv = require("dotenv");
    dotenv.config();
}

import Fastify from "fastify";
import cors from "@fastify/cors";
import { initSchema } from "@mirfa/db";
import { encryptHandler, getRecordHandler, decryptHandler } from "./handlers";

const PORT = parseInt(process.env.PORT || "3001", 10);
const HOST = process.env.HOST || "0.0.0.0";

const fastify = Fastify({
    logger: true,
});

// CORS - allow everything (simplest config)
fastify.register(cors);

// Explicitly handle OPTIONS for all routes (required for Vercel serverless)
fastify.options("/*", async (request, reply) => {
    reply.status(204).send();
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
 * Start server (only in non-serverless environments)
 * On Vercel, the fastify instance is exported and handled by the serverless wrapper
 */
async function start() {
    try {
        // ❌ DO NOT run initSchema on Vercel - causes serverless crash
        // Only initialize schema in local development
        if (!process.env.VERCEL) {
            await initSchema();
            fastify.log.info("Database schema initialized");

            await fastify.listen({ port: PORT, host: HOST });
            fastify.log.info(`Server listening on ${HOST}:${PORT}`);
        }
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

// Only start server in local development
if (!process.env.VERCEL) {
    start();
}

// Export for Vercel serverless - proper handler wrapper with error handling
export default async function handler(req: any, res: any) {
    try {
        await fastify.ready();
        fastify.server.emit("request", req, res);
    } catch (err) {
        console.error("Serverless handler error:", err);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Internal server error" }));
    }
}
