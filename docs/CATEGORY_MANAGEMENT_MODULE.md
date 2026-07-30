# Category Management Module Documentation

## Overview
The Category Management module provides full lifecycle management for restaurant menu categories in QR Dine SaaS. It supports tenant isolation, multi-branch scope, availability scheduling, drag-and-drop reordering, soft-delete archiving, and object storage image uploads.

## Features
1. **Category Listing & Views**: Grid and Table views with instant search and tab filtering (`all`, `active`, `inactive`, `featured`, `archived`).
2. **Category Creation & Editing**: Supports category identity (Name, Slug, Description), branding (Image Upload to `menu-images` bucket, Icon, Custom Background Color, Text Color), and visibility flags.
3. **Availability Scheduling**: Time window (`available_from`, `available_until`) and business days selection (`Mon`-`Sun`).
4. **Native Drag & Drop Reordering**: High-performance reorder modal allowing visual reordering with order persistence to the database.
5. **Soft Delete Archiving & Restoration**: Safe archiving with recovery options; categories are never permanently deleted from menu history.
6. **Duplication**: Quick 1-click category cloning with automatic slug collision prevention (`-copy-XXXX`).

## Database Architecture
- **Table**: `public.menu_categories`
- **Tenant Scope**: `restaurant_id` (foreign key to `public.restaurants`)
- **Branch Scope**: `branch_id` (nullable foreign key to `public.branches`)
- **RLS Policies**: Tenant-isolated policies using security definer helper function `public.get_my_restaurant_ids()`.

## Service & State Layer
- **Types**: `@qrdine/types` (`Category`, `CreateCategoryPayload`, `UpdateCategoryPayload`, `CategoryFilterType`)
- **Service**: `@qrdine/lib` (`categoryService`)
- **React Hook**: `apps/admin/src/hooks/useCategories.ts`

## Routing
- Admin Route: `/categories` (`CategoriesPage.tsx`)
