# DEVELOPER GUIDE & STANDARDS — QR Dine SaaS

A reference handbook for developers working on the QR Dine SaaS codebase.

---

## Technical Setup

1. **Monorepo setup**: This project uses `npm` workspaces. Ensure you run package installations at the root folder:
   ```bash
   npm install
   ```
2. **Environment Variables**: Create a `.env` or `.env.local` file inside the target app directories (`apps/admin`, `apps/kitchen`, `apps/customer`).
   - Fill in:
     ```env
     VITE_INSFORGE_URL=https://vy3qe8cs.ap-southeast.insforge.app
     VITE_INSFORGE_ANON_KEY=your-anon-key-here
     ```
3. **Running Apps**:
   - Admin (Developer A): `npm run dev:admin` (Port 3000)
   - Customer (Developer B): `npm run dev:customer` (Port 3001)
   - Kitchen (Developer A): `npm run dev:kitchen` (Port 3002)

---

## Coding Standards

### 1. TypeScript & Type Safety
- **No Implicit Any**: Explicitly type all variables, function arguments, and return types.
- **Shared Schemas**: When declaring models that represent database tables, always extend or import from `@qrdine/types`.
- **API Responses**: Always wrap service callbacks in `ApiResponse<T>` to force checking for errors.

### 2. React Components
- **Functional Components**: Use standard functional components (`const MyComponent: React.FC<Props> = ...`).
- **Hooks Decoupling**: Separate complex API fetching or state mutations into custom hooks (e.g. `useMenu`, `useOrderStatus`) inside `src/hooks/`.
- **Reusable UI**: If a component is used across multiple screens (e.g. Card, Toggle, Button), import it from `@qrdine/ui` rather than rewriting it locally.

### 3. Styling & Styling Tokens
- **Tailwind Version**: We enforce **Tailwind CSS 3.4**. Do not upgrade to version 4 to maintain compatibility with InsForge templates.
- **Theme tokens**: Do not hardcode hex values. Use Tailwind's semantic tokens (`bg-primary`, `text-secondary`, etc.).
- **Glassmorphism Card Style**: Use the preconfigured frosted card classes:
  ```text
  bg-slate-900/60 backdrop-blur-md border border-slate-800/80
  ```

---

## Git & GitHub Collaboration Workflow

This is a shared repository with two active developers. To prevent merge conflicts, observe the following rules:

### Branch Management
- **Never push directly to `main` or `develop`.**
- Create features on separate branches: `feature/your-feature-name`.
- When a feature is ready:
  1. Rebase `feature/*` against the latest `develop` branch.
  2. Run `npm run typecheck` to verify no compilation errors.
  3. Create a Pull Request (PR) from `feature/*` to `develop`.
  4. Wait for code review / approval before merging.

### Workspace Ownership
- **Developer A (User)**: Modifies `apps/admin/`, `apps/kitchen/`, `insforge/`, and `docs/`.
- **Developer B (Friend)**: Modifies `apps/customer/`.
- **Shared Modifications (`packages/`)**: If you need to make changes to types, shared helpers, or UI components, align with your teammate first to ensure it doesn't break their workspace compilation.
