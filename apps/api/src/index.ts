import Fastify from "fastify";
import cors from "@fastify/cors";
import { encryptHandler, getRecordHandler, decryptHandler } from "./handlers";

const fastify = Fastify({ logger: true });

// ✅ Enable CORS (allow all origins for now)
fastify.register(cors, {
    origin: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
});

// ✅ Routes
fastify.get("/", async () => ({ ok: true, service: "mirfa-secure-transactions-api" }));
fastify.get("/health", async () => ({ ok: true, timestamp: new Date().toISOString() }));

fastify.post("/tx/encrypt", encryptHandler);
fastify.get("/tx/:id", getRecordHandler);
fastify.post("/tx/:id/decrypt", decryptHandler);

// ✅ Vercel Serverless Handler (THIS PART FIXES EVERYTHING)
export default async function handler(req: any, res: any) {
    try {
        await fastify.ready();
        fastify.server.emit("request", req, res);
    } catch (err) {
        console.error("Vercel handler crash:", err);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Server crashed", details: String(err) }));
    }
}
