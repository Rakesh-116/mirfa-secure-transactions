import { aesGcmEncrypt, aesGcmDecrypt, generateDEK, validateEncryptedRecord } from "./utils";
import { EncryptInput, EncryptResult, CryptoError } from "./types";

/**
 * Envelope Encryption Implementation
 *
 * Steps:
 * 1. Generate random DEK (32 bytes)
 * 2. Encrypt payload with DEK using AES-256-GCM
 * 3. Wrap (encrypt) DEK with Master Key using AES-256-GCM
 * 4. Store everything as hex strings
 */
export class EnvelopeEncryption {
    private masterKey: Buffer;
    private mkVersion: 1 = 1;

    constructor(masterKeyHex: string) {
        if (!masterKeyHex || masterKeyHex.length !== 64) {
            throw new CryptoError("Master key must be 32 bytes (64 hex chars)");
        }
        this.masterKey = Buffer.from(masterKeyHex, "hex");
    }

    /**
     * Encrypt payload using envelope encryption
     */
    encrypt(input: EncryptInput): EncryptResult {
        try {
            // Step 1: Generate random DEK
            const dek = generateDEK();

            // Step 2: Encrypt payload with DEK
            const payloadJson = JSON.stringify(input.payload);
            const payloadBuffer = Buffer.from(payloadJson, "utf-8");
            const payloadEncrypted = aesGcmEncrypt(payloadBuffer, dek);

            // Step 3: Wrap DEK with Master Key
            const dekWrapped = aesGcmEncrypt(dek, this.masterKey);

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
        } catch (err) {
            if (err instanceof CryptoError) throw err;
            throw new CryptoError(`Encryption failed: ${(err as Error).message}`);
        }
    }

    /**
     * Decrypt payload using envelope encryption
     */
    decrypt(encrypted: EncryptResult): Record<string, any> {
        try {
            // Validate all fields
            validateEncryptedRecord(encrypted);

            // Step 1: Unwrap (decrypt) DEK using Master Key
            const dek = aesGcmDecrypt(
                encrypted.dek_wrapped,
                encrypted.dek_wrap_nonce,
                encrypted.dek_wrap_tag,
                this.masterKey,
            );

            // Step 2: Decrypt payload using DEK
            const payloadBuffer = aesGcmDecrypt(
                encrypted.payload_ct,
                encrypted.payload_nonce,
                encrypted.payload_tag,
                dek,
            );

            // Step 3: Parse JSON
            const payloadJson = payloadBuffer.toString("utf-8");
            return JSON.parse(payloadJson);
        } catch (err) {
            if (err instanceof CryptoError) throw err;
            throw new CryptoError(`Decryption failed: ${(err as Error).message}`);
        }
    }
}
