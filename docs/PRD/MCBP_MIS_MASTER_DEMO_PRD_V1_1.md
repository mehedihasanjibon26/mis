# MCBP-MIS — MASTER PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Project:** MoWCA Mother and Child Benefit Programme Management Information System (MCBP-MIS) — Client-Facing Tender Demonstration  
**RFP:** SIMCBP-G-01A  
**Prepared for:** Riseup Labs / Demo Engineering Team  
**Document ID:** MCBP-DEMO-PRD-001-V1.1  
**Version:** 1.1 — clean implementation specification, fully mapped  
**Date:** 14 November 2026  
**Status:** Demo implementation baseline; source-derived requirements and explicitly marked demo assumptions; not a Government-approved SRS  
**Recommended codebase path:** `docs/MCBP_MIS_MASTER_DEMO_PRD.md`  

> **HIGHEST PRIORITY PRODUCT DIRECTIVE:** Deliver an **entirely frontend-only**, polished, client-facing, **fully navigable and logically functional**, role-based, geographically scoped, **English/Bangla bilingual** demonstration of all **14 proposed MCBP-MIS subsystems** and the relevant platform/assurance experiences. Use **100% fictional dummy data**, browser-local state, and deterministic mocks. **No backend, real database, authentication service, live government integration, real money movement, infrastructure control or production-security claims.** Keep **the exact original HTML/Codex design system** including its colors, fonts, component shapes, menu terminology, key screen sections and illustrative metrics. No feature or source screen is silently dropped. All unavailable real-world abilities must be represented as **clearly labelled simulations or evidence views**, never misrepresented as genuinely operational.

---

## 0. How to use this document

1. This file is the **single implementation contract** for demo work, not a production architecture specification. Read it before code generation, screen implementation or test design.
2. Trace functionality to the originating proposal via E-2 sections/RFP clauses and the incorporated **E-2 clause annex** and **E-8 coverage annex**. Trace original visual elements to the **Codex D01–D22 audit annex** and/or the actual HTML files.
3. **Conflict precedence:** (a) user-confirmed demo-only constraints; (b) E-2–E-8 proposal's intended behavior, scope and control restrictions; (c) original HTML/Codex visual specifications and illustrative values; (d) implementer UX choices only where originals leave a gap. Exact source facts cannot be replaced by fabricated production policies. Where proposal texts differ, identify both and use a safe mock choice with a documented note.
4. For each feature, differentiate **functional frontend simulation** (state transition) from **visual/informational simulation** (illustrative infrastructure/operational capability). Not every RFP service obligation is a UI feature.
5. The reference screenshots and ZIP HTML screens are **design constraints, not working application templates**. The source HTML is static; the new project must implement interactions without losing its visual identity.
6. If an explicit behavior is not specified in source, implement a sensible dummy behavior flagged as **Demo design assumption**; never present it as final MoWCA-approved policy.
7. Before marking a module complete: (i) verify both languages, (ii) verify its role and geographic scope, (iii) verify navigation, (iv) verify success/error/empty state, (v) verify cross-module propagation, (vi) verify no fake production claim, (vii) verify the source screen/requirement coverage list.

### 0.1 Evidence and completeness qualification

- Sources supplied: **E-2, E-3, E-4, E-5, E-6, E-7, E-8** (original DOCX), Proposal TOC, HTML ZIP (`index.html`, D01–D22, local fonts), and Codex's 1,169-line source-based UI inventory.
- **Original purchaser RFP Section VII and latest official addenda were not separately provided**; the proposal's E-8 checklist represents the bidder's response, not an independent legal/compliance certification.
- Codex's inspection was based on **HTML/CSS/SVG source**; a rendered browser pixel-by-pixel visual comparison remains a delivery QA task.
- The annexes preserve the source requirement and layout inventories to minimize omission, **but the created frontend cannot demonstrate real production security, throughput, government integration, backups or certification**.


### 0.2 Read order, ownership and requirement priority

**For Codex/dev:** Read Sections 0–9, 20–24, 17–18 first; use Annex A for exact E-2 requirement wording, Annex B for source statements, Annex C for all UI facts, Annex F for every mapped E-8 row. Do not paste or rebuild the annexes as standalone pages. The main body specifies implementation; annexes provide verification evidence.

**Mandatory test triad for every user action:** positive outcome; blocked/negative outcome; English/Bangla outcome. Verify actor ID, geography, data mutation, route, audit event, and reset consistency. Distinguish `Confirmed proposal rule`, `Reference UI fact`, and `Demo implementation assumption` in code comments or fixtures.

**No omission rule:** A source item may reuse an existing route, but it must have a traceable route/component, demonstration type, and acceptance evidence. Document any non-executable real-world capability with a simulated effect plus a visible disclaimer, not a dead button.

## 1. Product vision, objective, outcome

### 1.1 Product goal

Create a convincingly realistic demonstrator of MoWCA's integrated programme-management lifecycle: applicant intake → identity/eligibility checks → field verification → union selection and officer approval → unique beneficiary profile → benefit/payroll creation → maker-checker sign-off → simulated disbursement → reconciliation/failures and re-payment → training, ANC/PNC follow-up, complaints/referrals → graduation/exit → executive analytics/GIS/AI insights. Additional operations/admin consoles must connect to this story through shared dummy status/activity feeds.

### 1.2 What success looks like

- Client can start on a public portal or via UDC, complete a case, switch to relevant roles and **see the same case progress across modules**.
- Every visible relevant menu, action, filter, tab, modal, data row, export, language toggle and view has a **meaningful deterministic interaction**, not a dead decorative element; some infra buttons may demonstrate simulated outcomes and must be labelled.
- Client can demonstrate all **14 functional subsystems**, all **22 original E-3 HTML screens**, E-2's **30 figure references** and the platform's relevant E-4–E-8 assurance claims using functional or evidence-oriented views.
- UI matches the Codex audited original brand: exact palette, semantic status colors, Inter/Poppins/Hind Siliguri fonts, green header/sidebar, 14px cards, sidebar groups, precise available illustrative KPIs and datasets.
- **Global EN/বাংলা toggle** translates every navigable and transient interface, including system consoles, simulated AI results and generated documents where shown; preserves user language preference on reload.
- Frontend supports QR-code-accessible **stable public URL** with no login gate imposed by hosting; no production government data; reset button restores canonical scenario.

### 1.3 Explicit non-goals

- No production backend/database, server authorization, Keycloak deployment, real OTP/SMS/email/IVR/CTI, live NID/BDRIS/iBAS++/bank/MFS/GRS APIs, real Flutter binary, authenticated external user accounts, actual AI inference, live GIS servers, payment execution, analytics warehouse, X-Road security servers, Kafka/containers/Kubernetes, CI/CD run, immutable records, cryptographic signing, real encryption, real backup/DR, VAPT/SQTC certification or performance proof.
- Do not ask for or store real NIDs, sensitive maternal/child health information or bank details. All input defaults and validation use fictional records.
- No claim that frontend-only permission checks or local storage offer production privacy or access security.

### 1.4 Supported user surfaces

1. **Role demo entry:** classy, simple, non-dark-screen demo account chooser; selectable role and geographic scope. Demo-only label.
2. **Back-office web:** national/division/district/upazila/union and platform administration.
3. **Public portal:** mobile-first beneficiary experience, usable full-width in actual phone browsers, not only phone frame.
4. **Android simulated app:** native-like browser demo for field registration, visits, attendance, complaints, offline/sync.
5. **iOS simulated app:** executive KPIs, AI, grievance, GIS.
6. **Tablet supervisor** and adaptive executive interface.
7. **Technical/assurance consoles:** D10–D22 with stateful simulation/evidence experiences.

## 2. Delivery constraints and architecture — frontend only

### 2.1 Recommended frontend

- Next.js + TypeScript + React, Tailwind CSS or scoped CSS tokens consistent with supplied HTML. **Static export** (`output: 'export'`) preferred for simple Netlify/static hosting, with no API routes/server actions.
- Source of truth: typed seeded data modules + a single browser-local application store; use `localStorage` with versioned schema for persistence, and optional in-memory actions. Use an explicit `Reset Demo` and optional scenario presets.
- Store state in the user browser: **do not imply cross-browser or cross-device synchronization**. Mobile/desktop demonstrations under one origin and browser profile share persistence; different devices are independent unless manually reseeded. Enable screenshots and walkthroughs without internet dependencies.
- Deterministic timers/mocks for verification, sync, payroll progress, SLA clock, AI suggestions, alerts, pipelines and backup restore. Use controlled demos; no uncontrolled random outcomes.
- No third-party tracker or public telemetry of entered data. All sample records fictional.

### 2.2 Canonical state modules

`sessionDemo`, `users`, `roles`, `geoScope`, `schemes`, `applicants`, `applications`, `verificationChecks`, `fieldVisits`, `consents`, `eligibilityResults`, `selections`, `quotas`, `beneficiaries`, `households`, `healthCompliance`, `paymentRules`, `payrollCycles`, `payrollItems`, `settlementEvents`, `repaymentCases`, `trainingSessions`, `attendance`, `learningContent`, `certificates`, `grievances`, `systemUseGrievances`, `helpdeskTickets`, `calls`, `referrals`, `notifications`, `apiDefinitions`, `apiRequests`, `partnerConnections`, `retryQueue`, `analyticsDatasets`, `kpiDefinitions`, `savedReports`, `dashboards`, `campaigns`, `gisLayers`, `gisFeatures`, `aiAgentRuns`, `aiConversations`, `configurationVersions`, `formDefinitions`, `workflowDefinitions`, `bulkJobs`, `migrationJobs`, `auditEvents`, `platformEvents`, `pipelineRuns`, `securityAlerts`, `backupJobs`, `releasePlans`, `loadTestScenarios`.

Every entity must have stable ID, timestamps, owner/geo/scheme where applicable, status enum, and demo provenance. Derived metrics must have one canonical calculator rather than inconsistent hard-coded totals. **Reference numbers are large national illustrative baseline snapshots; active scenario transactions are a small delta**, not a recomputation of millions of individual browser objects.

### 2.3 Persistence, isolation, idempotency

- Initial fixture version `demoSeedVersion`; on first visit, seed all roles and curated scenarios. If seed schema changes, migrate/reset safely with a clear notice.
- Each event has unique deterministic ID. Repeated clicking Submit, Approve, Repay, Import, Sync, Publish must not double-create records; disable during pending animation and enforce current-status guards.
- `Reset Demo` requires confirmation; resets all local data, audit trail and scenarios to canonical seed; preserves language unless user opts otherwise.
- `Switch Role` retains the shared application store and current language. Route to newly permitted dashboard; do not expose previous user's unauthorized content.
- Browser local state can be edited manually; describe RBAC as **demo-enforced**, not security-resistant.

### 2.4 Every route has standard behavior

Global layout: header/search/logo/EN|বাংলা/notification bell/role switch/profile/demo badge; role-filtered sidebar, breadcrumbs, heading/subtitle, relevant primary action, metric cards, tables/charts/maps, contextual details; helpful empty/loading/success/error states; quick access to Scenario Guide and Reset Demo. Actions show toast and audit record; if a permission or prerequisite fails, show a specific explanation.

## 3. Hard design constraints — preserve original Codex and HTML

### 3.1 Exact color tokens

| Token | HEX | Usage |
|---|---|---|
| Brand dark green | `#004B37` | Header/logo/sidebar anchor |
| Brand primary green | `#006A4E` | Primary CTA and active nav |
| Accent magenta | `#C2185B` | Accents, select statuses, callouts |
| Page background | `#F3F5F4` | Entire light app canvas |
| Desktop mockup background | `#DDE3E0` | Showcase/mockup background |
| Card surface | `#FFFFFF` | Cards, panels, modals |
| Border | `#E1E7E4` | Standard outlines |
| Secondary border | `#D5DED9` | Secondary separators |
| Main text | `#111111` | Primary foreground |
| Muted text | `#333333`, `#444444`, `#5B6660` | Secondary labels |
| Green status bg | `#E4F1EC` | Success, completed |
| Magenta status bg | `#FBE7EF` | Magenta-status context |
| Amber status bg | `#FCF3DC` | Warnings/pending |
| Blue status bg | `#E6EEF8` | Informational |
| Purple status bg | `#EEE9F5` | Secondary workflow |
| Neutral status bg | `#ECEFED` | Neutral/inactive |

Header gradient **exact**: `linear-gradient(90deg,#004B37,#006A4E)`. Do not introduce a new dark interface, unrelated hue palette, or generic AI-dashboard aesthetic. Use existing source-derived colors for all module extensions. Ensure text contrast even when status backgrounds are used.

### 3.2 Exact typographic/layout baseline

- **Inter:** English body/labels/tables/controls, weights 400/500/600/700.
- **Poppins:** heading, logo/brand and KPI numbers, weights 500/600/700.
- **Hind Siliguri:** Bangla, weights 400/500/600/700; keep corresponding metrics and layout intact.
- **DejaVu Sans Mono:** monospaced codes/IDs/log excerpts.
- Original desktop reference **1440 × 880px**, top header **64px**, sidebar **232px**, content padding **18px 22px**, cards **14px** radius, buttons and sidebar items **9px** radius; main title **24px**, KPI **27px**, card headings **~15.5px**, body **13–14px**.
- **These are fidelity targets, not fixed viewport restrictions**. Convert to responsive CSS; avoid clipping/overflow. For client presentation, improve readability gently while keeping visual identity and spatial hierarchy. Original Android device reference **392 × 820px** (camera cutout, dark shell, rounded corners); iOS notch; mobile bottom navigation.
- White light surfaces dominate. Original green header, sidebar groups, cards, compact tables, status pills, inline SVG-like chart language and original icon family should be recognizable.
- Preserve exact labels/titles/illustrative values where referenced; new functional screens use matching structure and tokens. Show bilingual exact semantic equivalents rather than rigid same-length text.

### 3.3 Screen fidelity policy

- D01–D22: every original title, section, KPI, table header, chart, key sample row, control and special scenario must map to an implemented screen. Track no missing controls in acceptance matrix.
- E-2 Figure references: all **30 functional reference screenshots** must have a matching functional/visual experience. Some are paired EN/BN and may map to a single toggleable route, not two duplicated routes.
- Never replace one dense original console with an empty generic grid. Use actual sample values and information hierarchy from Codex annex.
- User role determines which nav entries appear; preserve original nav taxonomy for eligible roles.

### 3.4 Responsive and accessible

- Desktop ≥1280: left sidebar 232px and wide data panels; tablet 768–1279: collapsible sidebar/rail; phone ≤767: drawer/bottom nav/cards and stackable tables; phones must be usable without horizontal viewport overflow.
- Public portal is true mobile-first page, not only mockup in desktop canvas. Simulated Android/iOS showcase optionally has phone frame on desktop; phone browser drops unnecessary frame and fills viewport.
- Minimum 44×44px touch targets where practical; proper labels/tab order/focus states; keyboard navigation; accessible contrast; avoid relying solely on color for statuses; charts get readable values/table alternatives.
- Low-bandwidth demo: local fonts and assets, lightweight SVGs, no required remote dependency. Show source-specific 2G/86KB note as **reference illustrative claim**, not measured performance.

## 4. Global bilingual localization — absolute acceptance gate

- A persistent **EN | বাংলা** toggle in all web, public, mobile and technical surfaces. Switch in place without losing entity, route, filter, form step or pending action. All role screens, menu groups, submenu labels, breadcrumbs, dashboards, forms, table headings/cells with translatable statuses, chart axes/legends, map legends, errors, confirmation dialogs, tooltips, help, notifications, audit event descriptions, documents/exports, scripted AI content and technical console explanatory labels have both languages.
- Translation keys must cover common UI plus each subsystem; no raw English hardcoded in a Bangla-labelled screen except stable official brand/acronym/technical IDs or deliberately bilingual name fields.
- `Intl.NumberFormat('bn-BD')` or explicit localized numeral formatting for Bangla numeric UI; dates `bn-BD` in appropriate human-facing formats; **never translate/corrupt IDs, API paths, hashes, version numbers, machine-readable exports or reference keys**.
- Bangla typography Hind Siliguri; avoid line breaks/text clipping; handle long Bangla labels, placeholders and mobile navigation.
- User's language preference preserved across refresh and role switch. Simulated AI answers and notification messages use same selected language. Individual applicant names can use separate `nameEn` / `nameBn` seed fields.
- Translation parity test enumerates *every* route, dialog, error condition, permission denial, export heading and mobile state; switching back and forth does not reset workflow state.

## 5. Demonstration RBAC, geographic hierarchy and accounts

### 5.1 Role inventory and user journeys

| Demo role | Geographic scope | Start screen | Core actions |
|---|---|---|---|
| Public applicant/beneficiary | Own fictional case | Public portal | Apply, consent, track, profile/payment, grievance |
| UDC Operator / Assisted Intake | Assigned union | Assisted intake | Create, save drafts, submit assisted with consent, view local applications |
| Field Verifier | Assigned union/upazila | Android field home | Assigned visits, offline checks, photo/GPS mock, sync, attendance, grievance |
| Field Supervisor | Assigned upazila/district | Tablet | Team status, conflicts, assign/review, overdue visits |
| Union Committee Maker | Assigned union | Selection preparation | Review evidence, prepare shortlist, recommend with reason and quota context |
| UWAO Checker | Assigned upazila | D01 officer home | Review case, approve/reject/return, OTP demo, quota control, beneficiary lookup |
| District/Divisional Officer | District/division | Regional dashboards | Oversight, escalations, authorised approvals, reports |
| Finance Maker | Finance geographic/central scope | Payroll workspace | Calculate, validate, prepare/suggest adjustments, submit payroll/re-payment |
| Finance Checker | Finance geographic/central scope | Checker queue | Independently review, enter dummy OTP, approve/reject/return |
| Training Officer | Assigned jurisdiction | Training | Schedule, enroll, upload demo content, attendance and certificate |
| GRS Officer | Jurisdiction/assigned queue | Grievance | Assign/investigate/resolve/escalate complaint |
| Helpdesk/CRM Agent | Assigned queue | Agent desk | Dummy inbound call, ticket, knowledge base, referral |
| Programme Executive / PD/PMMCU | National | Executive dashboard | Aggregate KPIs, map, reports, AI review; no payment authorisation |
| Data/GIS/AI Steward | Assigned privileged domain | Governance consoles | Mock quality, GIS layer and AI output review, approve as separate checker |
| System Administrator | National/admin | User management | Demo accounts/roles/geo scopes/config/flags/audit |
| Platform Operator / DevOps / Security / QA | Platform view | D10–D22 | Console simulations and explanatory evidence |
| Scheme Administrator/Checker | National/config | Multi-scheme | Configure, simulate, submit, independently publish/roll back |

**Policy:** demo role definitions are representative; final production permission matrix would be SRS-approved. Never let an actor both make and approve the same controlled decision, even by switching role while retaining the same actor ID.

### 5.2 Geographic scope and cross-role view

Geography hierarchy: Bangladesh → division → district → upazila → union / pourashava / city corporation → ward where applicable; use BBS-aligned *fictional/mock* geographical mapping. Officer can see only assigned descendants; national executive sees aggregates. Mask fields irrelevant to role. Active role and jurisdiction prominently shown in header. A role-switch demonstration must preserve the single case history but deny actions outside scope with explicit bilingual explanatory message.

### 5.3 Permission model

Capabilities: `view`, `create`, `edit`, `submit`, `verify`, `recommend`, `approve`, `reject`, `escalate`, `configure`, `publish`, `export`, `unmask_demo`, `simulate`. Permission decision depends on **role × geographic scope × record status × maker-checker separation × scheme**. UI hides disallowed features where appropriate and guards direct route/action dispatch. Demo denial is not secure authorization.

### 5.4 Sign-in/MFA and audit simulation

- Demo account quick login by role with no real password/OTP provider; optionally PIN keypad or OTP modal accepting a clearly labelled *demo code* and/or click-to-fill.
- Privileged role actions require dummy confirmation. Login lock, suspend, expire, temporary accounts, CAPTCHA and unusual access notifications can be simulated from seed scenarios.
- Audit feed records actor ID/role/area, action, record ID, before/after, timestamp and decision/reason. Label as **simulated audit log**, never immutable cryptographic evidence.

## 6. Cross-module lifecycle, statuses and safeguards

### 6.1 Main beneficiary story

1. Start public/assisted application → 5-step form with consent and household/pregnancy/GIS details → draft/autosave and submit.
2. Simulate NID & BRN provider success, mismatch or service-down retry → eligible/ineligible with reason codes and duplicate/Single Registry check → queue field visit.
3. Field Verifier captures checklist/photo/GPS/time while demo-offline; later syncs; supervisor resolves conflicts; case appears in officer queue.
4. Union maker prepares selection with ranked evidence and quota position; UWAO or authorized district checker reviews, enters demo OTP, approves/rejects/returns (AI score never decides).
5. Approved application receives unique Beneficiary ID and geo-scoped profile and lifecycle history.
6. Finance maker calculates period entitlement (MCBP default Tk 850 per month up to 36 months, configurable scheme rules), validates and submits; different finance checker signs; batch and partner payment simulation generate paid/bounced results.
7. Reconciliation flags bounce-back, sends dummy notifications, opens correction and maker-checker re-payment. Profile/payroll/GRS/dashboard values update together.
8. Training enrolls beneficiary; attendance/assessment/certificate; ANC/PNC context shows as fictional compliance; grievance/helpline/referral activities attach to same profile.
9. Transfer/status change/exit/graduation decisions require authorization; archive/retention/erasure flows are simulated with audit and anonymized aggregates.
10. National dashboard, GIS, AI, Data Hub and technical consoles reflect scenario events or clearly labelled static scale indicators.

### 6.2 Canonical status machines (demo assumptions where source does not enumerate strings)

- **Application:** `draft → submitted → identity_pending / identity_verified / identity_exception → eligibility_passed / eligibility_failed → field_pending → field_completed / conflict_review → selection_prepared → approval_pending → approved / rejected / returned → enrolled`. Store reason/history; no skip through required field and consent checks.
- **Beneficiary:** `active → suspended / transferred / correction_pending / exit_pending → exited / graduated → archived → erasure_review / erased_demo`. Preserve anonymized aggregate counts.
- **Payroll:** `draft → validated → maker_submitted → checker_pending → checker_approved → submitted_to_partner_mock → processing → paid / bounced / partial → reconciled / exception → correction_pending → repayment_pending → repaid`.
- **Grievance:** `received → triaged → assigned → investigating → resolved → closed`; exceptional `escalated / reopened`. System-use grievance separate type/queue.
- **Training:** `draft → scheduled → invited → in_progress → completed → certified` with attendance and feedback.
- **Field sync:** `local_draft → queued → syncing → synced / conflict → resolved`; mock conflict types office-vs-device value and approved-while-offline.
- **Governed change:** `draft → validated → submitted_for_review → approved → staged → published / rejected → rolled_back`.
- **AI run:** `requested → drafted → human_review → approved / edited / rejected → simulated_action_logged`.

### 6.3 Strict human control rules

- AI does **not** approve/reject applicant, change eligibility, approve payroll, initiate real/fictional payment without human checker, or edit protected master data autonomously.
- Maker and checker must be distinct actors; every consequential approval logs reason/OTP simulation.
- Union quota checked at approval; no bypass from bulk upload, AI, or mobile sync.
- Do not finalize application if privacy consent missing.
- Duplicate checks at application, approval and payroll; show explainable warnings/exceptions, not silent deletion.
- Integrations can fail: capped 3 retries/back-off and `verification pending`; do not silently mark verified.

## 7. Functional requirements by subsystem

Each FR below is a demonstrable interaction. The **original proposal's clause-by-clause text is reproduced in Annex A** for exhaustive detail; E-8 original checklist in Annex B covers further non-functional/service obligations.

### SS01 — Beneficiary application, verification, selection, enrollment
**Source:** E-2.4.1 / RFP 1.2.3; E-2 Figures E2-35–38. **Roles:** applicant, UDC, field verifier, union maker, UWAO/district checker.

**Views:** Public portal home; multi-step self-application EN/BN; assisted intake; bulk intake link; application list/detail; identity verification; eligibility screening queue with rule reasons; duplicate review; offline field assignment/checklist; selection and quota workspace; maker/checker OTP modal; decision timeline; beneficiary ID confirmation.

**Required behaviors:** Create/update draft; NID mock pre-fill name/DOB; pregnancy/child BRN details; household socio-economic fields; GIS pin; optional documents; versioned privacy notice and mandatory consent; submission receipt and SMS preview; OTP sign-in demo; validations and masked NID; EC/BDRIS simulated success/failure/timeout and three-retry queue; Single Registry check; versioned deterministic eligibility rules and failed reason codes; duplicates across NID/BRN/mobile/wallet; assign field visit; record offline checklist/photo/GPS/time; supervisor resolve conflict; union shortlist and quota; checker independently approves/rejects/returns with OTP; ID created once at approval; location hierarchy and profile created; cross-module audit and notifications.

**Seed cases:** Moriom Begum, `APP-2611-00447`, NID ending `4471`, scheduled field check; a clean approval case, a duplicate, an ineligible case, pending BDRIS outage, an over-quota union, and a failed GPS/photo input. **Acceptance:** one case can move across 5 roles from draft to enrolled; all negative states can be triggered/reset.

### SS02 — Beneficiary profile management
**Source:** E-2.4.2 / 1.2.4; Figures E2-40/41. **Views:** profile list/search, 360° beneficiary profile tabs, timeline, corrections/transfer/exit/graduation, archive/erasure, audit.

**Required behaviors:** Unique Beneficiary ID across all modules, 36-month progress; personal/household/geo; identity and consent, children/pregnancy; payments including bounced-and-repaid month; DGHS-style simulated ANC/PNC compliance; training/certificates; grievances, referrals; role and area filtering, field masking; edit request with before/after and maker-checker; transfer under approved geo permissions, suspension/graduation/exit, configurable retention/archive and simulated erasure while maintaining anonymous stats. **Acceptance:** update from payroll/training/GRS appears on the same profile, never duplicated.

### SS03 — Benefit calculation, payroll, payment tracking, reconciliation
**Source:** E-2.4.3 / 1.2.5; Figures E2-43/44 and ZIP D17. **Views:** benefit rules, payroll cycle list/new cycle, division partitions, validation/errors, approval and OTP, mocked SPBMU/iBAS++/MFS/bank messages, transaction detail, settlement file upload, reconciliation dashboard, exception correction, repayment queue, download audit pack.

**Required behaviors:** Default Tk 850 × eligible monthly periods up to 36; configurable durations, schemes, arrears and exclusions (demo rule versions); calculate from seeded population + case deltas; no double-pay cycle; prevalidation wallet/NID/36-month flags; maker generates and submits; other actor checker approves; simulate signed file/API submission without actual network; statuses paid/bounced/pending, reference IDs, dates, sources; reconcile API callbacks and generated/imported CSV; mismatches flagged with reason; simulated SMS and field office notification; correction request and re-payment need checker; audit hash mock clearly labelled illustrative; pause/resume/abort mock progress; percent and division totals update; preserve D17 exact original initial KPI snapshot (`1,895,010` eligible, `1,777,870` processed, etc.) in **Baseline Demo Scenario** and show when scenario alters it. **Acceptance:** failed payment→correction→checker→repaid reflects profile, GRS, dashboard and payment table.

### SS04 — Training management
**Source:** E-2.4.4 / 1.2.6; Figure E2-46. **Views:** weekly calendar by union/venue/topic, create session, participants, QR/ID mobile attendance, content library (flipbook/video/guide mock), pre/post assessment/feedback builder, certificate, reports.

**Required behaviors:** schedule and invite by geo or target cohort; SMS preview; mark attendance online/offline; simple scanner simulation accepts fictional QR/code; offline queue to sync; pre/post score and feedback forms; completion rule and bilingual PDF/print certificate mock; add completion to profile, dashboard KPI area F and exports; content offline download indicator. **Acceptance:** completion and certificate persist after reload and show in profile.

### SS05 — Grievance redress and system-use GRM
**Source:** E-2.4.5 / 1.2.7; Figures E2-48/49. **Views:** public complaints/appeals/questions, anonymous misconduct option, complaint register, filters by category/status/SLA, detail/history, assignment, resolve/escalate/reopen, national GRS exchange mock, separate system-use GRM, analytics.

**Required behaviors:** four primary categories payment, selection appeals, misconduct/fraud, service issues, nested subtypes; multiple intake channels (web, mobile, UDC, call, mock national GRS); unique case ID, notification preview, assignment rule by area/category, due-date/SLA display, escalation on overdue (demo clock), attachments/notes/history, resolution validation, reopen, anonymous protection mock, link transaction/profile where appropriate; system-use data errors/access/glitches in distinct queue linked helpdesk; quarterly problem themes/backlog mock. **Acceptance:** `GRS-2611-0872` fictional bounced wallet case can be investigated and closed once re-payment completes.

### SS06 — Secure Data Hub / API Bank
**Source:** E-2.4.6 / 1.2.8, E-3.3, E-7; ZIP D10/D11. **Views:** API catalogue/developer details, gateway traffic/latency/success/rate limit, route/consumer configuration, X-Road subsystem/partner page, partner health, retry and dead-letter queues, message logs, mapping, integration sandbox, bulk fallback and joint test evidence.

**Required behaviors:** simulated routes for EC NID, BDRIS BRN, DGHS, DGFP, SPBMU/iBAS++, MFS, banks/gateway, National GRS, Single Registry. Support mocked REST JSON/XML, auth/rate limit metadata and X-Road statuses (visual only); register API in demo catalogue, inspect request/response sample, simulate failed partner and retries 1/2/3 then pending/fallback; replay queue and view log; canonical schema sample and controlled file exchange; mock owner/service agreement/testing register. Do not claim live calls or real security server. **Acceptance:** simulated BDRIS outage causes affected application identity pending and raises retry/observability signal.

### SS07 — Monitoring, Evaluation, dashboards, self-service MIS & reporting
**Source:** E-2.4.7 / 1.2.9; Figures E2-54–57; ZIP D01–D03/D08. **Views:** role-home dashboards, national executive intelligence, nine-area KPI catalogue A–I, trend charts, time/area/scheme filters, standard report library, ad-hoc query, saved views, no-code dashboard builder, scheduled exports, AI advisory tile, SMS/email campaign hub.

**Required behaviors:** preserve core national baseline figures; update scenario-affected deltas; drill national→division→district→upazila→union as permission allows; filter time/geo/scheme without blank reset; KPI definitions/formulas/source/refresh notes; tables/export CSV and client-side PDF/print where feasible; report designer selects approved Tier-2 mock datasets, charts/widgets/formulas, preview, submit/publish via maker-checker; privacy suppression of aggregate groups <10; campaign audience/template (Bangla/English), preview, approval, schedule/send simulation/delivery summary; exception monitor for shared mobile, overdue verification, graduation and bounce-backs. **Acceptance:** selected time/geo changes related chart/table, generated report has selected parameters, live case delta shows in appropriate summary.

### SS08 — GIS intelligence & spatial analytics
**Source:** E-2.4.8 / 1.2.10; Figures E2-59/60, ZIP D08/D19. **Views:** Bangladesh division choropleth, drill-down regions, layer selector, legend, search, map pin, beneficiary location capture, heatmaps/clusters, polygon/radius selection mock, GIS catalogue/version/promotions, reconciled totals.

**Required behaviors:** client-side GeoJSON/mock boundaries where feasible (source includes no GIS shape assets); stable division coverage sample: Rangpur 82, Mymensingh 74, Sylhet 61, Rajshahi 79, Dhaka 88, Khulna 77, Barishal 71, Chattogram 84; filters cascade to charts; layer toggle coverage/applications/payments/grievances/health facilities/underserved/field points; low-density suppression; hover values, legend, tooltip, zoom, breadcrumb; simulate approval of layer promotion separately from layer author; display last reconciliation vs reports =0 when unchanged; no continuous tracking. **Acceptance:** map selection updates contextual KPI and spatial list in both languages, with privacy suppressions.

### SS09 — Agentic AI, embedded bilingual assistant & governance
**Source:** E-2.4.9 / 1.2.11; Figures E2-62–64; ZIP D08/D18. **Views:** assistant chat, suggested sources and charts, four agent cards (Data Collection / Report Generation / Alert / Calculation), runs/history, review queue, model registry/guardrails, simulated agent execution log and decision.

