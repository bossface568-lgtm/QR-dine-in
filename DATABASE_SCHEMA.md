# QR Dine SaaS — Production Database Schema

This document details the exact PostgreSQL database schema for the QR Dine SaaS multi-tenant platform. All tables enforce tenant isolation using `restaurant_id` foreign keys and Row-Level Security (RLS) policies.

---

## Entity Relationship Overview

```
                      +-------------------+
                      |   auth.users      |
                      +---------+---------+
                                |
                                v
                      +---------+---------+
                      |   restaurants     | (Tenant Root)
                      +----+----+----+----+
                           |    |    |
       +-------------------+    |    +--------------------+
       |                        |                         |
       v                        v                         v
+------+------+         +-------+-------+         +-------+-------+
|   roles     |         |   branches    |         |menu_categories|
+------+------+         +---+---+---+---+         +-------+-------+
       |                    |   |                         |
       v                    |   +-------------+           v
+------+------+             |                 |   +-------+-------+
|restaurant_  |             v                 v   |  menu_items   |
|   users     |      +------+------+   +------+---+----+      |
+-------------+      |   staff     |   |   tables      |      |
                     +-------------+   +---------------+      |
                                                              |
                                                              v
                                                   (Modifier Groups & Orders)
```

---

## Table Schemas

### 1. `restaurants` (Tenant Master)
Stores primary restaurant profiles, owner mapping, and global settings.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique Restaurant ID |
| `owner_id` | `UUID` | `NOT NULL` | Links to `auth.users(id)` |
| `name` | `TEXT` | `NOT NULL` | Restaurant display name |
| `slug` | `TEXT` | `UNIQUE`, `NOT NULL` | Unique subdomain/URL slug |
| `description` | `TEXT` | | Restaurant short summary |
| `logo_url` | `TEXT` | | Media Service URL |
| `cover_image_url` | `TEXT` | | Media Service URL |
| `address` | `TEXT` | | Primary address |
| `phone` | `TEXT` | | Contact phone |
| `currency` | `TEXT` | `DEFAULT 'INR'` | Currency code (INR, USD, EUR, etc.) |
| `timezone` | `TEXT` | `DEFAULT 'Asia/Kolkata'` | Default timezone |
| `settings` | `JSONB` | `DEFAULT '{}'` | Global settings JSON |
| `is_active` | `BOOLEAN` | `NOT NULL`, `DEFAULT true` | Activity status toggle |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Date onboarded |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Last edit date |

---

### 2. `roles` (Access Control Roles)
Defines customizable RBAC roles per restaurant (e.g. Owner, Manager, Waiter, Kitchen).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Role ID |
| `restaurant_id` | `UUID` | `NOT NULL`, `REFERENCES restaurants(id) ON DELETE CASCADE` | Tenant owner |
| `name` | `TEXT` | `NOT NULL` | Role name |
| `description` | `TEXT` | | Role purpose description |
| `permissions_json` | `JSONB` | `NOT NULL`, `DEFAULT '{}'` | Permission key-value map |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Date created |

---

### 3. `restaurant_users` (User Tenant Mappings)
Maps `auth.users` to restaurants and assigns roles.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Mapping ID |
| `restaurant_id` | `UUID` | `NOT NULL`, `REFERENCES restaurants(id) ON DELETE CASCADE` | Scoped tenant |
| `auth_user_id` | `UUID` | `NOT NULL` | Auth user ID |
| `role_id` | `UUID` | `REFERENCES roles(id) ON DELETE SET NULL` | Assigned RBAC role |
| `is_owner` | `BOOLEAN` | `NOT NULL`, `DEFAULT false` | Owner flag |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Date mapped |

---

### 4. `branches` (Multi-Location Outlets)
Stores physical branch locations, operating hours, addresses, and geo-coordinates.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `UUID` | `PRIMARY KEY` | Branch ID |
| `restaurant_id` | `UUID` | `NOT NULL`, `REFERENCES restaurants(id) ON DELETE CASCADE` | Root tenant |
| `name` | `TEXT` | `NOT NULL` | Branch name (e.g. `Connaught Place Branch`) |
| `branch_code` | `TEXT` | | Optional unique branch code (e.g. `CP-01`) |
| `phone` | `TEXT` | | Branch phone number |
| `email` | `TEXT` | | Branch email |
| `address` | `TEXT` | | Physical address line 1 |
| `address_line2` | `TEXT` | | Physical address line 2 |
| `city` | `TEXT` | | Location City |
| `state` | `TEXT` | | Location State |
| `country` | `TEXT` | | Location Country |
| `postal_code` | `TEXT` | | Zip/Postal code |
| `latitude` | `DECIMAL(9, 6)` | | Geo-coordinate latitude |
| `longitude` | `DECIMAL(9, 6)` | | Geo-coordinate longitude |
| `opening_time` | `TIME` | | Daily opening time |
| `closing_time` | `TIME` | | Daily closing time |
| `business_days` | `JSONB` | `DEFAULT '["Mon",...,"Sun"]'` | Weekly operating days array |
| `timezone` | `TEXT` | `DEFAULT 'Asia/Kolkata'` | Location timezone |
| `is_active` | `BOOLEAN` | `NOT NULL`, `DEFAULT true` | Activity status toggle |
| `is_default` | `BOOLEAN` | `NOT NULL`, `DEFAULT false` | Primary default outlet flag |
| `is_archived` | `BOOLEAN` | `NOT NULL`, `DEFAULT false` | Soft-delete archive flag |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Date added |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Last updated |

