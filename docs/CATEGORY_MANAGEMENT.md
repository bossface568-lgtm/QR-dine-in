# Category Management Module Architecture & Specification

## Overview

The **Category Management Module** serves as the structural foundation for menu organization across the QR Dine SaaS platform. All downstream modules — including **Menu Items**, **Product Variants**, **Modifier Groups**, **Kitchen Display System (KDS)**, **Customer QR Ordering App**, and **AI Intelligence & Analytics** — directly depend on categories.

---

## 1. Category Architecture & Data Model

Categories represent logical groupings of menu items (e.g. *Appetizers*, *Gourmet Burgers*, *Beverages*, *Desserts*). 

### Schema Definition (`public.menu_categories`)
- **`id`** (`UUID`): Primary key.
- **`restaurant_id`** (`UUID`): Tenant identifier (enforced via PostgreSQL RLS).
- **`branch_id`** (`UUID`, nullable): Branch restriction. `null` indicates a global category visible across all branches.
- **`name`** (`TEXT`): Category display name.
- **`slug`** (`TEXT`): Unique URL identifier scoped per restaurant.
- **`description`** (`TEXT`, nullable): Category subtitle or customer description.
- **`image_url`** (`TEXT`, nullable): High-resolution WebP image URL processed via shared `MediaService`.
- **`icon`** (`TEXT`, nullable): Emoji or short icon representation.
- **`sort_order`** (`INTEGER`): Display sequence for drag-and-drop ordering.
- **`bg_color`** (`TEXT`): Custom background color token for customer menu UI.
- **`text_color`** (`TEXT`): Custom text color token for customer menu UI.
- **`is_visible`** / **`is_active`** (`BOOLEAN`): Controls visibility on customer digital menus.
- **`is_featured`** (`BOOLEAN`): Highlighted category banner flag.
- **`available_from`** / **`available_until`** (`TIME`, nullable): Time-window availability restrictions (e.g. 07:00 – 11:00 for Breakfast).
- **`available_days`** (`JSONB`, nullable): Array of active weekdays (e.g. `["Mon", "Tue", "Wed", "Thu", "Fri"]`).
- **`created_by`** / **`updated_by`** (`UUID`): Audit user tracking.
- **`created_at`** / **`updated_at`** / **`archived_at`** (`TIMESTAMPTZ`): Timestamps. Soft-deletion populates `archived_at`.

---

## 2. Category Relationships

```
                     ┌──────────────────────┐
                     │     restaurants      │
                     └──────────┬───────────┘
                                │ 1:N
                                ▼
                     ┌──────────────────────┐
                     │   menu_categories    │◄───────┐
                     └──────────┬───────────┘        │
                                │ 1:N                │ 1:N
                                ▼                    │ (Optional)
                     ┌──────────────────────┐   ┌────┴──────┐
                     │      menu_items      │   │  branches │
                     └──────────────────────┘   └───────────┘
```

- **Restaurant Tenant Isolation**: Every category belongs to a `restaurant_id`. RLS policies enforce tenant boundaries.
- **Menu Items Association**: Each `menu_item` references a `category_id`.
- **Branch Scope**: Categories can be linked to a specific `branch_id` or left `null` for global multi-branch inheritance.

---

## 3. Branch Visibility Strategy

In multi-branch restaurant operations (e.g. Downtown Branch vs Airport Branch):
1. **Global Categories (`branch_id = null`)**: Visible across all branches for that restaurant tenant.
2. **Branch-Specific Categories (`branch_id = <UUID>`)**: Visible only when a customer or staff member is accessing that specific branch location.
3. **Filtering Engine**: The category fetch queries apply `.eq('restaurant_id', id)` and conditionally filter by `branch_id`.

---

## 4. Scheduling & Time-Restricted Availability

Categories support time-window and day-of-week restrictions for specialized menus (e.g. *Breakfast*, *Lunch Specials*, *Late Night Menu*):
- **Time Range**: `available_from` and `available_until` store standard 24-hour time strings (`HH:mm`).
- **Day Restrictions**: `available_days` stores a JSON array of active days.
- **Customer Menu Resolution**: When the customer app renders the menu, it evaluates current local time and weekday against category schedule constraints to dynamically show or hide time-bound categories.

---

## 5. Drag-and-Drop Ordering Strategy

- Categories are sorted by `sort_order ASC`.
- The **Reorder Modal** (`CategoryReorderModal.tsx`) allows interactive drag-and-drop rank shifting.
- Reordered items update `sort_order` sequentially (`0, 1, 2, 3...`) and persist changes via `categoryService.reorderCategories()`.
- Customer menus query categories sorted by `sort_order ASC` to guarantee immediate UI consistency.

---

## 6. Media Integration Pipeline

- Category display images use the shared **QR Dine Media Service** (`mediaService` in `@qrdine/lib`).
- Images are processed client-side: EXIF metadata is stripped, dimensions scaled to `800 × 800 px`, converted to WebP, and compressed adaptively to target **150 KB – 300 KB**.
- Unoptimized raw files are never stored. Replacing an image cleans up previous storage paths automatically.

---

## 7. Audit of Files

### Files Created / Updated
- **`packages/types/src/index.ts`**: Contains `Category`, `CreateCategoryPayload`, `UpdateCategoryPayload`, and `CategoryFilterType`.
- **`packages/lib/src/services/category.service.ts`**: Added `checkSlugAvailable`, `bulkArchiveCategories`, and `bulkToggleStatus`.
- **`apps/admin/src/hooks/useCategories.ts`**: Added selection state, bulk actions, and branch filter integration.
- **`apps/admin/src/components/categories/CategoryFormModal.tsx`**: Integrated shared `MediaUploader`, auto-slug generation + validation, branch dropdown, and availability schedule controls.
- **`apps/admin/src/pages/CategoriesPage.tsx`**: Integrated branch filter, bulk selection table checkboxes, floating bulk action bar, availability schedule badges, and grid/table views.
- **`docs/CATEGORY_MANAGEMENT.md`**: Module documentation.

---

## 8. Future Compatibility with Menu Module

Category Management lays the exact ground rules for the upcoming **Menu Management Module**:
1. When creating a `MenuItem`, `category_id` will select from active categories.
2. Deactivating or archiving a category dynamically hides all child `menu_items` on the customer menu.
3. Category reordering determines top-level menu navigation tabs in the customer ordering application.
