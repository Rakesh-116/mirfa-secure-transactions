"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateHex = validateHex;
exports.validateEncryptedRecord = validateEncryptedRecord;
exports.aesGcmEncrypt = aesGcmEncrypt;
exports.aesGcmDecrypt = aesGcmDecrypt;
exports.generateDEK = generateDEK;
const crypto_1 = require("crypto");
const types_1 = require("./types");
/**
 * Validates hex string format and length
 */
function validateHex(hex, expectedBytes, fieldName) {
    if (!/^[0-9a-f]+$/i.test(hex)) {
        throw new types_1.ValidationError(`${fieldName} is not valid hex`);
    }
    const actualBytes = hex.length / 2;
    if (actualBytes !== expectedBytes) {
        throw new types_1.ValidationError(`${fieldName} must be ${expectedBytes} bytes, got ${actualBytes} bytes`);
    }
}
/**
 * Validates all fields in an encrypted record
 */
function validateEncryptedRecord(record) {
    validateHex(record.payload_nonce, 12, "payload_nonce");
    validateHex(record.payload_tag, 16, "payload_tag");
    validateHex(record.dek_wrap_nonce, 12, "dek_wrap_nonce");
    validateHex(record.dek_wrap_tag, 16, "dek_wrap_tag");
}
/**
 * Encrypt data using AES-256-GCM
 * Returns: { ciphertext, nonce, tag } all as hex strings
 */
function aesGcmEncrypt(plaintext, key) {
    if (key.length !== 32) {
        throw new types_1.CryptoError("Key must be 32 bytes for AES-256");
    }
    const nonce = (0, crypto_1.randomBytes)(12); // 96 bits for GCM
    const cipher = (0, crypto_1.createCipheriv)("aes-256-gcm", key, nonce);
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
function aesGcmDecrypt(ciphertextHex, nonceHex, tagHex, key) {
    if (key.length !== 32) {
        throw new types_1.CryptoError("Key must be 32 bytes for AES-256");
    }
    // Validate inputs
    validateHex(nonceHex, 12, "nonce");
    validateHex(tagHex, 16, "tag");
    const ciphertext = Buffer.from(ciphertextHex, "hex");
    const nonce = Buffer.from(nonceHex, "hex");
    const tag = Buffer.from(tagHex, "hex");
    const decipher = (0, crypto_1.createDecipheriv)("aes-256-gcm", key, nonce);
    decipher.setAuthTag(tag);
    try {
        const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
        return decrypted;
    }
    catch (err) {
        throw new types_1.CryptoError("Decryption failed: data may be tampered or corrupted");
    }
}
/**
 * Generate a random 32-byte DEK (Data Encryption Key)
 */
function generateDEK() {
    return (0, crypto_1.randomBytes)(32);
}
