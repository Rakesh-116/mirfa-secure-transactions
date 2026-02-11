/**
 * Core types for secure transaction records
 */
export type TxSecureRecord = {
    id: string;
    partyId: string;
    createdAt: string;
    payload_nonce: string;
    payload_ct: string;
    payload_tag: string;
    dek_wrap_nonce: string;
    dek_wrapped: string;
    dek_wrap_tag: string;
    alg: "AES-256-GCM";
    mk_version: 1;
};

/**
 * Input for encryption
 */
export type EncryptInput = {
    partyId: string;
    payload: Record<string, any>;
};

/**
 * Result after encryption (for storage)
 */
export type EncryptResult = {
    payload_nonce: string;
    payload_ct: string;
    payload_tag: string;
    dek_wrap_nonce: string;
    dek_wrapped: string;
    dek_wrap_tag: string;
    alg: "AES-256-GCM";
    mk_version: 1;
};

/**
 * Error types
 */
export class CryptoError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "CryptoError";
    }
}

export class ValidationError extends CryptoError {
    constructor(message: string) {
        super(message);
        this.name = "ValidationError";
    }
}