**Required behaviors:** deterministic scenario-driven answer templates (no actual LLM), in current language, for bounce-back, payment exception, grievance volume, coverage, verification backlog, beneficiary lookup limited by role; if unsupported, show honest not-available response; source & refresh stamp; export/preview report where appropriate; run agents and generate proposed result with masked data; named human reviewer approve/edit/reject; no autonomous approvals/payments/master data edits; Calculation Agent uses deterministic seeded formulas, never pretend language model computed money; show prompt injection or out-of-scope refusal as mock; AI governance metrics (92.1% Bangla accuracy, 100% sources, GPU etc.) clearly **illustrative baseline**. **Acceptance:** pressing Accept can create a suggested draft notification/report **only after** human action; never directly authorizes payment.

### SS10 — Mobile Android/iOS and field support
**Source:** E-2.4.10 / 1.2.12; Figures E2-66/67; ZIP D04–D09. **Views:** Android demo sign-in PIN/biometric mock, field home/assignments, offline verification/photo/GPS mock, assisted registration, attendance/QR mock, grievance form, sync centre/conflict, supervisor tablet, iOS executive KPIs/assistant/grievance/coverage; beneficiary self-service.

**Required behaviors:** toggle simulated online/offline; draft edits while offline go to persistent local queue; sync button replays queued transactions deterministically; conflict types office value vs device and approved-while-offline; pick `Keep office value` or `Send mine for review` (second creates supervisor review); show real queued count, completed visits, photos, last sync; compressed image/file size only as mock; GPS demo coordinate/time mocked with explicit label; app PIN/biometric is demo only; proper responsive phone layouts, usable without iframe. **Acceptance:** save offline→switch online→sync→supervisor resolves→officer sees result; same for EN/BN.

### SS11 — User management, access control and security workflow
**Source:** E-2.4.11 / 1.2.13, 1.4; Figure E2-69; ZIP D14. **Views:** user directory, role permission matrix, jurisdiction/device binding, demo login audit, account lifecycle, privileged action confirmation, security events, role switching.

**Required behaviors:** create/edit/suspend/lock/expire/reactivate fictional demo user; assign role + geo scope + scheme; permission preview and effective navigation; demo MFA/OTP for controlled actions; password policy/CAPTCHA/inactivity scenarios as mock; mask/unmask sensitive seeded values under permission; actor action logs and suspicious patterns (bulk downloads/unusual logins) into D14; preserve separation-of-duty. **Acceptance:** restricted union user cannot access/approve another union's case; national executive can view aggregate but cannot approve finance.

### SS12 — Helpdesk, helpline/CRM and referral management
**Source:** E-2.4.12 / 1.2.14; Figure E2-71; ZIP D08 grievances. **Views:** call-pop CRM agent desk, matched beneficiary/profile, call log, auto-created ticket, categories/severity/SLA, knowledge search, assignment/escalation, email/phone case simulation, referral creation/acceptance/service follow-up/outcome.

**Required behaviors:** one-click simulated incoming call and fictional caller match, auto-populate ticket (not real CTI/IVR), related profile/grievance links, issue notes, KB suggested article, ticket status and priority, timer and severity-based SLA; simulate referral to DGHS/DGFP/support service, provider accepted/closed, follow-up reminder and profile timeline; separate MIS technical helpdesk requests. Present critical SLA example acknowledge 15min/workaround 4h/resolution 8h as proposed standard, not a test of real support service. **Acceptance:** mock caller→ticket→referral→closed updates beneficiary timeline and support KPI.

### SS13 — Dynamic module creation and governed bulk exchange
**Source:** E-2.4.13 / 1.2.15; Figures E2-73–75; ZIP D21. **Views:** no-code form builder, bilingual field/property editor, conditional validation, workflow/BPMN visualization, versioned decision/rule table, module/KPI/report/GIS/API mapping/template registry, validation, approval/promote/rollback, CSV/Excel sample import/export with row exception table and reconciliation.

**Required behaviors:** form fields add/edit/remove, text/select/date/number/checklist/calculated read-only; EN/BN labels, preview, save version, validation; drag/step-wise workflow editor or meaningful frontend node editor, transition checks, approval path; import fictional CSV, validate required fields/type/geography/duplicates, show accepted/rejected row counts/reasons, download error report, maker submit, checker approve and commit; seven-day reversible commit represented by demo clock; publish config only after independent checker and environment selection. **Acceptance:** create one new field verification checklist field, publish under checker, open field verification to see it; import batch updates relevant list only after approval.

### SS14 — Multi-scheme extensibility
**Source:** E-2.4.14 / 1.2.16; Figure E2-77. **Views:** active scheme catalogue, **eight-step wizard**, target group, eligibility, quotas, amount/frequency/duration, forms, approval chain, mock payment channels, permissions and reporting, projected cost/impact simulation, test sample cohort, submit/publish.

**Required behaviors:** create draft scheme independent of MCBP; reuse core identity, profile, payments, grievance, hub and security modules; show per-scheme rules, quotas, reports; scheme simulation computes cost using deterministic sample counts; validation and maker-checker for launch; rollback or deactivate; language translations for all scheme labels. **Acceptance:** create and approve sample new scheme; selector reveals it in relevant modules without corrupting MCBP seed.

## 8. Supporting operational, assurance and delivery demonstrations (E-3–E-8)

### 8.1 Platform consoles D10–D22

- **D10 Gateway:** preserve requests/min 11,482; p95 412ms; 0.03% errors; published APIs 46; route catalogue; quota panels; mock register/try API.
- **D11 X-Road:** 2/2 healthy, 182,440 signed messages, 4 subsystems; partner connectivity, retry queues including 1,284 BRN pending; mock fail/retry, log view.
- **D12 Observability:** 99.96% availability, p95 412ms, 7,812 sessions; service health, synthetic checks, warning and alert detail; incident mock and correlations.
- **D13 CI/CD:** 38 pipelines, release 1.8.0-rc2, 1,842 unit passes, 86% coverage; quality gates, recent runs, mock pipeline, block on failed gate.
- **D14 Security:** 7 alerts, 318 failed logins, privileged MFA 100%, 98% patch; SIEM, investigations, vault/key, audit and demo incidents; avoid real-security implication.
- **D15 Backup/DR:** 118GB last full, 4.1GB incremental, lag 8s, restore 52min, DR RTO 3h12m; backup schedule, job history, retention; simulated restore/failover drill only.
- **D16 Data Governance:** quality score 96.8%, 24/24 aggregates, 3,412 suppressed cells, zero Tier variance, 6 erasure requests; quality rule details, access logs, review approve/reject, privacy safeguards illustrative.
- **D17 Payroll Monitor:** 1,895,010 eligible and seeded division partitions, progress 93.8% baseline, 574rec/s, pause/abort/rollback, maker/checker separate, validations and flags; mock state updates.
- **D18 AI Governance:** 92.1% Bangla answer accuracy baseline, agent runs, model registry, guardrails, decision queue, audit; approval queue linked SS09.
- **D19 GIS Layers:** catalogue, coverage, 14 production layers, tile p95 0.9s, promotions and no continuous tracking; mock approve/reject.
- **D20 Capacity:** 212/418 vCPU, 884/1616GB memory, 96 pods, autoscaling 72–180, nodes, utilization, storage forecasts; simulated what-if and explanatory status only.
- **D21 Environments/Releases:** development/testing/staging/training/production/DR; 148/148 requirement traces, 2,410 tests passed, 0 high/critical; next rollout Sunday 22 Nov 22:00–23:00, 10% canary, rollback thresholds 0.5% errors/1.5s p95; mock approval/promotion, version/drift view; keep original dates as **fictional reference scenario**, not actual current release planning.
- **D22 Performance:** 10,000 virtual users; 20,640 API calls/min; p95 742ms; 2.4s page p95; 0.04% errors; load/scenario rows; simulated export/view logs; **explicit illustrative results disclaimer**.

**For every console:** link its relevant domain event into the cross-module activity feed where sensible, but do not fake operational evidence from a frontend mock. Surface `DEMO / SIMULATED DATA` discreetly and consistently.

### 8.2 Data migration and knowledge transfer — E-6

Provide a frontend **Migration & Reconciliation Showcase** (may live under Data Governance/Platform Operations): legacy profile data quality, NID duplicates, BRN gaps, inactive wallet, name mismatch, orphan payments; mapping configuration preview; sample files and row-level validation; staged mock dry runs (three) and cut-over rehearsal; migration job stepper, 100% record-count reconciliation target and ≥99.5% field accuracy *as proposed acceptance targets*, exception workbench (no auto-cleansing identity/payment changes without human checker), 48h weekend freeze, six-month read-only legacy concept, rollback button (visual only), masked data and audit. Include knowledge-transfer views: audience/training/ToT, 12×25 batches=300, documentation, National Source Code Repository, handover checklists/clean rebuild evidence as informational content—not executed infrastructure.

### 8.3 Delivery stages and testing — E-4/E-5

Optional **Delivery Evidence / About Solution** views should show the full proposed implementation schedule without implying the demo has completed it: eight stage gates G0–G7; weeks 1–36 to go-live; support months 10–21; 11 biweekly sprints from W11–W32; 8-location pilot; test types (unit/contract/E2E/load/security/AI/GIS/usability/DR); performance targets; training; deployment/handover; seven workstreams/illustrative team responsibility matrix. E-5 personnel/name placeholder entries must NOT be presented as verified staff unless source actually names them. Use role/team structure rather than fabricated CVs.

### 8.4 E-7 interoperability confirmation

Provide integrations diagram/list with all source-named agencies and responsibility scope; internal shared services, canonical data model, mock partner success/failure, mock interface control docs, joint test sign-off preview. Do not connect to real endpoints or claim partner approvals. Clarify counting discrepancy: E-2 summary uses '10 integrations' while E-3/E-7 designs group 'nine' partner adapters; list explicit partners individually and label grouping assumption.

### 8.5 E-8 full technical responsiveness

Treat every E-8 checklist row in Annex B as a tracked deliverable: classify each as **Interactive Demo (I)**, **Visual/Informational Evidence (V)**, **Not executable in browser (N)**; assign feature owner(s) and link target route(s) during implementation. E-8 compliance assertions are proposal statements, not verified operational outcomes. No row may silently disappear even where multiple rows share one screen.

## 9. Sidebar, routes and information architecture

### 9.1 Preserve the existing original menu taxonomy

**BENEFICIARY LIFECYCLE:** Applications & enrollment; Beneficiary profiles; Payroll & reconciliation; Training; Grievance redress.  
**INTELLIGENCE:** Executive dashboard; GIS intelligence; AI assistant & agents; Self-service MIS.  
**PLATFORM:** Data Hub / API Bank; Helpdesk & referrals; Module & scheme builder; Users & access.  
**PLATFORM OPERATIONS:** Observability; Capacity & autoscaling; API gateway; X-Road exchange; CI/CD pipelines; Environments & releases.  
**ASSURANCE:** Security centre; Backup & DR; Data governance; AI governance.  
**WORKLOADS:** Payroll batch monitor; GIS layer catalogue; Performance tests.

Do not delete or rename original sidebar labels. Add necessary subroutes under relevant existing groups (e.g., Migration & Reconciliation under Data Governance; Campaign Hub under Self-service MIS; GRM under Grievance redress; Role Accounts under Users & access) without losing original hierarchy. Role gates determine visibility. The original `All screens/Previous/Next` can remain in **Reference Tour mode**, not be confused with actual MIS workflow navigation.

### 9.2 Route specification (suggested; preserve intent not exact URL strings)

| Path | Surface / scope | Subsystem / reference |
|---|---|---|
| `/` | Role demo landing/guide | all |
| `/demo/tour` | index cards and references | ZIP index |
| `/portal` `/portal/apply` `/portal/track` `/portal/payments` `/portal/grievance` | public/beneficiary | SS01,02,05; D04/D05 |
| `/app/officer/home` | upazila officer | D01/D02 |
| `/app/applications` `/app/applications/[id]` `/app/eligibility` `/app/selection` | applicant-to-approval | SS01, E2-35–38 |
| `/app/beneficiaries` `/app/beneficiaries/[id]` | 360° | SS02 |
| `/app/payroll` `/app/payroll/[id]` `/app/reconciliation` `/app/repayments` | finance | SS03; D17 |
| `/app/training` `/app/training/[id]` | training | SS04 |
| `/app/grievances` `/app/grievances/[id]` `/app/system-grm` | GRM | SS05 |
| `/app/data-hub` `/app/integrations` `/app/api-catalog` | interoperability | SS06; D10/D11 |
| `/app/executive` `/app/reports` `/app/dashboard-builder` `/app/campaigns` | dashboards | SS07; D03 |
| `/app/gis` `/app/gis/layers` | GIS | SS08; D19 |
| `/app/assistant` `/app/agents` `/app/ai-governance` | AI | SS09; D18 |
| `/mobile/android` `/mobile/ios` `/tablet/supervisor` | mobile/tablet | SS10; D06–D09 |
| `/app/users` `/app/roles` `/app/audit` | RBAC | SS11 |
| `/app/helpdesk` `/app/referrals` | CRM | SS12 |
| `/app/builder/forms` `/app/builder/workflows` `/app/bulk-import` | dynamic config | SS13 |
| `/app/schemes` `/app/schemes/new` | multi-scheme | SS14 |
| `/ops/gateway` `/ops/xroad` `/ops/observability` `/ops/cicd` `/ops/security` `/ops/backup` `/ops/data-governance` `/ops/payroll` `/ops/ai` `/ops/gis-layers` `/ops/capacity` `/ops/releases` `/ops/performance` | consoles | D10–D22 |
| `/ops/migration` `/ops/evidence` | migration/delivery documents | E-4–E-8 |

### 9.3 Demo role onboarding and guide — mandatory guided UX

After choosing an account, show a welcoming, compact, **light green/white** home screen matching the original palette, not a dark, technical or generic AI-generated landing. The user chooses **Explore by role**, **Complete beneficiary journey**, **Explore 14 modules**, **Technical & assurance tour**, or **Reference screen gallery**. A guided experience starts directly in the relevant module, not in a separate disconnected slideshow.

**Every role and journey must be understandable without prior MIS knowledge:**

1. **One obvious next action.** Prominent primary CTA, a plain-language heading, a 1–2 sentence explanation of what the user is doing and why, visible prerequisite/status indicators, and no competing primary buttons. Secondary actions must be visually quieter.
2. **A clear progress path.** Use a compact stepper such as `Application → Identity → Eligibility → Field Visit → Selection → Approval → Enrollment`; show completed/current/blocked/remaining stages and an accessible current-step label. On mobile, use a compact progress label and collapsible step list. Do not imply every separate module is a sequential approval stage.
3. **Contextual guided notes.** Place short animated-but-subtle informational notes next to the actual field, table, card or button being explained: "First, verify identity", "Now submit for field review", "Switch to Finance Checker to approve". Notes advance when a real state change occurs; no auto-advance based on fake completion. Respect reduced-motion preferences; no distracting constant animation.
4. **Clear hand-offs between users.** On every role boundary, show `Completed by`, `Waiting for`, `Next responsible role`, `Next action`, and a **Switch to next demo role** shortcut. Change actor ID as well as role when a maker/checker separation applies. Never bypass permissions; the shortcut follows the normal role selection flow and keeps case context.
5. **Smart queue continuity.** Each landing page has `My tasks`, `Needs attention`, `Recently updated`, and `Continue where I left off` where relevant. Selecting a queue item opens that specific shared case. Breadcrumbs and Back to queue preserve filters, page and scroll position where practical.
6. **Progressive disclosure.** Non-technical users see the essential fields and guidance first; detailed configuration, JSON, audit records, traces, policy clauses and technical evidence are under `View details` / `Advanced`. Technical console default view explains the impact in simple terms, while preserving all original Codex/ZIP content in expandable panels.
7. **Explain unavailable actions.** Disabled action displays the actual unmet prerequisite (e.g., `Field visit not synced`, `Quota full`, `Different checker required`, `Outside your geographic scope`). Do not show unresponsive buttons or generic "Action failed" messages.
8. **Visible outcomes.** Every consequential click produces a specific inline result plus toast, updated status badge/timeline, audit event, and link to the affected screen. Give a `View updated beneficiary profile` or `Open reconciliation` next action where relevant.
9. **Safe exploration.** Provide `Restart this journey`, `Reset all demo data` (with confirmation), a scenario picker, and undo/rollback for reversible simulations. Separate baseline snapshot from user-generated scenario deltas, and clearly identify fictional/demo data.
10. **Global bilingual parity.** All guidance, captions, step names, tooltips, system messages, walkthrough labels and technical explanations switch EN↔BN immediately without changing role, URL, scroll/progress, input or application state. Avoid partially untranslated tours.
11. **Presentation readability.** Prefer clear typography with base readable text ~15–16 px where space allows, adequate line height/tap targets, generous white space and a clear focus hierarchy; retain the sourced font families/colors/layout patterns and preserve the original 13–14 px dense-table style only where appropriate. Do not remove any source section to simplify the view; collapse it behind a discoverable explanation.
12. **Keyboard and touch.** Accessible button semantics, proper focus, Enter/Space activation, `aria` labels for icons, error hints tied to inputs, mobile touch targets, and no hover-only instructions.

### 9.4 Concrete guided user journeys and screen hand-offs

| Journey | Start / guide | Required steps visible to the user | Completion and next destination |
|---|---|---|---|
| Public mother applies | Public portal `Apply online` | Eligibility introduction → 5-step bilingual form → NID/BRN mock → privacy consent → submit | Application ID, status timeline, `Track my application`; UDC queue updated if assisted |
| UDC assisted registration | UDC `New assisted application` | Select union → capture applicant with assistance → consent → validate → submit | `Application submitted`, field/identity queue, reopen case |
| Field verifier offline | Mobile `My assigned visits` | View assignment → checklist/photo/GPS demo → offline local save → sync → conflict decision | Supervisor queue updated, case becomes ready for selection |
| Union selection → UWAO | Union `Selection queue` | Verify case evidence → view quota → prepare shortlist → hand off to independent checker → OTP approval | Unique Beneficiary ID, profile, dashboard delta, finance eligibility |
| Payroll and bounce-back | Finance `Start cycle` | Explain eligibility → calculate → maker submit → independent checker approval → simulated send → settlement import → bounce-back correction → re-payment | Profile/payment history, grievance status, notifications, dashboard updated |
| Training | Training `Schedule session` | Venue/date → enrol cohort → invite → QR/attendance mock/offline sync → assessment → certificate | Training tab on beneficiary profile and programme dashboard updated |
| Grievance and helpline | Public complaint or Helpdesk incoming-call simulation | Record issue → assign → SLA tracker → update/investigate → resolve/escalate → notify | Public complaint timeline and beneficiary profile updated |
| Executive review | Executive dashboard `Explore trends` | Choose geo/time/scheme → see KPI source and refresh → GIS drill-down → optional AI sourced advice → review draft | Relevant report/export or human-approved notification draft |
| Configuration/scheme | Admin `Create scheme` | Guided 8-step wizard with explainers → sample simulation → submit → different checker → publish | Scheme selector, permissions, reporting and sample beneficiaries updated |
| Technical tour | Platform operations `Explore platform` | Guided D10–D22 consoles → choose incident or test scenario → run simulated action → observe linked status/logs/evidence | Clear simulation result, affected consoles, original detailed metrics available |

### 9.5 Workable frontend simulations for non-frontend capabilities

**Principle:** Every original action that would require a backend or infrastructure must still be **clickable with a deterministic demonstration outcome**, not a dead element, while being labelled `Demo simulation / সিমুলেশন` and never claiming real performance, security or connectivity. No actual external connections, sensitive data, payments or live infrastructure changes.

| Real-world capability unavailable in frontend | Required executable frontend demonstration | Boundary disclosed to client |
|---|---|---|
| NID/BRN/Single Registry/DGHS/DGFP/iBAS++/MFS/bank/GRS API | Choose success/timeout/failed/duplicate test scenario; mock request ID, latency and JSON-like response; retry queue, affected case status and D10/D11/D12 counters update | Fictional partner responses, not government connectivity |
| Actual bank disbursement and bulk payroll engine | Click Calculate, Validate, Submit, Checker Approve, Send, Reconcile, Retry; deterministic simulated progress, partition rows, bounce-back reasons and linked beneficiary history | No funds transferred; throughput is illustrative |
| Real AI inference/GPU/agent orchestration | Prompt from supported sample scenarios, show bilingual sourced deterministic answer, make a draft, route approval, enforce human decision and guardrail examples | No LLM inference or measured model accuracy |
| Real GIS server/geospatial processing | Geo filters, sample map features/layers, marker selection, coverage drill-down, layer governance checks, suppressed small cells | Mock boundary/features and demo analytics |
| Native camera/GPS/biometric/PIN and actual offline mobile | Simulated capture, fictional coordinates/photos, local browser queue, online/offline toggle, conflict resolution, PIN/demo confirmation | Browser app simulation, not device/native hardware attestation |
| Keycloak, MFA, encryption, SIEM, tamper-proof audit | Role/geography demo gates, OTP confirmation, simulated threat detection/alert investigation, visible mock audit timeline and key status | Not production authorization, encryption assurance or actual SIEM |
| X-Road, Kubernetes, CI/CD, deployment | Retry/log scenarios, service health changes, pipeline stages pass/fail, security gate block, mock release approval/canary/rollback | No deployment or infrastructure control |
| Backup, DR, data retention, erasure, migration | Start mock backup/restore, show staged progress/RPO/RTO evidence; dry-run CSV/records, exceptions, sign-off, mock cut-over or restore; approval-controlled erasure example | No real backups, erasure, migrations or certification |
| 10,000 concurrent / 1M payment / 72h tests | Select predefined load scenario; view synthetic counters, graphs, outcome and exportable evidence view | Illustrative results only; no load test executed |
| External SMS, email, phone call, QR scan | Simulate send, show localized preview and delivery/inbox logs; fake call connection/QR entry | No message/call sent and no camera scanned |

**Simulation acceptance rules:** (a) starter control has a visible action and outcome, (b) output updates the relevant shared store or clearly says it is an illustrative evidence state, (c) linked views remain consistent, (d) reset restores baseline, (e) maker/checker and geographic gates remain enforced, (f) technical baseline KPIs are never passed off as actually measured values.

### 9.6 Page-level usability acceptance tests

- A first-time nontechnical evaluator can identify **what this page does, what to do first, what happens next, and what success looks like** without reading the PRD.
- Every primary workflow shows stage/current status, actor/next role, a next action and a clear end screen; every cross-role hand-off has a working shortcut.
- Guidance can be skipped and revisited; all tasks remain possible with guidance off.
- Every D01–D22 source section remains present and discoverable despite progressive disclosure; no generic placeholder dashboard replaces a reference screen.
- Each action has immediate local feedback; errors and guard conditions are explanatory and localized.
- Repeat all scripted J01–J15 acceptance journeys with language switched midway, with no loss of form or role state.

## 10. Original ZIP D01–D22 screen fidelity checklist

Every line below is a required reference experience, with exact detail in Annex C. Mark acceptance only after checking all source-specific data/cards/tables/controls.

| Original | Screen | Fidelity target |
|---|---|---|
| `index.html` | 22-screen catalogue | 5 group sections; D01–D22 cards; fictional data notice; reference tour |
| `D01_home_en.html` | Officer EN | 46 pending, 118 verification, 14,208 paid, 9 grievances; approval queue/quotas/8-week chart/today/AI |
| `D02_home_bn.html` | Officer BN | same structure, localized text/numerals; global toggle rather than separate file |
| `D03_responsive.html` | Executive 3 devices | national KPIs/trend/division coverage/payment channels/exceptions; real adaptive layout |
| `D04_mweb_en.html` | Public EN mobile web | portal/apply step 2 of 5/tracking timeline; apply/track/payments/OTP/complaint |
| `D05_mweb_bn.html` | Public BN | exact equivalent and localized dates/numbers |
| `D06_android_en.html` | Android EN | PIN/home/verification/Sync Centre, 12 tasks/7 queued/photo/GPS/conflict |
| `D07_android_bn.html` | Android BN | same controls/data in Bangla |
| `D08_ios_en.html` | iOS executive | KPIs, assistant sourced answer, GRS-2611-0872, division coverage map |
| `D09_tablet.html` | Field supervisor | 64 planned, 44 completed, 4 conflicts, 2 offline devices; team table/review |
| `D10_gateway.html` | API Gateway | 46 APIs, gateway metrics, consumers/quotas, traffic chart, Register API |
| `D11_xroad.html` | X-Road | 2 healthy servers, services/partners, queues, certificate, signed log |
| `D12_observability.html` | monitoring | availability/latency/sessions, traffic and errors, service health/synthetic checks |
| `D13_cicd.html` | CI/CD | candidate release, quality gates, pipelines, failed scans |
| `D14_security.html` | Security | alerts/MFA/audit/patch, SIEM/access reviews/keys/incident history |
| `D15_backup.html` | Backup/DR | backups, replication/restore/RTO, jobs, readiness and retention |
| `D16_datagov.html` | Governance | 2-tier counts, suppression, quality, erasure, aggregation and access |
| `D17_payroll.html` | payroll batch | exact progress/divisional partitions/validations/pause/rollback/checker |
| `D18_aigov.html` | AI governance | 4 agent runs, registry, guardrails, human approval, log |
| `D19_gislayers.html` | GIS layer catalogue | layers, 8 division coverage, promotion controls, tiles and privacy |
| `D20_capacity.html` | Capacity | vCPU/memory/pods/HPA, pools, scaling event, storage |
| `D21_releases.html` | Releases | 6 environments, release evidence, canary/rollback, business config promotions |
| `D22_perf.html` | Performance | load KPIs/scenarios, evidence note and PDF export simulation |

## 11. E-2 functional figures reference mapping

Maintain implementation coverage for every **screen figure** (not summary process figures) from E-2.4. Original functional figure numbering in supplied E-2: 

| Figure | Required screen/experience | Recommended route |
|---|---|---|
| E2-35 | Public self-application English | `/portal/apply` |
| E2-36 | Public self-application Bangla | `/portal/apply` + BN |
| E2-37 | Eligibility screening queue | `/app/eligibility` |
| E2-38 | Selection, quota, checker OTP | `/app/selection` |
| E2-40 | Beneficiary 360 profile EN | `/app/beneficiaries/[id]` |
| E2-41 | Beneficiary 360 profile BN | same + BN |
| E2-43 | Payroll cycle | `/app/payroll/[id]` |
| E2-44 | Reconciliation | `/app/reconciliation` |
| E2-46 | Training schedule/attendance/library | `/app/training` |
| E2-48 | Grievance management EN | `/app/grievances` |
| E2-49 | Grievance management BN | same + BN |
| E2-51 | API Bank catalogue | `/app/api-catalog` |
| E2-52 | Integration monitor | `/app/integrations` |
| E2-54 | Executive intelligence EN | `/app/executive` |
| E2-55 | Executive intelligence BN | same + BN |
| E2-56 | No-code dashboard builder | `/app/dashboard-builder` |
| E2-57 | SMS and email campaign hub | `/app/campaigns` |
| E2-59 | GIS intelligence EN | `/app/gis` |
| E2-60 | GIS intelligence BN | same + BN |
| E2-62 | Bilingual assistant EN | `/app/assistant` |
| E2-63 | Bilingual assistant BN | same + BN |
| E2-64 | Agentic AI console | `/app/agents` |
| E2-66 | Mobile field app EN | `/mobile/android` |
| E2-67 | Mobile field app BN | same + BN |
| E2-69 | User management/permission matrix | `/app/users` |
| E2-71 | Helpdesk agent desk/referrals | `/app/helpdesk` |
| E2-73 | No-code form builder | `/app/builder/forms` |
| E2-74 | Workflow designer | `/app/builder/workflows` |
| E2-75 | Governed bulk import | `/app/bulk-import` |
| E2-77 | Multi-scheme wizard | `/app/schemes/new` |

**Count: 30 visual screen figure references.** E2-34/39/42/etc. are overview diagrams and still inform flows; do not miscount them as standalone application pages.

## 12. Canonical reference dummy dataset and metrics

### 12.1 Persona/record relationships

- Demo applicant **Moriom Begum**, application `APP-2611-00447`, NID masked `1990 **** **** 4471`, phone `017** *** *44`, expected delivery **14 March 2027**; status initially `In verification` in public D04; field verification scheduled **15 Nov 2026**; D06 field checklist and D01 queue reference same application.
- Demo upazila **Kaunia · Rangpur**, unions: Kaunia Sadar, Haragach, Tepamadhupur, Balapara, Shahidbag, Kursha; preserve source scenario spelling and original union quota figures (92/78/64/81/70%).
- Demo grievance `GRS-2611-0872`: October allowance bounced because wallet inactive; 15-working-day SLA, Day 8; correction and repayment queue; tie to fictional beneficiary/payment scenario.
- Executive region coverage: **Rangpur 82%, Mymensingh 74%, Sylhet 61%, Rajshahi 79%, Dhaka 88%, Khulna 77%, Barishal 71%, Chattogram 84%** (all D03/D08/D19 agree).

### 12.2 Baseline statistics (preserve unchanged in initial Reference Scenario)

| Context | Source KPI snapshot |
|---|---|
| National | active 1,895,010; target 2.5M; paid 1,871,955; Tk 159.11 crore; on-time 98.6%; open grievances 1,126; ANC compliance 72.4% |
| Officer | 46 awaiting decision (12 >5d); 118 field checks pending (83% within SLA); 14,208 paid this cycle (99.1%); 9 grievances (2 due today) |
| Tablet supervisor | 64 planned visits, 44 done (69%), 4 conflicts, 2/18 devices offline |
| Android | 12 assigned field verifications, 7 sync queued, 5/12 completed, 14 photos, last sync 08:12 |
| Payroll monitor | 1,895,010 eligible, 1,777,870 processed (93.8%), 574 rec/s, 32 workers, 51m38s elapsed, ~55m total; 112 duplicate NID, 6,430 wallet prevalidation failures |
| API Gateway | 11,482 requests last minute, 18,940 peak, p95 412ms, 0.03% error, 214 throttled, 46 APIs |
| Observability | 99.96% 30-day availability, 412ms p95, 2.3s page p75, 7,812 sessions, 2 open alerts |
| CI/CD | 38 pipelines (36 passed/2 failed), 5h20m staging lead, 8% failure, 2 security blocked, 86% business coverage |
| Security | 7 alerts, 318 failed logins/day, MFA 412/412 privileged, patch 98% |
| Backup | 118GB full, 4.1GB incremental, 8s replication lag, 52m restore, 3h12m DR drill |
| Data gov | quality 96.8%, 24/24 aggregates, 3,412/418,000 cells suppressed, variance 0, 6 erasure requests |
| AI governance | Bangla answers 92.1% (gate ≥90%), answers with source 100%, scope violations 0/4,120, injection blocked 214/217, GPUs 2×32GB |
| GIS catalogue | 14 production layers, p95 tiles 0.9s, 42 exports, continuous tracking OFF |
| Capacity | 212/418 vCPU, 884/1,616GB, 96 pods, HPA 72–180, pooled sessions 7,812 |
| Releases | 148/148 traced, 2,410 regression tests passed, rollback rehearsal 4m10s |
| Perf | 10,000 VU, 20,640 API/min, 742ms p95, page p95 2.4s, 0.04% errors |

**Math/reporting rule:** keep original *display snapshot* and live *transaction deltas* separate. Avoid deriving a figure that contradicts other source KPIs; label snapshot date/source, adjust only dependent mock metrics when a relevant action happens. A control can switch between `Original Reference Snapshot` and `Live Demo Scenario`.

## 13. Form fields, business rules and validation catalog

