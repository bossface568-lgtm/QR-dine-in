---
description: Instructions building apps with MCP
globs: *
alwaysApply: true
---

# InsForge SDK Documentation - Overview

## What is InsForge?

Backend-as-a-service (BaaS) platform providing:

- **Database**: PostgreSQL with PostgREST API
- **Authentication**: Email/password + OAuth (Google, GitHub)
- **Storage**: File upload/download
- **AI**: OpenRouter key provisioning and model catalog for direct OpenAI-compatible integrations
- **Functions**: Serverless function deployment
- **Realtime**: WebSocket pub/sub (database + client events)

## Installation

The following is a step-by-step guide to installing and using the InsForge TypeScript SDK for Web applications. If you are building other types of applications, please refer to:
- [Swift SDK documentation](/sdks/swift/overview) for iOS, macOS, tvOS, and watchOS applications.
- [Kotlin SDK documentation](/sdks/kotlin/overview) for Android applications.
- [REST API documentation](/sdks/rest/overview) for direct HTTP API access.

### 🚨 CRITICAL: Follow these steps in order

### Step 1: Download Template

Use the `download-template` MCP tool to create a new project with your backend URL and anon key pre-configured.

### Step 2: Install SDK

```bash
npm install @insforge/sdk@latest
```

### Step 3: Create SDK Client

You must create a client instance using `createClient()` with your base URL and anon key:

```javascript
import { createClient } from '@insforge/sdk';

const client = createClient({
  baseUrl: 'https://your-app.region.insforge.app',  // Your InsForge backend URL
  anonKey: 'your-anon-key-here'       // Get this from backend metadata
});

```

**API BASE URL**: Your API base URL is `https://your-app.region.insforge.app`.

## Getting Detailed Documentation

### 🚨 CRITICAL: Always Fetch Documentation Before Writing Code

InsForge provides official SDKs and REST APIs, use them to interact with InsForge services from your application code.

- [TypeScript SDK](/sdks/typescript/overview) - JavaScript/TypeScript
- [Swift SDK](/sdks/swift/overview) - iOS, macOS, tvOS, and watchOS
- [Kotlin SDK](/sdks/kotlin/overview) - Android and Kotlin Multiplatform
- [REST API](/sdks/rest/overview) - Direct HTTP API access

Before writing or editing any InsForge integration code, you **MUST** call the `fetch-docs` or `fetch-sdk-docs` MCP tool to get the latest SDK documentation. This ensures you have accurate, up-to-date implementation patterns.

### Use the InsForge `fetch-docs` MCP tool to get specific SDK documentation:

Available documentation types:

- `"instructions"` - Essential backend setup (START HERE)
- `"real-time"` - Real-time pub/sub (database + client events) via WebSockets
- `"db-sdk-typescript"` - Database operations with TypeScript SDK
- **Authentication** - Choose based on implementation:
  - `"auth-sdk-typescript"` - TypeScript SDK methods for custom auth flows
  - `"auth-components-react"` - Pre-built auth UI for React+Vite (single-page app)
  - `"auth-components-react-router"` - Pre-built auth UI for React(Vite+React Router) (multi-page app)
  - `"auth-components-nextjs"` - Pre-built auth UI for Next.js (SSR app)
- `"storage-sdk"` - File storage operations
- `"functions-sdk"` - Serverless functions invocation
- `"ai-integration-sdk"` - AI integration with the provisioned OpenRouter key and OpenAI SDK
- `"deployment"` - Deploy frontend applications via MCP tool
- `"payments"` - Stripe Checkout, Billing Portal, webhook projections, and fulfillment patterns

These docs are mostly for the TypeScript SDK. For other languages, you can also use the `fetch-sdk-docs` MCP tool to get specific documentation.

### Use the InsForge `fetch-sdk-docs` MCP tool to get specific SDK documentation

You can fetch SDK documentation using the `fetch-sdk-docs` MCP tool with a specific feature type and language.

Available feature types:
- `db` - Database operations
- `storage` - File storage operations
- `functions` - Serverless functions invocation
- `auth` - User authentication
- `ai` - AI integration with the provisioned OpenRouter key and OpenAI SDK
- `realtime` - Real-time pub/sub (database + client events) via WebSockets
- `payments` - Stripe Checkout and Billing Portal with webhook-based fulfillment

