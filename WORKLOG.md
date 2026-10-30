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

## 2026-10-30 — Module 1: contracts (1.1–1.9)

**Module / screen:** contracts — list C1, card C2 (core tabs), wizard C3, transition dialogs C6, types C4, alerts C5, linked documents C7, module KPIs on the landing.

**Completed**
- Seed: 12 contract types, 30 contracts across all 10 statuses (15 agreements, 5 service, 10 general; IQD and USD; Iraqi fictional counterparties), parties, signatures (roles Counterparty/Company), attachments (draft/signed/appendix, metadata only), status history, document links, 38 basic agreement lines (module 3 extends them). `npm run check` now also verifies contracts (history ends at the current status, required signatures present, no duplicate numbers, FKs).
- `lifecycle.ts`: state machine for T1–T14 (submit/approve/reject, send for signature, activate, suspend/resume, terminate, close, cancel, reopen, delete) with `allowedActions()` driving the UI; `validateSubmit()` (BR-C-02/03/04); signature rules (BR-C-06); locked fields (BR-C-05); version 1 + exchange-rate snapshot at activation (BR-C-07); `syncTime()` expires Active/OnHold past end date and auto-activates signed contracts whose effective date arrived (BR-C-11); numbering `CTR-{prefix}-{year}-{nnnnnn}`; confidentiality filter (BR-C-12).
- `alerts.ts`: expiry / notice-deadline / expired / approval-pending / signature-missing alerts from settings, type defaults and per-contract overrides (BR-C-14).
- Screens: list with status tabs + counts, 7 filters, search, sortable columns; card with 15 tab slots (later modules show «قريباً», gated by feature flags); 6-step wizard (type defaults, partner defaults payment term and currency, item prices converted to the contract currency, quick line editor, reminders, attachments, review with validation); contract types screen; alerts center with read marks; KPI dashboard (donut by status, bars by type, expiring list).
- Role gating: buttons come from `allowedActions()` + `rolePerms`; confidential contracts hidden/forbidden without ViewConfidential; export button hidden without Export.

**Key design decisions**
- Approval is a single-step stub (module 2 replaces `submit/approve/reject` with the Elsa stage engine). The creator cannot approve their own contract unless the setting allows it.
- Contract effective date defaults to the start date; activation is blocked until it arrives, and the demo-date job promotes it automatically if signatures are complete (plan T6).
- `useApi` keeps stale data while refreshing, so action results show up ~one tick after a click (expected).
- Seed `createdAt` of in-flight contracts is 3–7 days ago so approval/signature reminders look realistic.
- Wizard editing of non-draft contracts is limited to non-legal fields (owner, notes, reminders, attachments).

**Issues / deferred:** amendments, versions, fulfilment, obligations, templates and service tabs are placeholders by design; `Contracts.Edit` is used for signature recording (plan doc 07). The console shows old `ERR_CONNECTION_REFUSED` lines from the dev server being stopped between sessions — not application errors.

**Verification (actual):** `tsc -b` clean, `npm run build` ok, `npm run check` → integrity OK. Browser, role admin: dashboard KPIs (14 active, 1 expiring in 30 days, 9 alerts); list shows 30 rows with correct tab counts; c-15 draft → submit → approve → activation blocked with «تواقيع ناقصة» → one signature via dialog → remaining signature + signed attachment injected → activation created version 1, effective date and history Draft>PendingApproval>Approved>Active; +90 demo days moved 7 contracts to Expired (system history rows) while OnHold ones stayed; wizard validation (type/title, partner required, contract value) and full create + «حفظ وإرسال للاعتماد» produced CTR-PA-2026-000007 with USD price 11.07 converted from 14,500 IQD, payment term defaulted from partner; role «مبيعات»: list 31→28 (confidential hidden), direct link to a confidential contract shows the forbidden message, export hidden; types screen 12 rows, create button only for admin, dialog opens.

**Next step:** owner review checklist, then module 2 «workflow».

---

## 2026-10-30 — Module 2: workflow (2.1–2.7)