| Domain | Minimum inputs / validation | Output / negative scenario |
|---|---|---|
| Application | name EN/BN, fictional NID, DOB, mobile, household, income/criteria, pregnancy/child BRN, due date, address/ward/union, wallet channel, GIS pin, consent | draft/submitted; missing consent; identity mismatch; duplicate; age/policy rule failure |
| Field check | assigned case, visit date, checklist 5 items, photo mock count, GPS/time, remarks, verifier, network | completed, delayed, conflict, pending sync |
| Selection | eligible field evidence, score advisory, union quota, maker comment, checker identity, OTP mock | submitted/approved/returned/rejected; over quota; same maker/checker denied |
| Beneficiary correction | field, old/new values, evidence, reason, maker/checker | updated profile + audit or declined |
| Payroll | scheme, cycle, rules/version, eligible cohort, validation, maker/checker, file/partner, reason | approved, bounced, exception, repaid; invalid wallet or >36 months |
| Training | session/venue/union/topic/date/cohort, attendance method, score, feedback | certificate/updated profile or incomplete |
| GRS | channel/category/description/anonymous/beneficiary/geo/evidence/severity | case ID, SLA, escalation, closure or reopen |
| CRM | fictional caller, matching ID, ticket category/priority, referral partner/follow-up | ticket & referral linked to profile |
| API sandbox | route, mock payload, consumer, timeout/error preset | response, mock log, retry queue, rate-limit event |
| BI builder | authorized dataset/filter/chart/KPI/suppression/publish approval | saved draft, preview, protected aggregate, approved view |
| GIS | layer, geo selector, metric, date/filter, polygon/radius mock | map/list/chart sync; privacy suppression |
| AI | scenario question, source context, run type, human decision | explanatory sourced answer, draft output, audit; refusal |
| Dynamic forms | field type, EN/BN labels, required/rules, version, owner | validated preview, reviewed/published version |
| Bulk exchange | fictional CSV template, mapping, duplicate/required checks, checker | exception report, committed/rolled back batch |
| Scheme | name EN/BN, eligibility/rules, benefit amount/frequency/duration, quota, workflow, source mappings | cost preview, test scenario, approved demo scheme |

**Unspecified policy:** do not hardcode arbitrary actual GoB pregnancy age/poverty thresholds as factual; use clearly labelled configurable **illustrative rule criteria** that align with the proposed approach. Programme default Tk 850/36 months is sourced.

## 14. Explicit end-to-end demo scripts (must pass)

**J01 Enrollment:** public EN→BN while filling → submit with consent → verify NID/BRN → offline verifier → sync → maker selection → checker OTP → Beneficiary ID/profile → executive KPI delta and timeline.

**J02 Identity outage:** submission → BDRIS timeout → queue retry 1/2/3 → pending with reason → Data Hub/observability log → retry success → resumes verification; no premature approval.

**J03 Duplicate + quota:** duplicate NID/wallet warning; eligibility failure with reason; overfilled union blocks approval; audit records action.

**J04 Finance:** eligible beneficiary in payroll → maker validates → checker distinct approves → simulated payment bounce → reconciliation → GRM+notifications → correction → re-payment checker → paid + profile history.

**J05 Learning:** training officer schedules nutrition session → invites cohort → offline Android attendance → sync → completion/assessment/certificate → profile/dashboard updated.

**J06 Complaint:** public complaint → SMS preview/case ID → assigned GRS officer → SLA escalates via controlled clock → resolves → beneficiary timeline updates; separate system-use GRM unaffected.

**J07 Helpline:** simulate inbound call → beneficiary match → ticket → KB suggestion → service referral → acceptance/follow-up/closure → profile.

**J08 GIS/BI:** executive filters Rangpur→Kaunia → map layer, table/chart KPI update; exports; Tier-2 group <10 suppressed; dashboard builder preview/publish.

**J09 AI:** ask in English → get sourced result → switch Bangla → correct localized answer → agent alert proposal → human approve → notification draft; AI cannot approve enrollment or payroll.

**J10 Config builder:** add bilingual field → validate → author submits → different approver publishes → field appears in checklist; rollback returns old version.

**J11 Scheme:** eight-step new scheme wizard → cost/eligibility simulation → separate maker/checker → publish → new scheme available in dashboards/forms/report filters.

**J12 Technical:** BDRIS simulated outage changes D11 retry queue, D10 error counts, D12 warning; pipeline failed security gate D13→D14; D21 release remains blocked until mock approval; back/restore D15 and load D22 remain clearly illustrative.

**J13 Migration:** upload mock legacy batch → profile/mapping quality exceptions → clean sample → dry runs/reconcile → checkpoint and checker → mock cut-over/rollback; users can inspect summary and reports.

**J14 User access:** union actor denied unauthorized geo/finance action; demo role switch to valid checker allows approval and records actor; same actor under different role still cannot self-check; language stays unchanged.

**J15 Visual and accessibility:** view every D01–D22 and each E2-35…E2-77 UI figure in desktop, tablet/phone where relevant; audit original colors, fonts, panels, labels, icons, status chips, contrast and all interactions.

## 15. Exports, notification simulations, search and audit

- Header universal search: case ID, fictional NID last digits, beneficiary name, mobile masked, payment/grievance ID; results limited by demo role/scope and deep link to permitted target.
- Notifications: in-app inbox, unread status, links, bilingual SMS/email preview. No actual sending, spam or external account use.
- Exports: client-side CSV with UTF-8 BOM for Bangla, printable report, PDF via browser print or local library when reliable; file contains `FICTIONAL / DEMO DATA` marking and filters/method metadata. Never label as certified results.
- Charts: tooltips, legend, keyboard-value/table alternative, filters, download where shown. Tables: sort/filter/search/pagination/selection/row click, empty/no access/loading/error states, CSV/print where relevant.
- Audit events appear on case timeline and global demo audit console, but no immutability guarantees; include event and related cross-domain links.
- Explain mock platform telemetry and performance evidence in visible footnote; maintain a clear **Illustrative sample values** badge/legend on operational evidence screens.

## 16. Source gaps, deviations, conflicts and decisions register

| ID | Item | Resolution for demo |
|---|---|---|
| GAP-01 | Official RFP and addenda unavailable separately | E-2–E-8 bidder wording used; note not independently certified |
| GAP-02 | Final SRS role permissions not yet established | Representative conservative role matrix, labelled demo assumption |
| GAP-03 | Final eligibility/rule tables not provided | Configurable example rules, reasons; no invented legal thresholds |
| GAP-04 | Real partner APIs unavailable | deterministic mock, retry, failure/fallback; no network |
| GAP-05 | Original ZIP only E-3 22 HTML views | implement E-2 30 figure experiences using same design tokens |
| GAP-06 | Codex no rendered visual pixel QA | mandatory visual regression/manual side-by-side before acceptance |
| GAP-07 | E-2 uses 10 integrations vs E-3/E-7 nine adapters | name all external systems; distinguish grouping and adapters |
| GAP-08 | E-3 pipeline gate count references may vary | use actual 9-step CI/CD view as chosen reference; annotate difference if found |
| GAP-09 | E-5 score 20 vs older TOC 15% | don't repeat unconfirmed scoring in demo, preserve proposal evidence context |
| GAP-10 | E-7 signature/date placeholders | do not present as signed/effective confirmation in demo |
| GAP-11 | Original technical screen timestamps/release dates are fictional | retain as seeded reference snapshot, not current event |
| GAP-12 | LocalStorage role state is not security | prominently label demo roles; no real identifiers/personal data |
| GAP-13 | Full BCC/AI/GIS/DR/performance testing cannot run frontend | visual evidence + interactive mock only; never production proof |
| GAP-14 | Separate visitors don't share browser state | per-browser sandbox, reset/seed, no distributed collaboration claim |
| GAP-15 | 100% feature inclusion means full **demonstrable coverage**, not real IT operations | E-8 rows classify I/V/N, no silent omission |

## 17. Implementation plan — demo-specific, not E-4 contract schedule

**Phase A / Foundation:** install original fonts/assets, create exact design tokens, route scaffold, typed fixture data, canonical store, reset/scenario selector, EN/BN framework, account/geo RBAC, standard components. No generic redesign.

**Phase B / Core lifecycle:** public/assisted application, identity checks, eligibility, offline field/sync, maker/checker, beneficiary profile, payment and reconciliation, GRM. Finish J01–J06.

**Phase C / Rest of 14 subsystems:** training, Data Hub, BI/GIS, AI, mobile/iOS/tablet, RBAC admin, helpdesk/referrals, dynamic builder/bulk, multi-scheme. Finish J07–J11/J14.

**Phase D / Operations & evidence:** D10–D22 fidelity and controlled mocked actions, migration evidence, E-4/E-5/E-6/E-7 informational views, complete E-8 traceability classification. Finish J12/J13.

**Phase E / Validation & deploy:** D01–D22 fidelity comparison, 30 E-2 figure experiences, language parity, all scripts, responsive real-device QA, static production build, Netlify public visibility, stable QR URL, initial reset state and offline/browser reload tests.

No artificial time estimates and no dependency on a backend development workstream.

## 18. Definition of Done and acceptance gates

### A. Functional completeness
- [ ] 14 subsystems and supporting views implemented and accessible by proper demo roles.
- [ ] All 30 E-2 functional UI figures mapped, visually represented and their associated principal action works.
- [ ] All 22 E-3 HTML screens preserved as actual navigable experiences, not merely a catalogue screenshot.
- [ ] Every relevant original control works or is explicitly labelled `Illustrative / Non-executable` with meaningful details; no dead button.
- [ ] All J01–J15 scenario scripts pass repeatedly after reset; no contradictory statuses or broken role continuity.
- [ ] Business-critical controls consent, duplicate, quota, maker-checker, no-AI-approval, geographic RBAC all pass negative tests.

### B. Visual fidelity
- [ ] Exact sourced HEX tokens, original fonts and widths/radii baseline are present.
- [ ] Original top-bar/sidebar hierarchy, all menu labels and D01–D22 screen sections/metrics/tables/charts present.
- [ ] Original illustrations and data are preserved where design-correct; user-facing readability enhanced without generic re-skin.
- [ ] Responsive real browser on desktop/tablet/mobile; no overflow, tiny click targets, broken modals.

### C. Language completeness
- [ ] **Every route, state, form, tooltip, table, chart, status, modal, notification, export heading, technical console and mobile screen works in EN and BN**.
- [ ] In-place toggle preserves route/role/form progress/state and user preference on refresh.
- [ ] Bangla font, dates/numerals/labels correct; IDs unchanged.

### D. Demonstration integrity
- [ ] All records fictional; consent/health/identity info clearly sample; no real integration or payments.
- [ ] Platform telemetry and performance claims labelled illustrative, not measured.
- [ ] Reset scenario works; no destructive shared behavior between independent visitors claimed.
- [ ] No live server/API/database/auth/storage dependency.
- [ ] Static build works; no hosted auth wall; stable public URL and QR opens without signing in to Netlify.

### E. Source traceability
- [ ] Each E-8 requirement row mapped to a route/view, classification (I/V/N), outcome and pass status.
- [ ] The 30 E-2 UI figures and 22 original HTML views listed in screen matrix have screenshot-diff/manual review evidence.
- [ ] Each error/scope exception documented; no implied RFP clause silently invented or omitted.

## 20. Detailed screen implementation contracts — no guesswork

The table below supplements Section 11 and the **full source audit in Annex C**. Every original section, field, chart, row, colour and sample statistic remains required; the entries below specify the previously missing primary action, result and hand-off. These are **frontend-only demo behaviour contracts**, not claims that the reference HTML is already functional.

### 20.1 E-2 functional reference screens (all 30)

| Figure | Route | Demo role | Primary interaction | Immediate observable outcome | Next screen | Required blocked/negative state |
|---|---|---|---|---|---|---|
| E2-35 | /portal/apply | Beneficiary | Start application | Five-step form opens; draft persists; consent mandatory | Submit -> /portal/track | Incomplete/invalid identity or missing consent blocks |
| E2-36 | /portal/apply | Beneficiary | Switch বাংলা / continue | Same application and step display in Bangla | Submit -> /portal/track | No lost entered data on language switch |
| E2-37 | /app/eligibility | UWAO/verification officer | Run eligibility/Retry verification | Rule reasons, pending queue and service mock change | Eligible -> /mobile/android or /app/selection | Failed rule retained with reason; outage queues |
| E2-38 | /app/selection | Union maker/UWAO checker | Prepare shortlist / Approve with OTP | Quota evaluated; different checker approves; ID issued | /app/beneficiaries/[id] | Same-actor, full quota and missing verification blocked |
| E2-40 | /app/beneficiaries/[id] | Officer | Open history / request correction | All module records and audit timeline shown | /app/payroll or /app/training | Out-of-geo edits denied |
| E2-41 | /app/beneficiaries/[id] | Officer | Toggle Bangla | Identical timeline, translated cards and numerals | Same route and record | No identity/ID changes |
| E2-43 | /app/payroll | Finance maker/checker | Generate payroll / independent checker approve | Cycle, partitions, checks and approval status update | /app/reconciliation | Maker self-check/invalid totals blocked |
| E2-44 | /app/reconciliation | Finance team | Import mock settlement / re-pay | Paid/bounced/exception/re-payment queues update | /app/beneficiaries/[id] | Repayment needs independent approval |
| E2-46 | /app/training | Trainer/field officer | Schedule / enrol / mark attendance | Attendance, assessment, certificate and profile update | /app/beneficiaries/[id] | Missing/duplicate attendance handled |
| E2-48 | /app/grievances | GRM officer | Assign / escalate / resolve | Status/SLA/timeline/notification change | /portal/grievance | Unauthorised closure blocked |
| E2-49 | /app/grievances | GRM officer | Toggle Bangla | Same cases and state with bilingual content | Same route | SLA and IDs unchanged |
| E2-51 | /app/api-catalog | Platform operator | Register mock API / test | API entry, request/response and log generated | /ops/gateway | Missing auth/over-limit simulation |
| E2-52 | /app/integrations | Platform operator | Simulate partner fail / retry | Partner health, retry/DLQ and alert update | /ops/xroad | No claim of real partner call |
| E2-54 | /app/executive | National executive | Filter geographic coverage | All linked KPI/charts/map use same filter | /app/gis | Small cell suppression applies |
| E2-55 | /app/executive | National executive | Toggle Bangla | Same filters and chart values translated | Same route | No data reset |
| E2-56 | /app/dashboard-builder | Analyst | Build widget / preview / publish | Configurable widget included in reporting view | /app/reports | Unapproved publication blocked |
| E2-57 | /app/campaigns | Communications officer | Create segment / preview SMS | Recipient preview/count and mock notification log | /app/reports | No real send; privacy/cell checks |
| E2-59 | /app/gis | Executive/GIS user | Select layer / region / feature | Map legend, counts and linked table/chart update | /app/gis/layers | Data group <10 suppressed |
| E2-60 | /app/gis | Executive/GIS user | Toggle Bangla | Same geometry/filters, localized legend | Same route | IDs/pins stable |
| E2-62 | /app/assistant | Authorized user | Ask preset English question | Sourced sample answer scoped to role/geography | /app/agents | Out-of-scope/refusal example |
| E2-63 | /app/assistant | Authorized user | Ask preset Bangla question | Localized answer and sources | Same route | No invented uncited financial actions |
| E2-64 | /app/agents | AI reviewer | Review agent draft / approve or reject | Human decision, audit log and follow-up draft update | /ops/ai | AI cannot approve payment/selection |
| E2-66 | /mobile/android | Field verifier | Complete visit offline / sync | Queue, photos/GPS mock and case verified state | /tablet/supervisor | Conflict requires explicit resolution |
| E2-67 | /mobile/android | Field verifier | Toggle Bangla | Same work item and sync queue in Bangla | Same route | No draft loss |
| E2-69 | /app/users | System admin | Assign role/geography / test access | User permissions and audit change | /app/officer/home | Out-of-jurisdiction denied |
| E2-71 | /app/helpdesk | Helpdesk agent | Log call / ticket / referral | Linked case, referral status and history | /app/referrals | Restricted data remains masked |
| E2-73 | /app/builder/forms | Form designer | Add bilingual field / preview | Schema version and draft form created | /app/builder/workflows | Missing BN/EN label blocks publish |
| E2-74 | /app/builder/workflows | Workflow admin | Edit transitions / submit for approval | Versioned maker-checker workflow visible | /app/builder/forms | Invalid transition and self-approval blocked |
| E2-75 | /app/bulk-import | Data operator | Upload demo CSV / validate / commit | Preview, exception table and audit update | /ops/migration | Duplicate/invalid row quarantined |
| E2-77 | /app/schemes/new | Scheme configurator | Complete wizard / simulate / approve | Draft scheme, cost model, published menu item | /app/schemes | Incomplete config/self-approval blocked |

### 20.2 Original ZIP screens (D01–D22)

| Screen | Primary route | Required clickable action | Linked state / outcome | Next contextual destination |
|---|---|---|---|---|
| D01 | /app/officer/home | Review next | Open selected queue record; status/quotas remain consistent | /app/applications/[id] |
| D02 | /app/officer/home | Bangla toggle | Same dashboard in Bangla with localized metrics | /app/applications/[id] |
| D03 | /app/executive | Filter/division drilldown | National cards, charts and exceptions update coherently | /app/gis |
| D04 | /portal | Apply online / Track application | Five-step apply or real in-demo tracking | /portal/apply |
| D05 | /portal | Bangla Apply / Track | Same forms/data in Bangla | /portal/apply |
| D06 | /mobile/android | Save offline / Sync | Local queued visits/photos and conflict appear | /tablet/supervisor |
| D07 | /mobile/android | Bangla Save / Sync | Same queue and data localized | /tablet/supervisor |
| D08 | /mobile/ios | Ask AI / grievance note / map | Sourced scripted answer, case update, map filter | /app/assistant |
| D09 | /tablet/supervisor | Open review queue | Review conflicts; resolve or escalate; queue count changes | /mobile/android |
| D10 | /ops/gateway | Register API / simulate request | API catalogue, traffic and quota log update | /ops/xroad |
| D11 | /ops/xroad | Simulate outage / retry | Partner health and retry/DLQ counter update | /ops/observability |
| D12 | /ops/observability | Inspect alert / synthetic check | Service warning and inspection detail shown | /ops/security |
| D13 | /ops/cicd | Run mocked pipeline | Stages pass/fail by predefined scenario | /ops/releases |
| D14 | /ops/security | Investigate / acknowledge alert | Incident note, status and audit event update | /ops/cicd |
| D15 | /ops/backup | Run illustrative restore test | Progress/RPO/RTO sample output; mock log appended | /ops/releases |
| D16 | /ops/data-governance | Review quality/erasure | Exception or approval state changes | /ops/migration |
| D17 | /ops/payroll | Pause / resume / abort simulation | Batch state and partition progress change | /app/payroll |
| D18 | /ops/ai | Human approve/reject | Draft response and governance log changes | /app/agents |
| D19 | /ops/gis-layers | Approve layer promotion | Layer version/status and coverage preview update | /app/gis |
| D20 | /ops/capacity | Run load scenario / inspect scaling | Illustrative node counts/events change | /ops/performance |
| D21 | /ops/releases | Approve promotion / canary simulation | Release states and rollback criteria update | /ops/cicd |
| D22 | /ops/performance | Select scenario / export | Illustrative test results; PDF/print marked mock | /ops/evidence |

### 20.3 All-page interaction minimum

For **each** visible control in source: assign a unique ID, a triggering role, permission prerequisite, precise expected state mutation (or informational drill-down), success message, failure message, destination, BN/EN keys, and reset seed. Do **not** interpret a static source badge as a button. Preserve reference metrics on initial load; after a simulated action show a small `Demo scenario changed values` indicator and update all affected cards coherently. Every icon-only control has tooltip and keyboard label. Add a no-action proof only if the source really represents read-only evidence; it must open a meaningful details panel rather than appear dead.

## 21. Guided interaction scripts — user-facing content and transitions

All sample wording below must have exact English and Bangla translation keys; wording is product guidance, not source-derived policy. Render as short contextual notes near the relevant action, not a modal blocking every click.

| Journey stage | Guidance (EN) | Guidance (BN) | Continue when | Next action |
|---|---|---|---|---|
| Choose your role | Choose a demo role to see the work that person can perform. | কোন কর্মকর্তা কী কাজ করেন তা দেখতে একটি ডেমো ভূমিকা বেছে নিন। | Valid demo actor chosen | Open their home |
| Apply / understand | This application has five short steps. You can save a draft and return later. | এই আবেদনের পাঁচটি ছোট ধাপ আছে। খসড়া সংরক্ষণ করে পরে আসতে পারবেন। | Start selected | Personal details |
| Apply / identity | Check sample identity information before continuing. | পরের ধাপে যাওয়ার আগে নমুনা পরিচয় তথ্য যাচাই করুন। | Mock verification complete or pending acknowledged | Household and child |
| Apply / consent | Read the privacy notice and give consent to submit. | গোপনীয়তার তথ্য পড়ে আবেদন জমা দিতে সম্মতি দিন। | Consent checkbox explicitly checked | Submit application |
| Field visit | Check each item, capture sample evidence and save the visit. | প্রতিটি বিষয় যাচাই করে নমুনা প্রমাণসহ পরিদর্শন সংরক্ষণ করুন। | Checklist complete | Sync centre |
| Offline sync | Your offline work is saved on this device. Sync it to send for review. | অফলাইনে করা কাজ এই ডিভাইসে সংরক্ষিত। পর্যালোচনার জন্য সিঙ্ক করুন। | Sync completed or explicit conflict reviewed | Supervisor review |
| Selection | Review verification and union quota before preparing the shortlist. | তালিকা প্রস্তুতের আগে মাঠ যাচাই ও ইউনিয়নের কোটা দেখুন। | Maker submits shortlisted case | Switch to checker |
| Checker | A different authorised officer must approve this case. | এই আবেদন অনুমোদন করবেন অন্য একজন অনুমোদিত কর্মকর্তা। | Different actor with allowed jurisdiction and demo OTP | Open beneficiary profile |
| Payroll | Check eligibility and payment exceptions before submitting payroll for approval. | পেরোল অনুমোদনের আগে যোগ্যতা ও পেমেন্টের সমস্যাগুলো যাচাই করুন। | Maker completes review | Switch Finance Checker |
| Settlement | Review failed payments and prepare a correction for the next approved payment. | ব্যর্থ পেমেন্ট যাচাই করে পরবর্তী অনুমোদিত পরিশোধের জন্য সংশোধন তৈরি করুন। | Checker authorises correction | Beneficiary payment history |
| Training | Schedule a session, record attendance, and see it on the beneficiary profile. | সেশন নির্ধারণ করে উপস্থিতি দিন এবং উপকারভোগীর প্রোফাইলে ফল দেখুন। | Attendance saved | Open beneficiary profile |
| Grievance | Assign the complaint, track its deadline and document the resolution. | অভিযোগ বরাদ্দ করুন, সময়সীমা দেখুন এবং সমাধান লিখুন। | Correct officer resolves | Beneficiary case history |
| AI review | The assistant suggests an action. A person must review before anything is applied. | সহকারী পরামর্শ দেবে। কার্যকর করার আগে দায়িত্বপ্রাপ্ত ব্যক্তিকে যাচাই করতে হবে। | Authorized human decision recorded | Open governance audit |
| Technical tour | These are sample operations. Try a failure to see the affected screens update. | এগুলো নমুনা অপারেশন। একটি ব্যর্থতা চালিয়ে সম্পর্কিত স্ক্রিনের পরিবর্তন দেখুন। | Scenario selected | Connected console |
| Finish | See what changed across the system, then reset for the next demonstration. | সিস্টেমজুড়ে কী বদলেছে দেখুন, তারপর পরবর্তী ডেমোর জন্য রিসেট করুন। | Review links viewed | Reset or new journey |

### 21.1 Standard guidance panel and route journey contracts

- Top: `You are acting as [role] in [geography]` / `আপনি [এলাকা]-এর [ভূমিকা] হিসেবে কাজ করছেন` with demo badge.
- Context: `Step n of m` with concise `Why this matters` / `এটি কেন গুরুত্বপূর্ণ`.
- Right next to CTA: `What happens next` / `এরপর কী হবে`, exact next actor and route.
- Upon action: success toast + changing badge + timeline row + `View changes` link. Blocked action: persistent inline explanation and remediation, never only a toast.
- `Switch to next demo role` retains case and geography, logs actor switch, **does not bypass** separate maker/checker actor requirement. `Resume journey` restores step and case from browser-local state.
- Contextual page guide must start at the business process entry point, **not** at an incidental technical/scheduling step. Public journeys start Apply; Officer journeys start My queue; Payroll starts benefit-cycle review; Field journey starts assigned visits.

## 22. Shared frontend state, deterministic simulations, and cross-module contracts

### 22.1 Canonical browser-local entity keys

| Entity | Key | Required related entities | Mutating examples |
|---|---|---|---|
| `Actor` | actorId | roles, regionScopes | switch role, permission edit |
| `Application` | applicationId | identity, location, verification, screening, consent, selection | submit, retry, field sync, shortlist, approve |
| `Beneficiary` | beneficiaryId | approvedApplicationId, household, payments, training, grievances, lifecycle | enrollment, correction, exit |
| `PayrollCycle` | cycleId | schemeId, beneficiaries, batches, checks, checker, settlement | generate, sign, process, reconcile |
| `Payment` | paymentId | beneficiaryId, cycleId, provider, exceptions | bounce, correct, repay |
| `FieldVisit` | visitId | applicationId, actorId, photoGpsMock, deviceId, syncConflict | save offline, sync, resolve |
| `TrainingSession` | sessionId | attendees, trainer, location, assessment | schedule, attend, certify |
| `Grievance` | grievanceId | beneficiaryId/applicationId, officerId, SLA, audit | submit, assign, escalate, resolve |
| `Ticket` | ticketId | caller, case, referral, KB article | open, assign, refer, close |
| `PartnerMock` | partnerId | calls, retryQueue, health, latency | outage/retry/recover |
| `ConfigVersion` | configId/version | form, workflow, rules, scheme, checker | draft, promote, rollback |
| `Alert` | alertId | sourceEntityId, severity, assignee | generate, acknowledge, investigate |
| `AuditEvent` | eventId | actorId, entityId, previous/next status, time | append for all meaningful actions |

### 22.2 Deterministic mock sequence and invariants

1. Load **reference baseline seed** without modifying the original fictional KPIs; keep separate `scenarioDelta` for user actions. Cards show baseline with a clearly identified delta after a scenario change, rather than mathematically inconsistent replacement totals.
2. `APP-2611-00447` links **Moriom Begum** across portal, Android checklist, D01 queue, tablet, case approval and eventual beneficiary profile. A new beneficiary ID is generated only upon correct approval.
3. A pending NID/BRN mock never becomes verified merely by changing pages. Mock retry/recovery must write verification event; service outages change D10, D11 and D12 sample scenario state.
4. Same actor may not submit and check any maker-checker item, even after role switch. Test actor IDs, not merely role names. Approved or rejected decisions write immutable-in-demo event history (not tamper-proof storage).
5. Any payment bounce/re-payment affects transaction, beneficiary payment timeline, reconciliation counts, D17 monitor and relevant dashboard; avoid double counting corrections.
6. Field visits saved offline remain `local_pending` until sync; supervisor may review only synced or explicitly surfaced conflicts.
7. AI suggestions always start as proposals and never directly change approval, payroll or transfer statuses.
8. All geography-bound reads/actions filter by actor allowed administrative scopes; a denied actor sees an explanation, not data leakage via global search.
9. BN/EN toggle changes presentation strings/dates/numerals but never IDs, actor, role, route, input draft, status machine, or storage schema.
10. Reset/choose scenario reconstructs every entity consistently, clears notifications and simulated alerts, resets sample clock to selected reference scenario, and preserves language preference unless user explicitly resets settings.

### 22.3 Demo scenarios as reproducible fixtures

Provide fixtures `baseline`, `nid_outage`, `duplicate_application`, `quota_full`, `offline_sync_conflict`, `payment_bounce`, `grievance_sla_due`, `ai_review_pending`, `pipeline_scan_fail`, `partner_recovery`, `migration_exceptions`, `new_scheme_draft`. Each has **Start**, **Expected changes**, **Roles involved**, **Recovery**, and **Reset**; scenario selector explains expected outcome before launching. Do not change live clock, connect to real networks, or expose actual PII.

## 23. Developer execution plan — dependency-ordered acceptance slices

Each slice must deliver **routes + visual fidelity + state + EN/BN + role/geo gates + positive/negative tests** before the next slice starts. This is a build order, not the E-4 contractual 36-week schedule.

| Slice | Build contract | Dependencies | Completion evidence |
|---|---|---|---|
| S00 | Asset inventory, source screenshot reference, local fonts and color tokens | None | D01/D21 style side-by-side, all fonts/local assets load |
| S01 | Application shell, sidebar taxonomy, responsive header, route registry, demo disclaimer | S00 | D01/D10 template, all menu entries route |
| S02 | Global i18n, BN/EN keys, numerals/dates, missing-key gate | S01 | Every shell element switches without reload/data loss |
| S03 | Canonical entities, fixtures, persistence, scenario reset, audit and simulated clock | S01 | Baseline seed reload stable; reset works |
| S04 | Demo actors, RBAC, geography scope, role switch, maker-checker engine | S02,S03 | Unauthorized cross-geo and same-actor denial |
| S05 | Guided welcome, scenario journey, stepper, handoff and focus UX | S04 | Novice completes one start-to-finish guided route |
| S06 | Portal applications, assisted intake, identity/consent/eligibility | S05 | E2-35/37; initial application links same ID |
| S07 | Android field visits, local pending queue, sync/conflict, tablet review | S06 | D06–D09, E2-66/67, conflict resolution |
| S08 | Union selection, checker OTP, quota, profile and lifecycle | S07 | E2-38/40/41, negative approvals |
| S09 | Payroll, independent sign, payment mock, exceptions and repayments | S08 | E2-43/44, D17, balances/state consistent |
| S10 | Training, grievances, system GRM, helpdesk and referrals | S08 | E2-46/48/49/71, linked profile and timeline |
| S11 | Dashboards, reports, campaigns, analytics and GIS | S08,S09,S10 | E2-54–60, D03/D19, same totals and filters |
| S12 | API Bank, X-Road partner simulator and observability | S06,S09 | D10–D12, outage trace cross-console |
| S13 | AI assistant/agents/governance with mandatory human gate | S11,S12 | E2-62–64, D18, zero autonomous approval |
| S14 | User admin, dynamic forms/workflows, bulk import, multi-scheme builder | S04,S08 | E2-69/73–75/77, config maker-checker |
| S15 | Security, backup/DR, data governance, migration, CI/CD, capacity/releases/performance | S12,S14 | D13–D16/D20–D22, realistic labelled simulations |
| S16 | Reference gallery, visual comparison, E-2 30 figure QA, ZIP 22 screen QA | S06–S15 | 52 mapped reference experiences; no missing source data |
| S17 | 235-row E-8 prefilled mapping verification and final acceptance scripts | S16 | Every row reviewed and tests recorded |
| S18 | Static build, public deployment, QR smoke test, EN/BN device testing | S17 | Anonymous URL accessible; all guided cases pass |

### 23.1 Required build artifacts in repository

`docs/MCBP_MIS_MASTER_DEMO_PRD_V1_1.md` (this file); `src/lib/demo/fixtures.*` with typed IDs and seeded sample state; `src/lib/demo/permissions.*`; `src/lib/demo/transitions.*`; `src/lib/i18n/{en,bn}.*`; `src/lib/demo/scenarios.*`; `docs/coverage/e8-tracker.csv`; `docs/coverage/screen-contracts.md`; `docs/qa/acceptance-log.md`. File paths are implementation suggestions, **not** requirements from E-2. Keep exact local font asset paths from source if possible. Build should remain statically deployable.

### 23.2 Stop/go rules

Do not proceed beyond S04 if role switching bypasses checker identity or loses language. Do not proceed beyond S09 if a failed payment can be marked paid without reconciliation. Do not proceed beyond S16 if any of the 22 ZIP views lacks its original data sections. Do not call completion before all 30 E-2 figures are mapped and every E-8 row reviewed. Tests should be repeatable after `Reset Demo`.

## 24. Complete usability and workflow quality gates

