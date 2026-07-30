# Restaurant Settings Module — Technical Architecture & Guide

The **Restaurant Settings Module** serves as the central configuration engine for every tenant in the QR Dine SaaS platform. All operational modules (Customer Digital Menu, Kitchen Display System, Order Processing, Notifications, and Media System) read their parameters from this single source of truth.

---

## 1. Module Architecture

```
apps/admin/src/
├── pages/
│   └── SettingsPage.tsx               # Root settings container & tab layout
├── hooks/
│   └── useSettings.ts                 # Form state, validation, dirty tracking & persistence
├── utils/
│   └── settings.validators.ts         # Pure input validation functions (Phone, Email, GST, PAN, Slug)
└── components/settings/
    ├── GeneralTab.tsx                 # Identity & Support contact form
    ├── BrandingTab.tsx                # Logo/Cover upload & Brand palette customization
    ├── BusinessTab.tsx                # GSTIN, PAN, Business Reg & Operating Hours
    ├── RegionalTab.tsx                # Currency, Timezone, Language & Formats
    ├── OrderingTab.tsx                # Master order toggles & fulfillment controls
    ├── NotificationsTab.tsx           # Email & Audio chime alerts
    └── PlaceholderTab.tsx             # Reusable placeholder tab (Integrations, Security, Advanced)
```

---

## 2. Configuration Flow & State Management

1. **Initialization**: On component mount, `useSettings` retrieves the active tenant record from `AuthContext` (`restaurant`).
2. **Form State**: Local `formData` is initialized alongside `originalData` for dirty state comparison.
3. **Dirty Tracking**: `isDirty` boolean dynamically evaluates whether `formData` differs from `originalData`. An unsaved changes status pill is displayed in the header.
4. **Validation**: Before submission, input strings are validated against regex contracts defined in `settings.validators.ts`. Slug uniqueness is verified asynchronously against the database.
5. **Persistence**: `restaurantService.updateRestaurantSettings()` submits patch updates to the InsForge database `restaurants` table.
6. **Session Refresh**: On successful save, `refreshAuth()` is triggered in `AuthContext` to update cached restaurant settings across all admin components.

---

## 3. Database Schema Mapping (`restaurants` Table)

Migration `014_add_restaurant_settings_columns.sql` extended the existing `restaurants` table with the following columns:

| Column | Type | Default | Settings Tab | Description |
|--------|------|---------|--------------|-------------|
| `description` | `TEXT` | `NULL` | General | Restaurant cuisine & bio |
| `website` | `TEXT` | `NULL` | General | Support website URL |
| `logo_url` | `TEXT` | `NULL` | Branding | Primary brand logo URL |
| `cover_image_url` | `TEXT` | `NULL` | Branding | Landscape hero banner URL |
| `primary_color` | `TEXT` | `'#f97316'` | Branding | Primary brand accent color (Hex) |
| `secondary_color` | `TEXT` | `'#0f172a'` | Branding | Dark UI background color (Hex) |
| `accent_color` | `TEXT` | `'#06b6d4'` | Branding | Highlight badge color (Hex) |
| `gst_number` | `TEXT` | `NULL` | Business | 15-character GSTIN ID |
| `pan_number` | `TEXT` | `NULL` | Business | 10-character PAN tax ID |
| `business_registration` | `TEXT` | `NULL` | Business | FSSAI / License registration |
| `opening_time` | `TIME` | `'09:00'` | Business | Default opening time |
| `closing_time` | `TIME` | `'23:00'` | Business | Default closing time |
| `business_days` | `JSONB` | `["Mon"...]` | Business | Array of operating day strings |
| `business_address` | `TEXT` | `NULL` | Business | Official registered address |
| `currency` | `TEXT` | `'INR'` | Regional | Currency code (INR, USD, EUR, etc.) |
| `timezone` | `TEXT` | `'Asia/Kolkata'` | Regional | Timezone identifier |
| `date_format` | `TEXT` | `'DD/MM/YYYY'` | Regional | Date format string |
| `time_format` | `TEXT` | `'12h'` | Regional | 12-hour or 24-hour toggle |
| `language` | `TEXT` | `'en'` | Regional | Menu primary language |
| `country` | `TEXT` | `'IN'` | Regional | Country code |
| `state` | `TEXT` | `NULL` | Regional | State / Province |
| `city` | `TEXT` | `NULL` | Regional | City |
| `accept_orders` | `BOOLEAN` | `true` | Ordering | Master online order acceptance |
| `enable_table_ordering` | `BOOLEAN` | `true` | Ordering | QR table ordering toggle |
| `kitchen_display_enabled` | `BOOLEAN` | `true` | Ordering | KDS ticket routing toggle |
| `email_notifications` | `BOOLEAN` | `true` | Notifications | Management email reports |
| `kitchen_alerts` | `BOOLEAN` | `true` | Notifications | KDS sound chimes |
| `order_alerts` | `BOOLEAN` | `true` | Notifications | Admin order sound chimes |
| `settings_json` | `JSONB` | `'{}'` | All | Extensible JSON blob for future settings |

---

## 4. Media Service Integration

Branding logo and cover banner uploads utilize the centralized `@qrdine/lib` Media Service facade:

- **Entity Types**: `'logo'` and `'banner'`
- **Validation**: Enforces max file size (5MB) and mime-type (`image/jpeg`, `image/png`, `image/webp`).
- **Processing**: Client-side canvas compression converts uploads to WebP (82% quality) and generates responsive thumbnail variants.
- **Storage**: Uploads to storage bucket `menu-images` under tenant path `restaurants/{restaurant_id}/...`.
- **Replacement**: When replacing a logo or banner, `mediaService.replaceImage()` automatically purges old storage objects in the background.

---

## 5. Input Validation Rules

Validations enforced in `settings.validators.ts`:

- **Phone**: Validates 10-digit Indian numbers (`+91`) or standard E.164 international numbers.
- **Email**: Standard RFC 5322 email regex.
- **GSTIN**: 15-character alphanumeric format check (`^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`).
- **PAN**: 10-character alphanumeric format check (`^[A-Z]{5}[0-9]{4}[A-Z]{1}$`).
- **Slug**: Lowercase alphanumeric + hyphens (`^[a-z0-9]+(?:-[a-z0-9]+)*$`), min 3, max 50 chars. Asynchronous database query verifies uniqueness.
- **Website URL**: Standard URL constructor check.

---

## 6. Future Expansion Points

- **Scheduled Orders / Takeaway / Delivery**: Toggle controls are pre-scaffolded in `OrderingTab.tsx` and map to `settings_json`.
- **SMS & Push Notifications**: Pre-scaffolded in `NotificationsTab.tsx` for Twilio and Firebase integration.
- **Integrations / Security / Advanced**: Pre-scaffolded placeholder tabs ready for payment gateway API keys, 2FA security, and CNAME custom domain management.