Available languages:
- `typescript` - JavaScript/TypeScript SDK
- `swift` - Swift SDK (for iOS, macOS, tvOS, and watchOS)
- `kotlin` - Kotlin SDK (for Android and JVM applications)
- `rest-api` - REST API

Payments currently has TypeScript SDK docs only. Use the Payments API reference for non-TypeScript clients.

## When to Use SDK vs MCP Tools

### Always SDK for Application Logic:

- Authentication (register, login, logout, profiles)
- Database CRUD (select, insert, update, delete)
- Storage operations (upload, download files)
- AI integration via the provisioned OpenRouter key with the OpenAI SDK or OpenRouter HTTP API
- Serverless function invocation
- Payments checkout and customer portal session creation

### Use MCP Tools for Infrastructure:

- Project scaffolding (`download-template`) - Download starter templates with InsForge integration
- Backend setup and metadata (`get-backend-metadata`)
- Database schema management (`run-raw-sql`, `get-table-schema`)
- Storage bucket creation (`create-bucket`, `list-buckets`, `delete-bucket`)
- Serverless function deployment (`create-function`, `update-function`, `delete-function`)
- Frontend deployment (`create-deployment`) - Deploy frontend apps to InsForge hosting

## Important Notes

- For auth: use `auth-sdk` for custom UI, or framework-specific components for pre-built UI
- SDK returns `{data, error}` structure for all operations
- Database inserts require array format: `[{...}]`
- Serverless functions have one endpoint and do not support nested route paths
- Storage: Upload files to buckets, store URLs in database
- AI integrations should call OpenRouter directly with `baseURL: "https://openrouter.ai/api/v1"` and a server-side `OPENROUTER_API_KEY`
- **EXTRA IMPORTANT**: Use Tailwind CSS 3.4 (do not upgrade to v4). Lock these dependencies in `package.json`

<!-- INSFORGE:START -->
## InsForge backend