| ID | Test | Acceptance evidence |
|---|---|---|
| UX-01 | A first-time nontechnical client chooses role and begins without instructions | One clear CTA, contextual note and active stepper |
| UX-02 | Each role queue opens the correct specific case | Case ID persists across list/detail/back/role switch |
| UX-03 | Every handoff shows next actor and direct role switch | Checker is distinct actor; same-case context preserved |
| UX-04 | Important screen explains what happens next | Tooltip/note/next route on action completion |
| UX-05 | Blocked action gives actionable explanation | Quota, identity, geo, consent, maker-checker messages |
| UX-06 | Switch Bangla while partially completing 5-step form | State and place retained; all labels localized |
| UX-07 | Bangla on all D10–D22 technical consoles | No visible untranslated headings/buttons/status/tooltips |
| UX-08 | Search and filters respect geographic access | Unauthorized case not exposed in results |
| UX-09 | No dead primary button or misleading static badge | Click produces result or clearly informational detail |
| UX-10 | Keyboard-only, touch and reduced-motion operation | Focus, action, labels, safe motion |
| LOG-01 | NID outage and retry | Pending until recovery; D10–D12 sync |
| LOG-02 | Union quota and checker | Full quota/same actor blocked with audit |
| LOG-03 | Offline field conflict | Supervisor resolves; change propagates to application |
| LOG-04 | Failed payment and re-payment | No false paid status; finance approval/audit |
| LOG-05 | Grievance SLA and escalation | Case updated in beneficiary and dashboard |
| LOG-06 | AI human review | No autonomous case/payment approval |
| LOG-07 | Config and scheme publication | Maker/checker and version rollback |
| LOG-08 | Cross-module baseline integrity | Original D01/D03/D17/D21 values unchanged at reset |
| QA-01 | All 52 visual references accounted for | 30 E2 figures and 22 D views checked |
| QA-02 | All E-8 rows individually classified/tested | Audit-ready matrix with completion status |
| QA-03 | No real network, wallet, OTP, AI inference or government data | Only deterministic browser-local fixtures |
| QA-04 | Netlify/static URL anonymously accessible | New browser/mobile smoke test, 200 response |

**Test recording:** `Pass / Fail / Blocked / Not applicable` plus date, route, language, actor, scenario, evidence image/file, short reason; no unsupported automatic test-pass claims.

## 19. Source index

1. `2026-11-12_SIMCBP-G-01A_E-2_Understanding_and_Proposed_Solution.docx` — primary functional scope and 30 reference figures.
2. `2026-11-13_SIMCBP-G-01A_E-3_Technical_Architecture_and_System_Design (1).docx` — architecture/controls/device and 22 screen figures.
3. `2026-11-13_SIMCBP-G-01A_E-4_Work_Plan_and_Implementation_Schedule (3).docx` — delivery, testing, acceptance, training, support.
4. `2026-11-13_SIMCBP-G-01A_E-5_Team_Composition_and_Key_Experts (1).docx` — responsibilities, project governance, staffing.
5. `2026-11-13_SIMCBP-G-01A_E-6_Data_Migration_and_Knowledge_Transfer_Plan.docx` — migration, quality, cut-over, training and handover.
6. `2026-11-13_SIMCBP-G-01A_E-7_Integration_Responsibility_Confirmation.docx` — integration responsibility and partner interfaces.
7. `2026-11-13_SIMCBP-G-01A_E-8_Technical_Responsiveness_Checklist.docx` — item-by-item coverage inventory.
8. `SIMCBP-G-01A_Proposal_TOC.docx` — proposal structure.
9. `2026-11-13_E-3_Demo_HTML.zip` — original design/illustrative data and D01–D22 HTML plus fonts.
10. `Pasted markdown(20261113-183837).md` — Codex source inspection, layouts, exact screen data and functional gaps.

---

# ANNEX A — E-2.4 ORIGINAL CLAUSE-BY-CLAUSE FUNCTIONAL REQUIREMENTS

**Purpose:** Make the foundational PRD self-contained for codebase use. The following source-derived entries retain the exact proposal clause/table text; the human-friendly FRs in Section 7 are their demo interpretation. These are *proposed production system requirements*, not claims that the browser demo implements live infrastructure.


### E-2.4.0 Functional architecture and shared services

The fourteen subsystems are separate services, but a mother experiences them as one journey: she applies, is verified and selected, is enrolled, is paid each month, receives training and health follow-up, can complain and is eventually exited. The platform holds one Beneficiary ID across all of them. Shared services for identity, workflow, rules, notifications, audit, documents, search, geography and integration are built once and reused by every subsystem, including any new scheme MoWCA configures later.


**Figure E2-33: Beneficiary lifecycle mapped to subsystems, and the shared services all subsystems reuse**


### E-2.4.1 Subsystem 1: Beneficiary application, verification, selection and enrollment (1.2.3)

This subsystem takes an applicant from first contact to enrollment. A mother can apply herself on the web portal or the mobile app, get help at a UDC or the upazila office, or be included through a validated bulk upload. The form captures personal details, household and socio-economic data, pregnancy or child details and a GIS location, and every field and rule can be configured by MoWCA without code.


**Table E2-8: Subsystem 1: clause-by-clause response**

| Clause | Requirement | How MCBP-MIS meets it |
| 1.2.3.1 | End-to-end intake to enrollment | Single BPMN workflow from draft application to enrollment, with status visible to the applicant by SMS and portal |
| 1.2.3.2 | Online, assisted and bulk channels with GIS capture | Web portal and Flutter app for self-application; UDC-assisted mode; governed Excel/CSV bulk upload; map pin and GPS on every application |
| 1.2.3.3 | Configurable data collection with NID verification | Form builder (Subsystem 13) defines fields and rules; name and date of birth pre-filled from the EC response |
| 1.2.3.4 | NID/BRN verification; queue when the service is down | Real-time EC and BDRIS checks through the Data Hub; three retries with back-off, then "verification pending" without blocking the application |
| 1.2.3.5 | Automatic eligibility screening; failures recorded with reasons | Versioned rules engine; every application stored, each failed rule saved with its reason code |
| 1.2.3.6 | Field verification with checklist, offline | Mobile checklist with photo, GPS and time stamp; works offline and syncs later |
| 1.2.3.7 | Approval with quota and maker-checker | Union committee prepares (maker), UWAO or district officer approves (checker) with OTP; union quota enforced at approval |
| 1.2.3.8 | Unique Beneficiary ID and location linkage | ID generated on approval and linked to ward, union, upazila, district and division using BBS geo-codes |
| 1.2.3.9 | Privacy notice and non-bypassable consent | Consent step built into the workflow; the application cannot be submitted without it; consent version stored |
| 1.2.3.10 | Duplicate prevention | NID, BRN, mobile and wallet checks inside MCBP-MIS, plus Single Registry lookup as approved by MoWCA |
| 1.2.3.11 | No AI approval or rejection | Vulnerability score is advisory only; selection buttons are available to authorised officers only |

**Figure E2-34: Application to enrollment: process, key numbers and added value**


**Figure E2-35: Public self-application portal (English): NID already verified, household data, pregnancy details, location pin and preliminary eligibility check**


**Figure E2-36: The same application screen in Bangla, showing Bangla numerals and dates**


**Figure E2-37: Eligibility screening queue for an upazila office: channels, NID status with retry queue, rule results with reason codes and Single Registry check**


**Figure E2-38: Selection and approval: field evidence, advisory vulnerability score, union quota and maker-checker approval with OTP**


### E-2.4.2 Subsystem 2: Beneficiary profile management (1.2.4)

Once enrolled, each mother has one profile that gathers everything the programme knows about her: identity, household, status, payments, health compliance, training, grievances and referrals. The profile is the place officers go to answer a question, and the record auditors look at to see who changed what.


**Table E2-9: Subsystem 2: clause-by-clause response**

| Clause | Requirement | How MCBP-MIS meets it |
| 1.2.4.1 | Comprehensive, controlled digital profile | One profile per Beneficiary ID, with a timeline of every event over the 36 months |
| 1.2.4.2 | Personal, household, status, payments, compliance, grievances, service use | All held on the profile; health compliance pulled from DGHS through the Data Hub; training from Subsystem 4 |
| 1.2.4.3 | Role- and jurisdiction-based viewing and editing | Field-level permissions by role; geographic scope so users see only their area |
| 1.2.4.4 | Full audit of creation, change, approval, status and exit | Tamper-evident audit log with user, time, source, old value and new value |
| 1.2.4.5 | Status changes, correction, transfer, exit and graduation with approval | Lifecycle state machine; each transition needs maker-checker; exit triggered by rule at 36 months or by policy |
| 1.1.1.1 (link) | Retention, archiving and erasure | Automatic archive after the configured period; erasure workflow approved by authorised MoWCA staff; anonymised history kept for statistics |

**Figure E2-39: Profile lifecycle states, profile contents and controls**


**Figure E2-40: Beneficiary 360° profile (English): lifecycle month, payments with a failed and re-paid month, ANC/PNC compliance, household, training and audit trail**


**Figure E2-41: The same profile in Bangla, as a union or upazila user would normally see it**


### E-2.4.3 Subsystem 3: Benefit calculation, payroll, payment tracking and reconciliation (1.2.5)

This is the subsystem where errors cost the most. It calculates each mother's entitlement under the approved rules, builds the monthly payroll, sends it for disbursement through SPBMU and iBAS++ or an approved gateway, and closes the loop by reconciling every confirmation and failure. No payment leaves the system without a maker and a separate checker, and no AI agent can approve payroll or start a payment.


**Table E2-10: Subsystem 3: clause-by-clause response**

| Clause | Requirement | How MCBP-MIS meets it |
| 1.2.5.1 | Process allowances by programme rules, on time, with accountability | Rules engine computes entitlement per cycle; payroll audit pack generated for every cycle |
| 1.2.5.2 | Configurable rules: Tk 850 for up to 36 months; conditions; inclusion/exclusion | Decision tables for amount, duration, status, arrears and conditions; changes versioned under maker-checker |
| 1.2.5.3 | Configurable payment cycles | Monthly by default; quarterly or other frequencies set per scheme |
| 1.2.5.4 | Payroll to SPBMU/iBAS++ or gateway; receive confirmations and bounce-backs | Signed payroll file or API submission; callbacks and status files ingested automatically |
| 1.2.5.5 | Record every transaction status; correction and re-payment | Status per transaction with date and reference; failure reasons stored; correction workflow feeds the re-payment queue |
| 1.2.5.6 | Reconciliation reports; bank/MFS file ingestion; automated exception handling | Reconciliation engine for API callbacks and Excel/CSV files; automatic flag, SMS to beneficiary and field office, re-payment queued for checker approval, with no manual database edits |
| 1.2.5.6 (control) | Payroll approval stays with authorised officers; no AI approval | Maker and checker must be different people; OTP sign-off; file hash stored in the audit log |
| 1.2.5.7 / 1.5.1 | 1,000,000 transactions within 4 h (1.2.5.7); 2 to 3 h (1.5.1) | We commit to under 3 hours; partitioned batch engine processes 1 M records in about one hour without slowing other users |

**Figure E2-42: Payroll process, the design that delivers 1 M payments in under 3 hours, and control rules**


**Figure E2-43: Payroll cycle for 1,895,010 beneficiaries: stages, division totals, batch run time and checker approval**


**Figure E2-44: Reconciliation: settlement files from SPBMU, MFS and banks, failure reasons and the re-payment queue under maker-checker**


### E-2.4.4 Subsystem 4: Training management (1.2.6)

The Training Management module plans, records and evaluates capacity building for both beneficiaries and programme staff. MCBP's behaviour-change sessions on nutrition, antenatal and postnatal care and early childhood development are scheduled by union, mothers are invited by SMS, attendance is captured on the mobile app, and completion appears on each mother's profile and on the dashboards.


**Table E2-11: Subsystem 4: clause-by-clause response**

| Clause | Requirement | How MCBP-MIS meets it |
| 1.2.6.1.1 | Scheduling and enrollment into sessions or groups | Session calendar by union and venue; participants enrolled individually or by rule (for example, all pregnant mothers in a union) |
| 1.2.6.1.2 | Attendance tracking, including on mobile | QR on the beneficiary card or Beneficiary ID entry on the app, offline |
| 1.2.6.1.3 | Training content management | Content library for flipbooks, videos and guides, with offline download for trainers |
| 1.2.6.1.4 | Feedback and assessment | Pre- and post-tests and feedback forms built with the form builder |
| 1.2.6.1.5 | Certification | Bangla certificate generated on completion and stored on the profile |
| 1.2.6.2 | Reports on sessions, participants, attendance, modules; dashboards and profile | Standard training reports; KPI area F on dashboards; training tab on the profile |

**Figure E2-45: Training cycle, audiences and reporting**


**Figure E2-46: Training management: weekly session schedule for an upazila, attendance captured on mobile, coverage by topic and the content library**


### E-2.4.5 Subsystem 5: Grievance redress, feedback channels and system-use GRM (1.2.7)

The Grievance Redress System lets mothers and other stakeholders lodge complaints, appeals and queries through any channel and follow them to resolution. Each case gets a number by SMS, an owner by rule, and a deadline. Late cases move up a level automatically. A separate system-use GRM handles problems with the MIS itself, such as wrong data or access issues, so they do not mix with programme grievances.


**Table E2-12: Subsystem 5: clause-by-clause response**

| Clause | Requirement | How MCBP-MIS meets it |
| 1.2.7.1 | Built-in GRS for complaints, appeals and queries | Case management module available on web, app, UDC, helpline and through the national GRS |
| 1.2.7.2 | Payment, selection appeal, misconduct/fraud and service issues | Category tree with these four types and sub-types; anonymous option for misconduct |
| 1.2.7.3 | Receive, assign, track, resolve, close; notifications; escalation; analytics; audit | Auto-assignment by type and area; SLA timers; automatic escalation; SMS updates; grievance analytics; full case history |
| 1.2.7.4 | Interoperability with the national GRS | Two-way exchange through the Data Hub, with case ID mapping |
| 1.2.7.5 | Feedback channels and continuous improvement | In-app feedback, helpdesk, surveys and supervisory reports; top causes reviewed quarterly and turned into backlog items |
| 1.2.7.6 | Dedicated system-use GRM | Separate queue and category set for data errors, unauthorised access and glitches, linked to the helpdesk |

**Figure E2-47: Grievance lifecycle, types, owners and target times**


**Figure E2-48: Grievance case management (English): KPIs, case register with SLA status and the timeline of one payment complaint**


**Figure E2-49: Grievance case management in Bangla**


### E-2.4.6 Subsystem 6: Interoperability through the Secure Data Hub / API Bank (1.2.8)

The Data Hub is how MCBP-MIS talks to the outside world and how MoWCA will connect future schemes and registries. It combines an API gateway with full lifecycle management, a developer portal and catalogue, a canonical data model, data-quality rules, orchestration, durable retry queues and an X-Road-compatible security server, following GovStack's Information Mediator building block. Non-API partners use the governed bulk exchange as a secondary route.


**Table E2-13: Subsystem 6: clause-by-clause response**

| Clause | Requirement | How MCBP-MIS meets it |
| 1.2.8.1 | Secure APIs with EC, BDRIS, DGHS, DGFP, iBAS++/SPBMU, MFS and banks, GRS, Single Registry | One adapter per partner behind the gateway; status of each shown on the integration monitor |
| 1.2.8.2 | REST with JSON or XML, secure tokens; consume and expose; minimum data | OpenAPI 3 contracts, OAuth2 and mTLS; purpose-bound field lists per consumer |
| 1.2.8.3 | Authentication, encryption, logging, retry, fallback, error handling | Three retries with back-off, durable queues, "verification pending" fallback, alerting |
| 1.2.8.4 | Data Hub with aggregation, canonical models, metadata, validation, real-time and batch, gateway with lifecycle management, X-Road patterns | All functions provided; X-Road security server with member and subsystem management |
| 1.2.8.5 | Governed bulk exchange for non-API systems | Versioned templates with validation and approval (Subsystem 13) |
| 1.2.8.6 | Coordination with system owners | Interface control document per partner; MoWCA-facilitated MoUs from week 1 |
| 1.2.8.7 | Joint integration testing with signed approvals | Two joint cycles per partner, signed test cases and logs before Go-Live |
| 1.2.8.8 | Open standards; Future Interoperability Roadmap | Roadmap delivered with the SDD, covering new schemes and national registries |

**Figure E2-50: Secure Data Hub / API Bank: functions, partners and commitments**


**Figure E2-51: API Bank catalogue: partner and internal APIs, lifecycle status, an OpenAPI contract and the consumer onboarding steps**


**Figure E2-52: Integration monitor: latency and success rate per partner, retry and fallback queues, and gateway traffic**


### E-2.4.7 Subsystem 7: Monitoring, evaluation, dashboards, self-service MIS and reporting (1.2.9)

Reporting runs on a separate analytics server and data warehouse fed by automated ETL, so heavy reports never slow down data entry or payroll. On top of it sit role-based dashboards, standard and ad hoc reports, the AI-powered Executive Intelligence Dashboard, a no-code builder for dashboards and reports, and a campaign hub for approved SMS and e-mail messages. All KPIs are defined once in a semantic layer, which our BI and GIS Specialist will develop with MoWCA during requirements.


**Table E2-14: Subsystem 7: clause-by-clause response**

| Clause | Requirement | How MCBP-MIS meets it |
| 1.2.9.1 | Real-time operational dashboards and evaluation data | Operational views refreshed in near real time; evaluation extracts from Tier-2 data |
| 1.2.9.2 | Role-wise interactive dashboards with KPIs | Home dashboard per role and level, from union to national |
| 1.2.9.3 | Standard, ad hoc, drill-down, GIS and trend reports in PDF and Excel | Report library by level; drill-down from national to union; scheduled delivery |
| 1.2.9.4 | Dedicated analytics/BI server and data warehouse with ETL | Separate analytics cluster; nightly and incremental ETL; history kept for trend analysis |
| 1.2.9.5 | AI-powered Executive Intelligence Dashboard; outputs advisory | KPI cards, variance, exceptions and AI insights labelled advisory; no approval actions from the dashboard |
| 1.2.9.6 | Self-service MIS, no-code builder, SMS and e-mail campaigns | Drag-and-drop builder with formulas and saved views; campaign hub with approved templates and audiences |
| 1.2.9.7 | KPI catalogue in nine areas, approved by MoWCA | Catalogue covering areas A to I delivered with the SRS |
| 1.2.9.8 | Filters by time, level and programme; exports; aggregation | Global filter bar; Excel, PDF and CSV export; print layouts |

**Figure E2-53: KPI catalogue in nine areas and reporting tools**


**Figure E2-54: AI-powered Executive Intelligence Dashboard (English): national KPIs, enrollment trend, coverage map by upazila, advisory AI insights and exceptions**


**Figure E2-55: Executive Intelligence Dashboard in Bangla**


**Figure E2-56: No-code dashboard builder using Tier-2 datasets, with small-cell suppression and approval before publishing**


**Figure E2-57: SMS and e-mail campaign hub: audience, Bangla template, approval chain and delivery reports**


### E-2.4.8 Subsystem 8: GIS-based programme intelligence and spatial analytics (1.2.10)

The GIS engine shows where the programme reaches people and where it does not. Officers can move from the national map down to a union, keep their filters, and see coverage, applications, payments, grievances and service access as layers. The engine is open source (PostGIS, GeoServer and MapLibre), uses approved government boundary data, and is built into the application form and the mobile app as well as the dashboards.


**Table E2-15: Subsystem 8: clause-by-clause response**

| Clause | Requirement | How MCBP-MIS meets it |
| 1.2.10.1 | Spatial view of coverage, applications, approvals, payments, grievances, service access | Programme layers for each indicator; under-served areas highlighted; clustering, heatmaps, exports |
| 1.2.10.2 | GIS engine and GIS dashboard with layers, styling, search, spatial selection | GeoServer layers with dynamic styling; map search; polygon and radius selection |
| 1.2.10.3 | Drill-down division to union/pourashava/city corporation | Hierarchical navigation keeping filters and map context |
| 1.2.10.4 | Privacy-preserving location use; no continuous tracking | Location captured only at defined steps, time-stamped and access-controlled; no background tracking |
| 1.2.10.5 | Spatial data architecture, quality, reconciliation; GIS Architecture and Layer Catalogue | Catalogue delivered at design; nightly reconciliation of map totals to report totals; layers under maker-checker |
| 1.2.10.6 | GIS within application, verification and mobile app | Map pin on the application form; GPS on field checks; offline map tiles on mobile |

**Figure E2-58: GIS layer stack and capabilities**


**Figure E2-59: GIS programme intelligence for Rangpur Division (English): coverage index by upazila, grievance clusters and under-served unions**


**Figure E2-60: GIS programme intelligence in Bangla**


### E-2.4.9 Subsystem 9: Agentic AI workflow automation and the bilingual AI assistant (1.2.11)

We propose four AI agents and an embedded assistant, all hosted at the BCC National Data Center on open-weight multilingual language models, in line with MoWCA's clarification on data sovereignty. The agents take on repetitive data, reporting, alerting and calculation work. Every agent output is a proposal that a named officer approves, edits or rejects, and every step is logged. The assistant answers questions in Bangla or English using only the data and documents the user is allowed to see.


**Table E2-16: Subsystem 9: clause-by-clause response**

| Clause | Requirement | How MCBP-MIS meets it |
| 1.2.11.1 | Data Collection, Report Generation, Alert and Calculation agents with workflows, permissions, approval gates, rollback and full logs | Agent console with approval queue; each run logs input, data source, rule, output, decision and final action |
| 1.2.11.2 | No autonomous selection, eligibility change, payroll approval, payment or master-data edit | Restrictions enforced in the back-end services as well as the user interface; tested in every release |
| 1.2.11.3 | Embedded bilingual assistant in web and mobile; reports and narratives; respects access rules | Retrieval and text-to-SQL limited to the user's role and area; answers show source and refresh time |
| 1.2.11.4 | AI and Agentic AI Design Document; AI Governance and Human-in-the-Loop Plan | Both delivered at the design gate; model owner named; monthly accuracy report |
| Pre-proposal Q6 | AI hosted at BCC NDC or approved government cloud; no personal data abroad | Open-weight models served on BCC GPU capacity; CPU-sized fallback tier if GPUs are delayed |

**Figure E2-61: Four agents, the human approval gate, the assistant and the actions AI may never take**

Model choice will be made at the design gate after a bake-off on a Bangla evaluation set built from MCBP documents and questions, comparing current open-weight multilingual model families of suitable size for the GPU capacity BCC allocates. Calculation work that affects money uses a deterministic rule engine, not a language model, so results are exact and repeatable.


**Figure E2-62: Bilingual AI assistant (English): a question about bounce-back rates, the answer with a chart and source, and a suggested action that still needs approval**


**Figure E2-63: The same assistant conversation in Bangla**


**Figure E2-64: Agentic AI console: the four agents, the human-in-the-loop approval queue and the audit trail of one Calculation Agent run**


### E-2.4.10 Subsystem 10: Mobile application and field operations support (1.2.12)

The mobile app is where much of MCBP's work actually happens: in courtyards, at union halls and in places with no signal. We build it in Flutter as a single code base for Android and iOS, offline-first, with encrypted local storage and a sync engine that resolves conflicts. The same app serves field verifiers, UDC operators and supervisors, and offers mothers a simple self-service view.


**Table E2-17: Subsystem 10: clause-by-clause response**

| Clause | Requirement | How MCBP-MIS meets it |
| 1.2.12.1 | Android and iOS for registration, verification, grievance, attendance, supervision; equal weight in design and testing | One Flutter app with role-based home screens; mobile test cases run alongside web in every sprint |
| 1.2.12.2 | Offline entry, sync, conflict resolution, local protection | Encrypted local database; background sync; field-level merge and review of true conflicts |
| 1.2.12.3 | Light, low bandwidth, low-end devices | Android 8 and later; small install; compressed images; text-first screens |
| 1.2.12.4 | Encrypted local data; PIN or biometric; updates via stores or MDM | AES-256 local store; per-user PIN and biometrics; remote wipe; Play Store, App Store and MDM channels |
| 1.2.12.5 | Bangla and English | Language switch at any time, Bangla numerals and dates |

**Figure E2-65: Offline capture, sync and conflict resolution, and how the app meets each requirement**


**Figure E2-66: Mobile app (English): offline field verification, sync centre with conflict resolution, training attendance by QR and beneficiary self-service**


**Figure E2-67: The same four mobile screens in Bangla**


### E-2.4.11 Subsystem 11: User management and access control (1.2.13)

Access in MCBP-MIS is decided by three things: who the user is, what role they hold and which area they cover. Keycloak provides single sign-on for web, mobile and API users. Roles carry least-privilege permissions, and every role is bound to a geographic scope, so an upazila officer can act only within her upazila. Money, eligibility and configuration actions always need a second person.


**Table E2-18: Subsystem 11: clause-by-clause response**

| Clause | Requirement | How MCBP-MIS meets it |
| 1.2.13.1 | Secure user management for all levels, from UDC operator to Ministry administrator | Central user directory; delegated administration by level |
| 1.2.13.2 | RBAC, location scope, MFA for privileged roles, password policy, login control, audit, separation of duties, maker-checker | All provided; permission matrix approved in the SRS; MFA enforced for approvers, administrators and data stewards |
| 1.4.1 | Create, modify, suspend, lock, expire accounts; temporary accounts; CAPTCHA | Full account lifecycle; automatic expiry; lock after inactivity; configurable password and CAPTCHA rules |
| 1.4.2 | Write-once audit logs; activity reports; alerts on suspicious activity | Tamper-evident logging; activity reports; alerts on failed logins, bulk downloads and abnormal submission patterns |

**Figure E2-68: Identity, permission, scope, maker-checker and audit layers, with the indicative role list**


**Figure E2-69: User management: role permission matrix, a user's jurisdiction and device binding, and security events**


### E-2.4.12 Subsystem 12: Support, help desk, helpline and CRM automation, referral management (1.2.14)

Many mothers will reach the programme by phone rather than online. The helpline uses an open-source contact-centre stack with computer-telephony integration and Bangla IVR, so an agent sees the caller's profile as the call arrives and the ticket opens itself. The same desk serves officers and UDC operators who need help with the MIS. Referrals to health and nutrition services are tracked from hand-off to outcome.


**Table E2-19: Subsystem 12: clause-by-clause response**

| Clause | Requirement | How MCBP-MIS meets it |
| 1.2.14.1 | Help desk with ticket logging, categories, assignment, knowledge base, SLA monitoring, user notification | Ticketing inside the MIS and through phone and e-mail; severity-based SLAs; Bangla knowledge base; users see ticket status in the MIS |
| 1.2.14.2 | CTI, IVR, automated call logging, ticketing/CRM | Open-source PBX with CTI and IVR; calls matched to profiles; tickets created automatically |
| 1.2.14.3 | End-to-end referral tracking with alerts, hand-off and closure | Referral workflow with provider acceptance, service record, follow-up and outcome on the profile |
| S1.2 | Critical incidents acknowledged in 15 minutes, workaround in 4 h, resolution target 8 h | Built into SLA rules and monthly reporting |

**Figure E2-70: Helpline and CRM flow, referral tracking and service levels**


**Figure E2-71: Helpdesk agent desk: incoming call matched to a beneficiary, auto-created ticket with knowledge-base suggestion, and referral tracking**


### E-2.4.13 Subsystem 13: Dynamic module creation and governed bulk data exchange (1.2.15)

MoWCA will need to change forms, rules and workflows many times over the life of MCBP-MIS. Subsystem 13 lets authorised administrators make those changes without developers, while keeping the discipline of a software release: a named owner, automated checks, testing, checker approval, promotion through environments and one-click rollback. The same governance applies to bulk data exchange.


**Table E2-20: Subsystem 13: clause-by-clause response**

| Clause | Requirement | How MCBP-MIS meets it |
| 1.2.15.1.1 | Configure modules, forms, workflows, rules, KPIs, dashboards, reports, GIS layers, API mappings, templates without code | Form builder, BPMN workflow designer, decision tables, dashboard builder, layer manager and mapping editor |
| 1.2.15.1.2 | Named owners, maker-checker, versioning, promotion, validation, dependency checks, rollback, audit, periodic review | Governed change path for every configuration item; review reminders after 12 months |
| 1.2.15.1.3 | Enterprise security controls apply to all configured items | Configured modules inherit RBAC, MFA, masking, encryption and audit automatically |
| 1.2.15.1.4 | Defects fixed under support; major extensions through change control | Handled in the support SLA and change-control procedure |
| 1.2.15.2 | Governed bulk import/export with templates, validation, duplicates, errors, approval, reconciliation, audit | Bulk exchange pipeline with error reports and approval before commit; commit reversible for 7 days |

**Figure E2-72: What can be configured, the governed change path and bulk exchange**


**Figure E2-73: No-code form builder: field verification checklist with a calculated field, bilingual labels and governance details**


**Figure E2-74: Workflow designer: BPMN enrollment flow, automated validation, and promotion with rollback**


**Figure E2-75: Governed bulk import of a legacy batch: validation results, row-level exceptions and approval before commit**


### E-2.4.14 Subsystem 14: Multi-scheme extensibility and future programme integration (1.2.16)

MCBP-MIS is designed to run several of MoWCA's safety-net programmes on one platform. The configuration engine lets authorised administrators define a new programme, its target group, criteria, benefit rules, workflow, forms and approval chain, test it on sample data and launch it after approval, without changing or redeploying code. Each new scheme inherits NID verification, payment rails, grievance redress, interoperability and security from the core.


**Table E2-21: Subsystem 14: clause-by-clause response**

| Clause | Requirement | How MCBP-MIS meets it |
| 1.2.16.1 | Support several social safety-net programmes at once | Multi-scheme data model; each scheme has its own quota, payroll, reports and rules |
| 1.2.16.2 | No-code engine to create programmes, criteria, benefit rules, workflows, forms, approval hierarchies | Eight-step scheme wizard with simulation before launch |
| 1.2.16.3 | New schemes inherit security, NID verification, payment gateways, GRS and interoperability | Core services are shared and switched on for each scheme by configuration |

**Figure E2-76: Schemes on a shared core, and what is configured for each**


**Figure E2-77: Multi-scheme configuration wizard: benefit rules for a sample new scheme, cost simulation and inherited core services**


---

# ANNEX B — E-8 ORIGINAL TECHNICAL RESPONSIVENESS CHECKLIST (SOURCE INVENTORY)

**IMPORTANT:** The entries below are Riseup Labs' proposal commitments and traceability claims, *not actual performance/certification results*. During implementation append fields to the working tracker (Route, I/V/N, implementation status, test result). Included for full item-by-item non-omission coverage.


E-8 Technical Responsiveness Checklist


**Figure E8-1: E-8 at a glance: checklist rows by part of Section VII and the share where our design exceeds the requirement**


ITP 16.2(c) asks for an item-by-item commentary on the Purchaser's Requirements, demonstrating the substantial responsiveness of the proposed Information System. This checklist goes through Section VII clause by clause: the functional, architectural and performance requirements (B), the service specifications (C), the technology specifications (D), testing and quality assurance (E), the recurrent cost items (F), the Implementation Schedule, Site Table and System Inventory Tables, and Supplementary Sections S1 to S5. It also records the AI hosting requirement confirmed at the pre-proposal meeting.


Each row states the clause, a short summary of the requirement, our compliance status, a brief commentary and the section of this proposal where the evidence is. Where several numbered sub-clauses are answered by one design response, they share a row and the clause range is given in full. We have not taken any deviation, reservation or exception to Section VII. Where our design goes beyond the stated level, the row is marked "Complies and exceeds" and the commentary says by how much.


### Table E8-1: How to read the checklist

| Column | Meaning |
| Clause | Section VII clause number, or the schedule or table it belongs to |
| Requirement (summary) | Short summary of the requirement; the RFP text governs |
| Status | Complies: the requirement is met in full. Complies and exceeds: met in full, and our design or commitment goes beyond it |
| Commentary | How the requirement is met |
| Proposal reference | Section of this proposal where the response and evidence are given (E-2 Understanding and Proposed Solution; E-3 Technical Architecture; E-4 Work Plan; E-5 Team; E-6 Data Migration and Knowledge Transfer; Part B qualification documents; Part F additional documents) |

### Table E8-2: Technical Responsiveness Checklist: Section VII, item by item

