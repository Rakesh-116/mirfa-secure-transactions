import { EncryptInput, EncryptResult } from "./types";
/**
 * Envelope Encryption Implementation
 *
 * Steps:
 * 1. Generate random DEK (32 bytes)
 * 2. Encrypt payload with DEK using AES-256-GCM
 * 3. Wrap (encrypt) DEK with Master Key using AES-256-GCM
 * 4. Store everything as hex strings
 */
export declare class EnvelopeEncryption {
    private masterKey;
    private mkVersion;
    constructor(masterKeyHex: string);
    /**
     * Encrypt payload using envelope encryption
     */
    encrypt(input: EncryptInput): EncryptResult;
    /**
     * Decrypt payload using envelope encryption
     */
    decrypt(encrypted: EncryptResult): Record<string, any>;
}
//# sourceMappingURL=envelope.d.ts.map