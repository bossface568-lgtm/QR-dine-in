# Table Management Module — Technical Documentation

## 1. Module Overview

The **Table Management Module** is a core administrative foundation in QR Dine SaaS. It allows restaurant owners and branch managers to organize, configure, and maintain physical dining tables across single or multi-branch operations.

---

## 2. Table Architecture & Database Relationships

Every dining table in the system belongs to a root `restaurant_id` (tenant) and optionally to a specific `branch_id`.

```
                    +--------------------+
                    |    restaurants     | (Tenant)
                    +---------+----------+
                              |
                     +--------+--------+
                     |                 |
                     v                 v
            +--------+-------+  +------+------+
            |   branches     |  |   tables    |
            +--------+-------+  +------+------+
                     |                 ^
                     +-----------------+ (scoped to branch)
```

### Table Properties:
- **`table_number`**: String identifier (e.g., `T-101`, `12`). Unique per branch.
- **`label`**: Custom table name or description (e.g., `Window Booth 1`, `VIP Lounge Table`).
- **`seating_capacity`**: Integer seating limit (> 0).
- **`floor`**: Floor/Level designation (`Ground Floor`, `Rooftop`, `Outdoor Terrace`, etc.).
- **`section`**: Dining zone/area (`Main Dining`, `VIP Section`, `Bar & Lounge`, etc.).
- **`status`**: Operational status:
  - `available`: Open for seating.
  - `occupied`: Currently seated by customers.
  - `reserved`: Booked for upcoming reservation.
  - `cleaning`: Under maintenance or sanitization.
  - `inactive`: Disabled from active floor layout.
- **`archived_at`**: Timestamp for soft-deletion. Tables are **never permanently deleted**.

---

## 3. Branch Scoping & Ownership Security

- Every table operation (`getTables`, `createTable`, `updateTable`, `archiveTable`) explicitly includes `WHERE restaurant_id = :restaurant_id`.
- Real-time table number uniqueness checks (`checkTableNumberAvailable`) validate that no two active tables share the same `table_number` within the same branch.

---

## 4. Future QR Code Integration Strategy

This module reserves explicit UI slots and database fields (`qr_code_url`, `current_session_id`, `current_order_id`) to prepare for upcoming modules:

1. **QR Code Generator Module (Admin)**: Will allow bulk generation of printable PDF/PNG QR Code sheets for each table.
2. **Customer Scanning Flow**: When a customer scans a table's QR Code (`https://qrdine.app/r/:slug/t/:tableId`), the customer app creates an active table session mapped to `current_session_id`.
3. **Kitchen & Live Orders**: Orders created during the table session will link directly to `table_id` and update status from `available` to `occupied`.

---

## 5. Files Created & Modified

### Database Migration:
- `insforge/migrations/016_update_tables_schema.sql`

### Shared Packages:
- `packages/types/src/index.ts` — Added `TableStatus`, `Table`, `CreateTablePayload`, `UpdateTablePayload`, `TableFilterType`, `TableWithBranch`.
- `packages/shared/src/constants.ts` — Added `TABLE_STATUS_LABELS`, `TABLE_STATUS_COLORS` (including `cleaning`), `FLOOR_OPTIONS`, `SECTION_OPTIONS`.
- `packages/lib/src/services/table.service.ts` — Full CRUD service, tenant isolation, soft-deletion, branch uniqueness validation, bulk actions.

### Admin Panel (`apps/admin`):
- `apps/admin/src/hooks/useTables.ts` — State hook with search, filters, sorting, stats, and CRUD handlers.
- `apps/admin/src/components/tables/TableStatusBadge.tsx` — Status badge with animated indicators.
- `apps/admin/src/components/tables/TableCard.tsx` — Grid view card with capacity badge, floor/section tags, inline status selector, and explicit placeholders.
- `apps/admin/src/components/tables/TableFormModal.tsx` — Modal form with branch selection, real-time uniqueness validation, capacity check, and floor/section suggestions.
- `apps/admin/src/components/tables/TableDetailsModal.tsx` — Specification preview modal with operational placeholders.
- `apps/admin/src/pages/TablesPage.tsx` — Orchestrator page with stats row, filter bar, bulk action toolbar, grid/table view toggle, and modals.
