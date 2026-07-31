# QR Dine SaaS — Restaurant Intelligence OS

A production-grade, multi-tenant Restaurant QR Ordering & Restaurant Intelligence SaaS platform built for restaurants, cafes, hotels, food courts, and dine-in businesses. 

*QR ordering is only the customer-facing layer. The core product is Restaurant Intelligence (analytics, demand prediction, smart menu ranking, and operational insights).*

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Team Structure & Developer Ownership](#team-structure--developer-ownership)
3. [Folder Structure](#folder-structure)
4. [Tech Stack](#tech-stack)
5. [Backend & Media Policies](#backend--media-policies)
6. [GitHub Workflow & Branch Strategy](#github-workflow--branch-strategy)
7. [Daily Development Workflow](#daily-development-workflow)
8. [Setup Instructions](#setup-instructions)
9. [Development Roadmap](#development-roadmap)
10. [Contribution & PR Guidelines](#contribution--pr-guidelines)

---

## Project Overview

**QR Dine SaaS** empowers restaurants with real-time digital menu management, QR table ordering, kitchen display systems (KDS), multi-branch control, and revenue analytics.

### Key Architectural Highlights
- **Multi-Tenant Isolation**: Row-Level Security (RLS) policies in PostgreSQL isolate tenant data.
- **Shared Monorepo Libraries**: Common TypeScript types (`@qrdine/types`), utilities (`@qrdine/shared`), service client (`@qrdine/lib`), and design system UI (`@qrdine/ui`).
- **Real-Time Data Engine**: Built on InsForge database socket pub/sub and WebSocket channels.
- **Adaptive Media Pipeline**: Client-side WebP image optimization, EXIF stripping, and responsive variant generation.

---

## Team Structure & Developer Ownership

Development is split between **TWO** developers sharing ONE GitHub repository and ONE InsForge backend instance:

### Developer A (Technical Architect & Backend Lead)
**Owns:**
- Backend Architecture, Database Design & PostgreSQL Schema
- Database Migrations (`insforge/migrations/`) & Security Policies (RLS)
- Authentication Engine & User Management
- Admin Panel (`apps/admin`) & Restaurant Settings
- Branch Management
- Categories, Menu, Variants & Modifier Groups
- Table Management & QR Code Generation (Admin-side generation ONLY)
- Kitchen Display System - KDS (`apps/kitchen`)
- Orders Business Logic & Realtime Services
- Analytics, AI Insights, Billing & Subscriptions
- Shared Media Service & Object Storage
- APIs & Backend Security

### Developer B (Customer Experience Lead)
**Owns ONLY:**
- Customer Application (`apps/customer`)
- QR Code Scanning & Validation
- Restaurant & Branch Loading
- Customer Layout & Theme Engine
- Menu Display, Search & Filters
- Product Details Modal
- Customer Cart & Checkout UI
- Real-time Order Tracking UI
- Customer UX, Micro-animations & Responsive Design

> [!IMPORTANT]
> Developer B must **NEVER** modify database schema, storage buckets, authentication, or backend logic. If backend changes are required, Developer B must document the requirement instead of implementing it.

---

## Folder Structure

```text
c:\Users\Inayath shariff\Downloads\restaurant software\
├── apps/
│   ├── admin/           # Restaurant Owner Dashboard (Developer A)
│   ├── customer/        # Customer-facing Menu & Ordering App (Developer B)
│   └── kitchen/         # Kitchen Display System - KDS (Developer A)
├── packages/
│   ├── types/           # Shared TypeScript interfaces (@qrdine/types)
│   ├── shared/          # Shared constants, helpers & formatters (@qrdine/shared)
│   ├── lib/             # Service integration layer & InsForge client (@qrdine/lib)
│   └── ui/              # Reusable design system UI components (@qrdine/ui)
├── insforge/
│   ├── migrations/      # SQL database schema migrations (RLS & Realtime)
│   └── functions/       # Serverless function deployments
└── docs/                # Comprehensive technical specification docs
```

---

## Tech Stack

- **Frontend Core**: React 18, Vite, TypeScript
- **Styling & Theme**: Tailwind CSS 3.4 (locked to v3.4), Lucide React icons, Glassmorphism design tokens
- **Backend-as-a-Service**: [InsForge](https://insforge.dev) (PostgreSQL database with PostgREST, RLS policies, Auth, File Storage, WebSockets Realtime, AI Gateway)
- **Monorepo Tools**: npm workspaces

---

## Backend & Media Policies

### Real Data Policy
This project **NEVER** uses mock data, demo arrays, or hardcoded fake restaurants. Every feature consumes the live InsForge backend API.

### QR Code Generation Ownership
QR code generation belongs **ONLY** to the Admin dashboard (Developer A). The Customer Application only scans QR codes, validates parameters, and initializes table sessions.

### Shared Media Pipeline
All image uploads must pass through `mediaService` in `@qrdine/lib`.
- **Accepted Files**: Up to 50 MB input size (JPG, PNG, WebP).
- **Automated Processing**: Client-side EXIF stripping, scaling to target dimensions, and **Adaptive WebP Compression** to target ranges (100KB–700KB depending on entity type).
- **Responsive Variants**: Pre-renders `thumb` (150px), `small` (400px), `medium` (800px), and `large` (1600px) WebP variants.
- The raw original image is **NEVER** stored in storage buckets.

---

## GitHub Workflow & Branch Strategy

### Repository Rules
- Repository URL: `git@github.com:bossface568-lgtm/QR-dine-in.git` (`https://github.com/bossface568-lgtm/QR-dine-in.git`).
- Both developers clone this repository **once**. Never exchange ZIP files or manually copy folders.

### Branch Strategy

```text
main           (Production-ready releases)
 └── develop    (Integration branch for tested features)
      ├── admin-dev     (Developer A works ONLY here)
      └── customer-dev  (Developer B works ONLY here)
```

- **`main`**: Production releases only. Never commit directly.
- **`develop`**: Tested features integration branch. Never commit directly.
- **`admin-dev`**: Assigned branch for Developer A.
- **`customer-dev`**: Assigned branch for Developer B.

---

## Daily Development Workflow

Every session must follow these steps in order:

1. **Pull Updates**: Pull latest changes from your assigned branch (`git pull origin <branch>`).
2. **Inspect Context**: Read `AGENTS.md` and review current project status.
3. **Implement Feature**: Work strictly within your assigned ownership domain.
4. **Verification**: Run `npm run typecheck` and `npm run build`.
5. **Commit**: Use Conventional Commits (`feat(admin): ...`, `fix(customer): ...`).
6. **Push**: Push to your assigned branch (`git push origin <branch>`).
7. **Document**: Update relevant documentation in `docs/`.

---

## Setup Instructions

### Prerequisites
- Node.js (>=18.0.0)
- npm (>=9.0.0)

### Installation

Clone the repository and install workspace dependencies:

```bash
git clone git@github.com:bossface568-lgtm/QR-dine-in.git
cd "restaurant software"
npm install
```

### Environment Setup

Ensure `.env.local` or application `.env` files are configured with InsForge credentials:

```env
VITE_INSFORGE_URL=https://vy3qe8cs.ap-southeast.insforge.app
VITE_INSFORGE_ANON_KEY=your-anon-key-here
```

### Running Development Servers

```bash
# Admin Dashboard (Port 3000)
npm run dev:admin

# Customer Application (Port 3001)
npm run dev:customer

# Kitchen Display System (Port 3002)
npm run dev:kitchen
```

### Workspace Typechecking & Build

```bash
# Typecheck all packages & apps
npm run typecheck

# Production build test for admin
npm --prefix apps/admin run build
```

---

## Development Roadmap

### Completed Modules
- Monorepo Workspaces & Package Foundations
- Database Migration System (`001` to `015`) & Row Level Security
- Authentication & Staff Security Roles
- Restaurant Onboarding Wizard
- Branch Management Engine
- Adaptive WebP Media Processing Pipeline
- Restaurant Settings Module (7 Tabs: General, Branding, Business, Regional, Ordering, Notifications, Integrations)
- Category Management Module
- Menu Management Module (Items CRUD, Dietary Tags, Multi-Image Gallery, Pricing, Preparation Time, Availability Scheduling, Branch Visibility)

### Developer A Roadmap (Admin & Backend)
- [x] Category Management Module
- [x] Menu Item CRUD & Pricing Engine
- [ ] Modifier Groups & Product Variants
- [ ] Table Layout Grid & QR Code Generator
- [ ] Kitchen Display System (KDS) Live Tickets
- [ ] Real-time Order Engine & Status Triggers
- [ ] Stripe Payments & Billing Subscriptions
- [ ] Restaurant Intelligence Analytics & AI Forecasts

### Developer B Roadmap (Customer Application)
- [ ] Customer App Scaffolding & Routing
- [ ] QR Code Reader & Parameter Validation
- [ ] Restaurant & Branch Resolver
- [ ] Customer Branding & Dynamic Palette Engine
- [ ] Mobile Menu Browsing, Search & Category Tabs
- [ ] Item Customization & Variant Selector Modal
- [ ] Local Cart & Persistent Session State
- [ ] Order Submission & Confirmation
- [ ] Real-time Order Status Stepper
- [ ] UI Polish, Glassmorphic Styling & Micro-animations

---

## Contribution & PR Guidelines

Every Pull Request submitted to `develop` must include:
1. **Summary**: Concise description of changes.
2. **Files Changed**: List of created/modified files.
3. **Database Changes**: Details of any SQL migrations run (Developer A only).
4. **API Changes**: Description of new or updated service methods.
5. **Testing Completed**: Verification steps executed (`typecheck`, `build`, manual testing).
6. **Documentation Updated**: References to updated markdown files in `docs/`.
