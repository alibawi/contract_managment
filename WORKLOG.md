# WORKLOG

> Rules: read from the top before any work. Append a new entry at the bottom after every task. Never edit or delete past entries.

---

## 2026-10-30 — Discovery, brief, planning

**Module / screen:** whole mock (documents only).

**Completed**
- Source plan copied to `docs/source/contracts-plan/`, playbook to `docs/source/`.
- Discovery done with the owner; `docs/project-brief.md` confirmed.
- `docs/roadmap.md`, nine `docs/spec-*.md` and nine `docs/prompts-*.md` written; owner approved the plan.

**Key design decisions**
- Stack follows `assets_mock` (Vite + React 18 + TS + Tailwind v3, localStorage store, HashRouter) instead of the playbook default Next.js + shadcn — same reason as the assets mock: static hosting and shared shell. Confirmed by the owner in discovery.
- All four tracks complete from the start (owner choice); module order by dependency: contracts → workflow → agreements → amendments → obligations-finance → templates-print → service → settings-access → analytics.
- Arabic only, RTL, Iraqi locale, IQD plus USD; light theme only; role switcher gates buttons; Elsa approval stages simulated from a settings table.

**Issues / deferred:** none.

**Verification:** documents reviewed against the plan sections they cite.

**Next step:** foundation 0.1–0.9, then checkpoint.

---

## 2026-10-30 — Foundation 0.1–0.9

**Module / screen:** foundation (shell, roles, demo date, component library, store, mock API, shared seed, settings, health screen).

**Completed**
- Project scaffold from the assets_mock stack (Vite 5, React 18, TS 5.6, Tailwind 3.4, HashRouter with v7 future flags), `CLAUDE.md` rules, resettable `localStorage` store (`DATA_VERSION = 1`).
- Shell: ENKI RTL sidebar (contracts section with every module listed as «قريباً» until built, other ENKI modules inactive), top bar with demo-date control (+1/+7/+30/+90, date picker, reset), role menu (8 roles with a matching user each, simulate-server-error switch, reset demo data), `PageHeader` breadcrumbs.
- `permissions.ts` (29 permissions, default role matrix), `settings.ts` (15 settings with descriptions and defaults per ADR-17/18/25), `asof.ts`, `format.ts` (IQD/USD, Arabic month dates).
- Component library: Card, FormField/Field, Select, Badge/StatusBadge, Tabs, Dropdown, Modal, Confirm, SaveSplit, KPICard, Timeline, StageTimeline, BalanceBar, ModuleScreensGrid, DataTable (sortable, selectable, loading/empty), ListView, FilterSelect, SearchableSelect + Partner/Item/Category/User/Employee/Organization pickers, ChipListEditor, DateInput, AttachmentUploader/AttachmentList (metadata only), EmptyBlock, ErrorState, LoadingSkeleton, Async.
- `useApi` mock API hook (300–600 ms latency on first load, silent refresh after mutations, error simulation).
- Shared seed: 3 organizations, 11 users (one per role plus approvers), 14 employees, 20 partners (10 customers / 10 vendors), IQD+USD with rates, 8 UoMs, 13 categories (hierarchy), 20 items, payment terms, cost centers, projects. `npm run check` validates foreign keys.
- `/` landing (module cards) and `/health` smoke screen.

**Key design decisions**
- Foundation approval/permission model: `db.rolePerms` is stored so module 8's matrix edits persist; `can()` reads it.
- `useApi` does a first-load skeleton then silent refresh on `version` change, so lists don't flash after every mutation.
- Preview server runs outside this repo's `.claude/launch.json` limitation: the dev server is started with `npm run dev -- --port 5180` and opened by URL (the Claude session's launch.json lives in another project and must not be edited).
- No login screen and no language toggle (brief).

**Issues / deferred:** none open. React Router future-flag warnings fixed with `future` props.

**Verification (actual):** `npx tsc -b` clean; `npm run build` passes; `npm run check` → integrity OK. In the browser: shell renders RTL at 1280×800; switching role to «مدير عقود» persisted (user سارة حسين النعيمي); demo date +30 changed the chip to 29 تشرين الثاني 2026 and the health screen; error simulation showed the error state with retry; turning it off restored data; console shows no errors or warnings after reload.

**Next step:** owner checkpoint (playbook §8), then module 1 «contracts».

---
