# ✅ SOLUTION - Mirfa Secure Transactions

**This document explains the complete implementation of the challenge.**

---

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Run automated setup
.\setup.ps1        # Windows
# or
./setup.sh         # Unix/Linux/macOS

# Start development
pnpm dev
```

**Access:**

- Frontend: http://localhost:3000
- API: http://localhost:3001

---

## ✅ Implementation Checklist

### Core Requirements

- [x] TurboRepo monorepo with pnpm workspaces
- [x] Node.js 20+ compatible
- [x] TypeScript everywhere
- [x] Fastify backend API
- [x] Next.js frontend
- [x] PostgreSQL storage (not in-memory)
- [x] AES-256-GCM envelope encryption
- [x] Vercel deployment configuration

### API Endpoints

- [x] `POST /tx/encrypt` - Encrypt and store
- [x] `GET /tx/:id` - Fetch encrypted record
- [x] `POST /tx/:id/decrypt` - Decrypt payload

### Frontend Features

- [x] Party ID input
- [x] JSON payload textarea
- [x] Encrypt & Save button
- [x] Fetch encrypted record
- [x] Decrypt and display
- [x] Error handling
- [x] Result display

### Encryption Requirements

- [x] Random 32-byte DEK generation
- [x] Payload encryption with AES-256-GCM
- [x] DEK wrapping with master key
- [x] 12-byte nonce validation
- [x] 16-byte tag validation
- [x] Hex string storage
- [x] Tamper detection
- [x] Master key versioning

### Documentation

- [x] Complete technical documentation
- [x] Setup instructions
- [x] Deployment guide
- [x] Loom video script
- [x] Code comments

---

## 📁 Project Structure

```
mirfa-intern-challenge-main/
│
├── 📦 Root
│   ├── package.json              # Root workspace
│   ├── turbo.json               # TurboRepo config
│   ├── pnpm-workspace.yaml      # Workspaces
│   ├── .env.example             # Environment template
│   ├── setup.ps1 / setup.sh     # Setup scripts
│   └── .gitignore               # Git ignore
│
├── 📱 apps/api/ (Fastify Backend - Port 3001)
│   ├── src/
│   │   ├── index.ts             # Server + routes
│   │   ├── handlers.ts          # Route handlers
│   │   └── server.ts            # Vercel adapter
│   ├── package.json
│   ├── vercel.json             # Vercel config
│   └── .env.example
│
├── 🌐 apps/web/ (Next.js Frontend - Port 3000)
│   ├── src/app/
│   │   ├── page.tsx            # Main UI
│   │   └── layout.tsx          # Root layout
│   ├── package.json
│   ├── next.config.js
│   └── .env.example
│
├── 🔐 packages/crypto/ (Encryption Logic)
│   ├── src/
│   │   ├── types.ts            # Types & errors
│   │   ├── utils.ts            # AES-GCM utils
│   │   ├── envelope.ts         # Envelope encryption
│   │   └── index.ts
│   └── package.json
│
├── 🗄️ packages/db/ (Database Layer)
│   ├── src/
│   │   ├── pool.ts             # Connection pool
│   │   ├── schema.ts           # Table schema
│   │   ├── queries.ts          # DB queries
│   │   └── index.ts
│   └── package.json
│
└── 📚 Documentation
    ├── PROJECT.md              # Complete docs
    ├── QUICKSTART.md           # Quick setup
    ├── DEPLOYMENT.md           # Vercel guide
    ├── LOOM_SCRIPT.md          # Video script
    ├── IMPLEMENTATION.md       # Details
    └── SOLUTION.md             # This file