**Module / screen:** workflow — approval stage engine and timeline in the contract card (W1), tasks inbox (W2), delegations (W3), e-signature simulation (W4), approval stage rules preview (W5).

**Completed**
- `approval.ts`: stage rules selected by subject (contract / amendment / termination), type, organization and value in IQD (most specific wins); sequential stages snapshotted per request; one task per open stage; `eligibility()` (stage user or active delegation, creator cannot approve unless `Approval.AllowCreatorApproval`, legal-review stages need ViewConfidential); `decide()` returns next/approved/rejected.
- Seed rules: ≤25M (3 stages), 25–250M (5), >250M (5 with legal review), amendments (2/3 stages), termination (2); three delegations (active, expired, future).
- `lifecycle.ts`: submit/approve/reject go through the engine; signed contracts auto-activate when the effective date arrives.
- `esign.ts` + ESignPanel: fake provider, request Sent → PartiallySigned → Signed/Declined/Expired; on Signed creates provider signatures and a signed attachment.
- Screens: ApprovalPanel with stage timeline and decision dialog, tasks inbox, delegations (create/revoke), approval stages (read-only), user switcher in the header.
- `npm run check` now also verifies workflow (one open stage, rule/stage FKs, delegation dates).

**Key design decisions**
- Elsa is only simulated; real rules are designed in the Elsa workflow designer (decision 1). Value thresholds are illustrative.
- Manager role received Approve/Reject so the demo user can act on stages.
- `DATA_VERSION` bumped to 5 (reseeds localStorage).

**Issues / deferred:** stage-rule editing arrives in settings-access (module 8); Tasks KPIs, delegation dialog and c-06 pending flow were not browser-verified visually.

**Verification (actual):** `tsc -b` clean, `npm run build` ok, `npm run check` → integrity OK. Browser: full 5-stage approval of a 60M IQD contract (last stage approved by delegate on behalf of GM, history shows «بالنيابة»), rejection path, e-sign send → sign each signer → Signed, contract c-19 auto-activated by system on demo date 2026-11-20 (v1, activatedBy system), delegations list shows expired/active/future states, 6 stage rules rendered, no console errors.

**Next step:** owner review, then module 3 «agreements».

## 2026-10-30 — Module 3: agreements (3.1–3.8)

**Module / screen:** agreements — list A6, lines tab + editor A1/A2, fulfillment tab A3, linked documents A4, demo document simulator A5, resolution test A7, delivery schedules A8, module KPIs.

