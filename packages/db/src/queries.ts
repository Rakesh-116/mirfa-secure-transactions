import { TxSecureRecord } from "@mirfa/crypto";
import { getPool } from "./pool";

/**
 * Insert a new encrypted transaction record
 */
export async function insertTxRecord(record: TxSecureRecord): Promise<void> {
    const pool = getPool();
    await pool.query(
        `
    INSERT INTO public.tx_secure_records (
      id, party_id, created_at, payload_nonce, payload_ct, payload_tag,
      dek_wrap_nonce, dek_wrapped, dek_wrap_tag, alg, mk_version
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  `,
        [
            record.id,
            record.partyId,
            record.createdAt,
            record.payload_nonce,
            record.payload_ct,
            record.payload_tag,
            record.dek_wrap_nonce,
            record.dek_wrapped,
            record.dek_wrap_tag,
            record.alg,
            record.mk_version,
        ],
    );
}

/**
 * Fetch encrypted transaction record by ID
 */
export async function getTxRecordById(id: string): Promise<TxSecureRecord | null> {
    const pool = getPool();
    const result = await pool.query(
        `
    SELECT 
      id, party_id, created_at, payload_nonce, payload_ct, payload_tag,
      dek_wrap_nonce, dek_wrapped, dek_wrap_tag, alg, mk_version
    FROM public.tx_secure_records
    WHERE id = $1
  `,
        [id],
    );

    if (result.rows.length === 0) {
        return null;
    }

    const row = result.rows[0];
    return {
        id: row.id,
        partyId: row.party_id,
        createdAt: row.created_at,
        payload_nonce: row.payload_nonce,
        payload_ct: row.payload_ct,
        payload_tag: row.payload_tag,
        dek_wrap_nonce: row.dek_wrap_nonce,
        dek_wrapped: row.dek_wrapped,
        dek_wrap_tag: row.dek_wrap_tag,
        alg: row.alg,
        mk_version: row.mk_version,
    };
}

/**
 * Get all records for a party (optional, useful for debugging)
 */
export async function getTxRecordsByParty(partyId: string): Promise<TxSecureRecord[]> {
    const pool = getPool();
    const result = await pool.query(
        `
    SELECT 
      id, party_id, created_at, payload_nonce, payload_ct, payload_tag,
      dek_wrap_nonce, dek_wrapped, dek_wrap_tag, alg, mk_version
    FROM public.tx_secure_records
    WHERE party_id = $1
    ORDER BY created_at DESC
  `,
        [partyId],
    );

    return result.rows.map((row) => ({
        id: row.id,
        partyId: row.party_id,
        createdAt: row.created_at,
        payload_nonce: row.payload_nonce,
        payload_ct: row.payload_ct,
        payload_tag: row.payload_tag,
        dek_wrap_nonce: row.dek_wrap_nonce,
        dek_wrapped: row.dek_wrapped,
        dek_wrap_tag: row.dek_wrap_tag,
        alg: row.alg,
        mk_version: row.mk_version,
    }));
}
