# BACKEND INTEGRATION RULES — QR Dine SaaS

Rules and specifications for interfacing with the connected InsForge Backend-as-a-Service.

---

## 1. Authentication Configuration

- **Sign up/Registration**: Handled via `insforge.auth.signUp()`. When a restaurant owner signs up, we insert a record into the `staff` mapping table assigning them the `'owner'` role.
- **Sign in**: Users login via `insforge.auth.signInWithPassword()`.
- **Sessions**: The SDK manages JWT sessions in the browser storage automatically.
- **Authorization Headers**: The SDK automatically appends JWTs to database and storage requests.
- **Client Init**:
  - Frontend apps: Use `createClient` with the public `anonKey`.
  - Server-side (functions/edge): Use `createAdminClient` with the elevated `apiKey` only.

---

## 2. Database (CRUD & RLS) Rules

- **Database operations**: Always use the SDK query builder (`insforge.database.from(...)`).
- **Array inputs**: Inserting records requires passing objects or lists, returning result arrays via `.select()`.
  ```typescript
  const { data, error } = await insforge.database
    .from('menu_items')
    .insert({ name: 'Pizza', price: 499 })
    .select();
  ```
- **Filter binding**: Updates and deletes **MUST** specify primary filters using `.eq()` or `.in()` to prevent accidental table-wide modifications.
- **Row-Level Security (RLS)**: RLS is active on all tables. Queries originating from the admin panel automatically inherit the user's staff scoping rules. If a query attempts to access another restaurant's `restaurant_id`, PostgreSQL throws an access violation.

---

## 3. Storage Bucket Conventions

InsForge utilizes S3-compatible file storage. We define three public storage buckets to serve assets:

### 1. `restaurant-logos`
- Access: Public read, owner write.
- Path pattern: `{restaurant_id}/logo.{ext}`
- Usage: Displaying brand identities in dashboards and menus.

### 2. `restaurant-covers`
- Access: Public read, owner write.
- Path pattern: `{restaurant_id}/cover.{ext}`
- Usage: Header banners on ordering screens.

### 3. `menu-images`
- Access: Public read, staff write.
- Path pattern: `{restaurant_id}/menu/{item_id}.{ext}`
- Usage: MenuItem display photos.

### File Upload pattern:
```typescript
const { data, error } = await insforge.storage
  .from('menu-images')
  .upload(`${restaurantId}/menu/${itemId}.png`, file);
```

---

## 4. Realtime Socket channels

InsForge Realtime wraps Socket.IO.
- Connect: Explicitly invoke `insforge.realtime.connect()` on application mount if listening to live updates.
- Channel Subscriptions: Subscribe using `insforge.realtime.subscribe(channel)`.
- Listener Binding: Use `insforge.realtime.on(event, callback)`. Always clean up listeners on component unmount using `off()`.
- Channel naming standards:
  - `orders:{restaurant_id}` — Broadcasts updates to the order feed.
  - `kitchen:{restaurant_id}` — Notifies KDS of newly inserted tickets.
  - `tables:{restaurant_id}` — Synchronizes table occupancy changes.
  - `order:{order_id}` — Feeds status updates to a single customer screen.
