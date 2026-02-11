# 🎥 Loom Video Script (2-3 minutes)

## Introduction (15 seconds)

"Hey! I'm Rakesh, and this is my submission for the Mirfa Secure Transactions challenge. I built a full-stack monorepo using TurboRepo, Fastify, Next.js, and PostgreSQL with production-grade envelope encryption. Let me walk you through it."

---

## 1. TurboRepo Structure (30 seconds)

**Show:** Project folder structure in VS Code

"First, the architecture. I used TurboRepo to organize everything as a monorepo with two main apps and two shared packages:

- **apps/api** - Fastify backend with three endpoints
- **apps/web** - Next.js frontend
- **packages/crypto** - Shared AES-256-GCM envelope encryption logic
- **packages/db** - PostgreSQL schema and queries

The key benefit of TurboRepo is that both the API and web app can import `@mirfa/crypto` package directly, so encryption logic stays DRY. When I run `pnpm dev`, Turbo builds packages first, then starts both apps in parallel. This gives us fast builds with intelligent caching."

---

## 2. How Encryption Works (45 seconds)

**Show:** `packages/crypto/src/envelope.ts` file

"Let me explain the encryption flow. This is envelope encryption, which is how AWS KMS and Google Cloud KMS work in production.

**Step 1:** Generate a random 32-byte Data Encryption Key (DEK)

**Step 2:** Encrypt the user's JSON payload using the DEK with AES-256-GCM. This produces ciphertext, a 12-byte nonce, and a 16-byte authentication tag.

**Step 3:** Wrap (encrypt) the DEK using a Master Key, also with AES-256-GCM. This produces wrapped DEK, nonce, and tag.

**Step 4:** Store everything as hex strings in Postgres.

Why is this better than just encrypting with the master key? Because we can rotate the master key without re-encrypting all the data - we just re-wrap the DEKs. Also, GCM mode provides authenticated encryption, so if anyone tampers with the ciphertext or tag, decryption automatically fails.

The code validates that nonces are exactly 12 bytes and tags are exactly 16 bytes. Invalid lengths are rejected immediately."

---

## 3. Backend API (25 seconds)

**Show:** `apps/api/src/handlers.ts`

"The Fastify backend has three routes:

- `POST /tx/encrypt` - validates input, encrypts payload, stores in Postgres, returns record ID
- `GET /tx/:id` - fetches encrypted record without decrypting
- `POST /tx/:id/decrypt` - unwraps DEK, decrypts payload, returns original JSON

Each handler has proper error handling. Crypto errors return 400, database errors return 500. The API is fully async and uses Postgres connection pooling for production scalability."

---

## 4. Database & Storage (15 seconds)

**Show:** `packages/db/src/schema.ts`

"For storage, I chose PostgreSQL because the challenge required it. The schema includes constraints that enforce 12-byte nonces and 16-byte tags at the database level. The table auto-creates on first run using the `initSchema` function."

---

## 5. Deployment Strategy (20 seconds)

**Show:** `apps/api/vercel.json` and `apps/web/next.config.js`

"For deployment, both apps go to Vercel. The Fastify app uses Vercel's Node.js runtime - the `vercel.json` routes all requests to the main handler. The Next.js app deploys normally. Environment variables are set in Vercel's dashboard: `DATABASE_URL`, `MASTER_KEY_HEX`, and `NEXT_PUBLIC_API_URL`.

Both apps are now live at [your-api-url] and [your-web-url]."

---

## 6. Bug I Solved (15 seconds)

**Show:** Terminal or code

"One bug I hit during development: Initially, I was storing binary data directly in Postgres, but Vercel's serverless environment had encoding issues. I switched to hex strings for all binary fields (nonces, tags, ciphertext), which solved it completely and made debugging easier since you can inspect values in the database."

---

## 7. What I'd Improve (10 seconds)

"If I had more time, I'd add:

- Unit tests with Jest for crypto functions
- Master key rotation logic (mk_version is already in the schema)
- Redis caching for frequently accessed records
- Rate limiting to prevent abuse"

---

## Closing (5 seconds)

"That's it! The repo is ready with full documentation, runs with `pnpm install && pnpm dev`, and is deployed to production. Thanks for watching!"

---

## 🎬 Recording Tips

### Before Recording:

1. ✅ Have project open in VS Code
2. ✅ Have localhost:3000 and localhost:3001 running
3. ✅ Have one test transaction ready in the UI
4. ✅ Have `PROJECT.md` open for reference
5. ✅ Test your microphone

### While Recording:

- **Speak clearly and confidently**
- **Keep energy high but not rushed**
- **Use "I" statements** ("I built", "I chose", "I solved")
- **Show code briefly** - don't read line by line
- **Demo the UI** - encrypt and decrypt one payload
- **Smile** - they want to see personality

### Things to Show Visually:

1. Folder structure in VS Code sidebar
2. `envelope.ts` encryption logic (5 seconds max)
3. API routes in `handlers.ts`
4. Frontend UI working (encrypt → fetch → decrypt)
5. `vercel.json` deployment config

### Things to Avoid:

❌ Don't say "um" or "uh" - pause silently instead
❌ Don't read code word-for-word
❌ Don't go over 3 minutes
❌ Don't apologize for anything
❌ Don't say "I tried to..." - say "I built"

---

## Timing Breakdown

| Section      | Time      |
| ------------ | --------- |
| Intro        | 15s       |
| TurboRepo    | 30s       |
| Encryption   | 45s       |
| Backend      | 25s       |
| Database     | 15s       |
| Deployment   | 20s       |
| Bug solved   | 15s       |
| Improvements | 10s       |
| Closing      | 5s        |
| **Total**    | **~3min** |

---

## Sample Opening Lines (Choose One)

**Option 1 (Confident):**
"Hey! I'm Rakesh and I just shipped a production-ready secure transactions system using envelope encryption. Let me show you how it works."

**Option 2 (Technical):**
"Hi, I'm Rakesh. For this challenge, I built a TurboRepo monorepo with Fastify, Next.js, and PostgreSQL that implements AES-256-GCM envelope encryption - the same pattern AWS KMS uses. Let's dive in."

**Option 3 (Problem-focused):**
"I'm Rakesh, and the challenge was to build a secure transaction system with proper encryption. Here's how I solved it with envelope encryption, TurboRepo, and production deployment to Vercel."

---

## 🎯 Key Messages to Emphasize

1. **"Production-grade"** - not a toy project
2. **"Envelope encryption"** - same as AWS/Google
3. **"Turbo monorepo"** - shared packages
4. **"Fully deployed"** - not just local
5. **"Runs with pnpm dev"** - easy to test

Good luck! 🚀
