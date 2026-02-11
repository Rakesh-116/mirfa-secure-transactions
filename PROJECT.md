# 🚀 Mirfa Secure Transactions - TurboRepo

**Production-grade secure transaction system using envelope encryption (AES-256-GCM)**

## 📦 Project Structure

```
mirfa-secure-transactions/
├── apps/
│   ├── api/              # Fastify backend API
│   │   ├── src/
│   │   │   ├── index.ts         # Server entry point
│   │   │   ├── handlers.ts      # Route handlers
│   │   │   └── server.ts        # Vercel adapter
│   │   ├── package.json
│   │   └── vercel.json          # Vercel deployment config
│   │
│   └── web/              # Next.js frontend
│       ├── src/app/
│       │   ├── page.tsx         # Main UI
│       │   └── layout.tsx       # Root layout
│       ├── package.json
│       └── next.config.js
│
├── packages/
│   ├── crypto/           # Shared encryption logic
│   │   └── src/
│   │       ├── types.ts         # TypeScript types
│   │       ├── utils.ts         # AES-GCM utilities
│   │       ├── envelope.ts      # Envelope encryption
│   │       └── index.ts
│   │
│   └── db/               # PostgreSQL integration
│       └── src/
│           ├── pool.ts          # Connection pool
│           ├── schema.ts        # Table schema
│           ├── queries.ts       # Database queries
│           └── index.ts
│
├── package.json          # Root package.json
├── turbo.json           # TurboRepo config
├── pnpm-workspace.yaml  # pnpm workspaces
└── .env.example         # Environment variables template
```

## 🛠 Tech Stack

- **Monorepo:** TurboRepo + pnpm workspaces
- **Frontend:** Next.js 15 (React 19, TypeScript)
- **Backend:** Fastify 5 (TypeScript)
- **Database:** PostgreSQL with `pg` driver
- **Encryption:** Node.js Crypto (AES-256-GCM)
- **Deployment:** Vercel (web + API)

## 🔐 How Envelope Encryption Works

### Architecture

```
User Payload → DEK (encrypt) → Encrypted Payload
                ↓
             Master Key (wrap DEK) → Wrapped DEK
                ↓
          Store both in Postgres
```

### Step-by-Step Process

1. **Generate DEK:** Random 32-byte Data Encryption Key
2. **Encrypt Payload:** AES-256-GCM with DEK
    - Input: JSON payload
    - Output: ciphertext + 12-byte nonce + 16-byte auth tag
3. **Wrap DEK:** Encrypt DEK using Master Key (AES-256-GCM)
    - Input: DEK
    - Output: wrapped DEK + nonce + tag
4. **Store:** Save all components as hex strings in Postgres

### Decryption Process

1. Fetch encrypted record from database
2. Unwrap DEK using Master Key
3. Decrypt payload using DEK
4. Return original JSON

### Security Features

✅ **Authenticated encryption** (GCM mode prevents tampering)
✅ **Nonce validation** (must be exactly 12 bytes)
✅ **Tag validation** (must be exactly 16 bytes)
✅ **Tamper detection** (modified ciphertext/tag fails decryption)
✅ **Master key versioning** (supports key rotation)

## 🚀 Setup & Installation

### Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL 14+ (local or hosted)

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

Create `.env` in the root directory:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Generate a new master key:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

DATABASE_URL=postgresql://user:password@localhost:5432/mirfa_db
MASTER_KEY_HEX=<YOUR_64_CHAR_HEX_STRING>
PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Set Up PostgreSQL

**Option A: Docker (Quick Start)**

```bash
docker run --name mirfa-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=mirfa_db \
  -p 5432:5432 \
  -d postgres:16
```

Then update `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mirfa_db
```

**Option B: Local Install**

Install PostgreSQL and create database:

```sql
CREATE DATABASE mirfa_db;
```

### 4. Run the Project

```bash
pnpm dev
```

This starts:

- **API:** http://localhost:3001
- **Web:** http://localhost:3000

The database schema is auto-created on first run.

## 📡 API Endpoints

### `POST /tx/encrypt`

Encrypt and store payload.

**Request:**

```json
{
    "partyId": "party_123",
    "payload": {
        "amount": 100,
        "currency": "AED"
    }
}
```

**Response:**

```json
{
    "success": true,
    "id": "abc123",
    "partyId": "party_123",
    "createdAt": "2026-02-11T10:00:00.000Z"
}
```

