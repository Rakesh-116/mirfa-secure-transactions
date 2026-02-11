import { TxSecureRecord } from "@mirfa/crypto";
/**
 * Insert a new encrypted transaction record
 */
export declare function insertTxRecord(record: TxSecureRecord): Promise<void>;
/**
 * Fetch encrypted transaction record by ID
 */
export declare function getTxRecordById(id: string): Promise<TxSecureRecord | null>;
/**
 * Get all records for a party (optional, useful for debugging)
 */
export declare function getTxRecordsByParty(partyId: string): Promise<TxSecureRecord[]>;
//# sourceMappingURL=queries.d.ts.map