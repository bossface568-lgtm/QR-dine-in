# SYSTEM ARCHITECTURE — QR Dine SaaS

A comprehensive breakdown of the QR Dine SaaS system architecture, focusing on multi-tenant data isolation, frontend application layouts, and shared monorepo packages.

---

## High-Level Architecture Flow

```text
  [ Customer QR App ]      [ Admin Panel ]      [ Kitchen App ]
        (3001)                 (3000)                (3002)
          │                      │                     │
          └─────────────┬────────┴─────────────────────┘
                        ▼
            [ Monorepo Shared Workspace ]
            ├── @qrdine/types
            ├── @qrdine/shared
            ├── @qrdine/lib  (InsForge SDK Services)
            └── @qrdine/ui   (Tailwind 3.4 Design System)
                        │
                        ▼
                [ InsForge BaaS ]
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
     [ Database ]   [ Storage ]   [ Realtime ]
     (PostgreSQL)      (S3)      (WebSockets)
          │
      [ RLS Rules ]
```

---

## Architectural Principles

1. **Strict Tenant Separation**: All tables except global metadata must include a `restaurant_id` column. Data access must be isolated at the PostgreSQL Row-Level Security (RLS) layer, serving as a failsafe against bugs in the application code.
2. **Unified Core Packages**: App-specific business logic is isolated, but core API wrappers, data schemas, utility formatters, and design tokens live inside a shared monorepo packages directory.
3. **Decoupled Customer Application**: The customer-facing ordering workspace (`apps/customer`) is fully decoupled from operational management apps (`apps/admin`, `apps/kitchen`). Developer A (Admin/Kitchen/DB) must never modify customer files unless explicitly aligned.
4. **WebSocket-First Updates**: Realtime order statuses and kitchen ticket transitions use native pg_notify triggers relayed via Socket.IO connection pools, ensuring subsecond state synchronization across dashboards.

---

## Monorepo Package Layout

The monorepo uses npm workspaces configured in the root [package.json](file:///c:/Users/Inayath%20shariff/Downloads/restaurant%20software/package.json):

### 1. `@qrdine/types`
- Path: `packages/types/`
- Contains all typescript type models.
- Features interface models for DB schemas (`Restaurant`, `MenuItem`, `Order`), plus helper types (`CartItem`, `ApiResponse`).
- Direct dependency of all apps and shared packages.

### 2. `@qrdine/shared`
- Path: `packages/shared/`
- Contains utility functions and business logic constants.
- Exports formatters (`formatCurrency`, `formatRelativeTime`) and theme status class arrays.
- Implements custom `cn` className merge wrappers for Tailwind.

### 3. `@qrdine/lib`
- Path: `packages/lib/`
- Holds the SDK connection layer and services.
- Initializes the `@insforge/sdk` client singleton (`insforge`).
- Decouples API queries into clear services (`authService`, `menuService`, `orderService`, `realtimeService`).

### 4. `@qrdine/ui`
- Path: `packages/ui/`
- Contains the reusable components representing the product's design system.
- Implements premium buttons, card surfaces, modals, custom dropdowns, toggles, badge lists, and alert toast stacks.
- Reuses Tailwind classes natively.

---

## Routing & Layouts Specification

### apps/admin (Dashboard Interface)
- Port: `3000`
- State: Session-guarded authentication.
- Navigation: Collapsible sidebar navigation, top bar featuring restaurant detail lookups.
- Key routes: `/login` (Public), `/` (Dashboard root), `/menu`, `/tables`, `/orders`, `/staff`, `/settings`.

### apps/customer (Mobile Ordering Menu)
- Port: `3001`
- State: Anonymous, guest-centric session. Cart details persisted in session storage.
- Context: Determined strictly by URL path parameters (`/r/:restaurantSlug/t/:tableId`).
- Key routes: `/r/:slug/t/:tableId` (Menu), `/r/:slug/t/:tableId/cart` (Checkout), `/r/:slug/t/:tableId/order/:orderId` (Realtime status tracker).

### apps/kitchen (Kitchen KDS Display)
- Port: `3002`
- State: Session-guarded auth. Large screen tablet/display layouts.
- Navigation: Split column Kanban tracking grid.
- Key routes: `/login` (Public), `/` (Realtime Board).
