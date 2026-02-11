/**
 * Validates hex string format and length
 */
export declare function validateHex(hex: string, expectedBytes: number, fieldName: string): void;
/**
 * Validates all fields in an encrypted record
 */
export declare function validateEncryptedRecord(record: {
    payload_nonce: string;
    payload_tag: string;
    dek_wrap_nonce: string;
    dek_wrap_tag: string;
}): void;
/**
 * Encrypt data using AES-256-GCM
 * Returns: { ciphertext, nonce, tag } all as hex strings
 */
export declare function aesGcmEncrypt(plaintext: Buffer, key: Buffer): {
    ciphertext: string;
    nonce: string;
    tag: string;
};
/**
 * Decrypt data using AES-256-GCM
 * Throws if authentication fails (tampered data)
 */
export declare function aesGcmDecrypt(ciphertextHex: string, nonceHex: string, tagHex: string, key: Buffer): Buffer;
/**
 * Generate a random 32-byte DEK (Data Encryption Key)
 */
export declare function generateDEK(): Buffer;
//# sourceMappingURL=utils.d.ts.map