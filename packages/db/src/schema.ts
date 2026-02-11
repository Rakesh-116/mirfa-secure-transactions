import { getPool } from "./pool";

/**
 * Initialize database schema
 * Creates tx_secure_records table if it doesn't exist
 */
export async function initSchema(): Promise<void> {
    const pool = getPool();
    await pool.query(`
    CREATE TABLE IF NOT EXISTS public.tx_secure_records (
      id VARCHAR(255) PRIMARY KEY,
      party_id VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      payload_nonce VARCHAR(24) NOT NULL,
      payload_ct TEXT NOT NULL,
      payload_tag VARCHAR(32) NOT NULL,
      dek_wrap_nonce VARCHAR(24) NOT NULL,
      dek_wrapped VARCHAR(128) NOT NULL,
      dek_wrap_tag VARCHAR(32) NOT NULL,
      alg VARCHAR(50) NOT NULL,
      mk_version INTEGER NOT NULL,
      CONSTRAINT chk_nonce_length CHECK (LENGTH(payload_nonce) = 24),
      CONSTRAINT chk_tag_length CHECK (LENGTH(payload_tag) = 32),
      CONSTRAINT chk_dek_nonce_length CHECK (LENGTH(dek_wrap_nonce) = 24),
      CONSTRAINT chk_dek_tag_length CHECK (LENGTH(dek_wrap_tag) = 32)
    );

    CREATE INDEX IF NOT EXISTS idx_party_id ON public.tx_secure_records(party_id);
    CREATE INDEX IF NOT EXISTS idx_created_at ON public.tx_secure_records(created_at DESC);
  `);
}