```

---

## 🔐 Encryption Flow

### Envelope Encryption Implementation

```
┌─────────────────────────────────────────────────────────┐
│ 1. Generate Random DEK (32 bytes)                       │
│    → Unique encryption key per transaction              │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 2. Encrypt Payload with DEK (AES-256-GCM)              │
│    Input:  JSON payload                                 │
│    Output: ciphertext + 12-byte nonce + 16-byte tag    │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 3. Wrap DEK with Master Key (AES-256-GCM)              │
│    Input:  DEK                                          │
│    Output: wrapped_dek + nonce + tag                    │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 4. Store in PostgreSQL as Hex Strings                   │
│    → payload_ct, payload_nonce, payload_tag             │
│    → dek_wrapped, dek_wrap_nonce, dek_wrap_tag         │
└─────────────────────────────────────────────────────────┘
```

**Code:** [packages/crypto/src/envelope.ts](./packages/crypto/src/envelope.ts)

### Why Envelope Encryption?

1. **Key Rotation:** Change master key without re-encrypting data
2. **Performance:** DEK encryption is fast, master key operations minimal
3. **Security:** Same pattern used by AWS KMS, Google Cloud KMS
4. **Compliance:** Industry standard for data at rest

---

## 📡 API Documentation

### `POST /tx/encrypt`

Encrypt payload and store in database.

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

**Response (201):**

```json
{
    "success": true,
    "id": "abc123xyz",
    "partyId": "party_123",
    "createdAt": "2026-02-11T10:00:00.000Z"
}
```

**Error (400):**

```json
{
    "error": "partyId is required and must be a string"
}
```

---

### `GET /tx/:id`

Fetch encrypted record without decryption.

**Response (200):**

```json
{
    "id": "abc123xyz",
    "partyId": "party_123",
    "createdAt": "2026-02-11T10:00:00.000Z",
    "payload_nonce": "a1b2c3d4e5f6...",
    "payload_ct": "7890abcdef...",
    "payload_tag": "123456789abc...",
    "dek_wrap_nonce": "def012345678...",
    "dek_wrapped": "9abcdef01234...",
    "dek_wrap_tag": "567890abcdef...",
    "alg": "AES-256-GCM",
    "mk_version": 1
}
```

**Error (404):**

```json
{
    "error": "Record not found"
}
```

---

### `POST /tx/:id/decrypt`

Decrypt and return original payload.

**Response (200):**

```json
{
    "id": "abc123xyz",
    "partyId": "party_123",
    "createdAt": "2026-02-11T10:00:00.000Z",
    "payload": {
        "amount": 100,
        "currency": "AED"
    }
}
```

**Error (400):**

```json
{
    "error": "Decryption failed: data may be tampered or corrupted"
}
```

---

## 🏗 TurboRepo Setup

### How It Works

1. **Workspaces:** All packages linked via `pnpm-workspace.yaml`
2. **Dependency:** Apps depend on packages using `workspace:*`
3. **Build Order:** Turbo builds packages before apps
4. **Caching:** Builds are cached, only changed code rebuilds
5. **Parallel:** Independent tasks run in parallel

### Configuration

**turbo.json:**

```json
{
    "tasks": {
        "build": {
            "dependsOn": ["^build"], // Build dependencies first
            "outputs": [".next/**", "dist/**"]
        },
        "dev": {
            "cache": false,
            "persistent": true
        }
    }
}
```

**pnpm-workspace.yaml:**

```yaml
packages:
    - "apps/*"
    - "packages/*"
```

---

## 🗄️ Database Schema

```sql
CREATE TABLE tx_secure_records (
  id VARCHAR(255) PRIMARY KEY,
  party_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Payload encryption
  payload_nonce VARCHAR(24) NOT NULL,    -- 12 bytes hex (24 chars)
  payload_ct TEXT NOT NULL,
  payload_tag VARCHAR(32) NOT NULL,      -- 16 bytes hex (32 chars)

  -- DEK wrapping
  dek_wrap_nonce VARCHAR(24) NOT NULL,
  dek_wrapped VARCHAR(128) NOT NULL,
  dek_wrap_tag VARCHAR(32) NOT NULL,

  -- Metadata
  alg VARCHAR(50) NOT NULL,
  mk_version INTEGER NOT NULL,

  -- Validation constraints
  CONSTRAINT chk_nonce_length CHECK (LENGTH(payload_nonce) = 24),
  CONSTRAINT chk_tag_length CHECK (LENGTH(payload_tag) = 32),
  CONSTRAINT chk_dek_nonce_length CHECK (LENGTH(dek_wrap_nonce) = 24),
  CONSTRAINT chk_dek_tag_length CHECK (LENGTH(dek_wrap_tag) = 32)
);

-- Indexes for performance
CREATE INDEX idx_party_id ON tx_secure_records(party_id);
CREATE INDEX idx_created_at ON tx_secure_records(created_at DESC);
```

**File:** [packages/db/src/schema.ts](./packages/db/src/schema.ts)

---

## 🌐 Deployment to Vercel

### Step 1: Deploy API

```bash
cd apps/api
vercel --prod
```

**Environment variables (Vercel dashboard):**

- `DATABASE_URL` - PostgreSQL connection string
- `MASTER_KEY_HEX` - 64-char hex key
- `NODE_ENV` - production
- `CORS_ORIGIN` - Frontend URL

### Step 2: Deploy Web

```bash
cd apps/web
vercel --prod
```

**Environment variables:**

- `NEXT_PUBLIC_API_URL` - API URL from step 1

**Full guide:** [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🧪 Testing

### Manual Testing

1. Visit http://localhost:3000
2. Enter Party ID: `party_123`
3. Enter payload:
    ```json
    {
        "amount": 100,
        "currency": "AED"
    }
    ```
4. Click **Encrypt & Save**
5. Copy returned ID
6. Click **Fetch Encrypted**
7. Click **Decrypt**

### cURL Testing

```bash
# Encrypt
curl -X POST http://localhost:3001/tx/encrypt \
  -H "Content-Type: application/json" \
  -d '{"partyId":"party_123","payload":{"amount":100,"currency":"AED"}}'

