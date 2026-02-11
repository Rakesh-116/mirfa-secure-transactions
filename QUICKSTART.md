# 🚀 Quick Start Guide

## Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL 14+

## Installation (5 minutes)

### 1. Clone and Install

```bash
cd mirfa-intern-challenge-main
pnpm install
```

### 2. Set Up PostgreSQL

**Docker (recommended):**

```powershell
docker run --name mirfa-postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=mirfa_db `
  -p 5432:5432 `
  -d postgres:16
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Generate master key:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Edit `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mirfa_db
MASTER_KEY_HEX=<paste_generated_key_here>
PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Run the Project

```bash
pnpm dev
```

Open:

- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001

## Test the Application

1. Enter `party_123` in Party ID
2. Use the default JSON payload or edit it
3. Click **🔒 Encrypt & Save**
4. Copy the returned ID
5. Paste in Record ID field
6. Click **📥 Fetch Encrypted** to see encrypted data
7. Click **🔓 Decrypt** to see original payload

## Project Structure

```
├── apps/
│   ├── api/              # Fastify backend (port 3001)
│   └── web/              # Next.js frontend (port 3000)
├── packages/
│   ├── crypto/           # Encryption logic
│   └── db/               # Postgres queries
```

## Common Commands

```bash
# Start development servers
pnpm dev

# Build all packages
pnpm build

# Clean build artifacts
pnpm clean

# Lint code
pnpm lint
```

## API Endpoints

### POST /tx/encrypt

```bash
curl -X POST http://localhost:3001/tx/encrypt \
  -H "Content-Type: application/json" \
  -d '{"partyId":"party_123","payload":{"amount":100,"currency":"AED"}}'
```

### GET /tx/:id

```bash
curl http://localhost:3001/tx/<ID>
```

### POST /tx/:id/decrypt

```bash
curl -X POST http://localhost:3001/tx/<ID>/decrypt
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Vercel deployment instructions.

## Need Help?

- Read [PROJECT.md](./PROJECT.md) for complete documentation
- Check [LOOM_SCRIPT.md](./LOOM_SCRIPT.md) for architecture walkthrough
- Review code comments in `packages/crypto/src/envelope.ts`

## Troubleshooting

**Issue:** "DATABASE_URL is required"

- **Fix:** Create `.env` file with valid Postgres URL

**Issue:** "Cannot find module '@mirfa/crypto'"

- **Fix:** Run `pnpm install` in root directory

**Issue:** Schema not created

- **Fix:** Restart API server, schema auto-creates on startup

---

Built with ❤️ for Mirfa Internship Challenge
