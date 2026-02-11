import { IncomingMessage, ServerResponse } from "http";
import { config } from "dotenv";

// Load environment variables
config();

// Import the Fastify app after env is loaded
import("./index");

// Vercel serverless handler
export default async function handler(req: IncomingMessage, res: ServerResponse) {
    // This file is for Vercel deployment
    // Actual implementation is in index.ts
    await import("./index");
}
