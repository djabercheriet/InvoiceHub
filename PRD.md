🚀 PRD — NON-BREAKING CUSTOMIZATION & ADMIN LAYER (V2)

Objective:
Add enterprise-grade control system WITHOUT:

duplicating logic
breaking domain services
overriding existing modules
🧠 CORE PRINCIPLE (READ THIS FIRST)

You DO NOT build new logic.

You build a CONTROL LAYER ON TOP OF EXISTING SYSTEMS.

Existing System (you already built)
    ↓
Control Layer (NEW)
    ↓
UI + Permissions + Feature Toggles
⚠️ WHAT YOU MUST NOT DO

❌ Do NOT create new invoice logic
❌ Do NOT duplicate payment system
❌ Do NOT fork inventory logic
❌ Do NOT bypass domain services

✅ WHAT YOU WILL DO

✔ Wrap existing features with:

permissions
feature flags
settings
configuration
🏗️ INTEGRATION ARCHITECTURE

Add ONLY these new layers:

/lib/platform/
  permissions/
  features/
  settings/
  tenant/

These must CALL existing domain services, never replace them.

🔹 PHASE 1 — SAFE RBAC (HOOK INTO EXISTING SYSTEM)
Goal

Control access WITHOUT touching business logic.

Implementation
1. Create Permission Layer
/lib/platform/permissions/
  index.ts
  guards.ts
2. Wrap Existing Actions (IMPORTANT)

Instead of modifying invoice service:

❌ BAD:

invoiceService.createInvoice = () => {
  if (!isAdmin) throw Error()
}

✔ GOOD:

export const createInvoiceAction = async (user, data) => {
  if (!can(user, "create_invoice")) {
    throw new Error("Unauthorized")
  }

  return invoiceService.createInvoice(data)
}
3. UI Protection (NON-DESTRUCTIVE)
hide buttons if no permission
do NOT rely only on UI → always backend check
Acceptance
existing flows unchanged
unauthorized access blocked
🔹 PHASE 2 — FEATURE FLAGS (NO DUPLICATION)
Goal

Control visibility of modules like:

automation
payments
reports
Integration Strategy
DO NOT create new modules

Wrap existing ones:

if (!isFeatureEnabled("payments")) return null
Where to Apply
sidebar rendering
route access
API entry points
Example
export const createPaymentAction = async (...) => {
  if (!isFeatureEnabled("payments")) {
    throw new Error("Feature disabled")
  }

  return paymentService.create(...)
}
Acceptance
features toggle without breaking imports
no dead code execution
🔹 PHASE 3 — TENANT SETTINGS (CONFIG, NOT LOGIC)
Goal

Make your system configurable WITHOUT rewriting logic.

RULE

Settings must be:
👉 READ by services, not embedded inside them

Example (IMPORTANT)

❌ BAD:

const tax = 0.19

✔ GOOD:

const settings = await getTenantSettings(tenantId)
const tax = settings.tax_rate
Integration Points
1. Invoice Service

Inject:

tax rate
currency
numbering format
2. Inventory Service

Inject:

low stock threshold
3. Automation System

Inject:

delay rules
notification preferences
Acceptance
no hardcoded values remain
services depend on settings dynamically
🔹 PHASE 4 — USER PREFERENCES (UI ONLY LAYER)
Goal

Personalization WITHOUT touching backend logic.

Scope

Only affects:

UI rendering
layout
filters
DO NOT:
modify services
affect shared data
Example
const prefs = getUserPreferences()

if (prefs.compactMode) {
  renderCompactUI()
}
Acceptance
zero backend impact
instant UI changes
🔹 PHASE 5 — SUPER ADMIN (ISOLATED SYSTEM)
Goal

Control platform WITHOUT touching tenant logic.

Critical Rule

Super Admin must NEVER:

directly modify business tables
bypass domain services
Correct Approach

Use:

adminService → domainService
Example
adminService.suspendTenant(tenantId)
  → updates tenant status
  → triggers event
  → system reacts
Add Isolation
/app/admin (completely separate layout)
Acceptance
no leakage into main app
clean separation
🔹 PHASE 6 — PLAN & LIMIT ENFORCEMENT (HOOK, NOT REWRITE)
Goal

Monetization without breaking flows.

Integration Strategy

Wrap actions:

if (!canCreateInvoice(tenant)) {
  throw new Error("Limit reached")
}
DO NOT:
modify invoice service logic
add limits inside DB queries
Use:
middleware / action layer
Acceptance
limits enforced cleanly
core logic untouched
🔹 PHASE 7 — AUDIT SYSTEM (HOOK INTO EVENTS)
IMPORTANT

You already have:
👉 event system ✅

DO NOT build new logging system

Hook into events:

on("invoice.created", (event) => {
  logAudit(event)
})
This avoids:
duplication
performance issues
Acceptance
full traceability
no extra DB calls in services
🔹 PHASE 8 — UI INTEGRATION (SAFE)
Sidebar

Render dynamically:

if (featureEnabled && canAccess) {
  showMenu()
}
Pages

Guard routes:

if (!can(user, "view_reports")) redirect()
Buttons

Hide:

create
edit
delete
🧪 TESTING STRATEGY (CRITICAL)

Test these flows:

1. Regression
create invoice
create payment
inventory update
2. Permissions
user cannot access restricted action
3. Feature flags
disable payments → no crash
4. Settings
change tax → affects new invoices only
⚠️ FINAL RULES (THIS PREVENTS DISASTER)
NEVER:
modify domain service logic directly
duplicate tables
fork modules
ALWAYS:
wrap (actions layer)
inject (settings)
guard (permissions)
toggle (features)
🎯 FINAL RESULT

You will get:

✅ fully customizable SaaS
✅ no duplicated logic
✅ clean architecture
✅ safe evolution of system
✅ enterprise-level control