| Clause | Requirement (summary) | Status | Commentary | Proposal reference |
| B. Functional, architectural and performance requirements: 1.1 Legal and regulatory | B. Functional, architectural and performance requirements: 1.1 Legal and regulatory | B. Functional, architectural and performance requirements: 1.1 Legal and regulatory | B. Functional, architectural and performance requirements: 1.1 Legal and regulatory | B. Functional, architectural and performance requirements: 1.1 Legal and regulatory |
| 1.1.1 | Comply with GoB and World Bank laws, regulations, policies and standards | Complies | Legal framework mapped to design responses | E-2.1.6; E-3.6.6 |
| 1.1.1.1 | Personal data protection: PDPO 2025 / PDP Act 2026; privacy notice, non-bypassable consent, Do-No-Harm, data localisation | Complies | Consent checkpoint in every intake channel; all data, backups and AI at BCC in Bangladesh | E-2.4.1; E-3.6.5; E-6.1.14 |
| 1.1.1.1 (b) | Data retention, archiving and erasure protocol; anonymised transactions kept | Complies | Configurable retention; automatic archive of exited records; auditable erasure with approval; retention flags set on migrated data | E-2.4.2; E-3.2.6; E-6.1.13 |
| 1.1.1.2 | Data governance, sharing and interoperability: NDGO 2025, NDM Act 2026, NDGIO; Single Registry alignment | Complies | Data Governance Framework; exchange through Data Hub and approved middleware | E-3.2.6; E-3.3 |
| 1.1.1.3 | Digital and cyber security laws, GoB ICT security guidelines, BCC and SQTC standards | Complies | Security model, VAPT and SQTC support built into schedule | E-3.6; E-4.4.6 |
| 1.1.1.4 | BeGA / BIETA alignment and open standards (JSON, CSV, XML, REST) | Complies | Open standards only; architecture mapped to BeGA layers | E-3.1.5 |
| 1.1.1.5 | ISO/IEC 27001, ISO/IEC 25010, OWASP Top 10, WCAG 2.0 AA | Complies and exceeds | Riseup Labs holds ISO/IEC 27001 and ISO 9001; ISO 25010 used for test design; OWASP ASVS L2 | E-3.6.6; E-4.4.1 |
| 1.1.1.6 | Procurement and contract rules incl. acceptance and audit rights | Complies | Acceptance procedure and audit access to tools and repositories | E-4.6.3; E-3.10.4 |
| 1.1.1.7 | IP, licensing, source code to National Source Code Repository; disclose COTS | Complies | All outputs owned by MoWCA; open-source stack; SBOM each release | E-3.9.5; E-6.2.7 |
| 1.1.1.7.1 | Third-party licences in MoWCA name, perpetual, royalty-free; no recurring licence liability | Complies | No paid licence needed to run, patch or scale | E-3.1.4; E-6.2.10 |
| 1.1.1.8 | Environmental and social considerations; energy efficiency | Complies | Code of Conduct, SEA/SH plans; no hardware supplied; hosting on shared BCC infrastructure | E-5.5; Part F |
| 1.1.1.9 | Information responsibility; no use of data outside the contract | Complies | Confidentiality undertakings for all personnel; no data at Supplier premises | E-4.1.3; E-5.5 |
| 1.1.2 | Programme rules implemented and configurable without re-coding | Complies and exceeds | Rules engine and multi-scheme engine; changes by configuration under maker-checker | E-2.4.3; E-2.4.14 |
| 1.2 Business function requirements | 1.2 Business function requirements | 1.2 Business function requirements | 1.2 Business function requirements | 1.2 Business function requirements |
| 1.2.1.1-1.2.1.5 | Client background, legacy MIS, programme parameters, administrative structure, MCBP-MIS / MoWCA Integrated MIS | Complies | Understood and reflected in personas, roles and scope | E-2.1; E-2.2 |
| 1.2.2.1.1-1.2.2.1.11 | Eleven key challenges to be solved | Complies | Each challenge traced to root cause and subsystem response | E-2.2.2 |
| 1.2.2.1.12 | Additional requirements found in analysis within scope; change control for new requirements | Complies | Treated through SRS and change control | E-2.3.4; E-4.1.9 |
| 1.2.2.2 | Scope of services | Complies | Every scope line covered | E-2.1.5 |
| 1.2.2.3 | Programme covered: MCBP; deliverables structured around MCBP | Complies | MCBP first; other schemes through configuration | E-2.4.14 |
| 1.2.2.4 | Thirteen required subsystems (plus 1.2.16) | Complies | Fourteen subsystems in scope, including the multi-scheme engine | E-2.4 |
| 1.2.2.5 | Smooth transition from legacy; current rules and formats | Complies | Legacy reports reproduced; staged migration; pilot | E-4.2.5; E-6.1 |
| 1.2.3 Subsystem 1: Beneficiary application, verification, selection and enrollment | 1.2.3 Subsystem 1: Beneficiary application, verification, selection and enrollment | 1.2.3 Subsystem 1: Beneficiary application, verification, selection and enrollment | 1.2.3 Subsystem 1: Beneficiary application, verification, selection and enrollment | 1.2.3 Subsystem 1: Beneficiary application, verification, selection and enrollment |
| 1.2.3.1 | End-to-end intake and enrollment | Complies | Full lifecycle from application to enrollment | E-2.4.1 |
| 1.2.3.2.1 | Online application (web portal, mobile) | Complies | Public portal and app, Bangla by default, low-bandwidth | E-2.4.1; E-3.11.2 |
| 1.2.3.2.2 | Assisted application by UDC operators and office staff | Complies | Assisted mode with operator identity and consent capture | E-2.4.1 |
| 1.2.3.2.3 | Bulk upload with validated Excel/CSV templates under 1.2.15 | Complies | Governed bulk templates with approval before commit | E-2.4.13 |
| 1.2.3.3 | Configurable forms collecting personal, socio-economic and programme data | Complies | No-code form engine with validation rules | E-2.4.1; E-2.4.13 |
| 1.2.3.4 | NID/BRN verification; queue or pending state if service is down | Complies and exceeds | Verification-pending state, capped replay, retry up to three times | E-2.4.1; E-3.3.5 |
| 1.2.3.5 | Automatic eligibility screening; failed cases recorded with reasons | Complies | Rule results and reasons stored for every application | E-2.4.1 |
| 1.2.3.6 | Field verification workflow with checklists; offline mobile | Complies | Offline verification with photo and GPS on the app | E-2.4.10; E-3.11.3 |
| 1.2.3.7 | Approval with quota and maker-checker; all approvals logged | Complies | Quota per union; maker-checker; audit trail | E-2.4.1 |
| 1.2.3.8 | Unique Beneficiary ID; location linkage union to division | Complies | ID generated at enrollment; geocoded hierarchy | E-2.4.1 |
| 1.2.3.9 | Privacy notice and non-bypassable digital consent | Complies | Consent checkpoint cannot be skipped in any channel | E-2.4.1; E-3.6.5 |
| 1.2.3.10 | Duplicate prevention through NID/BRN and Single Registry | Complies and exceeds | Checks at application, approval and payroll | E-2.4.1; E-2.4.3 |
| 1.2.3.11 | No AI approval or rejection of applications | Complies | Agents have no approval rights; enforced and tested | E-3.4.3; E-4.4.4 |
| 1.2.4 Subsystem 2: Beneficiary profile management | 1.2.4 Subsystem 2: Beneficiary profile management | 1.2.4 Subsystem 2: Beneficiary profile management | 1.2.4 Subsystem 2: Beneficiary profile management | 1.2.4 Subsystem 2: Beneficiary profile management |
| 1.2.4.1-1.2.4.2 | Comprehensive profile: personal, household, status, payments, compliance, grievances, training | Complies | Single profile aggregating all records | E-2.4.2 |
| 1.2.4.3 | Role- and jurisdiction-based viewing and editing | Complies | Geographic scope applied in every query | E-2.4.2; E-3.6.2 |
| 1.2.4.4 | Full audit log with previous and new values | Complies | Tamper-evident audit chain | E-2.4.2; E-3.6.5 |
| 1.2.4.5 | Status change, correction, transfer, exit, graduation | Complies | Lifecycle states with documented reasons | E-2.4.2 |
| 1.2.5 Subsystem 3: Benefit calculation, payroll, payment tracking and reconciliation | 1.2.5 Subsystem 3: Benefit calculation, payroll, payment tracking and reconciliation | 1.2.5 Subsystem 3: Benefit calculation, payroll, payment tracking and reconciliation | 1.2.5 Subsystem 3: Benefit calculation, payroll, payment tracking and reconciliation | 1.2.5 Subsystem 3: Benefit calculation, payroll, payment tracking and reconciliation |
| 1.2.5.1-1.2.5.2 | Configurable benefit rules; Tk 850 for up to 36 months; policy conditions enforced | Complies | Rules engine; amounts and durations configurable | E-2.4.3 |
| 1.2.5.3 | Configurable payment cycles | Complies | Monthly default; quarterly or other by configuration | E-2.4.3 |
| 1.2.5.4 | Payroll lists for approval; interface to SPBMU / iBAS++ or gateway; confirmations and bounce-backs | Complies | Signed payroll files and API exchange | E-2.4.3; E-3.3.4 |
| 1.2.5.5 | Transaction status, failure reasons, correction and re-payment | Complies | Status per transaction; correction workflow | E-2.4.3 |
| 1.2.5.6 | Reconciliation and financial-control reports; bank/MFS file ingestion | Complies | Reconciliation engine; file and API ingestion | E-2.4.3 |
| 1.2.5.6.1 | Automated reconciliation: flag reason, SMS alert, re-payment queue under maker-checker | Complies | Automated without manual database intervention | E-2.4.3 |
| 1.2.5.7 | Payroll approval with authorised officers; no AI payment authority | Complies | Maker-checker; agents excluded | E-2.4.3; E-3.4.3 |
| 1.2.5.8 | 1,000,000 payments within 4 hours without impact | Complies and exceeds | Committed under 3 hours; engine about 1 hour | E-3.7.3; E-4.4.5 |
| 1.2.6 Subsystem 4: Training management | 1.2.6 Subsystem 4: Training management | 1.2.6 Subsystem 4: Training management | 1.2.6 Subsystem 4: Training management | 1.2.6 Subsystem 4: Training management |
| 1.2.6.1.1-1.2.6.1.5 | Scheduling, enrollment, attendance on mobile, content, assessment, certification | Complies | All functions; also used for implementation training | E-2.4.4; E-4.3.5 |
| 1.2.6.2 | Training reports on dashboards and in profiles | Complies | Feeds KPI area F and the profile | E-2.4.4 |
| 1.2.7 Subsystem 5: Grievance redress, feedback channels and system-use GRM | 1.2.7 Subsystem 5: Grievance redress, feedback channels and system-use GRM | 1.2.7 Subsystem 5: Grievance redress, feedback channels and system-use GRM | 1.2.7 Subsystem 5: Grievance redress, feedback channels and system-use GRM | 1.2.7 Subsystem 5: Grievance redress, feedback channels and system-use GRM |
| 1.2.7.1-1.2.7.2 | Built-in GRS for complaints, appeals, fraud reports, service issues | Complies | All four grievance types | E-2.4.5 |
| 1.2.7.3 | Workflow, notifications, escalation, time-bound tracking, analytics, audit | Complies | SLA clocks and escalation rules | E-2.4.5 |
| 1.2.7.4 | Interoperability with national GRS | Complies | Adapter through the Data Hub | E-2.4.5; E-4.2.4 |
| 1.2.7.5 | Feedback channels: in-app, helpdesk, surveys, reports | Complies | Channels feed the improvement cycle | E-2.4.5 |
| 1.2.7.6 | Continuous improvement into quarterly updates | Complies | Quarterly improvement backlog and release | E-4.5.6 |
| 1.2.7.7 | Dedicated system-use GRM | Complies | Separate scope for system-level concerns | E-2.4.5; E-4.5.6 |
| 1.2.8 Subsystem 6: Interoperability, Secure Data Hub / API Bank | 1.2.8 Subsystem 6: Interoperability, Secure Data Hub / API Bank | 1.2.8 Subsystem 6: Interoperability, Secure Data Hub / API Bank | 1.2.8 Subsystem 6: Interoperability, Secure Data Hub / API Bank | 1.2.8 Subsystem 6: Interoperability, Secure Data Hub / API Bank |
| 1.2.8.1 | Integration with EC NID, BDRIS, DGHS, DGFP, iBAS++/SPBMU, MFS/banks, GRS, Single Registry, others | Complies | Nine adapters, one per system | E-2.4.6; E-3.3.4 |
| 1.2.8.2 | REST/JSON/XML with secure tokens; consume and expose; minimum data | Complies | Minimum-necessary rule in each interface control document | E-3.3.2 |
| 1.2.8.3 | Authentication, encryption, logging, retry, fallback, error handling | Complies | Retry, queue and fallback per partner | E-3.3.5 |
| 1.2.8.4 | Data Hub / API Bank: aggregation, canonical models, gateway lifecycle, GovStack-aligned X-Road patterns | Complies and exceeds | APISIX gateway plus X-Road 7 Security Server | E-3.3.1-E-3.3.3 |
| 1.2.8.5 | Governed bulk exchange as secondary layer | Complies | Subsystem 13 bulk exchange | E-3.3.6 |
| 1.2.8.6 | Coordination with system owners; MoWCA facilitates MoUs | Complies | Seven-step integration track per partner from week 1 | E-4.2.4 |
| 1.2.8.7 | Mandatory joint integration tests; signed cases, logs and approvals before go-live | Complies | Joint test cycles W18-W28; Go/No-Go criterion | E-4.2.4; E-4.2.6 |
| 1.2.8.8 | Open standards; Future Interoperability Roadmap | Complies | Roadmap delivered with design | E-3.3.7 |
| 1.2.9 Subsystem 7: Monitoring, dashboards, self-service MIS and reporting | 1.2.9 Subsystem 7: Monitoring, dashboards, self-service MIS and reporting | 1.2.9 Subsystem 7: Monitoring, dashboards, self-service MIS and reporting | 1.2.9 Subsystem 7: Monitoring, dashboards, self-service MIS and reporting | 1.2.9 Subsystem 7: Monitoring, dashboards, self-service MIS and reporting |
| 1.2.9.1-1.2.9.2 | Role-wise interactive dashboards; KPIs across programme areas | Complies | Role home dashboards | E-2.4.7; E-3.5.2 |
| 1.2.9.3 | Standard and ad hoc reports, exports, drill-down, trend analysis | Complies | PDF and Excel; drill-down to union | E-2.4.7 |
| 1.2.9.4 | Dedicated analytics server and warehouse; ETL; no effect on production | Complies | ClickHouse on separate servers; CDC and nightly batch | E-3.2.5 |
| 1.2.9.5 | AI-powered Executive Intelligence Dashboard on desktop, tablet, mobile; advisory only | Complies | Responsive dashboard; AI outputs advisory | E-2.4.7; E-3.11.1 |
| 1.2.9.6 | Self-service no-code dashboards; SMS and e-mail campaigns under 1.2.15 governance | Complies | Dashboard builder; Notification Hub | E-2.4.7; E-3.5.4 |
| 1.2.9.7 | KPI catalogue in nine areas, approved by MoWCA | Complies | Catalogue owned by BI and GIS Specialist | E-2.4.7; E-5.4 |
| 1.2.9.8 | Visualisation, filters by level and time, scheduled reports, exports | Complies | All listed functions | E-2.4.7 |
| 1.2.10 Subsystem 8: GIS programme intelligence | 1.2.10 Subsystem 8: GIS programme intelligence | 1.2.10 Subsystem 8: GIS programme intelligence | 1.2.10 Subsystem 8: GIS programme intelligence | 1.2.10 Subsystem 8: GIS programme intelligence |
| 1.2.10.1-1.2.10.2 | GIS engine and dashboard; layers, heatmaps, clustering, exports | Complies | PostGIS, GeoServer, MapLibre | E-2.4.8; E-3.5.1 |
| 1.2.10.3 | Navigation division to union / pourashava / city corporation | Complies | Drill-down keeping filters and context | E-2.4.8 |
| 1.2.10.4 | Privacy-preserving location use; no continuous tracking | Complies | Purpose-limited geotags only | E-2.4.8 |
| 1.2.10.5 | Spatial data quality; governed layers; GIS Architecture and Layer Catalogue | Complies | Layers under maker-checker; catalogue at design gate | E-3.5.1 |
| 1.2.10.6 | GIS in application, verification and mobile workflows | Complies | Location capture in forms and app | E-2.4.8 |
| 1.2.11 Subsystem 9: Agentic AI and bilingual AI assistant | 1.2.11 Subsystem 9: Agentic AI and bilingual AI assistant | 1.2.11 Subsystem 9: Agentic AI and bilingual AI assistant | 1.2.11 Subsystem 9: Agentic AI and bilingual AI assistant | 1.2.11 Subsystem 9: Agentic AI and bilingual AI assistant |
| 1.2.11.1-1.2.11.2 | Four agents with workflows, permissions, approval gates, HITL, full audit | Complies | Data Collection, Report, Alert, Calculation agents | E-2.4.9; E-3.4.2 |
| 1.2.11.3 | Prohibitions on autonomous selection, eligibility, payroll, payment, master data | Complies | Enforced by permission model and tested with adversarial prompts | E-3.4.3; E-4.4.4 |
| 1.2.11.4 | Embedded Bangla/English assistant respecting access rules | Complies | Answers within user role and geography | E-3.4.4 |
| 1.2.11.5 | AI and Agentic AI Design Document; AI Governance and HITL Plan | Complies | Delivered at design gate W9-W10 | E-3.4.6; E-4.6.1 |
| Addendum (minutes item 6) | AI/LLM hosted at BCC NDC or approved government cloud; no data outside Bangladesh | Complies | Open-weight models on BCC GPUs; CPU fallback | E-3.4.1; E-3.4.5 |
| 1.2.12 Subsystem 10: Mobile application | 1.2.12 Subsystem 10: Mobile application | 1.2.12 Subsystem 10: Mobile application | 1.2.12 Subsystem 10: Mobile application | 1.2.12 Subsystem 10: Mobile application |
| 1.2.12.1 | Android and iOS for field operations | Complies | Flutter app on both platforms | E-2.4.10; E-3.5.3 |
| 1.2.12.2 | Offline capture, sync, conflict resolution, local protection | Complies | Offline-first with conflict choice | E-3.5.3 |
| 1.2.12.3 | Lightweight; low bandwidth; low-end devices | Complies | Device matrix incl. 2 GB Android | E-4.4.4 |
| 1.2.12.4 | Encrypted local data; PIN or biometric; store or MDM updates | Complies | All three | E-3.5.3; E-3.11.3 |
| 1.2.12.5 | Bangla and English | Complies | One-tap toggle | E-3.11.3 |
| 1.2.13 Subsystem 11: User management and access control | 1.2.13 Subsystem 11: User management and access control | 1.2.13 Subsystem 11: User management and access control | 1.2.13 Subsystem 11: User management and access control | 1.2.13 Subsystem 11: User management and access control |
| 1.2.13.1-1.2.13.2 | RBAC, geographic scope, MFA, password policy, lockout, audit, separation of duties | Complies | Keycloak IAM; maker-checker | E-2.4.11; E-3.6.2 |
| 1.2.14 Subsystem 12: Help desk, helpline and CRM, referral management | 1.2.14 Subsystem 12: Help desk, helpline and CRM, referral management | 1.2.14 Subsystem 12: Help desk, helpline and CRM, referral management | 1.2.14 Subsystem 12: Help desk, helpline and CRM, referral management | 1.2.14 Subsystem 12: Help desk, helpline and CRM, referral management |
| 1.2.14.1 | Ticketing, categories, assignment, KB, SLA monitoring, notifications | Complies | Helpdesk inside the MIS | E-2.4.12; E-4.5.2 |
| 1.2.14.2 | Summary logs to MoWCA; status visible in MIS | Complies | Logs remain in MoWCA system | E-4.5.2 |
| 1.2.14.3 | CTI, IVR, call logging, ticketing/CRM | Complies | Open-source PBX with Bangla IVR | E-2.4.12 |
| 1.2.14.4 | End-to-end referral tracking | Complies | Referral workflow with outcome closure | E-2.4.12 |
| 1.2.15 Subsystem 13: Dynamic module creation and governed bulk exchange | 1.2.15 Subsystem 13: Dynamic module creation and governed bulk exchange | 1.2.15 Subsystem 13: Dynamic module creation and governed bulk exchange | 1.2.15 Subsystem 13: Dynamic module creation and governed bulk exchange | 1.2.15 Subsystem 13: Dynamic module creation and governed bulk exchange |
| 1.2.15.1.1 | No-code configuration of modules, forms, workflows, rules, KPIs, dashboards, reports, GIS layers, API mappings, templates | Complies | Configuration studio | E-2.4.13 |
| 1.2.15.1.2 | Governance: owners, maker-checker, versioning, promotion, validation, rollback, audit, review | Complies | Versioned configuration with one-click restore | E-2.4.13; E-3.9.3 |
| 1.2.15.1.3 | Enterprise security controls on all dynamic content | Complies | Same controls apply | E-3.6 |
| 1.2.15.1.4 | Defects fixed in support; major extensions by change control | Complies | Enhancement bucket and change control | E-4.5.6 |
| 1.2.15.2 | Governed bulk import/export with validation, approval, reconciliation, audit | Complies | Used for legacy ingestion too | E-2.4.13; E-6.1.7 |
| 1.2.16 Subsystem 14: Multi-scheme extensibility | 1.2.16 Subsystem 14: Multi-scheme extensibility | 1.2.16 Subsystem 14: Multi-scheme extensibility | 1.2.16 Subsystem 14: Multi-scheme extensibility | 1.2.16 Subsystem 14: Multi-scheme extensibility |
| 1.2.16.1-1.2.16.3 | Multiple programmes; no-code creation of programmes, rules, workflows; inheritance of security, NID, payment, GRS | Complies and exceeds | Multi-scheme engine with code isolation; specification at design gate | E-2.4.14; E-3.1.3 |
| 1.3 Architecture of the Information System | 1.3 Architecture of the Information System | 1.3 Architecture of the Information System | 1.3 Architecture of the Information System | 1.3 Architecture of the Information System |
| 1.3.1.1 | Secure, modular, API-first; Java/Spring Boot preferred; Python for AI; justify stack | Complies | Java 21 and Spring Boot; Python for AI | E-3.1.4 |
| 1.3.1.2 | Modular, distributed, microservices; scaling; containers and Kubernetes | Complies | 22 services and 9 adapters on Kubernetes | E-3.1.3 |
| 1.3.1.3 | BeGA, NDGIO, approved middleware, GovStack | Complies | Mapped in E-3.1.5 | E-3.1.5 |
| 1.3.1.4 | Open standards; COTS disclosed; licences to MoWCA | Complies | Open-source stack; SBOM | E-3.1.4; E-3.9.5 |
| 1.3.1.5 | Scalable beyond legacy capacity without degradation | Complies and exceeds | Sized for 3 M active, 10 M+ history | E-3.7.2; E-3.8 |
| 1.3.1.6 | Dev, Test, Staging, Training, Production; CI/CD; DevSecOps | Complies | Five environments plus DR; nine pipeline gates | E-3.9 |
| 1.3.2.1-1.3.2.2 | Reference architecture layers | Complies | All eight layers provided | E-3.1.2 |
| 1.3.3.1-1.3.3.7 | Database, front-end, interoperability platform, orchestration, analytics, coding standards, licensing | Complies | PostgreSQL, React/Next.js, Flutter, APISIX/X-Road, Kubernetes, ClickHouse | E-3.1.4 |
| 1.3.4.1-1.3.4.2 | Central IAM/SSO; security architecture in SDD | Complies | Keycloak; security model in SDD | E-3.6.2 |
| 1.3.5.1-1.3.5.3 | Database design, dictionary, ER model; warehouse via ETL; Data Governance Framework | Complies | Delivered at design gate | E-3.2 |
| 1.3.6.1-1.3.6.2 | Tier-1 / Tier-2 separation; aggregation engine; suppression rules | Complies and exceeds | Physical separation; k = 10 with secondary suppression | E-3.2.3; E-3.2.4 |
| 1.3.7.1 | Environments, pipelines, automated tests, configuration, rollback, release, documentation | Complies | GitOps with Argo CD; IaC | E-3.9 |
| 1.3.8.1 | Bangla and English, Unicode, translations, i18n framework | Complies | Message catalogues; translator in team | E-3.5.4; E-5.3.2 |
| 1.3.8.2 | Usability: clean screens, role home dashboard, local-language errors, guidance | Complies | Design rules tested with users | E-3.11 |
| 1.3.8.3 | Accessibility, WCAG 2.0 AA | Complies | axe-core and manual checks | E-4.4.4 |
| 1.3.8.4 | Participatory design; two rounds of field validation | Complies and exceeds | Observation in 8 divisions before design; rounds W8-9 and W27-28 | E-2.3.4; E-4.4.3 |
| 1.3.8.5 | Acceptable performance on UDC bandwidth | Complies | Pages under 100 KB on the portal | E-3.1.7 |
| 1.4 System administration, monitoring, backup and DR | 1.4 System administration, monitoring, backup and DR | 1.4 System administration, monitoring, backup and DR | 1.4 System administration, monitoring, backup and DR | 1.4 System administration, monitoring, backup and DR |
| 1.4.1.1-1.4.1.4 | User and role administration, roles, temporary accounts, password policy, CAPTCHA | Complies | All administration functions | E-2.4.11; E-3.6.2 |
| 1.4.2.1-1.4.2.4 | Audit logs of critical actions; tamper-evident; activity reports; suspicious-activity alerts | Complies | Hash-chained audit; SIEM rules | E-3.6.5 |
| 1.4.3.1-1.4.3.2 | Configuration governance; no material change without approval | Complies | Change control procedure | E-4.1.9 |
| 1.4.4.1-1.4.4.2 | Monitoring of uptime, performance, errors, integrations, jobs, backups, security | Complies | Prometheus, Grafana, Loki, Tempo, Wazuh | E-3.7.6 |
| 1.4.5.1-1.4.5.2 | Automated daily incremental and weekly full backups; encrypted; separate storage | Complies and exceeds | Plus 5-minute WAL archiving | E-3.7.5 |
| 1.4.5.3 | RPO < 24 h; RTO < 48 h | Complies and exceeds | Design target RPO 15 min, RTO 4 h | E-3.7.5 |
| 1.4.5.4-1.4.5.5 | Deployable at BCC DR; replication; DR/BCP | Complies | Warm standby at BCC DR | E-3.7.5 |
| 1.4.5.6-1.4.5.7 | Quarterly restore tests; DR drill before go-live and in support; backup notifications | Complies | Scheduled W33 and M16; quarterly restores | E-4.5.5 |
| 1.5 Performance requirements | 1.5 Performance requirements | 1.5 Performance requirements | 1.5 Performance requirements | 1.5 Performance requirements |
| 1.5.1 (API) | Average API response under 2 s | Complies | Response-time budget per tier | E-3.7.1 |
| 1.5.1 (page) | Average page response under 3 s | Complies | Tested at 10,000 users | E-4.4.5 |
| 1.5.1 (availability) | 99.9% design availability | Complies | No single instance in request path | E-3.7.5 |
| 1.5.1 (batch) | 1,000,000 payments in 2 to 3 hours | Complies and exceeds | Under 3 hours; engine about 1 hour | E-3.7.3 |
| 1.5.1 (users) | At least 5,000 concurrent users | Complies and exceeds | Tested at 10,000 | E-4.4.5 |
| 1.5.1 (API throughput) | At least 10,000 API requests per minute | Complies and exceeds | Tested at 20,000 | E-4.4.5 |
| 1.5.1 (scale) | 1.0-1.5 M+ active beneficiaries | Complies and exceeds | Sized for 3 M | E-3.8.2 |
| 1.5.1.1-1.5.1.3 | Vertical and horizontal scaling; load, stress, endurance tests; targets in SRS | Complies | 72-hour endurance included | E-3.7.4; E-4.4.5 |
| 1.6 Cyber security | 1.6 Cyber security | 1.6 Cyber security | 1.6 Cyber security | 1.6 Cyber security |
| 1.6.1 | Security-first approach; reviews by Cybersecurity Specialist | Complies | Specialist in Design Authority | E-3.6; E-5.4 |
| 1.6.2 | Enterprise security standards applied consistently | Complies | Applied to dashboards, GIS, bulk, APIs, mobile, dynamic modules | E-3.6.1 |
| 1.6.3 | Encryption at rest (AES-256) and in transit (TLS); key management; masking | Complies | OpenBao vault; field encryption | E-3.6.3 |
| 1.6.4 | Password policy, brute-force protection, Bangla CAPTCHA, sessions | Complies | Keycloak policies | E-3.6.2 |
| 1.6.5 | Write-once, tamper-evident audit trail | Complies | Hash-chained audit | E-3.6.5 |
| 1.6.6 | Secure coding, OWASP Top 10, SAST, third-party VAPT; no open critical/high at go-live | Complies | Pipeline gates; VAPT W29-32 | E-3.9.2; E-4.4.6 |
| 1.6.7 | Rate limiting, fraud-pattern detection, headers, API security, patching, mid-term pentest | Complies | SIEM fraud rules; pentest M15-16 | E-3.6; E-4.5.5 |
| 1.6.8 | Compliance with GoB ICT security, BeGA, ISO 27001, ISO 25010 | Complies | Riseup Labs ISO/IEC 27001 certified | E-3.6.6 |
| 1.6.9 | Consent, privacy notice, data minimisation | Complies | Do-No-Harm principles in design | E-3.6.5 |
| 1.6.10 | DPIA; annual privacy and security audit | Complies | DPIA at design gate; audit M20 | E-4.5.5 |
| 1.6.11 | Incident Response Plan; 24-hour escalation | Complies | IRP with notification protocol | E-3.6.5; E-4.5.4 |
| 1.6.12 | Coordinate with BCC SQTC; resolve critical/high before go-live | Complies | SQTC request W2, slot W4, testing W29-34 | E-4.4.6 |
| C. Service specifications: 2.1 System analysis, design and development | C. Service specifications: 2.1 System analysis, design and development | C. Service specifications: 2.1 System analysis, design and development | C. Service specifications: 2.1 System analysis, design and development | C. Service specifications: 2.1 System analysis, design and development |
| 2.1.1 | Formal analysis and design methodology | Complies | Stage gates with agile sprints | E-2.3.2; E-4.1.1 |
| 2.1.2.1-2.1.2.4 | Kick-off and consultations; document review; Inception Report and SRS; participatory workshops | Complies | W1-W6 | E-4.1.4; E-2.3.4 |
| 2.1.3 (1-14) | Fourteen design deliverables (SRS to multi-scheme specification) | Complies | All delivered by design gate W10 | E-4.6.1 |
| 2.1.4.1-2.1.4.4 | User manuals, admin/technical manuals, documented source code, CASE artefacts in Git | Complies | Bangla and English; Git from week 1 | E-6.2.6; E-6.2.7 |
| 2.1.5 | Lifecycle phases I-VI with milestones; 36 weeks then 12 months | Complies | Gates match phases | E-4.2.1 |
| 2.2 Software customisation / development | 2.2 Software customisation / development | 2.2 Software customisation / development | 2.2 Software customisation / development | 2.2 Software customisation / development |
| 2.2.1.1 | Iterative, sprint-based development with demos and quality gates | Complies | 11 sprints; demos every two weeks | E-4.2.2 |
| 2.2.1.2 | Enterprise-grade, modular, open-source preferred stack | Complies | Open-source stack | E-3.1.4 |
| 2.2.1.3 | Responsive, bilingual, accessible, low-bandwidth web | Complies | React/Next.js responsive | E-3.11.1 |
| 2.2.1.4 | Android and iOS offline-capable apps | Complies | Flutter | E-3.5.3 |
| 2.2.1.5 | Version control, coding standards, code review, SBOM, CI/CD; code to MoWCA and NSCR | Complies | GitLab; CycloneDX SBOM | E-3.9.5; E-6.2.7 |
| 2.2.1.6 | Code quality, documented APIs, OWASP, SAST, unit tests | Complies | Quality gate in pipeline | E-4.4.4 |
| 2.2.1.7 | COTS disclosed, approved, licences transferred | Complies | No COTS needed | E-3.1.4 |
| 2.3 System integration | 2.3 System integration | 2.3 System integration | 2.3 System integration | 2.3 System integration |
| 2.3.1.1 | Review of external systems; documentation, keys, test environments | Complies | Interface control documents per partner | E-4.2.4 |
| 2.3.1.2-2.3.1.3 | Integration requirements per system: type, frequency, standards, retry and fallback | Complies | Integration Plan at design gate | E-3.3.4; E-3.3.5 |
| 2.3.1.4 | Develop middleware, APIs, adapters; implement Data Hub | Complies | Data Hub and nine adapters | E-3.3 |
| 2.3.1.5 | Joint integration testing with all agencies; signed evidence; fallbacks | Complies | Joint cycles W18-W28 | E-4.2.4 |
| 2.3.1.6 | Delays from external access handled under schedule provisions | Complies | Dependency log and change control | E-4.1.6 |
| 2.4 Training and training materials (transfer of knowledge) | 2.4 Training and training materials (transfer of knowledge) | 2.4 Training and training materials (transfer of knowledge) | 2.4 Training and training materials (transfer of knowledge) | 2.4 Training and training materials (transfer of knowledge) |
| 2.4.1 | Structured training; continuous knowledge transfer; final handover workshop | Complies | Four-step KT; workshop M21 | E-4.3; E-6.2 |
| 2.4.2 | User training before go-live; cascade; Bangla materials; modes and testing | Complies | 12 batches W29-W35; cascade; pre/post tests | E-4.3.2-E-4.3.6 |
| 2.4.3 | Technical training: administration, source code, DB, APIs, deployment, backup, DR; drills | Complies and exceeds | 132-hour curriculum plus drills | E-6.2.3-E-6.2.5 |
| 2.4.4 | Change Management Plan, Change Champion Network, Toolkit | Complies | Champions from 300 master users | E-4.2.8 |
| 2.4.5 | Materials, manuals, quick guides, videos, Training Completion Report | Complies | Report with Go-Live Report | E-4.3.5; E-4.3.6 |
| 2.4.6 | Training volume per price schedule; programmes in Inception Report | Complies | 12 x 25; materials for 300 | E-4.3.2 |
| 2.5 Data conversion and migration | 2.5 Data conversion and migration | 2.5 Data conversion and migration | 2.5 Data conversion and migration | 2.5 Data conversion and migration |
| 2.5.1 | Migrate approved legacy data into MCBP-MIS | Complies | 4.0-5.0 M records planned | E-6.1.1 |
| 2.5.1.1 | Early assessment and profiling; strategy, mapping, scripts, reconciliation, rollback | Complies | Profiling W3-5 | E-6.1.4-E-6.1.7 |
| 2.5.1.2 | At least one dry run and migrated test data before UAT; final migration | Complies and exceeds | Three dry runs and a rehearsal | E-6.1.9 |
| 2.5.1.3 | 100% count reconciliation; ≥ 99.5% field accuracy; exception log; repeat validation | Complies | Four-level reconciliation; 4,800-record sample | E-6.1.10 |
| 2.5.1.4 | Historical beneficiary and payment records; bulk templates for ingestion | Complies | Payment history in scope | E-6.1.1; E-6.1.7 |
| 2.5.1.5 | Staged migration; repeated script tests; reconciliation report | Complies | Five stages with checks | E-6.1.8 |
| 2.5.1.6 | Parallel or read-only legacy; cut-over strategy in Inception Report | Complies | Cut-over plan in Inception Report | E-6.1.11 |
| 2.5.1.7 | Legacy owner provides data and access | Complies | Recorded as dependency W3 | E-4.1.6; E-6.1.3 |
| 2.5.1.8 | Freeze ≤ 48 h on weekend; zero payment disruption; legacy read-only ≥ 6 months | Complies | Thursday 18:00 to Saturday 18:00 after cycle close | E-6.1.11; E-6.1.13 |
| 2.6 Documentation requirements | 2.6 Documentation requirements | 2.6 Documentation requirements | 2.6 Documentation requirements | 2.6 Documentation requirements |
| 2.6.1.1 | End-user documents in Bangla and English | Complies | Full set | E-6.2.6 |
| 2.6.1.2 | Technical documents in English; editable, version-controlled, as-built | Complies | Wiki and repository | E-6.2.6 |
| 2.6.2 (1-10) | Ten deliverables on the indicative timeline | Complies | Each on or before the RFP date | E-4.6.1 |
| 2.6.2.1 | Fortnightly progress reports; monthly in maintenance; quarterly reviews | Complies | Report contents defined | E-4.6.2 |
| 2.6.2.2 | Comment-resolution matrix; resubmit in five working days | Complies | Matrix in project office tools | E-4.6.3 |
| 2.7 Supplier technical team | 2.7 Supplier technical team | 2.7 Supplier technical team | 2.7 Supplier technical team | 2.7 Supplier technical team |
| 2.7.1 | Fourteen key positions with qualifications; replacement only with approval | Complies | 21 persons in 14 positions; CVs for all | E-5 |
| 2.7.1 (non-key) | Additional non-key staff at Supplier cost | Complies | 59 person-months in RFP-named roles | E-5.3.2 |
| D. Technology specifications: 3.1 and 3.2 | D. Technology specifications: 3.1 and 3.2 | D. Technology specifications: 3.1 and 3.2 | D. Technology specifications: 3.1 and 3.2 | D. Technology specifications: 3.1 and 3.2 |
| 3.1.1.1 | Bangla and English UI, reports, notifications; Unicode; embedded Bangla fonts; Bangla numerals and dates | Complies | Full localisation | E-3.5.4 |
| 3.1.1.2 | Bangla translations of system text and training materials; MoWCA verifies terms | Complies | Translator in team; glossary at W6 | E-5.3.2; E-4.6.5 R13 |
| 3.1.1.3 | AI assistant, notification hub, CAPTCHA, KB in Bangla and English | Complies | All bilingual | E-3.4.4; E-3.5.4 |
| 3.2.1.1 | Hosting at BCC NDC or approved cloud; BCC DR; data localisation | Complies | BCC NDC primary, BCC DR secondary | E-3.8.1 |
| 3.2.1.2 | Liaise with BCC in advance for all environments | Complies | Requests W2, W7-9, W14, W20, W26 | E-4.2.3 |
| 3.2.1.3 | Sizing with capacity calculations in Technical Proposal | Complies | Phased sizing with calculations | E-3.8.2-E-3.8.4 |
| 3.2.1.4 | Hosting costs borne by Purchaser; system tuned and documented | Complies | Provisional sum respected | E-3.8 |
| 3.2.1.5 | Automated backup, logging, monitoring, DR | Complies | Open-source monitoring stack | E-3.7.5; E-3.7.6 |
| 3.2.2 | Hosting infrastructure inventory (Table 3) | Complies | Completed | E-3.8.5 |
| E. Testing and quality assurance | E. Testing and quality assurance | E. Testing and quality assurance | E. Testing and quality assurance | E. Testing and quality assurance |
| 4.1.1 | Review by committee; MoWCA final approval; five-day resolution | Complies | Acceptance procedure | E-4.6.3 |
| 4.1.2 | Quality gates before submission; testing evidence | Complies | Six-step internal gate | E-4.4.1 |
| 4.1.3 | Purchaser rights of inspection and audit | Complies | Read-only accounts from week 1 | E-3.10.4 |
| 4.2.1 (S-1 hosting) | Pre-commissioning: hosting and deployment readiness | Complies | Build from repository, restore, failover | E-4.4.8 |
| 4.2.1 (S-2 mobile) | Pre-commissioning: mobile apps and devices | Complies | Store/MDM install, offline, device matrix | E-4.4.8 |
| 4.2.1 (S-3 platform) | Pre-commissioning: software platform | Complies | Role and geography tests, integration evidence | E-4.4.8 |
| 4.2.1 (entire system) | Pre-commissioning: end-to-end, 1 M payments, RPO/RTO, response times | Complies | End-to-end scenarios | E-4.4.8 |
| 4.3.1 (SS1-SS14) | Operational acceptance tests per subsystem | Complies | One-to-one mapping of OAT table | E-4.4.8 |
| 4.3.1 (cross-cutting) | Load, VAPT, SQTC, DR drill, migration reconciliation, second usability round | Complies | All scheduled before W36 | E-4.4.3 |
| 4.3.2 | Pilot and Go/No-Go Plan; ten criteria | Complies | Pilot W31-34; decision W34 | E-4.2.5; E-4.2.6 |
| 4.3.3 | SQTC independent testing; certificate precondition for final acceptance | Complies | SQTC plan agreed at inception | E-4.4.6 |
| 4.3.4 | Acceptance sequence: Operational Acceptance then Final Acceptance after support | Complies | G6 and G7 | E-4.2.1 |
| F. Recurrent cost items: 5.1 to 5.3 | F. Recurrent cost items: 5.1 to 5.3 | F. Recurrent cost items: 5.1 to 5.3 | F. Recurrent cost items: 5.1 to 5.3 | F. Recurrent cost items: 5.1 to 5.3 |
| 5.1.1 | 12 months of maintenance and support from Go-Live | Complies | M10-M21; plus 36-month defect repair under GCC 29.4 | E-4.5.1 |
| 5.1.2 | Maintenance scope | Complies | Preventive maintenance calendar | E-4.5.5 |
| 5.1.3 | Service levels: availability, helpdesk hours, 24/7 critical channel, 95% within SLA, backups, security | Complies | Monthly SLA reporting | E-4.5.3 |
| 5.1.3 (matrix) | Severity matrix: critical 15 min / 4 h / 8 h; medium 4 h / 3 days; low 1 day / 7 days | Complies | Clocks automated in helpdesk | E-4.5.3 |
| 5.1.4 | RCA, corrective action, service credits | Complies | Within the period MoWCA directs | E-4.5.7 |
| 5.2.1 | Helpdesk by phone, e-mail, ticketing in Bangla and English | Complies | Subsystem 12 | E-4.5.2 |
| 5.2.2 | On-site support for critical issues; proactive visits | Complies and exceeds | Two L1 engineers seated at DWA HQ; monthly field visits | E-4.5.2 |
| 5.2.3 | Monitoring; monthly and quarterly reports; quarterly reviews | Complies | D8 and D9 | E-4.5.7 |
| 5.2.4 | Backups, quarterly restore tests, DR drills with BCC | Complies | Quarterly on staging | E-4.5.5 |
| 5.2.5 | Security patches, vulnerability remediation, log review | Complies | Remediation timelines committed | E-4.4.6 |
| 5.2.6 | Audit and compliance support; annual audit | Complies | Audit M20 | E-4.5.5 |
| 5.2.7 | About 30 person-days per year of minor enhancements | Complies | Balance shown monthly | E-4.5.6 |
| 5.2.8 | Capacity building and handover; transition cooperation | Complies | KT in support year; S4 handover | E-6.2 |
| 5.3.1 | Support team composition and level of effort | Complies | 47 person-months; persons named | E-5.3.3; E-4.5.8 |
| Implementation Schedule, Site Table, Holidays and System Inventory | Implementation Schedule, Site Table, Holidays and System Inventory | Implementation Schedule, Site Table, Holidays and System Inventory | Implementation Schedule, Site Table, Holidays and System Inventory | Implementation Schedule, Site Table, Holidays and System Inventory |
| Impl. lines 0-11 | Delivery, installation and acceptance weeks for each line | Complies | All dates on or before the limits | E-4.1.6 |
| Site Table S-1 to S-8 | Sites; mandatory pilot at 8 locations in 8 divisions with costs included | Complies | Sites and pilot plan; pilot costs in financial proposal | E-4.1.3; E-4.2.5 |

