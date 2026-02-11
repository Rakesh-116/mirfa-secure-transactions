# 🔐 Mirfa Secure Transactions
## Production-Ready Envelope Encryption System

A full-stack monorepo application implementing **envelope encryption** using AES-256-GCM for secure transaction storage. Built with modern TypeScript, TurboRepo, and deployed on Vercel with Neon PostgreSQL.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)

---

## 🏗️ Architecture Overview

This project uses a **monorepo structure** powered by TurboRepo for efficient build caching and dependency management:

```
mirfa-secure-transactions/
├── apps/
│   ├── web/              # Next.js 15 frontend (Port 3000)
│   │   ├── src/app/
│   │   │   ├── page.tsx       # Main UI with form
│   │   │   └── layout.tsx     # Root layout
│   │   └── package.json
│   └── api/              # Fastify backend (Port 3001)
│       ├── src/
│       │   ├── index.ts           # Server initialization
│       │   ├── handlers.ts        # Route handlers
│       │   └── server.ts
│       └── package.json
├── packages/
│   ├── crypto/           # Envelope encryption library
│   │   ├── src/
│   │   │   ├── envelope.ts        # EnvelopeEncryption class
│   │   │   ├── utils.ts           # AES-GCM helpers
│   │   │   └── types.ts           # TypeScript interfaces
│   │   └── package.json
│   └── db/               # PostgreSQL database layer
│       ├── src/
│       │   ├── pool.ts            # Connection pooling
│       │   ├── queries.ts         # CRUD operations
│       │   └── schema.ts          # Table initialization
│       └── package.json
├── .env                  # Environment configuration
├── turbo.json            # TurboRepo config
└── pnpm-workspace.yaml   # Workspace definition
```

---

## ✨ Key Features

✅ **Envelope Encryption** - Industry-standard security pattern used by AWS, Google Cloud, and banks  
✅ **AES-256-GCM** - NIST-approved authenticated encryption with tamper detection  
✅ **PostgreSQL (Neon)** - Cloud-native, serverless Postgres with automatic scaling  
✅ **TurboRepo** - Parallel execution and smart caching for monorepo builds  
✅ **TypeScript** - Full type safety across frontend, backend, and shared packages  
✅ **Production-Ready** - Deployed on Vercel with proper error handling and validation  

---

## 🔐 Encryption Implementation

### What is Envelope Encryption?

Envelope encryption is a security pattern where data is encrypted with a **Data Encryption Key (DEK)**, and the DEK itself is encrypted with a **Master Key**. This approach provides:

- **Key rotation** - Change master key without re-encrypting all data
- **Master key security** - Never stored in database
- **Unique DEK per record** - Isolation between transactions
- **Tamper detection** - GCM authentication tags verify data integrity