# Fetch (replace <ID> with actual ID)
curl http://localhost:3001/tx/<ID>

# Decrypt
curl -X POST http://localhost:3001/tx/<ID>/decrypt
```

---

## 🎥 Loom Video - Key Points

### 1. TurboRepo Structure (30s)

"I built a monorepo with TurboRepo containing two apps and two shared packages. The crypto package implements envelope encryption that both the API and any future services can import. Turbo handles the build pipeline automatically."

### 2. Envelope Encryption (45s)

"The encryption uses the AWS KMS pattern. First, generate a random DEK. Second, encrypt the payload with the DEK using AES-256-GCM - this produces ciphertext, a nonce, and an auth tag. Third, wrap the DEK with a master key. Fourth, store everything as hex strings in Postgres. This allows master key rotation and provides tamper detection."

### 3. API Implementation (25s)

"The Fastify backend has three endpoints: encrypt stores the payload, fetch returns the encrypted record, and decrypt returns the original. All routes have proper validation and error handling with correct HTTP status codes."

### 4. Deployment (20s)

"Both apps deploy to Vercel. The API uses serverless functions, and environment variables are managed in the Vercel dashboard. The frontend is a standard Next.js deployment."

**Full script:** [LOOM_SCRIPT.md](./LOOM_SCRIPT.md)

---

## 🐛 Common Issues & Solutions

### "Cannot find module '@mirfa/crypto'"

```bash
pnpm install
cd packages/crypto && pnpm build
cd packages/db && pnpm build
```

### "DATABASE_URL is required"

Create `.env` file or run setup script:

```bash
.\setup.ps1  # Windows
```

### Schema not created

Restart API - schema auto-creates on startup

---

## 📚 Documentation Files

| Document                                 | Purpose                            |
| ---------------------------------------- | ---------------------------------- |
| [PROJECT.md](./PROJECT.md)               | Complete technical documentation   |
| [QUICKSTART.md](./QUICKSTART.md)         | 5-minute setup guide               |
| [DEPLOYMENT.md](./DEPLOYMENT.md)         | Vercel deployment instructions     |
| [LOOM_SCRIPT.md](./LOOM_SCRIPT.md)       | Video recording script with timing |
| [IMPLEMENTATION.md](./IMPLEMENTATION.md) | Detailed implementation summary    |
| [SOLUTION.md](./SOLUTION.md)             | This file                          |

---

## 🛠 Tech Stack

| Component       | Technology  | Version  |
| --------------- | ----------- | -------- |
| Monorepo        | TurboRepo   | 2.3.0    |
| Package Manager | pnpm        | 9.15.0   |
| Runtime         | Node.js     | 20+      |
| Language        | TypeScript  | 5.6.3    |
| Backend         | Fastify     | 5.2.0    |
| Frontend        | Next.js     | 15.1.6   |
| UI              | React       | 19.0.0   |
| Database        | PostgreSQL  | 14+      |
| Encryption      | Node crypto | Built-in |
| Deployment      | Vercel      | Latest   |

---

## ✅ Submission Checklist

Before submitting:

- [ ] `pnpm install` works
- [ ] `pnpm dev` starts both apps
- [ ] Can encrypt/decrypt in UI
- [ ] All API endpoints respond
- [ ] API deployed to Vercel
- [ ] Web deployed to Vercel
- [ ] Loom video recorded (2-3 min)
- [ ] GitHub repo is public
- [ ] URLs added to submission form

---

## 🎯 What Makes This Production-Ready

1. **Type Safety** - TypeScript strict mode throughout
2. **Error Handling** - Proper status codes and messages
3. **Validation** - Input validation at multiple layers
4. **Security** - Authenticated encryption with tamper detection
5. **Scalability** - Connection pooling, async operations
6. **Maintainability** - Monorepo with shared packages
7. **Documentation** - Complete setup and deployment guides
8. **Deployment** - Production-ready Vercel configuration

---

## 👤 Author

**Rakesh**  
Mirfa Software Engineer Intern Challenge  
February 11, 2026

---

**Ready to deploy? See [DEPLOYMENT.md](./DEPLOYMENT.md)**  
**Need help? See [PROJECT.md](./PROJECT.md)**