### Table C | Working days; holidays; no cut-over in payment runs | Complies | Calendar rules in baseline | E-4.1.3

| Inventory 1-12 | Project management and analysis deliverables | Complies | Inception to Test Plan | E-4.6.1 |
| Inventory 13-27 | Fourteen software subsystems, production-ready | Complies | All subsystems | E-2.4 |
| Inventory 28-33 | Migration, environments, DR, VAPT/SQTC, training, change management | Complies | Covered | E-6.1; E-3.9; E-4.3; E-4.4 |
| Inventory 34-38 | Manuals, technical documentation, source code, Go-Live reports, sustainability plan | Complies | Covered | E-6.2 |
| Recurrent R1-R11 | Support, helpdesk, reports, enhancements, pentest, DR drill, audit, visits, workshops, final KT | Complies | All in support plan | E-4.5 |

### Table 3 | Hosting infrastructure inventory | Complies | Completed | E-3.8.5

| Supplementary Sections S1 to S5 | Supplementary Sections S1 to S5 | Supplementary Sections S1 to S5 | Supplementary Sections S1 to S5 | Supplementary Sections S1 to S5 |
| S1.1 | Institutional arrangements; reporting to PD; key personnel availability | Complies | Governance mirrors S1.1 | E-4.1.2; E-5.5 |
| S1.2 | Performance management: baseline, reporting, governance, quality gates, change control, corrective action | Complies | All registers from week 1 | E-4.1.1; E-4.6.6 |
| S1.3 | RACI | Complies | Refined by work package | E-4.1.2; E-6.1.3 |
| S1.4 | Risk Management Framework; monthly review; 24-hour escalation | Complies and exceeds | 24-risk register with triggers and contingencies | E-4.6.4; E-4.6.5 |
| S2.1 | Firm qualifications | Complies | See Part B | Part B |
| S2.2 | Evaluation criteria | Complies | Proposal structured on the criteria | E-2 to E-6 |
| S2.3 | Tentative major milestones and 36-week period | Complies | Milestones matched | E-4.1.6 |
| S3 | Payment schedule against accepted deliverables | Complies | Acknowledged | E-4.6.3 |
| S4 | Final handover, sustainability and exit | Complies | Handover index, verification, roadmap | E-6.2.7-E-6.2.10 |
| S5.1 | IP, source code and data ownership; confidentiality; COTS | Complies | Accepted without reservation | E-6.2.7; E-5.5 |
| S5.2 | Compliance with GoB standards; independent testing support; editable deliverables | Complies | Accepted | E-3.6.6; E-4.4.6 |
| S5.3 | Environmental and social considerations | Complies | Code of Conduct; SEA/SH plans | E-5.5 |
| S5.4 | Information responsibility | Complies | Data stays at BCC | E-6.1.14 |

---

# ANNEX C — FULL CODEX AUDIT OF ORIGINAL ZIP (D01–D22)

The following file-by-file layout, data and control inventory is included verbatim (apart from the heading hierarchy as authored by Codex) to preserve all original observations. Its findings are based on source inspection, not independently verified browser screenshots.

# A. Executive Summary

