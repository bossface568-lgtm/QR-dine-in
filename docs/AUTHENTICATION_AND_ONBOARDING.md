# AUTHENTICATION & RESTAURANT ONBOARDING — QR Dine SaaS

This document outlines the authentication flows, session handling rules, protected route checks, and step-by-step tenant onboarding pipelines.

---

## 1. Authentication Architecture

We utilize InsForge BaaS authentication, which manages user identities via JWT-based sessions.

### Auth Providers
- **Google Sign-In**: Powered by `signInWithOAuth` using the PKCE flow. Redirects users to Google, then returns to the console dashboard.
- **Email Sign-In**: Uses standard email and password authentication (`signInWithPassword`) as a backup flow.

---

## 2. Session Management & Persistence

- **Session Restoration**: On application mount, the `AuthProvider` (`AuthContext.tsx`) calls `authService.getCurrentUser()`. This automatically evaluates and restores any cached browser sessions.
- **Token Injection**: The SDK handles local storage and automatically signs and appends the user's JWT to all database and storage queries.
- **Active Scopes**:
  * If a session is valid, the provider queries the `restaurant_users` mapping table:
    ```typescript
    restaurantService.getRestaurantUser(userId)
    ```
  * If a row exists, the context resolves `restaurantId` and updates the provider state, which scopes all future admin queries.
  * If no row exists, `restaurantId` resolves to `NULL`.

---

## 3. Redirection Flowchart (First Login)

```text
  [ User enters app / reload ]
                │
                ▼
      [ Loading credentials ]
                │
                ▼
        [ Is logged in? ]
         /           \
       NO             YES
       /               \
[ Show /login ]    [ Has restaurantId? ]
                     /               \
                   YES                NO
                   /                   \
        [ Show /dashboard ]     [ Redirect /onboarding ]
```

---

## 4. Protected Route Architecture

Guards are implemented in [App.tsx](file:///c:/Users/Inayath%20shariff/Downloads/restaurant%20software/apps/admin/src/App.tsx) using the `<ProtectedRoute>` wrapper:
- **`requireOnboarded = true` (Default)**: Enforced on all dashboard, menu, table, and setting paths. If `restaurantId` is null, the wrapper redirects the browser to `/onboarding`.
- **`requireOnboarded = false`**: Enforced strictly on `/onboarding`. If `restaurantId` is already set, the wrapper redirects the browser back to the dashboard `/`.

---

## 5. Restaurant Onboarding Pipeline

If a user has authenticated but does not belong to any restaurant, they enter the multi-step `/onboarding` form:

### Step 1: Restaurant Profile Setup
- Collects: Restaurant Name, Classification, Phone, Email, GSTIN (optional), Timezone, and Currency.
- Automatically generates the routing `slug` as the user types the name (validated to prevent duplicate handles in the database).
- Uploads the optional logo file to the public S3 bucket (`restaurant-logos`) via `insforge.storage.from()`.

### Step 2: Headquarter Branch Setup
- Collects: Branch Name (defaulted to `HQ Branch`), Address, City, State, Country, Postal Code, and Phone.

### Step 3: Creation & DB Inserts
When the user clicks "Submit Setup", the onboarding service calls the backend sequentially:
1. Creates the root `Restaurant` record.
2. Generates an `'Owner'` Role record (assigning all permissions).
3. Inserts a `Restaurant User` mapping row linking the auth user's ID to the restaurant and the Owner role (`is_owner = true`).
4. Creates the primary `Branch` record.
5. Adds a `Staff` record mapping the owner's employee file.

---

## 6. Files Created & Modified

### Shared Packages
- **[types/src/index.ts](file:///c:/Users/Inayath%20shariff/Downloads/restaurant%20software/packages/types/src/index.ts)** [MODIFIED]: Added schema interfaces for `Restaurant`, `Branch`, `Role`, `RestaurantUser`, and `Staff`.
- **[lib/src/services/auth.service.ts](file:///c:/Users/Inayath%20shariff/Downloads/restaurant%20software/packages/lib/src/services/auth.service.ts)** [MODIFIED]: Added `signInWithGoogle` OAuth support.
- **[lib/src/services/restaurant.service.ts](file:///c:/Users/Inayath%20shariff/Downloads/restaurant%20software/packages/lib/src/services/restaurant.service.ts)** [MODIFIED]: Added `getRestaurantUser`, `checkRestaurantSlugExists`, and the transactional `onboardRestaurant` pipeline.

### Admin Dashboard Application
- **[admin/src/contexts/AuthContext.tsx](file:///c:/Users/Inayath%20shariff/Downloads/restaurant%20software/apps/admin/src/contexts/AuthContext.tsx)** [MODIFIED]: Modified session check hook to fetch restaurant IDs from `restaurant_users`.
- **[admin/src/App.tsx](file:///c:/Users/Inayath%20shariff/Downloads/restaurant%20software/apps/admin/src/App.tsx)** [MODIFIED]: Integrated `/onboarding` routing guards.
- **[admin/src/pages/LoginPage.tsx](file:///c:/Users/Inayath%20shariff/Downloads/restaurant%20software/apps/admin/src/pages/LoginPage.tsx)** [MODIFIED]: Integrated Google Sign-In and separators.
- **[admin/src/pages/OnboardingPage.tsx](file:///c:/Users/Inayath%20shariff/Downloads/restaurant%20software/apps/admin/src/pages/OnboardingPage.tsx)** [CREATED]: Professional multi-step wizard onboarding UI with S3 image uploading.

---

## 7. Future Extension Points

1. **OAuth Redirects**: For production, configure the redirect domains inside the InsForge Project settings dashboard to redirect to `https://admin.qrdine.com/` instead of `localhost`.
2. **Additional Branches**: The onboarding flow defaults to setting up a single primary location. Branch management modules will be built later to add extra locations.
3. **Advanced RBAC Permissions**: The Owner role has full permissions. Managers and cooks will receive customized permission lists in the future.
