"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.CryptoError = void 0;
/**
 * Error types
 */
class CryptoError extends Error {
    constructor(message) {
        super(message);
        this.name = "CryptoError";
    }
}
exports.CryptoError = CryptoError;
class ValidationError extends CryptoError {
    constructor(message) {
        super(message);
        this.name = "ValidationError";
    }
}
exports.ValidationError = ValidationError;
