# DASHBOARD ARCHITECTURE & WIDGET SYSTEM — QR Dine SaaS

This document defines the architecture of the Restaurant Admin Console dashboard and the reusable widget rendering system.

---

## 1. Dashboard Layout

- **Persistent Navigation**: Implemented in [DashboardLayout.tsx](file:///c:/Users/Inayath%20shariff/Downloads/restaurant%20software/apps/admin/src/layouts/DashboardLayout.tsx). Provides a collapsible glassmorphic sidebar layout containing complete system routing pathways.
- **Root Context Integration**: The Topbar displays the active tenant's details (`restaurant.name`, `restaurant.logo_url`) and hosts a **Branch Selector** mapping location entries from the database, letting the user switch context.

---

## 2. Reusable Widget System

To support adding new metric displays without code churn, we designed a modular widget system:

```text
       [ DashboardPage ]
               │
        ┌──────┴──────┐
        ▼             ▼
 [ Grid Container ] [ Detail Grid ]
        │             │
        ├─► DashboardWidget (Revenue)
        ├─► DashboardWidget (Orders)
        ├─► QuickActions
        └─► SystemStatus
```

### Components
1. **`DashboardWidget`** ([DashboardWidget.tsx](file:///c:/Users/Inayath%20shariff/Downloads/restaurant%20software/apps/admin/src/components/dashboard/DashboardWidget.tsx)): A statistics card displaying:
   * Title, Icon, Value
   * Trend Indicators (percentage shift + direction)
   * A full overlay loading skeleton block (`loading` state).
2. **`QuickActions`** ([QuickActions.tsx](file:///c:/Users/Inayath%20shariff/Downloads/restaurant%20software/apps/admin/src/components/dashboard/QuickActions.tsx)): Grid mapping standard operations setups (e.g. Add Category, Invite Staff) to routing paths.
3. **`SystemStatus`** ([SystemStatus.tsx](file:///c:/Users/Inayath%20shariff/Downloads/restaurant%20software/apps/admin/src/components/dashboard/SystemStatus.tsx)): Displays active client integrations (Auth, DB, S3 Storage, Realtime, Printer config, and Subscription plan tiers).
4. **`RecentActivity`** ([RecentActivity.tsx](file:///c:/Users/Inayath%20shariff/Downloads/restaurant%20software/apps/admin/src/components/dashboard/RecentActivity.tsx)): Log component prepared for live operation logs.

---

## 3. Empty States & Setup Wizard CTAs

If a new tenant registers, the dashboard displays inline setup warning banners for missing assets:
- **No Branches Setup**: Triggers if the `branches` database query returns empty.
- **No Menu Categories / Items / Tables**: Checks if counts are 0, displaying an orange warning card with a direct call-to-action button linking to configurations page setups.

---

## 4. Future Widget Integration Strategy

Adding new metric widgets in future modules requires three simple steps:
1. Define the metric SQL query or database view.
2. Add a count check hook in `DashboardPage.tsx`.
3. Drop in a new `<DashboardWidget>` element inside the Metrics Grid container:
   ```tsx
   <DashboardWidget 
     title="AI Prep Forecast" 
     value={predictionCount}
     icon={<BrainCircuit className="w-4 h-4" />}
     loading={loading}
   />
   ```
No layout restructures or CSS adjustments are necessary.

---

## 5. Files Created & Modified

### Shared Services
- **[lib/src/services/restaurant.service.ts](file:///c:/Users/Inayath%20shariff/Downloads/restaurant%20software/packages/lib/src/services/restaurant.service.ts)** [MODIFIED]: Added the `getBranches` location query method.

### Admin Application
- **[admin/src/contexts/AuthContext.tsx](file:///c:/Users/Inayath%20shariff/Downloads/restaurant%20software/apps/admin/src/contexts/AuthContext.tsx)** [MODIFIED]: Implemented restaurant profile and branches list querying with SVR caching.
- **[admin/src/layouts/DashboardLayout.tsx](file:///c:/Users/Inayath%20shariff/Downloads/restaurant%20software/apps/admin/src/layouts/DashboardLayout.tsx)** [MODIFIED]: Added full sidebar navigation, topbar restaurant logo, and active branch selector.
- **[admin/src/components/dashboard/DashboardWidget.tsx](file:///c:/Users/Inayath%20shariff/Downloads/restaurant%20software/apps/admin/src/components/dashboard/DashboardWidget.tsx)** [CREATED]: Reusable stat card with loading overlay support.
- **[admin/src/components/dashboard/QuickActions.tsx](file:///c:/Users/Inayath%20shariff/Downloads/restaurant%20software/apps/admin/src/components/dashboard/QuickActions.tsx)** [CREATED]: Onboarding actions grid.
- **[admin/src/components/dashboard/RecentActivity.tsx](file:///c:/Users/Inayath%20shariff/Downloads/restaurant%20software/apps/admin/src/components/dashboard/RecentActivity.tsx)** [CREATED]: Activity log placeholder.
- **[admin/src/components/dashboard/SystemStatus.tsx](file:///c:/Users/Inayath%20shariff/Downloads/restaurant%20software/apps/admin/src/components/dashboard/SystemStatus.tsx)** [CREATED]: Operations integration statuses checklist.
- **[admin/src/pages/DashboardPage.tsx](file:///c:/Users/Inayath%20shariff/Downloads/restaurant%20software/apps/admin/src/pages/DashboardPage.tsx)** [MODIFIED]: Implemented the core dashboard widgets and setup checklist empty states.
- **[admin/src/pages/PlaceholderPage.tsx](file:///c:/Users/Inayath%20shariff/Downloads/restaurant%20software/apps/admin/src/pages/PlaceholderPage.tsx)** [CREATED]: Reusable placeholder page for under-construction future features.
- **[admin/src/App.tsx](file:///c:/Users/Inayath%20shariff/Downloads/restaurant%20software/apps/admin/src/App.tsx)** [MODIFIED]: Configured subpage placeholder routing paths.