**Completed**
- `fulfillment.ts`: the engine. Counter mapping per document type (BR-A-01/02: order → release; delivery → fulfil; invoice → invoice; direct invoice with stock movement → all three once; returns restore per setting), contribution model with delta entries and revision guard (BR-A-03), basis-driven remaining (BR-A-04), validation by `EnforcementMode` (BR-A-05), `OnFulfillmentFailure` Rollback / KeepAndAlert with `Exceeded` entries and an alert (BR-A-06), any-currency conversion with ActivationRate / DocumentDateRate (BR-A-07), recalculate (BR-A-11), resolver (BR-A-09), schedule status (BR-A-12).
- Seed: 66 mock documents across 11 agreements (cancelled, edited, returned, USD-on-IQD and IQD-on-USD cases) posted through the real engine ⇒ 104 ledger entries, balances, 14 schedule rows; line limits (min/max release, enforced cap, validity) layered over the module-1 lines. `npm run check` also verifies agreements (ledger = every source line's contribution, ledger sum = balance for every line).
- Screens: list with KPIs and committed/released/fulfilled/invoiced bars; lines tab (Draft editable, item or category with sub-categories); fulfillment tab with ledger drill-down, recalculate and a demo «drift» button; documents tab; simulator with live preview, post/edit/cancel/reverse/unlink/delete/return and the five relevant settings inline; resolver with skipped-agreement reasons; schedule dialog.
- Alerts: a new «تجاوز الالتزام» rule for contracts with `Exceeded` ledger entries.

**Key design decisions**
- Balances are a cache (`db.balances`) rebuilt from the ledger; the drift button proves the indicator and recalculate.
- Seed has 104 entries, not the 120 in the spec — enough variety; count follows the documents.
- `enforceMax` caps the total commitment; `minRelease/maxRelease` apply per released document; Warn never throws (checks become warnings), None skips all checks.
- Document state lives on the document (all its lines), not per line; simulator documents are single-line, seed documents may have several.
- Returns are created as return document + optional inventory movement; with `ReturnsRestoreCommitment` off they add no entries.

**Issues / deferred:** amendments cannot yet reduce a line below its counters (BR-A-10, module 4); the real category-membership lookup is the placeholder item→category tree.

**Verification (actual):** `tsc -b` clean, `npm run build` ok, `npm run check` → integrity OK. `npm run check:agreements` (new, same engine code): SO 10 → receipt 6 → bill 6 → return 2 (with stock) → order cancel, edit delta, USD document on IQD contract and IQD on USD under both rate sources, Warn / None / Block+Rollback / Block+KeepAndAlert, restore off, direct invoice with stock = 3 entries, drift + recalculate, resolver (specific and general) — all pass. Browser: list KPIs and 15 rows, c-01 lines / fulfillment / documents tabs, simulator preview (Warn warning), Block+Rollback refused (5 docs) then KeepAndAlert kept (6 docs, entry «تجاوز الحد»), resolver result, Draft line dialog, schedule dialog with Met / Late / Upcoming.

**Next step:** owner review, then module 4 «amendments».

## 2026-10-30 — Module 4: amendments (4.1–4.8)

**Module / screen:** amendments — amendments tab M1, editor M2, detail M3, versions tab M4, version compare M5, renewal dialog M6, renewals due M7, all-amendments list with KPIs.

**Completed**
- `amendments.ts`: change sets (header fields, line add/change/close, party add/change/remove), one open amendment per contract, stale check, counter floor (BR-M-03), submit through the Elsa engine with the route chosen by the value change (≤100M IQD two stages, above three), approve/reject, cancel, apply (new immutable version, history row, expired contract revived by an extension), `applyDueAmendments` for future effective dates, snapshot + short cyrb53 hash + field-level diff.
- `renewal.ts`: manual successor (Draft, open lines renumbered from 1, counters reset, one successor per contract), auto-renewal once at the notice deadline when the demo date advances, renewals-due list; `lifecycle.ts` writes version 1 on activation (reason Renewal for successors) and closes the predecessor with reason Renewed.
- Seed: 25 versions, 8 amendments (4 applied, pending at stage 2 of 3, approved with a future date, draft, rejected), renewal chain c-21→c-22 and one auto-created successor (c-03→c-31). `npm run check` verifies version continuity, hashes, one open amendment per contract, symmetric renewal links.
- Screens as listed; Tasks inbox now routes amendment tasks to the amendment engine; contract card shows predecessor/successor links and a renew button.

**Key design decisions**
- Approval route uses the absolute value change of the amendment, not the contract value.
- Amendment creator cannot approve (separation of duties uses the amendment's creator).
- Applying is blocked until the effective date; the demo date advance applies due amendments by «النظام».
- Auto-renewal can be stopped only by changing the renewal policy with an amendment before the notice deadline.
- Terms group in a version = delivery terms, payment term, description (clauses arrive with module 6).

**Issues / deferred:** version snapshots do not include template clauses yet (module 6); no notification is sent on auto-renewal beyond the audit row.

**Verification (actual):** `tsc -b` clean, `npm run build` ok, `npm run check` → integrity OK. `npm run check:amendments` (same engine): value + quantity amendment → three-stage approval → apply → v1/v2 compare, ledger untouched, cut below consumed refused, second open amendment refused, stale refused, creator cannot approve, future-dated amendment applied by the demo date, expired contract renewed (lines 1..n, counters reset, one successor, predecessor closed as Renewed on activation), grace window, auto-renewal once, tamper detected — all pass. Browser: amendments and versions tabs of c-01, v1/v2 compare (3 differences), pending amendment detail (stage 2 of 3, buttons disabled for admin with the reason), renewals list with KPIs, editor with the counter floor error then a successful submit.

**Next step:** owner review, then module 5 «obligations-finance».