This project uses [InsForge](https://insforge.dev): an all-in-one, open-source Postgres-based backend (BaaS) that gives this app a database, authentication, file storage, edge functions, realtime, an AI model gateway, and payments through one platform.

- **Project:** **restaurant od** (API base `https://vy3qe8cs.ap-southeast.insforge.app`)
- **Skills:** these InsForge skills are installed for supported coding agents. Reach for them before implementing any InsForge feature instead of guessing the API:
  - `insforge`: app code with the `@insforge/sdk` client (database CRUD, auth, storage, edge functions, realtime, AI, email, and Stripe payments).
  - `insforge-cli`: backend and infrastructure via the `insforge` CLI (projects, SQL, migrations, RLS policies, storage buckets, functions, secrets, payment setup, schedules, deploys).
  - `insforge-debug`: diagnosing failures (SDK/HTTP errors, RLS denials, auth and OAuth issues) and running security or performance audits.
  - `insforge-integrations`: wiring external auth providers (Clerk, Auth0, WorkOS, Better Auth, etc.) for JWT-based RLS, or the OKX x402 payment facilitator.
  - `find-skills`: discovering additional skills on demand.
- **Credentials:** app code reads keys from `.env.local`; the CLI reads `.insforge/project.json`. Never hardcode or commit keys.

Key patterns:

- Database inserts take an array: `insert([{ ... }])`.
- Reference users with `auth.users(id)`; use `auth.uid()` in RLS policies.
- For storage uploads, persist both the returned `url` and `key`.
<!-- INSFORGE:END -->

## GitHub Collaboration & Development Workflow

This document is shared between BOTH developers and must become the single source of truth for how development is performed across the QR Dine SaaS platform.

### Project Structure & Ownership

This project is developed by TWO developers using ONE GitHub repository and ONE shared InsForge backend.

#### Developer A (Technical Architect)
**Owns:**
- Backend Architecture
- Database Schema
- Database Migrations
- Object Storage
- Security Policies
- Authentication
- Admin Panel
- Kitchen Display
- Analytics
- AI
- Billing
- Subscriptions
- Restaurant Management
- Categories
- Menu
- Variants
- Modifiers
- Tables
- QR Codes
- APIs
- Shared Business Logic

#### Developer B
**Owns ONLY:**
- Customer Application (`apps/customer`)
- Customer UI
- Customer UX
- Customer Cart
- Customer Checkout UI
- Customer Order Tracking UI
- Customer Animations
- Customer Responsive Design

> [!IMPORTANT]
> Developer B must never redesign or restructure backend architecture.

---

### GitHub Repository Rules

- There is **ONLY ONE** GitHub repository.
- Nobody should exchange ZIP files.
- Nobody should manually copy project folders.
- All collaboration must happen through Git.
- Both developers clone the repository only once.
- All future updates must happen using `git pull` and `git push`.

---

### Branch Strategy

Repository structure:

`main`  
└─ `develop`  
&nbsp;&nbsp;&nbsp;&nbsp;├─ `admin-dev`  
&nbsp;&nbsp;&nbsp;&nbsp;└─ `customer-dev`  

**Rules:**
- **`main`**: Production-ready code only.
- **`develop`**: Integrated and tested features only.
- **`admin-dev`**: Only Developer A works here.
- **`customer-dev`**: Only Developer B works here.
- **Never commit directly to `main`**.
- **Never commit directly to `develop`**.

---

### File Ownership

**Developer A owns:**
- `apps/admin`
- `apps/kitchen`
- `database` / `insforge`
- `migrations`
- `backend`
- `storage`
- `api`
- `security`

**Developer B owns:**
- `apps/customer`

**Shared folders:**
- `packages` (`@qrdine/types`, `@qrdine/lib`, `@qrdine/shared`, `@qrdine/ui`)
- `docs`

> [!CAUTION]
> Changes to shared folders require agreement from both developers.

---

### Backend Ownership & Restrictions

Developer B must **NEVER**:
- Create new database tables.
- Modify schema.
- Rename tables.
- Delete columns.
- Create migrations.
- Modify storage buckets.
- Change authentication.
- Change security policies.

*If backend changes are required, Developer B should document the requirement instead of implementing it.*

---

### Daily Workflow

Every development session must follow this order:

1. **Step 1**: Pull latest changes from the assigned branch (`git pull`).
2. **Step 2**: Implement only the assigned module.
3. **Step 3**: Run project checks (`npm run typecheck` / build).
4. **Step 4**: Verify no unrelated files were modified.
5. **Step 5**: Commit with meaningful commit messages.
6. **Step 6**: Push to the assigned branch (`git push`).

---

### Commit Message Format

Use clear, standardized commit messages following Conventional Commits syntax:

**Examples:**
- `feat(admin): add category management`
- `feat(customer): build menu page`
- `fix(admin): resolve onboarding validation`
- `fix(customer): improve menu loading`
- `docs: update AGENT.md`
- `refactor(admin): extract media service`

**Avoid generic commit messages such as:**
`update`, `changes`, `fix`, `work`

---

### Pull Request Rules

Every completed feature must be submitted using a Pull Request (PR).

Pull Request descriptions must include:
- **Summary**
- **Files Changed**
- **Database Changes**
- **API Changes**
- **Breaking Changes**
- **Testing Completed**
- **Known Limitations**

*Developer A reviews all backend-related changes.*

---

### Conflict Prevention Rules

- Never edit another developer's feature without discussion.
- Never rename shared files without approval.
- Never move shared folders.
- Never duplicate existing utilities.
- Always inspect existing code before creating new components.

---

### Documentation Requirements

Whenever a feature is completed, update documentation in `docs/` covering:
- New routes
- New APIs
- New components
- Database changes
- Storage changes
- Configuration changes
- Future extension points

---

### Quality Rules

Before committing, ensure:
- Project builds successfully (`npm run build`).
- No lint errors.
- No type errors (`npx tsc --noEmit`).
- No console errors.
- No duplicated code.
- No dead code.
- Documentation updated.

---

### AI Agent Rules

Whenever you receive a new prompt:
1. Read `AGENTS.md` first.
2. Respect file ownership.
3. Never generate duplicate architecture.
4. Never replace existing implementations.
5. Always extend the current project.
6. If a requested change belongs to the other developer's ownership, stop and explain why instead of making the change.

