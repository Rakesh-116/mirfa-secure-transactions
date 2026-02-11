"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvelopeEncryption = void 0;
const utils_1 = require("./utils");
const types_1 = require("./types");
/**
 * Envelope Encryption Implementation
 *
 * Steps:
 * 1. Generate random DEK (32 bytes)
 * 2. Encrypt payload with DEK using AES-256-GCM
 * 3. Wrap (encrypt) DEK with Master Key using AES-256-GCM
 * 4. Store everything as hex strings
 */
class EnvelopeEncryption {
    constructor(masterKeyHex) {
        this.mkVersion = 1;
        if (!masterKeyHex || masterKeyHex.length !== 64) {
            throw new types_1.CryptoError("Master key must be 32 bytes (64 hex chars)");
        }
        this.masterKey = Buffer.from(masterKeyHex, "hex");
    }
    /**
     * Encrypt payload using envelope encryption
     */
    encrypt(input) {
        try {
            // Step 1: Generate random DEK
            const dek = (0, utils_1.generateDEK)();
            // Step 2: Encrypt payload with DEK
            const payloadJson = JSON.stringify(input.payload);
            const payloadBuffer = Buffer.from(payloadJson, "utf-8");
            const payloadEncrypted = (0, utils_1.aesGcmEncrypt)(payloadBuffer, dek);
            // Step 3: Wrap DEK with Master Key
            const dekWrapped = (0, utils_1.aesGcmEncrypt)(dek, this.masterKey);
            // Step 4: Return all components as hex strings
            return {
                payload_nonce: payloadEncrypted.nonce,
                payload_ct: payloadEncrypted.ciphertext,
                payload_tag: payloadEncrypted.tag,
                dek_wrap_nonce: dekWrapped.nonce,
                dek_wrapped: dekWrapped.ciphertext,
                dek_wrap_tag: dekWrapped.tag,
                alg: "AES-256-GCM",
                mk_version: this.mkVersion,
            };
        }
        catch (err) {
            if (err instanceof types_1.CryptoError)
                throw err;
            throw new types_1.CryptoError(`Encryption failed: ${err.message}`);
        }
    }
    /**
     * Decrypt payload using envelope encryption
     */
    decrypt(encrypted) {
        try {
            // Validate all fields
            (0, utils_1.validateEncryptedRecord)(encrypted);
            // Step 1: Unwrap (decrypt) DEK using Master Key
            const dek = (0, utils_1.aesGcmDecrypt)(encrypted.dek_wrapped, encrypted.dek_wrap_nonce, encrypted.dek_wrap_tag, this.masterKey);
            // Step 2: Decrypt payload using DEK
            const payloadBuffer = (0, utils_1.aesGcmDecrypt)(encrypted.payload_ct, encrypted.payload_nonce, encrypted.payload_tag, dek);
            // Step 3: Parse JSON
            const payloadJson = payloadBuffer.toString("utf-8");
            return JSON.parse(payloadJson);
        }
        catch (err) {
            if (err instanceof types_1.CryptoError)
                throw err;
            throw new types_1.CryptoError(`Decryption failed: ${err.message}`);
        }
    }
}
exports.EnvelopeEncryption = EnvelopeEncryption;
