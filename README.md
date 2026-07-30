# QR Dine SaaS — Restaurant Intelligence OS

A multi-tenant Restaurant QR Ordering & Revenue Intelligence SaaS platform designed for restaurants, cafes, hotels, food courts, and dine-in businesses. 

*QR ordering is only the customer-facing layer. The core product is Restaurant Intelligence (analytics, demand prediction, smart menu ranking, and operational insights).*

## Project Architecture

This codebase is a monorepo structured to allow parallel development between two teams:
- **Developer A (Restaurant Management & Ops)**: Controls Admin Panel (`apps/admin`), Kitchen KDS (`apps/kitchen`), database schema design, and analytical microservices.
- **Developer B (Customer Ordering)**: Controls the public mobile-first ordering application (`apps/customer`).

### Directory Structure

```text
├── apps/
│   ├── admin/           # Restaurant Owner Dashboard (Developer A)
│   ├── customer/        # Customer-facing Menu & Ordering App (Developer B)
│   └── kitchen/         # Kitchen Display System - KDS (Developer A)
├── packages/
│   ├── types/           # Shared TypeScript interfaces & types
│   ├── shared/          # Shared constants, helpers, and utilities
│   ├── lib/             # Service integration layer & InsForge client singleton
│   └── ui/              # Reusable design system UI components
├── insforge/
│   ├── migrations/      # SQL database schema migrations (RLS & Realtime)
│   └── functions/       # Serverless function deployments
└── docs/                # Comprehensive technical specification docs
```

---

## Shared Monorepo Packages

1. **`@qrdine/types`**: Single source of truth for all domain entities (`Restaurant`, `MenuItem`, `Table`, `Order`, `Staff`, etc.).
2. **`@qrdine/shared`**: Layout utilities, currency/date formatters, global statuses, and role-based permissions configurations.
3. **`@qrdine/lib`**: Common interface wrapper around the `@insforge/sdk` for Authentication, Database CRUD operations, Storage uploads, and Realtime event sockets.
4. **`@qrdine/ui`**: High-fidelity, premium glassmorphic UI components (Buttons, Cards, Inputs, Modals, Badges, Tables, Loaders, Toasts) mapping to the unified design tokens.

---

## Technical Stack

- **Frontend framework**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS 3.4
- **Backend-as-a-Service**: InsForge (PostgreSQL with RLS, OAuth/Magic Authentication, Storage Buckets, Realtime socket pub/sub, Serverless Functions)

---

## Getting Started

### Prerequisites

Ensure you have **Node.js (>=18)** installed.

### Installation

Install all package dependencies and wire up npm workspaces:

```bash
npm install
```

### Development Servers

Launch any of the frontend applications:

```bash
# Run Admin Dashboard (Port 3000)
npm run dev:admin

# Run Customer App (Port 3001)
npm run dev:customer

# Run Kitchen Display App (Port 3002)
npm run dev:kitchen
```

### Code Verification

Perform workspace-wide typechecking:

```bash
npm run typecheck
```

---

## Git Workflow & Team Collaboration

This project enforces strict workspace ownership rules:
- **Developer A** owns `apps/admin`, `apps/kitchen`, `insforge/`, and `docs/`.
- **Developer B** owns `apps/customer/`.
- Both developers share access to `packages/`. **Do not modify files in other folders without explicit alignment.**

### Branching Policy

- `main`: Production-ready release branch.
- `develop`: Main development integration branch. All features merge here first.
- `feature/*`: Short-lived feature development branches branched off `develop` (e.g. `feature/admin-menu-crud`, `feature/customer-cart`).

---

## Future Roadmaps

1. **Phase 1: Foundation Setup** (Completed) - Monorepo workspaces, shared libraries, database schema + RLS policies, and design system.
2. **Phase 2: Core Features** (Next) - Menu manager, QR table generation, customer scanning & ordering, kitchen display cards.
3. **Phase 3: Realtime Operations & Analytics** - Live order status updates, table occupation tracking, daily revenue counters.
4. **Phase 4: Restaurant Intelligence OS** - AI menu item ranking, demand prediction forecasts, custom reports.
