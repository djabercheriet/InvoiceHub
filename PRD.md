# ⬡ Bntec Protocol - Master PRD

## 1. Product Vision
Bntec is an enterprise-grade SaaS platform designed for high-precision financial operations and inventory intelligence. It focuses on modularity, security (RLS), and a distraction-free professional aesthetic.

## 2. Platform Identity
- **Name**: Bntec / Bntec Dynamics
- **Primary Color**: Indigo (#4f46e5)
- **Typography**: Inter (no italics)
- **Architecture**: Next.js 16 (Turbopack) + Supabase (PostgreSQL/Storage)

---

## 3. High-Priority Technical Debt & Bug Tracking

### [BUG-001] Form Controller Null Value Warning
- **Type**: Console Error (React/DOM)
- **Origin**: `app/[locale]/dashboard/customers/page.tsx` (Stakeholders Page)
- **Error Message**: 
  ```text
  `value` prop on `input` should not be null. Consider using an empty string to clear the component or `undefined` for uncontrolled components.
  ```
- **Context**: Occurs during product/customer editing when a database field returns `null` and is passed directly to a controlled `Input` via `form.reset()` or `defaultValues`.
- **Proposed Fix**: 
  - Update `handleEdit` and `defaultValues` to use `field || ""` for all inputs.
  - Audit all pages (`Inventory`, `Invoices`, `Settings`) for similar patterns.
  - Status: **Pending Consideration** (Deferred for future pass).

---

## 4. Current Stability Goals
1. **Visual Consistency**: Ensure all dashboard elements (charts, feeds) maintain high contrast in both Dark and Light modes.
2. **Branding Integrity**: Periodic audits to ensure no legacy "InvoiceHub" strings exist in UI or documentation.
3. **Database Robustness**: Maintain idempotent SQL migrations in `scripts/` to ensure safe environment resets.

---

## 5. Storage & Visual Assets
- **Bucket**: `product-images` (Public)
- **Goal**: Resolve image visibility issues where uploaded assets aren't rendering in the dashboard or form previews.
- **Status**: **In Progress**.

---

## 6. Audit Trail & History
- *2026-04-08*: Rebranded footer to 4-column layout and fixed Navbar link visibility on light mode.
- *2026-04-08*: Initiated project structural cleanup (archiving legacy SQL & deleting obsolete logs).
