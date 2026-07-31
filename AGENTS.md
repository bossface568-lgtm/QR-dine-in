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

### Project Overview

**QR Dine SaaS** is a production-grade multi-tenant Restaurant QR Ordering & Restaurant Intelligence SaaS platform built for restaurants, cafes, hotels, food courts, and dine-in businesses.

### Project Structure & Ownership

This project is developed by TWO developers using ONE GitHub repository and ONE shared InsForge backend.

#### Developer A (Technical Architect)
**Owns:**
- Backend Architecture
- Database Design & Schema
- Database Migrations
- Authentication
- Admin Panel (`apps/admin`)
- Restaurant Settings
- Branch Management
- Categories
- Menu
- Variants
- Modifier Groups
- Tables
- QR Code Generation (Admin-side generation ONLY)
- Kitchen Display System - KDS (`apps/kitchen`)
- Orders Business Logic
- Analytics
- AI
- Billing
- Subscription
- Media Service
- Object Storage
- APIs
- Security Policies

#### Developer B
**Owns ONLY:**
- Customer Application (`apps/customer`)
- QR Scan
- Restaurant Loading
- Customer Layout
- Menu Display
- Search & Filters
- Product Details
- Customer Cart
- Checkout UI
- Order Tracking UI
- Customer UX & Animations
- Customer Responsive Design

> [!IMPORTANT]
> Developer B must never redesign or restructure backend architecture.

---

### Backend Ownership & Restrictions

Only Developer A is allowed to:
- Create database tables
- Modify schema
- Create migrations
- Modify storage buckets
- Modify authentication
- Modify APIs
- Modify backend business logic

Developer B must **NEVER**:
- Create new database tables.
- Modify schema.
- Rename tables.
- Delete columns.
- Create migrations.
- Modify storage buckets.
- Change authentication.
- Change security policies.

*If backend changes are required by Developer B, document the requirement instead of implementing it.*

---

### QR Code Generation & Scanning Rules

- **QR Code Generation**: Belongs **ONLY** to Developer A (Admin Panel). Admin creates, configures, and generates QR Codes for tables/branches.
- **Customer Application**: Scans QR, validates parameters, loads Restaurant, loads Branch, and creates Table Sessions. **Never generate QR codes inside Customer App.**

---

### Real Data & Media Policies

#### Real Data Policy
This project **NEVER** uses:
- Mock Data
- Demo Data
- Fake JSON
- Temporary Arrays
- Hardcoded Restaurants
- Sample Menu Items

Every feature must consume the real backend (`@insforge/sdk`).

#### Media Policy
- All image uploads **MUST** go through the shared Media Service (`mediaService` in `@qrdine/lib`). Never upload directly to storage.
- **Accepted Files**: Up to 50 MB input size (JPG, PNG, WebP).
- **Automated Pipeline**: Client-side EXIF stripping, scaling to target dimensions, WebP conversion, and **Adaptive Compression** to target size ranges (100KB–700KB depending on entity type).
- Only the optimized image and generated responsive variants (`thumb`, `small`, `medium`, `large`) are stored in storage. The raw original file is **NEVER** stored.

---

### GitHub Repository & Branch Strategy

- **ONLY ONE** GitHub repository: **`git@github.com:bossface568-lgtm/QR-dine-in.git`** (`https://github.com/bossface568-lgtm/QR-dine-in.git`).
- Both developers push to and pull from this exact repository.
- Nobody should exchange ZIP files or manually copy project folders.
- Both developers clone this repository only once.
- All future updates must happen using `git pull` and `git push`.

#### Branch Strategy

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

### Daily Workflow

Every development session must follow this exact order:

1. **Step 1**: Pull latest changes from the assigned branch (`git pull origin <branch>`).
2. **Step 2**: Read `AGENTS.md` and inspect the current project.
3. **Step 3**: Implement only the assigned module.
4. **Step 4**: Run project checks (`npm run typecheck` & build).
5. **Step 5**: Verify no unrelated files were modified.
6. **Step 6**: Commit with meaningful Conventional Commit messages.
7. **Step 7**: Push to the assigned branch (`git push origin <branch>`).
8. **Step 8**: Update documentation in `docs/`.

---

### Commit Message Format

Use clear, standardized commit messages following Conventional Commits syntax:

**Examples:**
- `feat(admin): add category management`
- `feat(customer): build menu page`
- `fix(admin): resolve onboarding validation`
- `fix(customer): improve menu loading`
- `docs: update AGENTS.md`
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
- **Documentation Updated**

*Developer A reviews all backend-related changes.*

---

### Current Development Status

- **Completed**:
  - Project Architecture & Monorepo Foundation
  - Database Schema & RLS Policies (`001` - `016`)
  - Authentication Engine
  - Restaurant Onboarding Flow
  - Dashboard Foundation
  - Branch Management Module
  - Media Foundation & Adaptive WebP Processor
  - Restaurant Settings Module (7 Tabs: General, Branding, Business, Regional, Ordering, Notifications, Integrations)
  - Category Management Module
  - Menu Management Module (Items CRUD, Dietary Tags, Multi-Image Gallery, Pricing, Preparation Time, Availability Scheduling, Branch Visibility)
  - Table Management Module (Dining Tables CRUD, Branch Uniqueness Check, Seating Capacity, Floor & Section Grouping, Soft Deletion, Status Tracking, Bulk Actions, Operational Placeholders)
- **Current Development**:
  - Modifier Groups & Variants Module
- **Upcoming Modules (Developer A)**:
  - Modifier Groups & Variants
  - QR Code Generation & Sheets
  - Kitchen Display System (KDS)
  - Orders Business Logic
  - Payments Integration
  - Analytics & AI Insights

---

### Customer Application Roadmap (Developer B)

Developer B must execute the customer application according to this roadmap:

1. **Customer Foundation**
2. **QR Scan & Parameter Validation**
3. **Restaurant & Branch Loading**
4. **Branding & Theme Engine**
5. **Menu Display**
6. **Product Details Modal**
7. **Cart Management**
8. **Checkout UI**
9. **Real-time Order Tracking UI**
10. **Customer Experience & Polish**

---

### Quality & AI Agent Rules

Before committing or completing a turn, ensure:
- Project builds successfully (`npm run build`).
- No lint or TypeScript errors (`npx tsc --noEmit`).
- No console errors or silent fallbacks.
- Documentation updated.

**AI Agent Rules:**
1. Read `AGENTS.md` first.
2. Inspect the existing codebase before writing code.
3. Reuse existing components and services. Never duplicate code or recreate architecture.
4. Always extend the current project.
5. Respect developer ownership boundaries.