---

### 5. `staff` (Operations Personnel)
Lists personnel employed at specific branches, linked to system roles.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `UUID` | `PRIMARY KEY` | Staff ID |
| `restaurant_id` | `UUID` | `NOT NULL`, `REFERENCES restaurants(id) ON DELETE CASCADE` | Scoped tenant |
| `branch_id` | `UUID` | `REFERENCES branches(id) ON DELETE CASCADE` | Assigned branch |
| `role_id` | `UUID` | `REFERENCES roles(id) ON DELETE SET NULL` | Assigned role |
| `full_name` | `TEXT` | `NOT NULL` | Employee full name |
| `phone` | `TEXT` | | Contact phone |
| `email` | `TEXT` | | Contact email |
| `status` | `TEXT` | `NOT NULL`, `DEFAULT 'active'` | Employment status |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Hiring date |

---

### 6. `menu_categories` (Menu Categories)
Organizes menu items into structured groups (e.g. Appetizers, Main Course, Beverages).

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Category ID |
| `restaurant_id` | `UUID` | `NOT NULL`, `REFERENCES restaurants(id) ON DELETE CASCADE` | Scoped tenant |
| `branch_id` | `UUID` | `REFERENCES branches(id) ON DELETE SET NULL` | Optional branch scoping |
| `name` | `TEXT` | `NOT NULL` | Category name |
| `slug` | `TEXT` | `NOT NULL` | URL slug |
| `description` | `TEXT` | | Category description |
| `image_url` | `TEXT` | | Category cover image |
| `icon` | `TEXT` | | Lucide icon name |
| `sort_order` | `INTEGER` | `NOT NULL`, `DEFAULT 0` | Display sorting order |
| `bg_color` | `TEXT` | `DEFAULT '#1e293b'` | Visual badge color |
| `text_color` | `TEXT` | `DEFAULT '#f8fafc'` | Text color |
| `is_visible` | `BOOLEAN` | `NOT NULL`, `DEFAULT true` | Customer menu visibility toggle |
| `is_active` | `BOOLEAN` | `NOT NULL`, `DEFAULT true` | Operational active state |
| `is_featured` | `BOOLEAN` | `NOT NULL`, `DEFAULT false` | Featured badge flag |
| `available_from` | `TIME` | | Daily available start time |
| `available_until` | `TIME` | | Daily available end time |
| `available_days` | `JSONB` | `DEFAULT '["Mon",...,"Sun"]'` | Weekly operating days array |
| `seo_title` | `TEXT` | | SEO title tag |
| `seo_description` | `TEXT` | | SEO meta description |
| `created_by` | `UUID` | | User ID who created |
| `updated_by` | `UUID` | | User ID who last updated |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Last edit timestamp |
| `archived_at` | `TIMESTAMPTZ` | | Soft delete timestamp |

---

