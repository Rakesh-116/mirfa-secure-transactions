import { FastifyReply, FastifyRequest } from "fastify";
import { EnvelopeEncryption, EncryptInput, TxSecureRecord, CryptoError } from "@mirfa/crypto";
import { insertTxRecord, getTxRecordById } from "@mirfa/db";
import { nanoid } from "nanoid";

// Lazy initialization of encryption engine
let envelope: EnvelopeEncryption | null = null;

function getEnvelope(): EnvelopeEncryption {
    if (!envelope) {
        const masterKeyHex = process.env.MASTER_KEY_HEX;
        if (!masterKeyHex) {
            throw new Error("MASTER_KEY_HEX environment variable is required");
        }
        envelope = new EnvelopeEncryption(masterKeyHex);
    }
    return envelope;
}

/**
 * POST /tx/encrypt
 * Encrypts payload and stores in database
 */
export async function encryptHandler(
    request: FastifyRequest<{
        Body: {
            partyId: string;
            payload: Record<string, any>;
        };
    }>,
    reply: FastifyReply,
) {
    try {
        const { partyId, payload } = request.body;

        // Validation
        if (!partyId || typeof partyId !== "string") {
            return reply.status(400).send({ error: "partyId is required and must be a string" });
        }
        if (!payload || typeof payload !== "object") {
            return reply.status(400).send({ error: "payload is required and must be an object" });
        }

        // Encrypt
        const encryptInput: EncryptInput = { partyId, payload };
        const encrypted = getEnvelope().encrypt(encryptInput);

        // Create record
        const record: TxSecureRecord = {
            id: nanoid(),
            partyId,
            createdAt: new Date().toISOString(),
            ...encrypted,
        };

        // Store in DB
        await insertTxRecord(record);

        return reply.status(201).send({
            success: true,
            id: record.id,
            partyId: record.partyId,
            createdAt: record.createdAt,
        });
    } catch (err) {
        if (err instanceof CryptoError) {
            return reply.status(400).send({ error: err.message });
        }
        request.log.error(err);
        return reply.status(500).send({ error: "Internal server error" });
    }
}

/**
 * GET /tx/:id
 * Returns encrypted record (without decrypting)
 */
export async function getRecordHandler(
    request: FastifyRequest<{
        Params: { id: string };
    }>,
    reply: FastifyReply,
) {
    try {
        const { id } = request.params;

        const record = await getTxRecordById(id);
        if (!record) {
            return reply.status(404).send({ error: "Record not found" });
        }

        return reply.status(200).send(record);
    } catch (err) {
        request.log.error(err);
        return reply.status(500).send({ error: "Internal server error" });
    }
}

/**
 * POST /tx/:id/decrypt
 * Decrypts and returns original payload
 */
export async function decryptHandler(
    request: FastifyRequest<{
        Params: { id: string };
    }>,
    reply: FastifyReply,
) {
    try {
        const { id } = request.params;

        // Fetch record
        const record = await getTxRecordById(id);
        if (!record) {
            return reply.status(404).send({ error: "Record not found" });
        }

        // Decrypt
        const decrypted = getEnvelope().decrypt(record);

        return reply.status(200).send({
            id: record.id,
            partyId: record.partyId,
            createdAt: record.createdAt,
            payload: decrypted,
        });
    } catch (err) {
        if (err instanceof CryptoError) {
            return reply.status(400).send({ error: err.message });
        }
        request.log.error(err);
        return reply.status(500).send({ error: "Internal server error" });
    }
}