### Encryption Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. Generate random DEK (32 bytes)                       │
│    ↓                                                     │
│ 2. Encrypt payload with DEK using AES-256-GCM          │
│    → Produces: ciphertext, nonce (12b), tag (16b)      │
│    ↓                                                     │
│ 3. Encrypt DEK with Master Key using AES-256-GCM       │
│    → Produces: wrapped_dek, nonce (12b), tag (16b)     │
│    ↓                                                     │
│ 4. Store everything in PostgreSQL as hex strings        │
└─────────────────────────────────────────────────────────┘
```

### Decryption Flow

```
┌─────────────────────────────────────────────────────────┐
│ 1. Fetch encrypted record from database                 │
│    ↓                                                     │
│ 2. Unwrap DEK using Master Key                          │
│    → Validates authentication tag (tamper detection)    │
│    ↓                                                     │
│ 3. Decrypt payload using unwrapped DEK                  │
│    → Validates authentication tag (tamper detection)    │
│    ↓                                                     │
│ 4. Return original JSON payload                         │
└─────────────────────────────────────────────────────────┘
```

### Security Validations

The system enforces strict validation rules:

- ✅ Nonce must be exactly **12 bytes** (24 hex characters)
- ✅ Tag must be exactly **16 bytes** (32 hex characters)
- ✅ All binary data stored as **valid hex strings**
- ✅ Authentication tags verified during decryption (prevents tampering)
- ✅ Decryption fails if any component is modified

---

## 🗄️ Database: Neon PostgreSQL Integration

### Why Neon?

[Neon](https://neon.tech) is a serverless PostgreSQL platform offering:

- ⚡ **Serverless** - No infrastructure management, automatic scaling
- 🌳 **Branching** - Create instant database copies for testing
- 🔄 **Connection Pooling** - Built-in PgBouncer for efficient connections
- 💰 **Free Tier** - 0.5 GB storage, perfect for demos and development
- 🚀 **Vercel Integration** - Seamless deployment with Vercel projects
- 🌍 **Global** - Multi-region support with low latency

### Database Schema

```sql
CREATE TABLE public.tx_secure_records (
  id VARCHAR(255) PRIMARY KEY,
  party_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Encrypted payload components
  payload_nonce VARCHAR(24) NOT NULL,    -- 12 bytes as hex
  payload_ct TEXT NOT NULL,              -- Variable length ciphertext
  payload_tag VARCHAR(32) NOT NULL,      -- 16 bytes as hex
  
  -- Wrapped DEK components
  dek_wrap_nonce VARCHAR(24) NOT NULL,   -- 12 bytes as hex
  dek_wrapped VARCHAR(128) NOT NULL,     -- 32 bytes (DEK) as hex
  dek_wrap_tag VARCHAR(32) NOT NULL,     -- 16 bytes as hex
  
  -- Metadata
  alg VARCHAR(50) NOT NULL,              -- "AES-256-GCM"
  mk_version INTEGER NOT NULL,           -- Master key version for rotation
  
  -- Validation constraints
  CONSTRAINT chk_nonce_length CHECK (LENGTH(payload_nonce) = 24),
  CONSTRAINT chk_tag_length CHECK (LENGTH(payload_tag) = 32),
  CONSTRAINT chk_dek_nonce_length CHECK (LENGTH(dek_wrap_nonce) = 24),
  CONSTRAINT chk_dek_tag_length CHECK (LENGTH(dek_wrap_tag) = 32)
);

CREATE INDEX idx_party_id ON public.tx_secure_records(party_id);
CREATE INDEX idx_created_at ON public.tx_secure_records(created_at DESC);
```

### Neon Setup Guide

#### 1. Create Neon Account

Visit [console.neon.tech](https://console.neon.tech) and sign up (free tier available).

#### 2. Create Project

```
Project Name: mirfa-secure-tx
Region: Choose closest to your users (e.g., ap-southeast-1 for Asia)
PostgreSQL Version: 16 (latest)
```

#### 3. Get Connection String

In your Neon dashboard:
- Click **"Connection Details"**
- Select **"Pooled connection"** (uses PgBouncer for better performance)
- Copy the full connection string

Example format:
```
postgresql://neondb_owner:npg_xxxxxxxxxxxx@ep-ancient-glade-a17bb286-pooler.ap-southeast-1.aws.neon.tech/mirfa_secure_tx?sslmode=require
```

#### 4. Update Environment Variables

Add to your `.env` file:

```env
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@YOUR_HOST/DATABASE_NAME?sslmode=require
```

**Important Notes:**
- ✅ Use the **pooled connection** string for production
- ✅ Include `?sslmode=require` for secure connection
- ✅ Password is auto-generated by Neon (copy from dashboard)
- ✅ Never commit `.env` to Git (already in `.gitignore`)

### Schema Note: Why `public.` prefix?

Neon's PostgreSQL requires explicit schema naming. All queries use `public.tx_secure_records` instead of just `tx_secure_records` to ensure compatibility:

```sql
-- ✅ Correct (works with Neon)
CREATE TABLE public.tx_secure_records (...);
SELECT * FROM public.tx_secure_records WHERE id = $1;

