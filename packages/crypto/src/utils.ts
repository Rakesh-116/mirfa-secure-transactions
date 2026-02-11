import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { ValidationError, CryptoError } from "./types";

/**
 * Validates hex string format and length
 */
export function validateHex(hex: string, expectedBytes: number, fieldName: string): void {
    if (!/^[0-9a-f]+$/i.test(hex)) {
        throw new ValidationError(`${fieldName} is not valid hex`);
    }
    const actualBytes = hex.length / 2;
    if (actualBytes !== expectedBytes) {
        throw new ValidationError(`${fieldName} must be ${expectedBytes} bytes, got ${actualBytes} bytes`);
    }
}

/**
 * Validates all fields in an encrypted record
 */
export function validateEncryptedRecord(record: {
    payload_nonce: string;
    payload_tag: string;
    dek_wrap_nonce: string;
    dek_wrap_tag: string;
}): void {
    validateHex(record.payload_nonce, 12, "payload_nonce");
    validateHex(record.payload_tag, 16, "payload_tag");
    validateHex(record.dek_wrap_nonce, 12, "dek_wrap_nonce");
    validateHex(record.dek_wrap_tag, 16, "dek_wrap_tag");
}

/**
 * Encrypt data using AES-256-GCM
 * Returns: { ciphertext, nonce, tag } all as hex strings
 */
export function aesGcmEncrypt(plaintext: Buffer, key: Buffer): { ciphertext: string; nonce: string; tag: string } {
    if (key.length !== 32) {
        throw new CryptoError("Key must be 32 bytes for AES-256");
    }

    const nonce = randomBytes(12); // 96 bits for GCM
    const cipher = createCipheriv("aes-256-gcm", key, nonce);

    const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const tag = cipher.getAuthTag(); // 128 bits (16 bytes)

    return {
        ciphertext: encrypted.toString("hex"),
        nonce: nonce.toString("hex"),
        tag: tag.toString("hex"),
    };
}

/**
 * Decrypt data using AES-256-GCM
 * Throws if authentication fails (tampered data)
 */
export function aesGcmDecrypt(ciphertextHex: string, nonceHex: string, tagHex: string, key: Buffer): Buffer {
    if (key.length !== 32) {
        throw new CryptoError("Key must be 32 bytes for AES-256");
    }

    // Validate inputs
    validateHex(nonceHex, 12, "nonce");
    validateHex(tagHex, 16, "tag");

    const ciphertext = Buffer.from(ciphertextHex, "hex");
    const nonce = Buffer.from(nonceHex, "hex");
    const tag = Buffer.from(tagHex, "hex");

    const decipher = createDecipheriv("aes-256-gcm", key, nonce);
    decipher.setAuthTag(tag);

    try {
        const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
        return decrypted;
    } catch (err) {
        throw new CryptoError("Decryption failed: data may be tampered or corrupted");
    }
}

/**
 * Generate a random 32-byte DEK (Data Encryption Key)
 */
export function generateDEK(): Buffer {
    return randomBytes(32);
}
