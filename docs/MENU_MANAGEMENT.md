# Menu Management Module Documentation — QR Dine SaaS

## Overview
The Menu Management module is the central catalog engine of QR Dine SaaS. It empowers restaurant owners and managers to create, organize, and control menu items (dishes, beverages, combos) across branches with rich metadata, dietary tagging, pricing controls, availability schedules, and adaptive image processing.

---

## Architecture & Data Model

### Database Table: `menu_items` (Migration 015)
- **Tenant Isolation**: Every row has a `restaurant_id` foreign key protected by Row-Level Security (RLS).
- **Category Linking**: Foreign key `category_id` referencing `menu_categories(id)` with `ON DELETE CASCADE`.
- **Branch Scoping**: `branch_id` for branch-specific overrides, plus `branch_availability` JSONB array for multi-branch visibility.

### Key Fields & Capabilities
1. **Identity**: `name`, `short_name` (POS/KDS), `slug` (unique per restaurant), `description`, `short_description`.
2. **Pricing & Taxes**: `base_price`, `compare_at_price` (discount strikethrough), `tax_category` (GST 0%, 5%, 12%, 18%, 28%).
3. **Codes**: `sku`, `internal_code`, `barcode`.
4. **Media & Optimization**: `image_url` (uploaded via Media Service with adaptive WebP compression to 100KB–700KB target range), `gallery_json` (multi-image array).
5. **Dietary & Health**: `dietary_tags` (`veg`, `non_veg`, `vegan`, `egg`, `halal`, `jain`, `gluten_free`, `dairy_free`, `nut_free`, `spicy`, `chef_special`, `new_item`, `best_seller`, `seasonal`), `allergens`, `calories`, `spice_level` (0 to 5 scale).
6. **Operations & Status**: `preparation_time` (minutes), `status` (`available`, `unavailable`, `hidden`, `out_of_stock`, `coming_soon`, `discontinued`).
7. **Display Flags**: `is_featured`, `is_new`, `is_best_seller`, `is_chef_special`, `is_seasonal`.
8. **Scheduling**: `available_from`, `available_until` (TIME), `available_days` (JSONB array).

---

## Service Layer: `menuItemService` (`packages/lib/src/services/menu.service.ts`)

| Method | Signature | Description |
|--------|-----------|-------------|
| `getMenuItems` | `(restaurantId, options?)` | Fetch menu items with category, branch, and status filters |
| `getMenuItem` | `(restaurantId, itemId)` | Get single item by ID |
| `checkSlugAvailable` | `(restaurantId, slug, excludeId?)` | Validate slug uniqueness |
| `createMenuItem` | `(restaurantId, userId, payload)` | Create menu item with auto-slug & auto-sort |
| `updateMenuItem` | `(restaurantId, userId, itemId, payload)` | Update menu item details |
| `archiveMenuItem` | `(restaurantId, itemId)` | Soft delete item (`archived_at` timestamp & `discontinued` status) |
| `restoreMenuItem` | `(restaurantId, itemId)` | Restore archived item |
| `duplicateMenuItem` | `(restaurantId, userId, itemId)` | Duplicate item with `-copy-xxxx` slug suffix |
| `setStatus` | `(restaurantId, itemId, status)` | Update operational status |
| `toggleFeatured` | `(restaurantId, itemId, isFeatured)` | Toggle featured badge |
| `reorderMenuItems` | `(restaurantId, items)` | Bulk update sort orders |
| `bulkArchive` | `(restaurantId, itemIds)` | Bulk archive items |
| `bulkSetStatus` | `(restaurantId, itemIds, status)` | Bulk status update |

---

## React Components Hierarchy

```
apps/admin/src/pages/MenuPage.tsx
├── Stats Bar (Total, Available, Featured, Out of Stock, Archived)
├── MenuFilters (Search, Branch, Category, Status, Dietary Tag, Grid/Table Toggle)
├── Bulk Actions Toolbar (Activate, Deactivate, Archive Selected)
├── Content Views
│   ├── Grid View -> MenuItemCard.tsx (DietaryBadge.tsx, AppImage)
│   └── Table View (Native responsive table with action buttons)
└── Modals
    ├── MenuItemFormModal.tsx (Multi-section create/edit form)
    └── MenuItemDetailsModal.tsx (Read-only detailed preview)
```

---

## Verification & Quality
- **TypeScript**: 0 errors (`npx tsc --noEmit`).
- **Production Build**: Clean Vite build (`npm run build --workspace=@qrdine/admin`).
- **RLS**: Row-Level Security policies active for multi-tenant isolation.