The project is a self-contained, offline HTML visual demo for the Mother & Child Benefit Programme Management Information System (MCBP-MIS). It contains `index.html` plus 22 reference screens (`D01`–\`D22\`) covering:

- Responsive executive dashboards.
- Role-specific officer dashboards.
- Public mobile web.
- Android and iOS field/executive apps.
- Tablet supervision.
- API, integration, observability, CI/CD, security, backup, governance, payroll, AI, GIS, capacity, releases, and performance consoles.

All screens use inline CSS, inline SVG icons/charts, and local font assets. There are no external stylesheets, JavaScript files, JavaScript blocks, forms, inputs, API calls, databases, authentication logic, or dynamic state updates.

Navigation is implemented through ordinary HTML links. Most visible buttons and controls are static representations.

The source was inspected directly. Rendered browser appearance was not independently verified.

# B. Complete File Inventory (index + D01–D22)

| File                     | Screen title / purpose                                                | Role                                |
| ------------------------ | --------------------------------------------------------------------- | ----------------------------------- |
| `index.html`             | MCBP-MIS preliminary demo; catalogue of 22 reference screens          | All users / reviewers               |
| `D01_home_en.html`       | Role-specific home dashboard in English                               | Upazila Women Affairs Officer       |
| `D02_home_bn.html`       | Same home dashboard in Bangla                                         | Upazila Women Affairs Officer       |
| `D03_responsive.html`    | Executive Intelligence Dashboard in desktop, tablet, and phone frames | Programme Director / PMMCU          |
| `D04_mweb_en.html`       | Public portal mobile browser screens in English                       | Applicant / beneficiary             |
| `D05_mweb_bn.html`       | Public portal mobile browser screens in Bangla                        | Applicant / beneficiary             |
| `D06_android_en.html`    | Android sign-in, field home, verification, sync centre                | Field Verifier                      |
| `D07_android_bn.html`    | Same Android workflow in Bangla                                       | Field Verifier                      |
| `D08_ios_en.html`        | iOS executive KPIs, AI assistant, grievance, coverage map             | Executive user                      |
| `D09_tablet.html`        | Tablet supervisor dashboard                                           | Field Supervisor                    |
| `D10_gateway.html`       | API gateway and Data Hub / API Bank console                           | Platform Operator                   |
| `D11_xroad.html`         | X-Road exchange and partner connectivity console                      | Platform Operator                   |
| `D12_observability.html` | Platform health and observability console                             | Platform Operator                   |
| `D13_cicd.html`          | CI/CD pipelines and security gates                                    | DevOps / Platform Operator          |
| `D14_security.html`      | Security centre and SIEM status                                       | Security / Platform Operator        |
| `D15_backup.html`        | Backup and disaster recovery                                          | Platform Operator                   |
| `D16_datagov.html`       | Data governance and two-tier control                                  | Data Governance / Platform Operator |
| `D17_payroll.html`       | Payroll batch monitor                                                 | Payment / Platform Operator         |
| `D18_aigov.html`         | AI governance and human-in-the-loop                                   | AI Governance / Platform Operator   |
| `D19_gislayers.html`     | GIS layer catalogue and governance                                    | GIS / Platform Operator             |
| `D20_capacity.html`      | Capacity and autoscaling                                              | Platform Operator                   |
| `D21_releases.html`      | Environments, releases, evidence, deployment plan                     | DevOps / Release Manager            |
| `D22_perf.html`          | Load and performance test report                                      | QA / Performance Engineer           |

# C. Global Design System

## Shared visual language

- Primary dark green: `#004B37`
- Primary green: `#006A4E`
- Magenta accent: `#C2185B`
- Page background: `#F3F5F4`
- Desktop mockup background: `#DDE3E0`
- White cards: `#FFFFFF`
- Border: `#E1E7E4`
- Secondary border: `#D5DED9`
- Main text: `#111`
- Muted text: `#333`, `#444`, `#5B6660`
- Green status background: `#E4F1EC`
- Magenta status background: `#FBE7EF`
- Amber status background: `#FCF3DC`
- Blue status background: `#E6EEF8`
- Purple status background: `#EEE9F5`
- Neutral status background: `#ECEFED`

## Fonts

Local WOFF2 fonts in `fonts/`:

- Inter: weights 400, 500, 600, 700.
- Poppins: weights 500, 600, 700.
- Hind Siliguri: Bengali weights 400, 500, 600, 700.
- `DejaVu Sans Mono` for monospaced values.

General usage:

- Inter for body, labels, tables, controls.
- Poppins for headings, brand, KPI values.
- Hind Siliguri for Bangla screens.
- KPI value size is generally `27px`.
- Main desktop title is `24px`.
- Card heading is approximately `15.5px`.
- Body text is generally `13–14px`.

## Desktop frame

The primary web dashboard frame is fixed at:

- Width: `1440px`
- Height: `880px`
- Top header: `64px`
- Sidebar: `232px`
- Content padding: `18px 22px`
- Card radius: `14px`
- Button radius: `9px`
- Sidebar link radius: `9px`
- Header gradient: `linear-gradient(90deg,#004B37,#006A4E)`

The top navigation contains:

- Circular logo icon.
- `MCBP-MIS` brand and subtitle.
- Search placeholder.
- EN / বাংলা language pill.
- Bell icon.
- Avatar initials.
- User role and location.

## Mobile mockups

- Android phone frame: `392px × 820px`, dark outer shell, approximately `46px` radius.
- iOS phone uses a wide black top notch.
- Android phone uses a circular camera cutout.
- Mobile bottom navigation uses Home / Tasks / Sync / Help or equivalent.
- Tablet and phone layouts are represented as static frames within the HTML.

## Components

- White bordered cards with `14px` radius.
- Compact tables with bold, small headers and horizontal separators.
- Status badges use rounded pills.
- Progress bars use an `8px` high grey track.
- Charts are inline SVG.
- Navigation uses ordinary anchors.
- No shared external CSS file exists; styles are duplicated inline within each HTML file.

## Responsive behavior

There are no detected CSS `@media` rules. Desktop, tablet, Android, and iOS presentations are fixed-width visual mockups rather than adaptive layouts. `D03_responsive.html` displays multiple explicitly sized compositions to illustrate responsive states.

# D. Complete Sidebar & Navigation Tree

## Shared web application sidebar

Used by `D01`, `D02`, and `D03`.

### BENEFICIARY LIFECYCLE

- Applications & enrollment
- Beneficiary profiles
- Payroll & reconciliation
- Training
- Grievance redress

### INTELLIGENCE

- Executive dashboard
- GIS intelligence
- AI assistant & agents
- Self-service MIS

### PLATFORM

- Data Hub / API Bank
- Helpdesk & referrals
- Module & scheme builder
- Users & access

The active item is visually highlighted in green on the relevant screen. These sidebar items are decorative: they do not contain target links.

## Platform operations sidebar

Used by `D10`–\`D22\`.

### PLATFORM OPERATIONS

- Observability
- Capacity & autoscaling
- API gateway
- X-Road exchange
- CI/CD pipelines
- Environments & releases

### ASSURANCE

- Security centre
- Backup & DR
- Data governance
- AI governance

### WORKLOADS

- Payroll batch monitor
- GIS layer catalogue
- Performance tests

These sidebar entries are also static. The current section is indicated visually.

## Navigation bar on every reference page

Each screen has a top strip containing:

- `All screens` → `index.html`
- Figure description
- `Previous`
- `Next`

The previous/next links form a linear sequence through the 22 screens. The sequence is:

`D01 → D02 → D03 → D04 → D05 → D06 → D07 → D08 → D09 → D10 → D11 → D12 → D13 → D14 → D15 → D16 → D17 → D18 → D19 → D20 → D21 → D22`

The links wrap only through the catalogue navigation; no application workflow is implemented.

# E. Detailed Screen-by-Screen Breakdown

## `index.html`

- Header: `MCBP-MIS preliminary demo`.
- Subtitle: Riseup Labs, RFP No. `SIMCBP-G-01A`, Technical Proposal chapter `E-3.11`, 22 reference screens.
- Notice: fictional sample data; offline operation; use Previous and Next.
- Sections:
  - Responsive web.
  - Public portal, mobile browser.
  - Android app.
  - iOS app and tablet.
  - Platform and assurance consoles.
- Contains 22 linked cards grouped by figure number `E3-62` through `E3-83`.
- No sidebar, table, form, or dynamic behavior.

## `D01_home_en.html`

Role-specific English desktop dashboard for an Upazila Women Affairs Officer.

### Header and sidebar

- `MCBP-MIS`
- Search: `Search beneficiary ID, NID or mobile number...`
- EN / বাংলা toggle
- User: `NS`, Upazila Women Affairs Officer, `Kaunia · Rangpur`
- Full shared beneficiary lifecycle, intelligence, and platform sidebar.
- Active item: `Applications & enrollment`.

### KPI cards

- `Applications awaiting my decision` — `46`; `12 older than 5 days`.
- `Field verifications pending` — `118`; `83% within SLA`.
- `Paid this cycle` — `14,208`; `99.1% success`.
- `Open grievances` — `9`; `2 due today`.

### Main sections

- `My approval queue`
  - Button: `Review next`.
  - Table columns: Application, Applicant, Union, Identity, Field, Age.
  - Records include Rahima Khatun, Shirin Akter, Moriom Begum, and Jesmin Ara.
- `Union quota used`
  - Kaunia Sadar `92%`.
  - Haragach `78%`.
  - Tepamadhupur `64%`.
  - Balapara `81%`.
  - Shahidbag `70%`.
- `Applications received, last 8 weeks`
  - Inline SVG bar chart, W1–W8.
- `Today`
  - Training sessions in my upazila: `3`.
  - Bounce-backs to correct: `27`.
  - Devices not synced for 3 days: `4`.
  - Exit reviews at 36 months: `61`.
  - Advisory AI insight concerning BRN verification in Haragach and slower BDRIS response.

## `D02_home_bn.html`

Bangla version of `D01`.

- Same layout, KPIs, records, quota bars, chart, and daily indicators.
- Labels, names, dates, statuses, and numerals are localized.
- Example:
  - `আমার সিদ্ধান্তের অপেক্ষায় আবেদন` — `৪৬`.
  - `মাঠ যাচাই বাকি` — `১১৮`.
  - `এই চক্রে পরিশোধিত` — `১৪,২০৮`.
- Uses Bengali terminology and Bangla numerals.
- Previous/Next links point to `D01_home_en.html` and `D04_mweb_en.html`.

## `D03_responsive.html`

Executive dashboard shown in three static layouts.

### Desktop version

- User: Programme Director, `SIMCBP PMMCU · National`.
- Active beneficiaries: `1,895,010`; target `2.5 million`.
- Paid this month: `1,871,955`; `Tk 159.11 crore`.
- On-time payment: `98.6%`; target `≥ 98%`.
- Open grievances: `1,126`; `93.4% resolved on time`.
- ANC compliance: `72.4%`; `▲ 2.1 pts vs last month`.

Sections:

- `Enrollment trend (lakh)` — SVG chart.
- `Coverage index by division`.
- `AI insights`.
- `Payments by channel (lakh)` — SVG chart.
- `Exception monitor`.

Coverage values:

- Rangpur `82%`
- Mymensingh `74%`
- Sylhet `61%`
- Rajshahi `79%`
- Dhaka `88%`
- Khulna `77%`
- Barishal `71%`
- Chattogram `84%`

Exceptions:

- `4+ beneficiaries on one mobile` — `18`.
- `36 months complete, exit pending` — `2,310`.
- `Field verification over 30 days` — `412`.

### Tablet version

- Fixed tablet layout with rail navigation.
- Two-column KPI arrangement.
- Same core executive metrics.
- Caption describes `834 px rail navigation, two columns`.

### Phone version

- Fixed phone frame with `9:41`.
- Condensed executive KPIs.
- Same coverage list and enrollment chart.
- Caption identifies the mobile executive view.

## `D04_mweb_en.html`

Static mobile browser composition with three pages.

### Portal home

- `MCBP-MIS`
- `Mother and Child Benefit Programme`
- `Tk 850 a month for up to 36 months for eligible mothers`
- Actions:
  - Apply online.
  - Track application.
  - My payments.
  - Sign in with OTP.
  - Complaint or question.
- Slow-network note: `Page size 86 KB · works on 2G`.

### Application step

- `Apply for MCBP`
- `Step 2 of 5 · Your details`.
- National ID: `1990 **** **** 4471`.
- Verified name: `Moriom Begum`.
- Expected delivery date: `14 March 2027`.
- Privacy consent statement.
- `Draft saved on this device`.
- `Continue`.
- Caption: NID check, consent, autosave.

### Status tracking

- Application number: `APP-2611-00447`.
- Mobile: `017** *** *44`.
- Status: `In verification`.
- Timeline:
  - Application received: 2 Nov 2026.
  - Identity verified: NID matched.
  - Field verification: visit scheduled 15 Nov.
  - Decision: Union committee and UWAO.
  - Enrollment and first payment.
- Help text references helpline and Union Digital Centre.

## `D05_mweb_bn.html`

Bangla equivalent of `D04`.

- Same three mobile browser pages.
- Bangla labels and dates.
- Bengali numerals and localized programme text.
- Same application number and masked mobile number.

## `D06_android_en.html`

Four Android application screens.

### Sign-in

- `Field app · signed in as Field Verifier`.
- Six-digit PIN.
- `Use fingerprint`.
- `Offline sign-in available`.
- EN / বাংলা.

### Field home

- `Kaunia Sadar Union`.
- `Working offline`.
- `7 records waiting to sync`.
- Tiles:
  - Field verification — `12 assigned`.
  - Assisted registration.
  - Start new.
  - Training attendance — `2 sessions today`.
  - Log grievance.
  - Voice or text.
- My day:
  - Visits completed `5 / 12`.
  - Photos captured `14`.
  - Last sync `Today 08:12`.
- Bottom nav: Home, Tasks, Sync, Help.

### Verification checklist

- Application `APP-2611-00447`, Moriom Begum.
- NID ending `4471`.
- Tepamadhupur, Ward 4.
- Checklist:
  - Applicant present, NID seen.
  - Pregnancy card or child BRN seen.
  - Lives at stated address.
  - Household income as declared.
  - Not receiving another allowance.
- `2 photos`, `180 KB each`.
- GPS captured `± 6 m · 10:42`.
- Local encrypted save and delayed sync note.
- `Save and next`.

### Sync centre

- `Syncing on 3G`.
- Approximately 40 seconds left.
- `5 verification checklists` synced.
- `14 photos`, uploading `9/14`.
- `1 assisted registration` synced.
- `1 attendance sheet (38 mothers)` queued.
- One conflict requiring choice:
  - Keep office value.
  - Send mine for review.

## `D07_android_bn.html`

Bangla translation of all four Android screens in `D06`.

- Localized sign-in, checklist, sync, conflict, and navigation labels.
- Bangla numerals appear in records and counts.
- Same data and scenarios as the English version.

## `D08_ios_en.html`

Four iOS-style screens.

### Executive view

- Active beneficiaries: `1,895,010`; target `2.5 M`.
- Paid this month: `1,871,955`; `Tk 159.11 crore`.
- On-time payment: `98.6%`; target `98%`.
- Open grievances: `1,126`; `93.4% in time`.
- Enrollment trend and coverage by division.
- Bottom navigation: KPIs, Map, Assistant, Me.

### AI assistant

- Question: highest payment bounce-back in November.
- Answer: Sylhet `1.12%`, Barishal `0.94%`, national `0.68%`, down from `0.75%` in October.
- Source: `KPI C-04 Bounce-back rate · Tier-2 · refreshed 09:00`.
- Draft note to Sylhet division office.
- Draft requires user review before sending.
- Supports English or বাংলা.

### Grievance

- Case: `GRS-2611-0872`.
- Issue: Payment not received.
- Status: In progress.
- October allowance bounced due to inactive wallet.
- SLA: 15 working days; Day 8.
- Timeline includes receipt, assignment, wallet correction, maker-checker approval, repayment queue, and SMS notification.
- `Add note`.

### Coverage map

- Coverage index, Nov 2026.
- Bangladesh by division.
- Same eight division percentages as `D03`.
- Legend: Low / High.
- Under-served Sylhet at `61%`.
- Aggregated Tier-2 data; cells under 10 hidden.

## `D09_tablet.html`

Landscape supervisor dashboard.

### KPIs

- Visits planned today: `64`; `6 unions`.
- Completed: `44`; `69%`.
- Conflicts to review: `4`; `2 unions`.
- Devices offline: `2 of 18`.

### Field team table

Columns:

- Union
- Verifier
- Planned
- Done
- Conflicts
- Device

Rows include Kaunia Sadar, Haragach, Tepamadhupur, Balapara, Shahidbag, and Kursha.

### Other sections

- `Verification turnaround (days)` — chart.
- `Review queue`
  - Same field changed on device and server: `3`.
  - Record approved while device offline: `1`.
- Button: `Open review queue`.

## `D10_gateway.html`

API gateway console.

### KPIs

- Requests, last minute: `11,482`.
- Peak today: `18,940`.
- p95 latency: `412 ms`; budget `1,000 ms`.
- Error rate: `0.03%`.
- Throttled calls: `214`; 2 clients over quota.
- Published APIs: `46`; 9 partner, 37 internal.

### API catalogue table

Columns:

- Route
- Upstream
- Status
- Auth
- Rate limit
- p95
- Success

Routes include enrollment, NID verification, BRN verification, payroll, registry, and grievance APIs.

### Other sections

- `Traffic, requests per minute` chart.
- RFP minimum `10,000`, tested to `20,000`.
- `Consumers` and quota used for web portal, mobile app, Single Registry, and DGHS sync.
- Button: `Register API`.

## `D11_xroad.html`

X-Road exchange console.

### KPIs

- Security Servers: `2 / 2 healthy`.
- Version: `7.8`.
- Signed messages today: `182,440`.
- Signature failures: `0`.
- Registered subsystems: `4`.
- Certificates: valid; auth certificate renews in `142 days`.

### Tables and sections

- `Subsystems and services`
  - Subsystem, Service, Consumers allowed, Calls today.
- `Partner connectivity`
  - Partner, Mode, Latency, Status.
  - Election Commission, BDRIS, DGHS, DGFP, iBAS++ / SPBMU, MFS providers, National GRS, Single Registry.
- `Retry and fallback queues`
  - BRN pending: `1,284`, replaying at 500/min.
  - NID pending: `0`.
  - Dead-letter over 24h: `3`.
- Signed, time-stamped message log archive with zero gaps.

## `D12_observability.html`

Platform health console.

### KPIs

- Availability, 30 days: `99.96%`; target `99.9%`.
- p95 API latency: `412 ms`; budget `1 s`.
- Page load p75: `2.3 s`; budget `3 s`.
- Active sessions: `7,812`; tested to `10,000`.
- Open alerts: `2`; 0 critical.

### Charts

- Latency p50 / p95.
- Requests per second.
- Error rate.

### Service health table

Columns:

- Service
- Replicas
- CPU
- Memory
- p95
- Status

Services include `application-svc`, `profile-svc`, `payroll-svc`, `bdris-adapter`, `notification-svc`, and `fieldsync-svc`.

### Synthetic checks

- Login journey: Pass, `1.4 s`.
- Submit application journey: Pass, `2.2 s`.
- BDRIS latency: Warning.
- Backup job: Success.
- Certificate expiry: None.

## `D13_cicd.html`

CI/CD and security gate console.

### KPIs

- Pipelines today: `38`; 36 passed, 2 failed.
- Lead time to staging: `5 h 20 m`.
- Change failure rate: `8%`.
- Blocked by security gate: `2 this week`.

### Release candidate

- `Release 1.8.0-rc2`.
- Services: payroll, reconciliation, web.
- Awaiting production approval.
- Build: `2 m 10 s`.
- Unit tests: `1,842 passed · 86%`.
- SAST: 0 critical, 0 high.
- Dependencies: 0 critical.
- SBOM, secrets, image scan, contract tests, DAST, and approval status.

### Recent pipeline table

Columns:

- Commit
- Service
- Author
- Stages
- Duration
- Result

Includes passed pipelines and failures from SAST and vulnerable dependency checks.

### Quality gate

- Business logic coverage: `86%`, gate `≥ 80%`.
- Critical/high vulnerabilities: `0 / 0`.
- Code smells: `A`.
- License violations: `0`.
- Accessibility failures: `0`.
- Page weight: `268 KB`, limit `300 KB`.

## `D14_security.html`

Security centre.

### KPIs

- Open security alerts: `7`; 0 critical, 1 high.
- Failed logins, 24h: `318`; 4 accounts locked.
- Privileged MFA: `100%`; 412 of 412 users.
- Audit chain: Verified.
- Patch compliance: `98%`; 2 nodes due this week.

### SIEM alerts table

Columns:

- Time
- Rule
- Source
- Severity
- Action

Includes bulk download, excessive applications from one IP, rapid multi-user logins, excessive NID unmasking, and blocked SQL injection.

### Other sections

- Vulnerability status by source and severity.
- Access reviews and dormant accounts.
- Vault and key age.
- Credential rotation.
- Incidents and tabletop drill history.

## `D15_backup.html`

Backup and disaster recovery console.

### KPIs

- Last full backup: `118 GB`, Success.
- Last incremental: `4.1 GB`, Success.
- Replication lag: `8 s`; RPO design `15 min`.
- Last restore test: Passed, `52 min`.
- Last DR drill RTO: `3 h 12 m`; target `4 h`.

### Backup jobs table

Columns:

- Job
- Schedule
- Last run
- Size
- Encrypted
- Result

Jobs include PostgreSQL full/incremental, WAL archive, object storage replication, Git mirror, and ClickHouse snapshot.

### DR readiness

- Standby applying WAL: Yes.
- DR release matches production: `1.7.3 = 1.7.3`.
- DNS failover tested.
- Runbook `v1.4` approved.
- Retention: WAL 14 days, daily incrementals 30 days, weekly fulls 4 weeks, monthly fulls 12 months.

## `D16_datagov.html`

Data governance console.

### KPIs

- Data quality score: `96.8%`; up `0.4` this week.
- Aggregation batches today: `24 / 24`; all reconciled.
- Cells suppressed: `3,412 of 418,000 published`.
- Tier-1 to Tier-2 variance: `0`.
- Erasure requests: `6`; 2 awaiting approval.

### Aggregation table

Columns:

- Batch
- Dataset
- Rows in (Tier-1)
- Cells out (Tier-2)
- Suppressed
- Hash
- Status

### Data quality table

Columns:

- Failing rule
- Records
- Steward

Rules include Bangla/English name mismatch, missing BRN or reason, and inactive wallets.

### Other sections

- Completeness `98.2%`.
- Validity `97.5%`.
- Uniqueness `99.9%`.
- Consistency `94.1%`.
- Timeliness `93.6%`.
- Accuracy `97.4%`.
- Retention and lifecycle.
- Tier-1 access, unmask events, Tier-2 analysts, and sharing agreements.

## `D17_payroll.html`

Payroll batch monitor.

### KPIs

- Cycle: Nov 2026.
- Eligible: `1,895,010`.
- Processed: `1,777,870`; `93.8%`.
- Throughput: `574 rec/s`; 32 workers.
- Elapsed: `51 m 38 s`.
- Estimated total: `55 m`.
- Online p95: `428 ms`; baseline `412 ms`.

### Controls

- `Pause`.
- `Abort and roll back`.

### Partitions by division

- Dhaka: `459,120`, Done.
- Chattogram: `388,400`, Done.
- Rajshahi: `254,330`, Done.
- Khulna: `209,870`, Done.
- Rangpur: `198,410`, Running.
- Barishal: `103,960`, Running.
- Mymensingh: `102,300`, Running.
- Sylhet: `61,480`, Running.

### Validation table

- Duplicate NID across schemes: `112`.
- Account/wallet failed pre-validation: `6,430`.
- Cycle count above 36: `0`.
- Amount outside rule range: `0`.

### Control

- Maker: Payment Officer.
- Checker: Pending, different officer and OTP.
- Rule version: `MCBP benefit rule v4 (Tk 850, 36 months)`.
- AI agents have no approval rights.

## `D18_aigov.html`

AI governance console.

### KPIs

- Bangla answer accuracy: `92.1%`; gate `≥ 90%`.
- Answers with source: `100%`.
- Scope violations: `0 of 4,120 queries`.
- Injection tests blocked: `98.6%`; 214 of 217.
- GPU utilisation: `46%`; 2 × 32 GB.

### Agent runs table

Columns:

- Agent
- Run
- Proposed output
- Assigned to
- Age
- Decision

Four runs await human review, including report generation, alerting, data collection, and calculation simulations.

### Model registry

Columns:

- Model
- Role
- Version
- Status

Includes multilingual LLM, embedding model, re-ranker, small fallback LLM, and candidate model.

### Guardrail events

- PII redacted: `37`.
- Out-of-scope questions refused: `58`.
- Prompt injection blocked: `4`.
- Not-found answers: `126`.

### Audit trail

Run `AL-5521` uses Tier-2 payments data to detect bounce-back rate over 1%; output is an alert and suggested SMS; decision pending.

## `D19_gislayers.html`

GIS layer catalogue and governance.

### Layer catalogue table

Columns:

- Layer
- Type
- Owner
- Version
- Lowest level
- Tier
- Status

Layers include administrative boundaries, beneficiary coverage, applications, payment bounce-back, grievance density, health facilities, under-served areas, and field verification points.

### Coverage preview

- Same division coverage percentages as `D03`.
- Map totals reconciled at 02:00; difference `0`.
- Under-served areas promotion request.
- Automated checks: geometry valid and totals match.
- Controls: `Approve to production`, `Reject`.

### Other metrics

- Layers in production: `14`.
- Tile response p95: `0.9 s`; budget `2 s`.
- Spatial exports today: `42`.
- Continuous tracking: Off / Not authorised.

## `D20_capacity.html`

Capacity and autoscaling console.

### KPIs

- Production vCPU: `212 / 418`, `51%`.
- Memory: `884 / 1,616 GB`, `55%`.
- Running pods: `96`.
- HPA range: `72 to 180`.
- Database connections: `214 / 400`.
- Pooled sessions: `7,812`.
- Scale-up trigger: not met.

### Node pools

- App pool: 8 nodes; CPU 58%, memory 62%.
- Batch pool: 3 nodes; CPU 12%, memory 18%.
- Gateway pool: 3 nodes; CPU 34%, memory 41%.
- PostgreSQL primary and replicas.
- ClickHouse.
- GPU nodes.

### Autoscaling table

Columns:

- Time
- Workload
- From
- To
- Signal

Includes payroll worker, application service, notification worker, and geoserver events.

### Storage table

Columns:

- Volume
- Used
- Capacity
- Forecast full

Includes PostgreSQL data, object storage, backup repository, and logs/metrics.

## `D21_releases.html`

Environments and release management.

### Environments table

Columns:

- Environment
- Release
- Deployed
- Data
- Health
- Drift
- Next

Rows:

- Development
- Testing
- Staging
- Training
- Production
- DR

All shown as healthy with no drift.

### Release evidence

- Requirements traced: `148 / 148`.
- Regression suite: `2,410 passed, 0 failed`.
- Performance regression: within 4% baseline.
- Security scans: 0 critical, 0 high.
- Backward-compatible migrations: Yes.
- Rollback rehearsal: `4 m 10 s`.
- Payment calendar clear.
- MoWCA change approval pending signature.

### Deployment plan

- Sunday 22 Nov, 22:00–23:00.
- Canary 10% for 15 minutes, then full.
- Automatic rollback if error rate exceeds `0.5%` or p95 exceeds `1.5 s`.
- Named on-call roles.

### Business configuration promotions

Columns:

- Item
- From
- To
- State

Includes field checklist, eligibility rule, and sample scheme promotions.

## `D22_perf.html`

Load and performance test report.

### KPIs

- Virtual users: `10,000`; RFP minimum `5,000`.
- API calls/minute: `20,640`; minimum `10,000`.
- API p95: `742 ms`; budget `2,000 ms`.
- Page p95: `2.4 s`; budget `3 s`.
- Errors: `0.04%`.
- Run: `LT-014`.
- Controls: `Export PDF`.

### Scenario results table

Columns:

- Scenario
- Target
- Result
- Pass/fail

Scenarios include:

- Load for 60 minutes at 10,000 users.
- Deadline surge.
- Payroll 1M with 3,000 users.
- Payroll 2.5M report.
- 72-hour endurance.
- Stress to failure.
- Mobile sync storm.
- Database failover under load.

All displayed results pass.

### Notes

The report explicitly states that values are illustrative and that production tests will be performed on BCC NDC hardware before Go-Live using synthetic data.

# F. Functional vs Static Interaction Matrix

| Element                           | Classification               | Evidence                                            |
| --------------------------------- | ---------------------------- | --------------------------------------------------- |
| `All screens`                     | Working navigation           | Links to `index.html`                               |
| `Previous` / `Next`               | Working navigation           | Links to adjacent HTML files                        |
| Index screen cards                | Working navigation           | Each card has an HTML target                        |
| Sidebar menu items                | Static                       | Anchors have no `href`                              |
| Search fields                     | Static                       | Rendered text only; no `<input>`                    |
| Language toggles                  | Static                       | No event handler or language logic                  |
| Notification bell                 | Static                       | SVG icon only                                       |
| User profile/avatar               | Static                       | No menu or session logic                            |
| `Review next`                     | Static                       | Button-like span                                    |
| `Register API`                    | Static                       | Visual button only                                  |
| `Run manual backup`               | Static                       | Visual button only                                  |
| `Pause`, `Abort and roll back`    | Static                       | No implementation                                   |
| `Approve to production`, `Reject` | Static                       | No implementation                                   |
| `Export PDF`                      | Static                       | No download behavior                                |
| `Continue`, `Save and next`       | Static                       | No forms or state transitions                       |
| AI assistant prompt               | Static                       | No input field or model connection                  |
| Grievance `Add note`              | Static                       | No form or save action                              |
| Charts and maps                   | Static SVG/CSS illustrations | No data source or chart library                     |
| Offline sync/conflict handling    | Static scenario              | No local storage, service worker, or merge logic    |
| Authentication, PIN, biometric    | Static scenario              | No authentication implementation                    |
| Tables and status values          | Static sample data           | Hard-coded HTML                                     |
| Forms                             | Not implemented              | No `<form>` elements detected                       |
| JavaScript                        | Not implemented              | No script blocks or script sources detected         |
| API/database connectivity         | Not implemented              | No fetch/XHR/WebSocket/database references detected |

# G. Responsive, Tablet & Mobile Analysis

- `D03_responsive.html` explicitly shows desktop, tablet, and phone variants in one file.
- `D04`/\`D05\` are mobile-browser mockups.
- `D06`/\`D07\` are Android mockups.
- `D08` is an iOS mockup.
- `D09` is a tablet landscape mockup.
- Phone frames use fixed dimensions and decorative camera/notch elements.
- There are no media queries.
- There is no fluid CSS layout adapting to browser width.
- Fixed `1440px × 880px` desktop frames can overflow narrow browsers.
- Mobile content is presented inside a simulated phone frame rather than as a responsive page.
- English and Bangla variants are separate files, not dynamically switched.
- The language control is decorative and does not change content.

# H. Cross-Screen Consistency and Shared Data

## Consistent elements

- Green MCBP-MIS branding.
- Inter/Poppins typography.
- Green, magenta, amber, blue, and purple status palette.
- Previous/Next/all-screen navigation.
- Shared fictional beneficiary and programme data.
- Repeated division coverage values:
  - Rangpur `82%`
  - Mymensingh `74%`
  - Sylhet `61%`
  - Rajshahi `79%`
  - Dhaka `88%`
  - Khulna `77%`
  - Barishal `71%`
  - Chattogram `84%`
- Repeated core numbers:
  - Active beneficiaries `1,895,010`.
  - Paid records `1,871,955`.
  - Payment amount `Tk 159.11 crore`.
  - On-time payment `98.6%`.
  - Open grievances `1,126`.

## Meaningful differences

- `D01`/\`D02\` are officer-specific and include approval queues.
- `D03` is national executive intelligence.
- `D04`/\`D05\` focus on applicants.
- `D06`/\`D07\` focus on field verification and synchronization.
- `D08` presents executive features in iOS form.
- `D09` focuses on team supervision and conflict review.
- `D10`–\`D22\` focus on platform assurance and operations.
- Bangla screens localize labels, names, dates, and numerals but preserve most identifiers and metrics.
- Some labels differ slightly between screens, such as `93.4% resolved on time` versus `93.4% in time`.

## Shared data relationships

- `D01` approval queue includes `APP-2611-00447`, which appears in the mobile application and Android verification flow.
- `D03`, `D08`, and `D19` share coverage metrics.
- `D03`, `D08`, `D17`, and `D20` share the `1,895,010` beneficiary scale.
- `D06` sync conflict relates conceptually to `D09` conflict review.
- Payroll values recur in `D03`, `D10`, `D15`, `D17`, and `D21`.
- AI governance in `D18` formalizes advisory AI behavior shown in `D01` and `D08`.

# I. Gaps and Risks for Building a Connected Functional MIS Demo

- No authentication or role-based authorization exists.
- No real language switching exists.
- No application, beneficiary, payroll, grievance, or training forms exist.
- No API, database, or persistent storage exists.
- No application-processing workflow exists.
- No approval, maker-checker, or audit workflow is executable.
- No payment reconciliation or payroll calculation is implemented.
- No offline storage, sync queue, retry logic, or conflict merge exists.
- No camera, GPS, biometric, PIN, OTP, or device integration exists.
- No real charts, maps, filtering, drill-down, pagination, or search behavior exists.
- No accessibility behavior beyond basic semantic HTML can be confirmed.
- Fixed desktop and device frames create overflow risks.
- Inline CSS is duplicated across files, increasing maintenance and consistency risk.
- Sample metrics are hard-coded and may diverge if a connected data model is later introduced.
- The visual separation between mockup screens and functional controls may mislead users unless clearly labelled.
- No automated tests, build process, dependency management, or deployment configuration is present.
- Bangla source encoding should be verified in a browser because terminal extraction showed mojibake in some output contexts.

# J. Final Screen Coverage Checklist (D01–D22)

- `D01_home_en.html` — English officer home dashboard.
- `D02_home_bn.html` — Bangla officer home dashboard.
- `D03_responsive.html` — Desktop/tablet/phone executive dashboard.
- `D04_mweb_en.html` — English public mobile web.
- `D05_mweb_bn.html` — Bangla public mobile web.
- `D06_android_en.html` — English Android field app.
- `D07_android_bn.html` — Bangla Android field app.
- `D08_ios_en.html` — English iOS executive app.
- `D09_tablet.html` — Tablet supervisor dashboard.
- `D10_gateway.html` — API gateway.
- `D11_xroad.html` — X-Road exchange.
- `D12_observability.html` — Observability.
- `D13_cicd.html` — CI/CD.
- `D14_security.html` — Security centre.
- `D15_backup.html` — Backup and DR.
- `D16_datagov.html` — Data governance.
- `D17_payroll.html` — Payroll monitor.
- `D18_aigov.html` — AI governance.
- `D19_gislayers.html` — GIS layer catalogue.
- `D20_capacity.html` — Capacity and autoscaling.
- `D21_releases.html` — Environments and releases.
- `D22_perf.html` — Performance tests.

---

# ANNEX D — LEGACY TRACKER EXAMPLES (SUPERSEDED BY ANNEX F)

Use one row per source requirement and per visual source screen element. Start by importing every row of Annex B; do not consider feature complete until row is classified and verified.

| Requirement ID / figure / file | Source requirement or original UI element | Classification I/V/N | Route/component | Role & geo scope | EN/BN verified | Data/state link | Positive test | Negative test | Fidelity verified | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| 1.2.3.7 | Union quota + maker-checker | I | `/app/selection` | Union maker/UWAO checker | ☐ | Application, quota, audit | ☐ | ☐ | ☐ | Planned |
| E2-35/36 | Bilingual public application design | I | `/portal/apply` | Public | ☐ | Application | ☐ | ☐ | ☐ | Planned |
| D01/D02 | Officer home exact KPI cards and queue | I | `/app/officer/home` | Upazila | ☐ | Queue, payments, GRS | ☐ | ☐ | ☐ | Planned |
| D21 | Releases and deployment evidence | V/I | `/ops/releases` | Release manager | ☐ | Simulated plans | ☐ | ☐ | ☐ | Planned |
| E-3.7.4 | Actual 10k virtual-user load test proof | N | `/ops/performance` | QA | ☐ | Illustrative evidence | N/A | N/A | ☐ | Informational |

**Classification:** `I` = interactive browser simulation; `V` = visual/informational evidence in demo; `N` = not executable as a real capability with frontend-only architecture, with mock/evidence view as appropriate.

# ANNEX E — FINAL BUILD HANDOFF / NO-OMISSION DIRECTIVES

- Keep this Markdown in the repository; feature changes require updating its source traceability and the test checklist.
- Build under the chosen original design system with actual source HTML available for side-by-side visual comparison.
- Never claim backend success, network verification, real payments, production AI, legally binding consent or certified government hosting.
- All 14 subsystems, 30 E2 functional figures and 22 original ZIP reference screens are mandatory demonstration coverage.
- A feature cannot be accepted because a screenshot exists; its required **frontend simulation logic** and linked data transitions must work where appropriate.
- No English-only orphan screen; Bangla/English parity is required across the entire platform including the system consoles.
- No absent menu item, dead decorative CTA, unexplained form field, contradictory sample KPI, wrong geography scope, same-actor maker-checker, skipped privacy consent or unsupported hard-coded eligibility policy.
- If a source figure includes a metric, table, note, filter or badge not mentioned in the main PRD, the attached full Codex audit / source HTML and the original E-2 figure remain binding.
- Final client-facing message is consistent: **"Interactive frontend demonstration using fictional data. Integrations and infrastructure behavior are simulated."**

---

# ANNEX F — E-8 CLAUSE-TO-DEMO TRACEABILITY (PREFILLED)

This table is **prefilled, not certified complete**: it has one row per identifiable E-8 compliance item extracted from Annex B, with **proposed route and classification**. E-8 includes grouped requirements and schedule entries; original clause text in Annex B remains authoritative. Assignment is a planning judgement and each row **requires developer review** before it is marked verified. The classification shows the proposed browser demonstration, not achieved production compliance. `I` = interactive simulation; `V` = informational/evidence; `N` = real capability impossible in browser (may still have an `I/V` mock). For ambiguous grouped clauses, developer may split into child rows without losing parent ID.

| E-8 clause / item | Original requirement summary | Proposed demo route | Coverage type | Owner or data relation | Source reference | Implementation / QA |
|---|---|---|---|---|---|---|
| 1.1.1 | Comply with GoB and World Bank laws, regulations, policies and standards | `/app/payroll` | I | SS03 / cycle, payment | E-2.1.6; E-3.6.6 | To implement; validate mapping |
| 1.1.1.1 | Personal data protection: PDPO 2025 / PDP Act 2026; privacy notice, non-bypassable consent, Do-No-Harm, data localisation | `/ops/evidence` | V | Cross-cutting / review | E-2.4.1; E-3.6.5; E-6.1.14 | To implement; validate mapping |
| 1.1.1.1 (b) | Data retention, archiving and erasure protocol; anonymised transactions kept | `/app/beneficiaries` | I | SS02 / case, audit | E-2.4.2; E-3.2.6; E-6.1.13 | To implement; validate mapping |
| 1.1.1.2 | Data governance, sharing and interoperability: NDGO 2025, NDM Act 2026, NDGIO; Single Registry alignment | `/app/data-hub` | I | SS06 / partner calls | E-3.2.6; E-3.3 | To implement; validate mapping |
| 1.1.1.3 | Digital and cyber security laws, GoB ICT security guidelines, BCC and SQTC standards | `/app/users` | I | SS11 / role, audit | E-3.6; E-4.4.6 | To implement; validate mapping |
| 1.1.1.4 | BeGA / BIETA alignment and open standards (JSON, CSV, XML, REST) | `/ops/evidence` | V | E-4/E-5/E-6 / documentary evidence | E-3.1.5 | To implement; validate mapping |
| 1.1.1.5 | ISO/IEC 27001, ISO/IEC 25010, OWASP Top 10, WCAG 2.0 AA | `/ops/evidence` | V | Cross-cutting / review | E-3.6.6; E-4.4.1 | To implement; validate mapping |
| 1.1.1.6 | Procurement and contract rules incl. acceptance and audit rights | `/ops/evidence` | V | E-4/E-5/E-6 / documentary evidence | E-4.6.3; E-3.10.4 | To implement; validate mapping |
| 1.1.1.7 | IP, licensing, source code to National Source Code Repository; disclose COTS | `/ops/evidence` | V | E-4/E-5/E-6 / documentary evidence | E-3.9.5; E-6.2.7 | To implement; validate mapping |
| 1.1.1.7.1 | Third-party licences in MoWCA name, perpetual, royalty-free; no recurring licence liability | `/ops/evidence` | V | Cross-cutting / review | E-3.1.4; E-6.2.10 | To implement; validate mapping |
| 1.1.1.8 | Environmental and social considerations; energy efficiency | `/ops/evidence` | V | E-3/E-4 / evidence | E-5.5; Part F | To implement; validate mapping |
| 1.1.1.9 | Information responsibility; no use of data outside the contract | `/ops/evidence` | V | E-4/E-5/E-6 / documentary evidence | E-4.1.3; E-5.5 | To implement; validate mapping |
| 1.1.2 | Programme rules implemented and configurable without re-coding | `/ops/evidence` | V | Cross-cutting / review | E-2.4.3; E-2.4.14 | To implement; validate mapping |
| 1.2.1.1-1.2.1.5 | Client background, legacy MIS, programme parameters, administrative structure, MCBP-MIS / MoWCA Integrated MIS | `/ops/migration` | I | E-6 / batch | E-2.1; E-2.2 | To implement; validate mapping |
| 1.2.2.1.1-1.2.2.1.11 | Eleven key challenges to be solved | `/ops/evidence` | V | Cross-cutting / review | E-2.2.2 | To implement; validate mapping |
| 1.2.2.1.12 | Additional requirements found in analysis within scope; change control for new requirements | `/ops/evidence` | V | Cross-cutting / review | E-2.3.4; E-4.1.9 | To implement; validate mapping |
| 1.2.2.2 | Scope of services | `/ops/evidence` | V | Cross-cutting / review | E-2.1.5 | To implement; validate mapping |
| 1.2.2.3 | Programme covered: MCBP; deliverables structured around MCBP | `/ops/evidence` | V | Cross-cutting / review | E-2.4.14 | To implement; validate mapping |
| 1.2.2.4 | Thirteen required subsystems (plus 1.2.16) | `/app/schemes` | I | SS14 / scheme | E-2.4 | To implement; validate mapping |
| 1.2.2.5 | Smooth transition from legacy; current rules and formats | `/ops/migration` | I | E-6 / batch | E-4.2.5; E-6.1 | To implement; validate mapping |
| 1.2.3.1 | End-to-end intake and enrollment | `/app/applications` | I | SS01 / actor + case | E-2.4.1 | To implement; validate mapping |
| 1.2.3.2.1 | Online application (web portal, mobile) | `/app/applications` | I | SS01 / actor + case | E-2.4.1; E-3.11.2 | To implement; validate mapping |
| 1.2.3.2.2 | Assisted application by UDC operators and office staff | `/app/applications` | I | SS01 / actor + case | E-2.4.1 | To implement; validate mapping |
| 1.2.3.2.3 | Bulk upload with validated Excel/CSV templates under 1.2.15 | `/app/applications` | I | SS01 / actor + case | E-2.4.13 | To implement; validate mapping |
| 1.2.3.3 | Configurable forms collecting personal, socio-economic and programme data | `/app/applications` | I | SS01 / actor + case | E-2.4.1; E-2.4.13 | To implement; validate mapping |
| 1.2.3.4 | NID/BRN verification; queue or pending state if service is down | `/app/applications` | I | SS01 / actor + case | E-2.4.1; E-3.3.5 | To implement; validate mapping |
| 1.2.3.5 | Automatic eligibility screening; failed cases recorded with reasons | `/app/applications` | I | SS01 / actor + case | E-2.4.1 | To implement; validate mapping |
| 1.2.3.6 | Field verification workflow with checklists; offline mobile | `/app/applications` | I | SS01 / actor + case | E-2.4.10; E-3.11.3 | To implement; validate mapping |
| 1.2.3.7 | Approval with quota and maker-checker; all approvals logged | `/app/applications` | I | SS01 / actor + case | E-2.4.1 | To implement; validate mapping |
| 1.2.3.8 | Unique Beneficiary ID; location linkage union to division | `/app/applications` | I | SS01 / actor + case | E-2.4.1 | To implement; validate mapping |
| 1.2.3.9 | Privacy notice and non-bypassable digital consent | `/app/applications` | I | SS01 / actor + case | E-2.4.1; E-3.6.5 | To implement; validate mapping |
| 1.2.3.10 | Duplicate prevention through NID/BRN and Single Registry | `/app/applications` | I | SS01 / actor + case | E-2.4.1; E-2.4.3 | To implement; validate mapping |
| 1.2.3.11 | No AI approval or rejection of applications | `/app/applications` | I | SS01 / actor + case | E-3.4.3; E-4.4.4 | To implement; validate mapping |
| 1.2.4.1-1.2.4.2 | Comprehensive profile: personal, household, status, payments, compliance, grievances, training | `/app/beneficiaries` | I | SS02 / case, audit | E-2.4.2 | To implement; validate mapping |
| 1.2.4.3 | Role- and jurisdiction-based viewing and editing | `/app/beneficiaries` | I | SS02 / case, audit | E-2.4.2; E-3.6.2 | To implement; validate mapping |
| 1.2.4.4 | Full audit log with previous and new values | `/app/beneficiaries` | I | SS02 / case, audit | E-2.4.2; E-3.6.5 | To implement; validate mapping |
| 1.2.4.5 | Status change, correction, transfer, exit, graduation | `/app/beneficiaries` | I | SS02 / case, audit | E-2.4.2 | To implement; validate mapping |
| 1.2.5.1-1.2.5.2 | Configurable benefit rules; Tk 850 for up to 36 months; policy conditions enforced | `/app/payroll` | I | SS03 / cycle, payment | E-2.4.3 | To implement; validate mapping |
| 1.2.5.3 | Configurable payment cycles | `/app/payroll` | I | SS03 / cycle, payment | E-2.4.3 | To implement; validate mapping |
| 1.2.5.4 | Payroll lists for approval; interface to SPBMU / iBAS++ or gateway; confirmations and bounce-backs | `/app/payroll` | I | SS03 / cycle, payment | E-2.4.3; E-3.3.4 | To implement; validate mapping |
| 1.2.5.5 | Transaction status, failure reasons, correction and re-payment | `/app/payroll` | I | SS03 / cycle, payment | E-2.4.3 | To implement; validate mapping |
| 1.2.5.6 | Reconciliation and financial-control reports; bank/MFS file ingestion | `/app/payroll` | I | SS03 / cycle, payment | E-2.4.3 | To implement; validate mapping |
| 1.2.5.6.1 | Automated reconciliation: flag reason, SMS alert, re-payment queue under maker-checker | `/app/payroll` | I | SS03 / cycle, payment | E-2.4.3 | To implement; validate mapping |
| 1.2.5.7 | Payroll approval with authorised officers; no AI payment authority | `/app/payroll` | I | SS03 / cycle, payment | E-2.4.3; E-3.4.3 | To implement; validate mapping |
| 1.2.5.8 | 1,000,000 payments within 4 hours without impact | `/app/payroll` | I | SS03 / cycle, payment | E-3.7.3; E-4.4.5 | To implement; validate mapping |
| 1.2.6.1.1-1.2.6.1.5 | Scheduling, enrollment, attendance on mobile, content, assessment, certification | `/app/applications` | I | SS01 / actor + case | E-2.4.4; E-4.3.5 | To implement; validate mapping |
| 1.2.6.2 | Training reports on dashboards and in profiles | `/app/training` | I | SS04 / session | E-2.4.4 | To implement; validate mapping |
| 1.2.7.1-1.2.7.2 | Built-in GRS for complaints, appeals, fraud reports, service issues | `/app/grievances` | I | SS05 / case | E-2.4.5 | To implement; validate mapping |
| 1.2.7.3 | Workflow, notifications, escalation, time-bound tracking, analytics, audit | `/app/grievances` | I | SS05 / case | E-2.4.5 | To implement; validate mapping |
| 1.2.7.4 | Interoperability with national GRS | `/app/grievances` | I | SS05 / case | E-2.4.5; E-4.2.4 | To implement; validate mapping |
| 1.2.7.5 | Feedback channels: in-app, helpdesk, surveys, reports | `/app/grievances` | I | SS05 / case | E-2.4.5 | To implement; validate mapping |
| 1.2.7.6 | Continuous improvement into quarterly updates | `/app/grievances` | I | SS05 / case | E-4.5.6 | To implement; validate mapping |
| 1.2.7.7 | Dedicated system-use GRM | `/app/grievances` | I | SS05 / case | E-2.4.5; E-4.5.6 | To implement; validate mapping |
| 1.2.8.1 | Integration with EC NID, BDRIS, DGHS, DGFP, iBAS++/SPBMU, MFS/banks, GRS, Single Registry, others | `/app/payroll` | I | SS03 / cycle, payment | E-2.4.6; E-3.3.4 | To implement; validate mapping |
| 1.2.8.2 | REST/JSON/XML with secure tokens; consume and expose; minimum data | `/app/data-hub` | I | SS06 / partner calls | E-3.3.2 | To implement; validate mapping |
| 1.2.8.3 | Authentication, encryption, logging, retry, fallback, error handling | `/app/data-hub` | I | SS06 / partner calls | E-3.3.5 | To implement; validate mapping |
| 1.2.8.4 | Data Hub / API Bank: aggregation, canonical models, gateway lifecycle, GovStack-aligned X-Road patterns | `/app/beneficiaries` | I | SS02 / case, audit | E-3.3.1-E-3.3.3 | To implement; validate mapping |
| 1.2.8.5 | Governed bulk exchange as secondary layer | `/app/data-hub` | I | SS06 / partner calls | E-3.3.6 | To implement; validate mapping |
| 1.2.8.6 | Coordination with system owners; MoWCA facilitates MoUs | `/app/data-hub` | I | SS06 / partner calls | E-4.2.4 | To implement; validate mapping |
| 1.2.8.7 | Mandatory joint integration tests; signed cases, logs and approvals before go-live | `/app/data-hub` | I | SS06 / partner calls | E-4.2.4; E-4.2.6 | To implement; validate mapping |
| 1.2.8.8 | Open standards; Future Interoperability Roadmap | `/app/data-hub` | I | SS06 / partner calls | E-3.3.7 | To implement; validate mapping |
| 1.2.9.1-1.2.9.2 | Role-wise interactive dashboards; KPIs across programme areas | `/app/executive` | I | SS07 / reports | E-2.4.7; E-3.5.2 | To implement; validate mapping |
| 1.2.9.3 | Standard and ad hoc reports, exports, drill-down, trend analysis | `/app/executive` | I | SS07 / reports | E-2.4.7 | To implement; validate mapping |
| 1.2.9.4 | Dedicated analytics server and warehouse; ETL; no effect on production | `/app/executive` | I | SS07 / reports | E-3.2.5 | To implement; validate mapping |
| 1.2.9.5 | AI-powered Executive Intelligence Dashboard on desktop, tablet, mobile; advisory only | `/app/executive` | I | SS07 / reports | E-2.4.7; E-3.11.1 | To implement; validate mapping |
| 1.2.9.6 | Self-service no-code dashboards; SMS and e-mail campaigns under 1.2.15 governance | `/app/executive` | I | SS07 / reports | E-2.4.7; E-3.5.4 | To implement; validate mapping |
| 1.2.9.7 | KPI catalogue in nine areas, approved by MoWCA | `/app/executive` | I | SS07 / reports | E-2.4.7; E-5.4 | To implement; validate mapping |
| 1.2.9.8 | Visualisation, filters by level and time, scheduled reports, exports | `/app/executive` | I | SS07 / reports | E-2.4.7 | To implement; validate mapping |
| 1.2.10.1-1.2.10.2 | GIS engine and dashboard; layers, heatmaps, clustering, exports | `/app/executive` | I | SS07 / reports | E-2.4.8; E-3.5.1 | To implement; validate mapping |
| 1.2.10.3 | Navigation division to union / pourashava / city corporation | `/app/gis` | I | SS08 / layers | E-2.4.8 | To implement; validate mapping |
| 1.2.10.4 | Privacy-preserving location use; no continuous tracking | `/app/gis` | I | SS08 / layers | E-2.4.8 | To implement; validate mapping |
| 1.2.10.5 | Spatial data quality; governed layers; GIS Architecture and Layer Catalogue | `/app/gis` | I | SS08 / layers | E-3.5.1 | To implement; validate mapping |
| 1.2.10.6 | GIS in application, verification and mobile workflows | `/app/applications` | I | SS01 / actor + case | E-2.4.8 | To implement; validate mapping |
| 1.2.11.1-1.2.11.2 | Four agents with workflows, permissions, approval gates, HITL, full audit | `/app/agents` | I | SS09 / human gate | E-2.4.9; E-3.4.2 | To implement; validate mapping |
| 1.2.11.3 | Prohibitions on autonomous selection, eligibility, payroll, payment, master data | `/app/applications` | I | SS01 / actor + case | E-3.4.3; E-4.4.4 | To implement; validate mapping |
| 1.2.11.4 | Embedded Bangla/English assistant respecting access rules | `/app/agents` | I | SS09 / human gate | E-3.4.4 | To implement; validate mapping |
| 1.2.11.5 | AI and Agentic AI Design Document; AI Governance and HITL Plan | `/app/agents` | I | SS09 / human gate | E-3.4.6; E-4.6.1 | To implement; validate mapping |
| Addendum (minutes item 6) | AI/LLM hosted at BCC NDC or approved government cloud; no data outside Bangladesh | `/app/agents` | I | SS09 / human gate | E-3.4.1; E-3.4.5 | To implement; validate mapping |
| 1.2.12.1 | Android and iOS for field operations | `/mobile/android` | I | SS10 / synced visit | E-2.4.10; E-3.5.3 | To implement; validate mapping |
| 1.2.12.2 | Offline capture, sync, conflict resolution, local protection | `/mobile/android` | I | SS10 / synced visit | E-3.5.3 | To implement; validate mapping |
| 1.2.12.3 | Lightweight; low bandwidth; low-end devices | `/mobile/android` | I | SS10 / synced visit | E-4.4.4 | To implement; validate mapping |
| 1.2.12.4 | Encrypted local data; PIN or biometric; store or MDM updates | `/mobile/android` | I | SS10 / synced visit | E-3.5.3; E-3.11.3 | To implement; validate mapping |
| 1.2.12.5 | Bangla and English | `/mobile/android` | I | SS10 / synced visit | E-3.11.3 | To implement; validate mapping |
| 1.2.13.1-1.2.13.2 | RBAC, geographic scope, MFA, password policy, lockout, audit, separation of duties | `/app/users` | I | SS11 / role, audit | E-2.4.11; E-3.6.2 | To implement; validate mapping |
| 1.2.14.1 | Ticketing, categories, assignment, KB, SLA monitoring, notifications | `/app/helpdesk` | I | SS12 / ticket | E-2.4.12; E-4.5.2 | To implement; validate mapping |
| 1.2.14.2 | Summary logs to MoWCA; status visible in MIS | `/app/helpdesk` | I | SS12 / ticket | E-4.5.2 | To implement; validate mapping |
| 1.2.14.3 | CTI, IVR, call logging, ticketing/CRM | `/app/helpdesk` | I | SS12 / ticket | E-2.4.12 | To implement; validate mapping |
| 1.2.14.4 | End-to-end referral tracking | `/app/helpdesk` | I | SS12 / ticket | E-2.4.12 | To implement; validate mapping |
| 1.2.15.1.1 | No-code configuration of modules, forms, workflows, rules, KPIs, dashboards, reports, GIS layers, API mappings, templates | `/app/data-hub` | I | SS06 / partner calls | E-2.4.13 | To implement; validate mapping |
| 1.2.15.1.2 | Governance: owners, maker-checker, versioning, promotion, validation, rollback, audit, review | `/app/builder/forms` | I | SS13 / config | E-2.4.13; E-3.9.3 | To implement; validate mapping |
| 1.2.15.1.3 | Enterprise security controls on all dynamic content | `/app/users` | I | SS11 / role, audit | E-3.6 | To implement; validate mapping |
| 1.2.15.1.4 | Defects fixed in support; major extensions by change control | `/app/builder/forms` | I | SS13 / config | E-4.5.6 | To implement; validate mapping |
| 1.2.15.2 | Governed bulk import/export with validation, approval, reconciliation, audit | `/app/payroll` | I | SS03 / cycle, payment | E-2.4.13; E-6.1.7 | To implement; validate mapping |
| 1.2.16.1-1.2.16.3 | Multiple programmes; no-code creation of programmes, rules, workflows; inheritance of security, NID, payment, GRS | `/app/payroll` | I | SS03 / cycle, payment | E-2.4.14; E-3.1.3 | To implement; validate mapping |
| 1.3.1.1 | Secure, modular, API-first; Java/Spring Boot preferred; Python for AI; justify stack | `/app/data-hub` | I | SS06 / partner calls | E-3.1.4 | To implement; validate mapping |
| 1.3.1.2 | Modular, distributed, microservices; scaling; containers and Kubernetes | `/app/agents` | I | SS09 / human gate | E-3.1.3 | To implement; validate mapping |
| 1.3.1.3 | BeGA, NDGIO, approved middleware, GovStack | `/ops/evidence` | V | Cross-cutting / review | E-3.1.5 | To implement; validate mapping |
| 1.3.1.4 | Open standards; COTS disclosed; licences to MoWCA | `/ops/evidence` | V | E-4/E-5/E-6 / documentary evidence | E-3.1.4; E-3.9.5 | To implement; validate mapping |
| 1.3.1.5 | Scalable beyond legacy capacity without degradation | `/ops/migration` | I | E-6 / batch | E-3.7.2; E-3.8 | To implement; validate mapping |
| 1.3.1.6 | Dev, Test, Staging, Training, Production; CI/CD; DevSecOps | `/app/training` | I | SS04 / session | E-3.9 | To implement; validate mapping |
| 1.3.2.1-1.3.2.2 | Reference architecture layers | `/ops/evidence` | V | Cross-cutting / review | E-3.1.2 | To implement; validate mapping |
| 1.3.3.1-1.3.3.7 | Database, front-end, interoperability platform, orchestration, analytics, coding standards, licensing | `/app/data-hub` | I | SS06 / partner calls | E-3.1.4 | To implement; validate mapping |
| 1.3.4.1-1.3.4.2 | Central IAM/SSO; security architecture in SDD | `/app/users` | I | SS11 / role, audit | E-3.6.2 | To implement; validate mapping |
| 1.3.5.1-1.3.5.3 | Database design, dictionary, ER model; warehouse via ETL; Data Governance Framework | `/app/agents` | I | SS09 / human gate | E-3.2 | To implement; validate mapping |
| 1.3.6.1-1.3.6.2 | Tier-1 / Tier-2 separation; aggregation engine; suppression rules | `/ops/evidence` | V | Cross-cutting / review | E-3.2.3; E-3.2.4 | To implement; validate mapping |
| 1.3.7.1 | Environments, pipelines, automated tests, configuration, rollback, release, documentation | `/ops/evidence` | V | E-3/E-4 / evidence | E-3.9 | To implement; validate mapping |
| 1.3.8.1 | Bangla and English, Unicode, translations, i18n framework | `/ops/evidence` | V | Cross-cutting / review | E-3.5.4; E-5.3.2 | To implement; validate mapping |
| 1.3.8.2 | Usability: clean screens, role home dashboard, local-language errors, guidance | `/app/executive` | I | SS07 / reports | E-3.11 | To implement; validate mapping |
| 1.3.8.3 | Accessibility, WCAG 2.0 AA | `/ops/evidence` | V | Cross-cutting / review | E-4.4.4 | To implement; validate mapping |
| 1.3.8.4 | Participatory design; two rounds of field validation | `/mobile/android` | I | SS10 / synced visit | E-2.3.4; E-4.4.3 | To implement; validate mapping |
| 1.3.8.5 | Acceptable performance on UDC bandwidth | `/ops/performance` | V | E-3 / illustrative results | E-3.1.7 | To implement; validate mapping |
| 1.4.1.1-1.4.1.4 | User and role administration, roles, temporary accounts, password policy, CAPTCHA | `/ops/evidence` | V | E-4/E-5/E-6 / documentary evidence | E-2.4.11; E-3.6.2 | To implement; validate mapping |
| 1.4.2.1-1.4.2.4 | Audit logs of critical actions; tamper-evident; activity reports; suspicious-activity alerts | `/app/executive` | I | SS07 / reports | E-3.6.5 | To implement; validate mapping |
| 1.4.3.1-1.4.3.2 | Configuration governance; no material change without approval | `/ops/evidence` | V | E-4/E-5/E-6 / documentary evidence | E-4.1.9 | To implement; validate mapping |
| 1.4.4.1-1.4.4.2 | Monitoring of uptime, performance, errors, integrations, jobs, backups, security | `/app/data-hub` | I | SS06 / partner calls | E-3.7.6 | To implement; validate mapping |
| 1.4.5.1-1.4.5.2 | Automated daily incremental and weekly full backups; encrypted; separate storage | `/app/agents` | I | SS09 / human gate | E-3.7.5 | To implement; validate mapping |
| 1.4.5.3 | RPO < 24 h; RTO < 48 h | `/ops/backup` | I | E-3 / DR simulation | E-3.7.5 | To implement; validate mapping |
| 1.4.5.4-1.4.5.5 | Deployable at BCC DR; replication; DR/BCP | `/ops/evidence` | V | E-3/E-4 / evidence | E-3.7.5 | To implement; validate mapping |
| 1.4.5.6-1.4.5.7 | Quarterly restore tests; DR drill before go-live and in support; backup notifications | `/ops/backup` | I | E-3 / DR simulation | E-4.5.5 | To implement; validate mapping |
| 1.5.1 (API) | Average API response under 2 s | `/app/data-hub` | I | SS06 / partner calls | E-3.7.1 | To implement; validate mapping |
| 1.5.1 (page) | Average page response under 3 s | `/ops/evidence` | V | Cross-cutting / review | E-4.4.5 | To implement; validate mapping |
| 1.5.1 (availability) | 99.9% design availability | `/app/agents` | I | SS09 / human gate | E-3.7.5 | To implement; validate mapping |
| 1.5.1 (batch) | 1,000,000 payments in 2 to 3 hours | `/app/payroll` | I | SS03 / cycle, payment | E-3.7.3 | To implement; validate mapping |
| 1.5.1 (users) | At least 5,000 concurrent users | `/ops/performance` | V | E-3 / illustrative results | E-4.4.5 | To implement; validate mapping |
| 1.5.1 (API throughput) | At least 10,000 API requests per minute | `/app/data-hub` | I | SS06 / partner calls | E-4.4.5 | To implement; validate mapping |
| 1.5.1 (scale) | 1.0-1.5 M+ active beneficiaries | `/ops/evidence` | V | Cross-cutting / review | E-3.8.2 | To implement; validate mapping |
| 1.5.1.1-1.5.1.3 | Vertical and horizontal scaling; load, stress, endurance tests; targets in SRS | `/ops/performance` | V | E-3 / illustrative results | E-3.7.4; E-4.4.5 | To implement; validate mapping |
| 1.6.1 | Security-first approach; reviews by Cybersecurity Specialist | `/app/users` | I | SS11 / role, audit | E-3.6; E-5.4 | To implement; validate mapping |
| 1.6.2 | Enterprise security standards applied consistently | `/app/users` | I | SS11 / role, audit | E-3.6.1 | To implement; validate mapping |
| 1.6.3 | Encryption at rest (AES-256) and in transit (TLS); key management; masking | `/ops/evidence` | V | Cross-cutting / review | E-3.6.3 | To implement; validate mapping |
| 1.6.4 | Password policy, brute-force protection, Bangla CAPTCHA, sessions | `/ops/evidence` | V | E-4/E-5/E-6 / documentary evidence | E-3.6.2 | To implement; validate mapping |
| 1.6.5 | Write-once, tamper-evident audit trail | `/app/agents` | I | SS09 / human gate | E-3.6.5 | To implement; validate mapping |
| 1.6.6 | Secure coding, OWASP Top 10, SAST, third-party VAPT; no open critical/high at go-live | `/ops/evidence` | V | E-3/E-4 / evidence | E-3.9.2; E-4.4.6 | To implement; validate mapping |
| 1.6.7 | Rate limiting, fraud-pattern detection, headers, API security, patching, mid-term pentest | `/app/data-hub` | I | SS06 / partner calls | E-3.6; E-4.5.5 | To implement; validate mapping |
| 1.6.8 | Compliance with GoB ICT security, BeGA, ISO 27001, ISO 25010 | `/app/users` | I | SS11 / role, audit | E-3.6.6 | To implement; validate mapping |
| 1.6.9 | Consent, privacy notice, data minimisation | `/ops/evidence` | V | Cross-cutting / review | E-3.6.5 | To implement; validate mapping |
| 1.6.10 | DPIA; annual privacy and security audit | `/app/users` | I | SS11 / role, audit | E-4.5.5 | To implement; validate mapping |
| 1.6.11 | Incident Response Plan; 24-hour escalation | `/ops/evidence` | V | Cross-cutting / review | E-3.6.5; E-4.5.4 | To implement; validate mapping |
| 1.6.12 | Coordinate with BCC SQTC; resolve critical/high before go-live | `/ops/evidence` | V | E-3/E-4 / evidence | E-4.4.6 | To implement; validate mapping |
| 2.1.1 | Formal analysis and design methodology | `/ops/evidence` | V | Cross-cutting / review | E-2.3.2; E-4.1.1 | To implement; validate mapping |
| 2.1.2.1-2.1.2.4 | Kick-off and consultations; document review; Inception Report and SRS; participatory workshops | `/app/beneficiaries` | I | SS02 / case, audit | E-4.1.4; E-2.3.4 | To implement; validate mapping |
| 2.1.3 (1-14) | Fourteen design deliverables (SRS to multi-scheme specification) | `/app/schemes` | I | SS14 / scheme | E-4.6.1 | To implement; validate mapping |
| 2.1.4.1-2.1.4.4 | User manuals, admin/technical manuals, documented source code, CASE artefacts in Git | `/ops/evidence` | V | Cross-cutting / review | E-6.2.6; E-6.2.7 | To implement; validate mapping |
| 2.1.5 | Lifecycle phases I-VI with milestones; 36 weeks then 12 months | `/app/beneficiaries` | I | SS02 / case, audit | E-4.2.1 | To implement; validate mapping |
| 2.2.1.1 | Iterative, sprint-based development with demos and quality gates | `/ops/evidence` | V | Cross-cutting / review | E-4.2.2 | To implement; validate mapping |
| 2.2.1.2 | Enterprise-grade, modular, open-source preferred stack | `/ops/evidence` | V | Cross-cutting / review | E-3.1.4 | To implement; validate mapping |
| 2.2.1.3 | Responsive, bilingual, accessible, low-bandwidth web | `/ops/evidence` | V | Cross-cutting / review | E-3.11.1 | To implement; validate mapping |
| 2.2.1.4 | Android and iOS offline-capable apps | `/mobile/android` | I | SS10 / synced visit | E-3.5.3 | To implement; validate mapping |
| 2.2.1.5 | Version control, coding standards, code review, SBOM, CI/CD; code to MoWCA and NSCR | `/ops/evidence` | V | E-4/E-5/E-6 / documentary evidence | E-3.9.5; E-6.2.7 | To implement; validate mapping |
| 2.2.1.6 | Code quality, documented APIs, OWASP, SAST, unit tests | `/app/data-hub` | I | SS06 / partner calls | E-4.4.4 | To implement; validate mapping |
| 2.2.1.7 | COTS disclosed, approved, licences transferred | `/ops/evidence` | V | Cross-cutting / review | E-3.1.4 | To implement; validate mapping |
| 2.3.1.1 | Review of external systems; documentation, keys, test environments | `/ops/evidence` | V | E-3/E-4 / evidence | E-4.2.4 | To implement; validate mapping |
| 2.3.1.2-2.3.1.3 | Integration requirements per system: type, frequency, standards, retry and fallback | `/app/data-hub` | I | SS06 / partner calls | E-3.3.4; E-3.3.5 | To implement; validate mapping |
| 2.3.1.4 | Develop middleware, APIs, adapters; implement Data Hub | `/app/data-hub` | I | SS06 / partner calls | E-3.3 | To implement; validate mapping |
| 2.3.1.5 | Joint integration testing with all agencies; signed evidence; fallbacks | `/app/data-hub` | I | SS06 / partner calls | E-4.2.4 | To implement; validate mapping |
| 2.3.1.6 | Delays from external access handled under schedule provisions | `/ops/evidence` | V | E-4/E-5/E-6 / documentary evidence | E-4.1.6 | To implement; validate mapping |
| 2.4.1 | Structured training; continuous knowledge transfer; final handover workshop | `/app/training` | I | SS04 / session | E-4.3; E-6.2 | To implement; validate mapping |
| 2.4.2 | User training before go-live; cascade; Bangla materials; modes and testing | `/app/training` | I | SS04 / session | E-4.3.2-E-4.3.6 | To implement; validate mapping |
| 2.4.3 | Technical training: administration, source code, DB, APIs, deployment, backup, DR; drills | `/app/training` | I | SS04 / session | E-6.2.3-E-6.2.5 | To implement; validate mapping |
| 2.4.4 | Change Management Plan, Change Champion Network, Toolkit | `/ops/evidence` | V | Cross-cutting / review | E-4.2.8 | To implement; validate mapping |
| 2.4.5 | Materials, manuals, quick guides, videos, Training Completion Report | `/app/training` | I | SS04 / session | E-4.3.5; E-4.3.6 | To implement; validate mapping |
| 2.4.6 | Training volume per price schedule; programmes in Inception Report | `/app/training` | I | SS04 / session | E-4.3.2 | To implement; validate mapping |
| 2.5.1 | Migrate approved legacy data into MCBP-MIS | `/ops/migration` | I | E-6 / batch | E-6.1.1 | To implement; validate mapping |
| 2.5.1.1 | Early assessment and profiling; strategy, mapping, scripts, reconciliation, rollback | `/app/payroll` | I | SS03 / cycle, payment | E-6.1.4-E-6.1.7 | To implement; validate mapping |
| 2.5.1.2 | At least one dry run and migrated test data before UAT; final migration | `/ops/migration` | I | E-6 / batch | E-6.1.9 | To implement; validate mapping |
| 2.5.1.3 | 100% count reconciliation; ≥ 99.5% field accuracy; exception log; repeat validation | `/app/payroll` | I | SS03 / cycle, payment | E-6.1.10 | To implement; validate mapping |
| 2.5.1.4 | Historical beneficiary and payment records; bulk templates for ingestion | `/app/payroll` | I | SS03 / cycle, payment | E-6.1.1; E-6.1.7 | To implement; validate mapping |
| 2.5.1.5 | Staged migration; repeated script tests; reconciliation report | `/app/payroll` | I | SS03 / cycle, payment | E-6.1.8 | To implement; validate mapping |
| 2.5.1.6 | Parallel or read-only legacy; cut-over strategy in Inception Report | `/app/executive` | I | SS07 / reports | E-6.1.11 | To implement; validate mapping |
| 2.5.1.7 | Legacy owner provides data and access | `/ops/migration` | I | E-6 / batch | E-4.1.6; E-6.1.3 | To implement; validate mapping |
| 2.5.1.8 | Freeze ≤ 48 h on weekend; zero payment disruption; legacy read-only ≥ 6 months | `/app/payroll` | I | SS03 / cycle, payment | E-6.1.11; E-6.1.13 | To implement; validate mapping |
| 2.6.1.1 | End-user documents in Bangla and English | `/ops/evidence` | V | Cross-cutting / review | E-6.2.6 | To implement; validate mapping |
| 2.6.1.2 | Technical documents in English; editable, version-controlled, as-built | `/ops/evidence` | V | Cross-cutting / review | E-6.2.6 | To implement; validate mapping |
| 2.6.2 (1-10) | Ten deliverables on the indicative timeline | `/ops/evidence` | V | Cross-cutting / review | E-4.6.1 | To implement; validate mapping |
| 2.6.2.1 | Fortnightly progress reports; monthly in maintenance; quarterly reviews | `/app/executive` | I | SS07 / reports | E-4.6.2 | To implement; validate mapping |
| 2.6.2.2 | Comment-resolution matrix; resubmit in five working days | `/ops/evidence` | V | Cross-cutting / review | E-4.6.3 | To implement; validate mapping |
| 2.7.1 | Fourteen key positions with qualifications; replacement only with approval | `/ops/evidence` | V | Cross-cutting / review | E-5 | To implement; validate mapping |
| 2.7.1 (non-key) | Additional non-key staff at Supplier cost | `/ops/evidence` | V | E-4/E-5/E-6 / documentary evidence | E-5.3.2 | To implement; validate mapping |
| 3.1.1.1 | Bangla and English UI, reports, notifications; Unicode; embedded Bangla fonts; Bangla numerals and dates | `/app/executive` | I | SS07 / reports | E-3.5.4 | To implement; validate mapping |
| 3.1.1.2 | Bangla translations of system text and training materials; MoWCA verifies terms | `/app/training` | I | SS04 / session | E-5.3.2; E-4.6.5 R13 | To implement; validate mapping |
| 3.1.1.3 | AI assistant, notification hub, CAPTCHA, KB in Bangla and English | `/app/agents` | I | SS09 / human gate | E-3.4.4; E-3.5.4 | To implement; validate mapping |
| 3.2.1.1 | Hosting at BCC NDC or approved cloud; BCC DR; data localisation | `/ops/evidence` | V | E-3/E-4 / evidence | E-3.8.1 | To implement; validate mapping |
| 3.2.1.2 | Liaise with BCC in advance for all environments | `/app/agents` | I | SS09 / human gate | E-4.2.3 | To implement; validate mapping |
| 3.2.1.3 | Sizing with capacity calculations in Technical Proposal | `/ops/performance` | V | E-3 / illustrative results | E-3.8.2-E-3.8.4 | To implement; validate mapping |
| 3.2.1.4 | Hosting costs borne by Purchaser; system tuned and documented | `/ops/evidence` | V | E-3/E-4 / evidence | E-3.8 | To implement; validate mapping |
| 3.2.1.5 | Automated backup, logging, monitoring, DR | `/ops/backup` | I | E-3 / DR simulation | E-3.7.5; E-3.7.6 | To implement; validate mapping |
| 3.2.2 | Hosting infrastructure inventory (Table 3) | `/ops/evidence` | V | E-3/E-4 / evidence | E-3.8.5 | To implement; validate mapping |
| 4.1.1 | Review by committee; MoWCA final approval; five-day resolution | `/ops/evidence` | V | Cross-cutting / review | E-4.6.3 | To implement; validate mapping |
| 4.1.2 | Quality gates before submission; testing evidence | `/ops/evidence` | V | Cross-cutting / review | E-4.4.1 | To implement; validate mapping |
| 4.1.3 | Purchaser rights of inspection and audit | `/ops/evidence` | V | Cross-cutting / review | E-3.10.4 | To implement; validate mapping |
| 4.2.1 (S-1 hosting) | Pre-commissioning: hosting and deployment readiness | `/ops/evidence` | V | E-3/E-4 / evidence | E-4.4.8 | To implement; validate mapping |
| 4.2.1 (S-2 mobile) | Pre-commissioning: mobile apps and devices | `/mobile/android` | I | SS10 / synced visit | E-4.4.8 | To implement; validate mapping |
| 4.2.1 (S-3 platform) | Pre-commissioning: software platform | `/ops/evidence` | V | Cross-cutting / review | E-4.4.8 | To implement; validate mapping |
| 4.2.1 (entire system) | Pre-commissioning: end-to-end, 1 M payments, RPO/RTO, response times | `/app/payroll` | I | SS03 / cycle, payment | E-4.4.8 | To implement; validate mapping |
| 4.3.1 (SS1-SS14) | Operational acceptance tests per subsystem | `/ops/evidence` | V | Cross-cutting / review | E-4.4.8 | To implement; validate mapping |
| 4.3.1 (cross-cutting) | Load, VAPT, SQTC, DR drill, migration reconciliation, second usability round | `/app/payroll` | I | SS03 / cycle, payment | E-4.4.3 | To implement; validate mapping |
| 4.3.2 | Pilot and Go/No-Go Plan; ten criteria | `/ops/evidence` | V | Cross-cutting / review | E-4.2.5; E-4.2.6 | To implement; validate mapping |
| 4.3.3 | SQTC independent testing; certificate precondition for final acceptance | `/app/training` | I | SS04 / session | E-4.4.6 | To implement; validate mapping |
| 4.3.4 | Acceptance sequence: Operational Acceptance then Final Acceptance after support | `/ops/evidence` | V | E-4/E-5/E-6 / documentary evidence | E-4.2.1 | To implement; validate mapping |
| 5.1.1 | 12 months of maintenance and support from Go-Live | `/app/agents` | I | SS09 / human gate | E-4.5.1 | To implement; validate mapping |
| 5.1.2 | Maintenance scope | `/app/agents` | I | SS09 / human gate | E-4.5.5 | To implement; validate mapping |
| 5.1.3 | Service levels: availability, helpdesk hours, 24/7 critical channel, 95% within SLA, backups, security | `/app/agents` | I | SS09 / human gate | E-4.5.3 | To implement; validate mapping |
| 5.1.3 (matrix) | Severity matrix: critical 15 min / 4 h / 8 h; medium 4 h / 3 days; low 1 day / 7 days | `/ops/evidence` | V | Cross-cutting / review | E-4.5.3 | To implement; validate mapping |
| 5.1.4 | RCA, corrective action, service credits | `/ops/evidence` | V | Cross-cutting / review | E-4.5.7 | To implement; validate mapping |
| 5.2.1 | Helpdesk by phone, e-mail, ticketing in Bangla and English | `/app/agents` | I | SS09 / human gate | E-4.5.2 | To implement; validate mapping |
| 5.2.2 | On-site support for critical issues; proactive visits | `/ops/evidence` | V | E-4/E-5/E-6 / documentary evidence | E-4.5.2 | To implement; validate mapping |
| 5.2.3 | Monitoring; monthly and quarterly reports; quarterly reviews | `/app/executive` | I | SS07 / reports | E-4.5.7 | To implement; validate mapping |
| 5.2.4 | Backups, quarterly restore tests, DR drills with BCC | `/ops/backup` | I | E-3 / DR simulation | E-4.5.5 | To implement; validate mapping |
| 5.2.5 | Security patches, vulnerability remediation, log review | `/app/users` | I | SS11 / role, audit | E-4.4.6 | To implement; validate mapping |
| 5.2.6 | Audit and compliance support; annual audit | `/ops/evidence` | V | E-4/E-5/E-6 / documentary evidence | E-4.5.5 | To implement; validate mapping |
| 5.2.7 | About 30 person-days per year of minor enhancements | `/ops/evidence` | V | Cross-cutting / review | E-4.5.6 | To implement; validate mapping |
| 5.2.8 | Capacity building and handover; transition cooperation | `/ops/performance` | V | E-3 / illustrative results | E-6.2 | To implement; validate mapping |
| 5.3.1 | Support team composition and level of effort | `/ops/evidence` | V | E-4/E-5/E-6 / documentary evidence | E-5.3.3; E-4.5.8 | To implement; validate mapping |
| Impl. lines 0-11 | Delivery, installation and acceptance weeks for each line | `/ops/evidence` | V | E-4/E-5/E-6 / documentary evidence | E-4.1.6 | To implement; validate mapping |
| Site Table S-1 to S-8 | Sites; mandatory pilot at 8 locations in 8 divisions with costs included | `/ops/evidence` | V | E-4/E-5/E-6 / documentary evidence | E-4.1.3; E-4.2.5 | To implement; validate mapping |
| Inventory 1-12 | Project management and analysis deliverables | `/ops/evidence` | V | E-4/E-5/E-6 / documentary evidence | E-4.6.1 | To implement; validate mapping |
| Inventory 13-27 | Fourteen software subsystems, production-ready | `/ops/evidence` | V | Cross-cutting / review | E-2.4 | To implement; validate mapping |
| Inventory 28-33 | Migration, environments, DR, VAPT/SQTC, training, change management | `/app/training` | I | SS04 / session | E-6.1; E-3.9; E-4.3; E-4.4 | To implement; validate mapping |
| Inventory 34-38 | Manuals, technical documentation, source code, Go-Live reports, sustainability plan | `/app/executive` | I | SS07 / reports | E-6.2 | To implement; validate mapping |
| Recurrent R1-R11 | Support, helpdesk, reports, enhancements, pentest, DR drill, audit, visits, workshops, final KT | `/app/executive` | I | SS07 / reports | E-4.5 | To implement; validate mapping |
| S1.1 | Institutional arrangements; reporting to PD; key personnel availability | `/app/executive` | I | SS07 / reports | E-4.1.2; E-5.5 | To implement; validate mapping |
| S1.2 | Performance management: baseline, reporting, governance, quality gates, change control, corrective action | `/app/executive` | I | SS07 / reports | E-4.1.1; E-4.6.6 | To implement; validate mapping |
| S1.3 | RACI | `/ops/evidence` | V | Cross-cutting / review | E-4.1.2; E-6.1.3 | To implement; validate mapping |
| S1.4 | Risk Management Framework; monthly review; 24-hour escalation | `/ops/evidence` | V | Cross-cutting / review | E-4.6.4; E-4.6.5 | To implement; validate mapping |
| S2.1 | Firm qualifications | `/ops/evidence` | V | Cross-cutting / review | Part B | To implement; validate mapping |
| S2.2 | Evaluation criteria | `/ops/evidence` | V | Cross-cutting / review | E-2 to E-6 | To implement; validate mapping |
| S2.3 | Tentative major milestones and 36-week period | `/ops/evidence` | V | E-4/E-5/E-6 / documentary evidence | E-4.1.6 | To implement; validate mapping |
| S3 | Payment schedule against accepted deliverables | `/app/payroll` | I | SS03 / cycle, payment | E-4.6.3 | To implement; validate mapping |
| S4 | Final handover, sustainability and exit | `/app/agents` | I | SS09 / human gate | E-6.2.7-E-6.2.10 | To implement; validate mapping |
| S5.1 | IP, source code and data ownership; confidentiality; COTS | `/ops/evidence` | V | E-4/E-5/E-6 / documentary evidence | E-6.2.7; E-5.5 | To implement; validate mapping |
| S5.2 | Compliance with GoB standards; independent testing support; editable deliverables | `/ops/evidence` | V | E-4/E-5/E-6 / documentary evidence | E-3.6.6; E-4.4.6 | To implement; validate mapping |
| S5.3 | Environmental and social considerations | `/ops/evidence` | V | E-3/E-4 / evidence | E-5.5 | To implement; validate mapping |
| S5.4 | Information responsibility | `/ops/evidence` | V | Cross-cutting / review | E-6.1.14 | To implement; validate mapping |

**Extracted checklist items mapped:** 233. E-8 mentions 235 checklist lines in its narrative; some are grouped rows or non-table metadata. Verify the official row count and grouped subclauses directly against Annex B and original E-8 during QA; this autogenerated table does not independently certify 235 individual implemented features.
