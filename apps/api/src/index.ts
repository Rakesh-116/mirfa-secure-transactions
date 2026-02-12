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

// Register CORS with proper origin validation
fastify.register(cors, {
    origin: (origin, cb) => {
        // Allow requests with no origin (server-to-server, Postman, curl)
        if (!origin) return cb(null, true);

        // Allow localhost (any port)
        if (origin.startsWith("http://localhost")) {
            return cb(null, true);
        }

        // Allow all Vercel preview + production domains
        if (origin.endsWith(".vercel.app")) {
            return cb(null, true);
        }

        // Reject all other origins
        cb(new Error("Not allowed by CORS"), false);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
});

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

// Export for Vercel serverless - proper handler wrapper
export default async function handler(req: any, res: any) {
    await fastify.ready();
    fastify.server.emit("request", req, res);
}
