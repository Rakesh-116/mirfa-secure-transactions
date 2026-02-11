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

// Register CORS with explicit origins for production safety
fastify.register(cors, {
    origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://mirfa-secure-transactions-web.vercel.app",
        "https://mirfa-secure-transactions-web-git-main.vercel.app",
        ...(process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : []),
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: false,
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
        // Initialize database schema
        await initSchema();
        fastify.log.info("Database schema initialized");

        // Start server (only if not running on Vercel)
        if (!process.env.VERCEL) {
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

// Export for Vercel serverless
export default fastify;