### 7. `menu_items` (Menu Items / Dishes)
Stores menu items, pricing, dietary tags, operations data, and branch availability.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Item ID |
| `restaurant_id` | `UUID` | `NOT NULL`, `REFERENCES restaurants(id) ON DELETE CASCADE` | Scoped tenant |
| `category_id` | `UUID` | `NOT NULL`, `REFERENCES menu_categories(id) ON DELETE CASCADE` | Category reference |
| `branch_id` | `UUID` | `REFERENCES branches(id) ON DELETE SET NULL` | Branch override |
| `name` | `TEXT` | `NOT NULL` | Item display name |
| `short_name` | `TEXT` | | Short name for POS/KDS |
| `slug` | `TEXT` | `NOT NULL` | URL slug |
| `description` | `TEXT` | | Full item description |
| `short_description` | `TEXT` | | Short subtitle description |
| `base_price` | `DECIMAL(10,2)` | `NOT NULL`, `DEFAULT 0.00` | Base selling price |
| `compare_at_price` | `DECIMAL(10,2)` | | Original price for discount display |
| `tax_category` | `TEXT` | | Tax classification (e.g. `gst_5`) |
| `sku` | `TEXT` | | Stock Keeping Unit |
| `internal_code` | `TEXT` | | Internal kitchen code |
| `barcode` | `TEXT` | | Barcode/EAN number |
| `image_url` | `TEXT` | | Primary item image |
| `gallery_json` | `JSONB` | `DEFAULT '[]'` | Multi-image gallery array |
| `dietary_tags` | `JSONB` | `DEFAULT '[]'` | Dietary classification tags |
| `allergens` | `JSONB` | `DEFAULT '[]'` | Allergen tags array |
| `preparation_time` | `INTEGER` | | Prep time in minutes |
| `calories` | `INTEGER` | | Caloric content |
| `spice_level` | `INTEGER` | `DEFAULT 0` | Spice scale 0 to 5 |
| `status` | `TEXT` | `NOT NULL`, `DEFAULT 'available'` | Status (`available`, `unavailable`, `hidden`, `out_of_stock`, `coming_soon`, `discontinued`) |
| `sort_order` | `INTEGER` | `NOT NULL`, `DEFAULT 0` | Sorting order within category |
| `is_featured` | `BOOLEAN` | `NOT NULL`, `DEFAULT false` | Featured flag |
| `is_new` | `BOOLEAN` | `NOT NULL`, `DEFAULT false` | New item badge flag |
| `is_best_seller` | `BOOLEAN` | `NOT NULL`, `DEFAULT false` | Best seller badge flag |
| `is_chef_special` | `BOOLEAN` | `NOT NULL`, `DEFAULT false` | Chef special badge flag |
| `is_seasonal` | `BOOLEAN` | `NOT NULL`, `DEFAULT false` | Seasonal item flag |
| `available_from` | `TIME` | | Availability start time |
| `available_until` | `TIME` | | Availability end time |
| `available_days` | `JSONB` | `DEFAULT '["Mon",...,"Sun"]'` | Availability operating days |
| `branch_availability` | `JSONB` | `DEFAULT '[]'` | Specific branch IDs array |
| `metadata_json` | `JSONB` | `DEFAULT '{}'` | Extensible metadata |
| `created_by` | `UUID` | | User ID who created |
| `updated_by` | `UUID` | | User ID who last updated |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Last edit timestamp |
| `archived_at` | `TIMESTAMPTZ` | | Soft delete timestamp |

---

### 8. `tables` (Dining Tables & Seating Layout)
Stores physical dining tables, seating capacity, branch scoping, floor/section grouping, and placeholders for QR Code & active session tracking.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Table ID |
| `restaurant_id` | `UUID` | `NOT NULL`, `REFERENCES restaurants(id) ON DELETE CASCADE` | Scoped tenant |
| `branch_id` | `UUID` | `REFERENCES branches(id) ON DELETE SET NULL` | Scoped branch |
| `table_number` | `TEXT` | `NOT NULL` | Unique table code/number per branch |
| `label` | `TEXT` | | Display name (e.g. `Window Side Booth 1`) |
| `seating_capacity` | `INTEGER` | `NOT NULL`, `DEFAULT 4` | Seating capacity |
| `floor` | `TEXT` | | Floor/level (e.g. `Ground Floor`, `Rooftop`) |
| `section` | `TEXT` | | Zone/section (e.g. `Main Dining`, `VIP Lounge`) |
| `status` | `TEXT` | `NOT NULL`, `DEFAULT 'available'`, `CHECK (status IN ('available','occupied','reserved','cleaning','inactive'))` | Table operational status |
| `is_active` | `BOOLEAN` | `NOT NULL`, `DEFAULT true` | Activity status toggle |
| `is_occupied` | `BOOLEAN` | `NOT NULL`, `DEFAULT false` | Occupancy indicator |
| `sort_order` | `INTEGER` | `NOT NULL`, `DEFAULT 1` | Sorting display order |
| `qr_code_url` | `TEXT` | | Placeholder for generated QR code |
| `current_session_id` | `TEXT` | | Placeholder for active customer session |
| `current_order_id` | `TEXT` | | Placeholder for active order |
| `created_by` | `UUID` | | User ID who created |
| `updated_by` | `UUID` | | User ID who last updated |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Last edit timestamp |
| `archived_at` | `TIMESTAMPTZ` | | Soft delete timestamp |

* **Indexes**: `idx_tables_restaurant_id`, `idx_tables_branch_id`, `idx_tables_status`, `idx_tables_archived_at`, `idx_tables_floor`, `idx_tables_section`, `idx_tables_number_branch`.

---

## Row-Level Security (RLS) Rules

RLS is configured on all tables to ensure complete tenant isolation:
- **Selects**: Any user mapped to a restaurant inside `restaurant_users` or staff can SELECT records matching that `restaurant_id`.
- **Modifications (INSERT/UPDATE/DELETE)**: Only user records that are authenticated and mapped to the tenant can modify rows.
- **Cross-tenant leaks**: All queries pass through `restaurant_id` constraints.