-- ❌ Incorrect (causes "no schema has been selected" error)
CREATE TABLE tx_secure_records (...);
SELECT * FROM tx_secure_records WHERE id = $1;
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 20+** ([Download](https://nodejs.org))
- **pnpm** (Install: `npm install -g pnpm`)
- **PostgreSQL** (Neon account recommended, or local Postgres)

### Installation

```bash
# Clone repository
git clone https://github.com/Rakesh-116/mirfa-secure-transactions.git
cd mirfa-secure-transactions

# Install all dependencies (monorepo)
pnpm install

# Configure environment variables
cp .env.example .env
# Edit .env with your Neon database URL and generate a master key
```

### Generate Master Encryption Key

```bash
# Run this command to generate a secure 32-byte key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy the output and add to .env as MASTER_KEY_HEX
```

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database Connection (Neon PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:PASSWORD@ep-xxx.pooler.ap-southeast-1.aws.neon.tech/mirfa_secure_tx?sslmode=require

# Master Encryption Key (32 bytes = 64 hex characters)
# Generate using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
MASTER_KEY_HEX=5e16f496e4002a61689abd787ced3c2e3531a9845fb81b81ba4e9f7c047ae345

# API Configuration
PORT=3001
HOST=0.0.0.0
NODE_ENV=development

# Web Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# CORS (for production, replace with actual frontend URL)
CORS_ORIGIN=*
```

### Run Development Server

```bash
# Runs all services concurrently (web + api + watch builds)
pnpm dev
```

This command:
- ✅ Builds `packages/crypto` and `packages/db` (TypeScript compilation)
- ✅ Starts API server on `http://localhost:3001`
- ✅ Starts Next.js web app on `http://localhost:3000`
- ✅ Watches for file changes and rebuilds automatically

### Access the Application

- **Frontend**: http://localhost:3000
- **API Health Check**: http://localhost:3001/health
- **API Documentation**: See [API Endpoints](#-api-endpoints) below

---

## 📡 API Endpoints

### 1. Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-11T10:21:35.626Z"
}
```

### 2. Encrypt & Store Transaction

```http
POST /tx/encrypt
Content-Type: application/json
```

**Request Body:**
```json
{
  "partyId": "Rakesh116",
  "payload": {
    "amount": 100,
    "currency": "AED"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "id": "7aEU3IC5epvg3VpWc_4vo",
  "partyId": "Rakesh116",
  "createdAt": "2026-02-11T10:21:35.626Z"
}
```

### 3. Fetch Encrypted Record

```http
GET /tx/:id
```

**Response (200 OK):**
```json
{
  "id": "7aEU3IC5epvg3VpWc_4vo",
  "partyId": "Rakesh116",
  "createdAt": "2026-02-11T10:21:35.626Z",
  "payload_nonce": "32cf8dc3525e1d7189c18bfb",
  "payload_ct": "8a253dc7be06fc05656aa585bc59325c56ed5fd8bc1b34b050b09d7bb71147",
  "payload_tag": "761e453ea964db753384c4fe7790b4f3",
  "dek_wrap_nonce": "f0175645a44706982ebeeb70",
  "dek_wrapped": "8724c5a02ec6baeddbc2964f7edb64d39b169aced7efa1d27c306c6c91bfb732",
  "dek_wrap_tag": "0fc3b245c042d6d4bea12dc4b0eaa245",
  "alg": "AES-256-GCM",
  "mk_version": 1
}
```

### 4. Decrypt Transaction

```http
POST /tx/:id/decrypt
```

**Response (200 OK):**
```json
{
  "id": "7aEU3IC5epvg3VpWc_4vo",
  "partyId": "Rakesh116",
  "createdAt": "2026-02-11T10:21:35.626Z",
  "payload": {
    "amount": 100,
    "currency": "AED"
  }
}
```

### Error Responses

**400 Bad Request:**
```json
{
  "error": "partyId is required and must be a string"
}
```

**404 Not Found:**
```json
{
  "error": "Record not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```

---

## 🧪 Testing

### Manual Testing

Use the web interface at `http://localhost:3000`:

1. Enter a Party ID (e.g., `Rakesh116`)
2. Add JSON payload:
```json
{
  "amount": 100,
  "currency": "AED"
}
```
3. Click **"🔒 Encrypt & Save"** → Record ID returned
4. Copy Record ID to "Record ID" field
5. Click **"📥 Fetch Encrypted"** → See encrypted data
6. Click **"🔓 Decrypt"** → Get back original payload

### API Testing (cURL)

```bash
# Encrypt
curl -X POST http://localhost:3001/tx/encrypt \
  -H "Content-Type: application/json" \
  -d '{"partyId":"test123","payload":{"amount":100,"currency":"USD"}}'

# Fetch (replace ID)
curl http://localhost:3001/tx/7aEU3IC5epvg3VpWc_4vo

# Decrypt (replace ID)
curl -X POST http://localhost:3001/tx/7aEU3IC5epvg3VpWc_4vo/decrypt
```

### Database Verification

In Neon SQL Editor or local psql:

```sql
-- View all records
SELECT * FROM public.tx_secure_records ORDER BY created_at DESC;

-- View specific party's records
SELECT id, party_id, created_at, alg, mk_version 
FROM public.tx_secure_records 
WHERE party_id = 'Rakesh116';

-- Count total records
SELECT COUNT(*) FROM public.tx_secure_records;
```

---

## 🚢 Deployment

### Deploy to Vercel

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Deploy API

```bash
cd apps/api
vercel --prod
```

#### 3. Deploy Web

```bash
cd apps/web
vercel --prod
```

#### 4. Set Environment Variables

In Vercel dashboard for **API project**:

```
Settings → Environment Variables → Add:
- DATABASE_URL (from Neon)
- MASTER_KEY_HEX (your generated key)
- CORS_ORIGIN (your frontend URL, e.g., https://your-app.vercel.app)
```

In Vercel dashboard for **Web project**:

```
Settings → Environment Variables → Add:
- NEXT_PUBLIC_API_URL (your API URL, e.g., https://your-api.vercel.app)
```

### Vercel + Neon Integration

For seamless deployment:

1. In Vercel dashboard → **Integrations** → Search for **Neon**
2. Click **Add Integration** and authorize
3. Select your Neon project
4. Neon automatically injects `DATABASE_URL` into Vercel environment
5. Deploy with `vercel --prod`

---

## 🐛 Common Issues & Solutions

### Issue 1: `MASTER_KEY_HEX environment variable is required`

**Cause:** Environment variables not loading before handlers import.

**Solution:** dotenv must load **before** any imports that use env vars:

```typescript
// apps/api/src/index.ts
import { config } from "dotenv";
import path from "path";

// ✅ Load env FIRST
config({ path: path.join(process.cwd(), ".env") });

// ✅ Then import handlers
import { encryptHandler } from "./handlers";
```

Also ensure lazy initialization in handlers:

```typescript
// apps/api/src/handlers.ts
let envelope: EnvelopeEncryption | null = null;

function getEnvelope(): EnvelopeEncryption {
  if (!envelope) {
    envelope = new EnvelopeEncryption(process.env.MASTER_KEY_HEX!);
  }
  return envelope;
}
```

### Issue 2: `no schema has been selected to create in`

**Cause:** Neon requires explicit schema naming.

**Solution:** Use `public.` prefix for all table references:

```sql
-- ✅ Correct
CREATE TABLE public.tx_secure_records (...);
SELECT * FROM public.tx_secure_records WHERE id = $1;
INSERT INTO public.tx_secure_records (...) VALUES (...);

-- ❌ Incorrect
CREATE TABLE tx_secure_records (...);
```

Files to check:
- `packages/db/src/schema.ts`
- `packages/db/src/queries.ts`

### Issue 3: Database Connection Fails

**Cause:** Missing or incorrect password in `DATABASE_URL`.

**Solution:** 
1. Go to [console.neon.tech](https://console.neon.tech)
2. Select your project
3. Click **Settings** → **Reset password**
4. Copy **full connection string with password**
5. Update `.env` file
6. Restart dev server: `pnpm dev`

### Issue 4: CORS Errors in Browser

**Cause:** API rejecting requests from different origin.

**Solution:**

In `.env`:
```env
# For development
CORS_ORIGIN=http://localhost:3000

# For production
CORS_ORIGIN=https://your-frontend.vercel.app
```

Or allow all origins (development only):
```env
CORS_ORIGIN=*
```

### Issue 5: TurboRepo Cache Issues

**Symptoms:** Changes not reflecting, stale builds.

**Solution:**

```bash
# Clear cache and rebuild
pnpm clean
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
pnpm install
pnpm dev
```

---

## 🏆 Key Technical Decisions

### 1. Why TurboRepo?

- ✅ **Parallel Builds**: Crypto and DB packages build simultaneously
- ✅ **Smart Caching**: Rebuilds only changed packages (saves time)
- ✅ **Dependency Graph**: Automatically builds in correct order
- ✅ **Shared Dependencies**: Single `node_modules` at root

### 2. Why Envelope Encryption?

- ✅ **Industry Standard**: Used by AWS KMS, Google Cloud KMS, banks
- ✅ **Key Rotation**: Change master key without re-encrypting data
- ✅ **Isolation**: Each transaction has unique DEK
- ✅ **Compliance**: Meets PCI-DSS requirements

### 3. Why Neon PostgreSQL?

- ✅ **Serverless**: No ops overhead, automatic scaling
- ✅ **Vercel Integration**: One-click setup
- ✅ **Free Tier**: Cost-effective for demos (0.5 GB storage)
- ✅ **Branching**: Test schema changes without affecting production

### 4. Why AES-256-GCM?

- ✅ **NIST Approved**: Cryptographically secure standard
- ✅ **Authenticated**: Built-in tamper detection (no separate HMAC)
- ✅ **Fast**: Hardware-accelerated on modern CPUs
- ✅ **Widely Used**: OpenSSL, TLS 1.3, HTTPS all use GCM

---

## 📚 Learning Resources

### Envelope Encryption
- [AWS KMS Envelope Encryption](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#enveloping)
- [Google Cloud Envelope Encryption](https://cloud.google.com/kms/docs/envelope-encryption)
- [HashiCorp Vault Encryption Concepts](https://www.vaultproject.io/docs/concepts/encryption)

### AES-GCM
- [Node.js Crypto Module Documentation](https://nodejs.org/api/crypto.html)
- [NIST AES-GCM Specification (SP 800-38D)](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf)
- [Cryptographic Storage Cheat Sheet (OWASP)](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)

### Neon PostgreSQL
- [Neon Documentation](https://neon.tech/docs)
- [Neon Branching Guide](https://neon.tech/docs/guides/branching)
- [Neon + Vercel Integration](https://neon.tech/docs/guides/vercel)

### TurboRepo & Monorepos
- [TurboRepo Documentation](https://turbo.build/repo/docs)
- [Monorepo Tools Comparison](https://monorepo.tools/)
- [Why TurboRepo is Fast](https://turbo.build/repo/docs/core-concepts/caching)

---

## 🎯 Future Improvements

### Security Enhancements
- [ ] Implement key rotation mechanism with version tracking
- [ ] Add audit logging for all encryption/decryption operations
- [ ] Implement rate limiting and request throttling
- [ ] Add Content Security Policy (CSP) headers

### Testing
- [ ] Add comprehensive test suite (Jest + Supertest)
- [ ] Add integration tests for encryption flow
- [ ] Add load testing (k6 or Artillery)
- [ ] Test tamper detection scenarios

### DevOps & Monitoring
- [ ] Add Prometheus metrics and Grafana dashboards
- [ ] Implement structured logging (Winston or Pino)
- [ ] Add health checks for database connectivity
- [ ] Set up CI/CD pipeline (GitHub Actions)

### Features
- [ ] Add backup and disaster recovery procedures
- [ ] Support multi-region deployment
- [ ] Add GraphQL API option
- [ ] Implement caching layer (Redis for frequently accessed records)
- [ ] Add OpenAPI/Swagger documentation

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 👤 Author

**Rakesh**  
GitHub: [@Rakesh-116](https://github.com/Rakesh-116)

---

## 🙏 Acknowledgments

Built as part of the **Mirfa Software Engineer Intern Challenge**. Special thanks to the Mirfa team for designing this practical, real-world engineering task that teaches:

- Modern monorepo architecture
- Production-grade encryption patterns
- Full-stack TypeScript development
- Cloud deployment best practices

---

**⭐ If you found this helpful, please star the repository!**