### `GET /tx/:id`

Fetch encrypted record (no decryption).

**Response:**

```json
{
    "id": "abc123",
    "partyId": "party_123",
    "createdAt": "2026-02-11T10:00:00.000Z",
    "payload_nonce": "a1b2c3...",
    "payload_ct": "d4e5f6...",
    "payload_tag": "789abc...",
    "dek_wrap_nonce": "def012...",
    "dek_wrapped": "345678...",
    "dek_wrap_tag": "9abcde...",
    "alg": "AES-256-GCM",
    "mk_version": 1
}
```

### `POST /tx/:id/decrypt`

Decrypt and return original payload.

**Response:**

```json
{
    "id": "abc123",
    "partyId": "party_123",
    "createdAt": "2026-02-11T10:00:00.000Z",
    "payload": {
        "amount": 100,
        "currency": "AED"
    }
}
```

## 🌐 Deployment to Vercel

### Prerequisites

1. Vercel account (free tier works)
2. PostgreSQL database (use Vercel Postgres, Neon, or Supabase)

### Deploy API

```bash
cd apps/api
vercel
```

Set environment variables in Vercel dashboard:

- `DATABASE_URL`
- `MASTER_KEY_HEX`
- `NODE_ENV=production`
- `CORS_ORIGIN=https://your-frontend.vercel.app`

### Deploy Web

```bash
cd apps/web
vercel
```

Set environment variable:

- `NEXT_PUBLIC_API_URL=https://your-api.vercel.app`

### Alternative: Deploy from Root

```bash
# Deploy API
vercel --cwd apps/api

# Deploy Web
vercel --cwd apps/web
```

## 🧪 Testing the System

### Test Encryption

```bash
curl -X POST http://localhost:3001/tx/encrypt \
  -H "Content-Type: application/json" \
  -d '{"partyId":"party_123","payload":{"amount":100,"currency":"AED"}}'
```

### Test Fetch

```bash
curl http://localhost:3001/tx/<RECORD_ID>
```

### Test Decryption

```bash
curl -X POST http://localhost:3001/tx/<RECORD_ID>/decrypt
```

## 🏗 How TurboRepo Works

TurboRepo enables:

1. **Parallel builds:** Builds packages in dependency order
2. **Shared packages:** `@mirfa/crypto` and `@mirfa/db` reused by API
3. **Caching:** Builds are cached, only changed packages rebuild
4. **Workspace protocol:** `workspace:*` links local packages

### Build Pipeline

```
pnpm dev
  ↓
turbo run dev
  ↓
┌─────────────┐
│   packages  │ (build first)
│   crypto    │
│   db        │
└─────────────┘
      ↓
┌─────────────┐
│    apps     │ (build after)
│    api      │
│    web      │
└─────────────┘
```

## 📊 Database Schema

```sql
CREATE TABLE tx_secure_records (
  id VARCHAR(255) PRIMARY KEY,
  party_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  payload_nonce VARCHAR(24) NOT NULL,     -- 12 bytes hex
  payload_ct TEXT NOT NULL,
  payload_tag VARCHAR(32) NOT NULL,       -- 16 bytes hex
  dek_wrap_nonce VARCHAR(24) NOT NULL,
  dek_wrapped VARCHAR(128) NOT NULL,
  dek_wrap_tag VARCHAR(32) NOT NULL,
  alg VARCHAR(50) NOT NULL,
  mk_version INTEGER NOT NULL
);
```

## 🐛 Common Issues

### Issue: `DATABASE_URL is required`

**Solution:** Create `.env` file with valid Postgres connection string.

### Issue: `MASTER_KEY_HEX is required`

**Solution:** Generate key and add to `.env`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Issue: `Cannot find module '@mirfa/crypto'`

**Solution:** Build packages first:

```bash
pnpm install
cd packages/crypto && pnpm build
cd packages/db && pnpm build
```

### Issue: `relation "tx_secure_records" does not exist`

**Solution:** Schema auto-creates on first API start. Restart API.

## 📝 Next Steps / Improvements

- [ ] Add unit tests (Jest + Vitest)
- [ ] Add E2E tests (Playwright)
- [ ] Implement master key rotation
- [ ] Add Redis caching layer
- [ ] Add audit logs
- [ ] Implement rate limiting
- [ ] Add OpenAPI/Swagger docs

## 👤 Author

Built by **Rakesh** for Mirfa Internship Challenge

---

**License:** MIT
