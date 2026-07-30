# PRODUCT BACKLOG & ROADMAP — QR Dine SaaS

A tracking dashboard of upcoming features and tasks, divided by developer ownership.

---

## Developer A (Management & Ops Panel)

### Branch/Restaurant Setup
- [ ] Implement restaurant registration/sign-up page.
- [ ] Build multi-branch lookup and management dashboards.
- [ ] Connect profile uploads for logos and cover banners to S3.

### Menu Management
- [ ] Categories editor (CRUD with drag-and-drop sort order).
- [ ] Menu items editor (veg/non-veg toggles, price settings, image uploads, allergen array tags).

### Tables & QR code generation
- [ ] Seating layout creator (table numbers, seating capacity).
- [ ] QR code generator (build URL path based on restaurant slug and table ID, compile print sheets).

### KDS (Kitchen Display System)
- [ ] Kitchen ticket card views with countdown timers.
- [ ] Realtime column sync using Socket.IO listeners.
- [ ] Sound/visual alerts for incoming orders.

### Revenue Intelligence & Analytics (Core Product)
- [ ] Custom dashboard widgets (Gross Revenue, Daily Orders, Seating utilization).
- [ ] Smart Menu Ranking (analyse item order velocity to rank popular dishes).
- [ ] Demand Prediction (predict raw ingredient requirements based on historical order volume).

---

## Developer B (Customer Mobile App)

### Scan & Ordering Flow
- [ ] QR scan resolver landing page.
- [ ] Category-filtered menu browse layout (mobile-first).
- [ ] Item options, variants, and modifications cart configuration.

### Checkout & Tracking
- [ ] Order placement transaction calls.
- [ ] Realtime order status tracking timeline.
- [ ] "Call Waiter" and "Request Bill" push notifications.

### Upselling Engine
- [ ] "Frequently ordered together" suggestions drawer on cart checkout.
- [ ] Combo deals banner slider.

---

## Platform & Integrations (Shared)

### Subscriptions & Billing
- [ ] Stripe integration for restaurant subscription plans.
- [ ] Auto invoices email dispatcher serverless function.

### Hardware Integrations
- [ ] POS thermal printer integration (ESC/POS command generation).
