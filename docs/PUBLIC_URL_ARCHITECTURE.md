# Public Restaurant URL & Table Token Architecture — Technical Documentation

## 1. Executive Summary

This document specifies the public routing, URL structure, and security foundation for QR Dine SaaS. Public endpoints allow customers to access restaurant menus and scan table QR codes without exposing internal PostgreSQL UUID primary keys.

---

## 2. Public URL Structure

Every restaurant and table in the system has a permanent, secure, human-friendly URL.

### Restaurant Public URL
```text
/r/{restaurant-slug}
```
**Examples:**
- `https://qrdine.app/r/aqsa-dry-fruits`
- `https://qrdine.app/r/pizza-palace`
- `https://qrdine.app/r/my-test-restaurant-1`

### Table Public URL
```text
/r/{restaurant-slug}/t/{table-token}
```
**Examples:**
- `https://qrdine.app/r/aqsa-dry-fruits/t/A7H29KD`
- `https://qrdine.app/r/pizza-palace/t/F0952D1`

---

## 3. Table Token Strategy (`table_token`)

- **Format**: 7-character uppercase URL-safe alphanumeric string (e.g., `A7H29KD`, `F0952D1`).
- **Uniqueness**: Guaranteed unique via a PostgreSQL `UNIQUE` constraint (`tables.table_token`).
- **Security**: Raw database UUIDs (`tables.id`) are **never** exposed in public client URLs.
- **Permanence**: Once generated during table creation, the token remains permanent for that physical table.
- **Future QR Encoding**: QR Codes printed on table stands encode the full URL: `https://qrdine.app/r/:slug/t/:tableToken`.

---

## 4. Customer Routing & Security Resolution

The Customer Application (`apps/customer`) processes incoming URLs through `tableService.getTableByToken(slug, tableToken)`:

```
[Customer opens /r/:slug/t/:tableToken]
                  │
                  ▼
  [1. Resolve Restaurant by slug]
        ├── Not found? ───────► Render <RestaurantNotFoundPage /> (404)
        └── Inactive? ────────► Render <RestaurantUnavailablePage />
                  │
                  ▼
  [2. Resolve Table by table_token]
        └── Invalid/Mismatch? ─► Render <TableNotFoundPage /> (Invalid Token)
                  │
                  ▼
  [3. Load Restaurant, Branch, Table & Active Menu] ──► Render <CustomerMenuPage />
```

---

## 5. Files Created & Modified

### Database Migrations:
- `insforge/migrations/017_add_table_token.sql` — Added `table_token` column (`TEXT UNIQUE`), backfilled existing rows with 7-character tokens, and created `idx_tables_table_token` index.

### Shared Packages:
- `packages/types/src/index.ts` — Added `table_token` to `Table` and `CreateTablePayload`, defined `PublicTableResolution` interface.
- `packages/shared/src/utils.ts` — Added `generateTableToken()`, `buildPublicRestaurantUrl()`, and `buildPublicTableUrl()`.
- `packages/lib/src/services/table.service.ts` — Implemented `getTableByToken` and auto token generation during `createTable`.

### Admin Panel (`apps/admin`):
- `apps/admin/src/pages/TablesPage.tsx` — Added Public Restaurant URL banner with Copy & Open buttons, Table Token column, and Copy URL actions.
- `apps/admin/src/components/tables/TableCard.tsx` — Displayed Table Token badge, Copy Table URL action, and Open Table URL action.
- `apps/admin/src/components/tables/TableDetailsModal.tsx` — Displayed Public Customer Endpoint section with Copy URL & Open Link buttons.

### Customer Application (`apps/customer`):
- `apps/customer/src/App.tsx` — Scaffolding & Routing for `/r/:slug` and `/r/:slug/t/:tableToken`.
- `apps/customer/src/pages/CustomerMenuPage.tsx` — Menu browsing page with category tabs, search, veg filter, and table session context.
- `apps/customer/src/pages/RestaurantNotFoundPage.tsx` — 404 Restaurant Not Found page.
- `apps/customer/src/pages/TableNotFoundPage.tsx` — Invalid Table Code error page.
- `apps/customer/src/pages/RestaurantUnavailablePage.tsx` — Inactive Restaurant warning page.
