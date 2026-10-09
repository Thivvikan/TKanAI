# TKanAI — Complete User Documentation
### AI-Assisted Software Engineering Ecosystem
**Document Version:** 1.0  
**Target Audience:** Engineering Leads, Product Managers, Developers, QA Engineers, UI/UX Designers, Clients & Stakeholders

---

## Table of Contents

1. [Executive Summary & System Overview](#1-executive-summary--system-overview)
2. [Quick Start & Setup](#2-quick-start--setup)
3. [Persona & Role-Based Access Architecture](#3-persona--role-based-access-architecture)
4. [User Interface & Navigation Guide](#4-user-interface--navigation-guide)
5. [Feature Modules Deep Dive](#5-feature-modules-deep-dive)
   - 5.1 [Organization Dashboard](#51-organization-dashboard)
   - 5.2 [Project Portfolio](#52-project-portfolio)
   - 5.3 [Requirements & AI Engineering](#53-requirements--ai-engineering)
   - 5.4 [Living Traceability Matrix](#54-living-traceability-matrix)
   - 5.5 [Product Backlog & User Stories](#55-product-backlog--user-stories)
   - 5.6 [Interactive Kanban Board](#56-interactive-kanban-board)
   - 5.7 [Sprint Velocity & Burndown Analytics](#57-sprint-velocity--burndown-analytics)
   - 5.8 [Issues & AI Bug Lab](#58-issues--ai-bug-lab)
   - 5.9 [QA Test Suites & Execution](#59-qa-test-suites--execution)
   - 5.10 [Documentation Hub & Living Specs](#510-documentation-hub--living-specs)
   - 5.11 [Meetings & AI Decision Extractor](#511-meetings--ai-decision-extractor)
   - 5.12 [AI Risk Radar & Mitigation](#512-ai-risk-radar--mitigation)
   - 5.13 [Executive Reports](#513-executive-reports)
   - 5.14 [Client Portal & Change Request Engine](#514-client-portal--change-request-engine)
   - 5.15 [Research Telemetry & Metrics](#515-research-telemetry--metrics)
   - 5.16 [System Settings & Database Management](#516-system-settings--database-management)
6. [TKanAI Copilot & AI Assistants](#6-tkanai-copilot--ai-assistants)
7. [Notifications & Activity Feeds](#7-notifications--activity-feeds)
8. [Global Search (Ctrl+K)](#8-global-search-ctrlk)
9. [Role Permissions Matrix](#9-role-permissions-matrix)
10. [Frequently Asked Questions (FAQ)](#10-frequently-asked-questions-faq)

---

## 1. Executive Summary & System Overview

**TKanAI** is an advanced, client-side, reactive Software Development Lifecycle (SDLC) ecosystem engineered to demonstrate real-time, AI-augmented agile software engineering. It bridges communication gaps across multi-disciplinary product teams: Product Owners, Engineers, QA Testers, Executives, and External Clients.

### Core Architecture Highlights
- **100% Client-Side Persistence:** Powered by IndexedDB via Dexie.js. Data persists across browser refreshes and works entirely offline.
- **Cross-Tab Real-time Sync:** Uses the browser `BroadcastChannel` API to synchronize state across multiple tabs without a server backend.
- **Reactive State Management:** Combines Zustand and `dexie-react-hooks` (`useLiveQuery`) for instant UI re-renders on data mutations.
- **Instant Role Persona Switching:** Switch seamlessly between 10 roles in real-time without password prompts, allowing rapid end-to-end simulation.
- **Embedded AI Capabilities:** Pre-configured intelligent heuristics and NLP routines for ambiguity scoring, bug root-cause analysis, meeting decision extraction, and change request impact modeling.

---

## 2. Quick Start & Setup

### Running the Application

1. Open your terminal in the project directory:
   ```powershell
   cd "c:\Users\ADMIN\Desktop\AI Ecosystem"
   ```

2. Start the development server:
   ```cmd
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:5173/
   ```

### First-Time Initialization
On first load, TKanAI automatically seeds IndexedDB with a comprehensive, realistic production scenario: **Zyroute Online Bus Reservation System** (including user stories, backlog items, automated test suites, SRS documents, and active sprint metrics).

### Resetting Data to Factory Defaults
If you modify data or wish to reload updated names from `seedData.ts`:
1. Navigate to **System Settings** via the sidebar.
2. Click **Reset Data**.
3. Confirm the modal prompt. IndexedDB will re-seed immediately.

---

## 3. Persona & Role-Based Access Architecture

TKanAI comes pre-configured with **10 specialized roles**. Each user persona has custom permissions, action abilities, and tailored UI visibility.

| Role Key | Role Name | Default Persona Name | Focus & Responsibility |
|---|---|---|---|
| `ORG_ADMIN` | Org Admin | **Vanuya** | System administration, user/team management, organization-level settings |
| `PROJECT_MANAGER` | Project Manager | **Thivvikan** | Sprints, timelines, task assignment, risk register, CR evaluations |
| `PRODUCT_OWNER` | Product Owner | **Ushamini** | Scope management, acceptance criteria, backlog prioritization, PRD/SRS approvals |
| `BUSINESS_ANALYST` | Business Analyst | **Kanushi** | Requirements engineering, ambiguity resolution, user story creation |
| `DEVELOPER` | Senior Developer | **Kajakaran** | Task execution, code review, technical specs, bug resolution |
| `QA_ENGINEER` | QA Lead | **Mayoory** | Test plan authoring, test execution, regression suites, bug verification |
| `UI_UX_DESIGNER` | UI/UX Designer | **Sarangn** | Design systems, mockups, design tokens, UI accessibility tickets |
| `DEVOPS_ENGINEER` | DevOps Specialist | **Karikaalan** | CI/CD pipelines, Docker/K8s configs, infrastructure runbooks, telemetry |
| `CLIENT` | Client Sponsor | **Sutharsini** | Deliverable sign-off, budget monitoring, change requests (CR) submission |
| `STAKEHOLDER` | Executive Stakeholder | **Hariarthan** | High-level reports, velocity charts, risk assessments, financial oversight |

### Switching Personas
At any time, click your profile avatar in the **top-right header**, then select any persona. The entire interface, permissions set, and active notification queue adapt instantly.

---

## 4. User Interface & Navigation Guide

### 1. Left Sidebar
- **Header:** System logo `TKanAI` and workspace badge.
- **Section 1: Executive Overview:**
  - `Organization Dashboard` — Multi-project bird's eye view.
  - `Project Portfolio` — All active and completed projects.
- **Section 2: Zyroute SDLC Workspace:**
  - `Project 360` — Project summary, team roster, sprint status.
  - `Requirements & AI` — FR/NFR requirements engineering with ambiguity scoring.
  - `Traceability Matrix` — Bidirectional traceability linking REQ ➔ Story ➔ Task ➔ Bug ➔ Test.
  - `Backlog & Stories` — Sprint backlog management and story breakdown.
  - `Kanban Board` — Visual drag-and-drop workflow tracker.
  - `Sprint Analytics` — Real-time burndown charts and velocity trackers.
  - `Issues & AI Bug Lab` — Defect reporting and AI root-cause analysis.
  - `QA Test Suites` — Test case authoring, execution, and pass-rate gauges.
  - `Documentation Hub` — Markdown-based living specifications and versioning.
  - `Meetings & AI Decisions` — Meeting logs with automatic ADR / action item extraction.
  - `AI Risk Radar` — Risk likelihood/impact heatmaps with automated mitigation plans.
  - `Executive Reports` — Automated exportable status reports.
- **Section 3: Portals & Research:**
  - `Client Portal` — Client self-service, milestone sign-offs, and Change Request engine.
  - `Research Telemetry` — AI interaction analytics and engineering telemetry.
  - `System Settings` — Theme toggles, reset database, and JSON export.
- **Footer:** Active user avatar and current role badge.

### 2. Top Header Bar
- **Global Search (`Ctrl+K`):** Universal search across tasks, issues, requirements, and docs.
- **Research Mode Badge:** Toggle to track simulated academic and telemetry metrics.
- **AI Assistant Button (`✨`):** Drawer launcher for the **TKanAI Copilot**.
- **Notification Bell:** Unread badge and dropdown with role-relevant alerts.
- **Theme Switcher:** Instant switch between Dark Mode and Light Mode.
- **User Switcher:** Interactive dropdown to swap personas.

---

## 5. Feature Modules Deep Dive

### 5.1 Organization Dashboard
- **KPI Metrics:** Total active projects, closed sprint rate, open critical bugs, and overall document health score.
- **Workload Balance Chart:** Visual workload allocation displaying active task count and remaining hours per developer/engineer.
- **Task Status Breakdown:** Real-time distribution across Backlog, Ready, In Progress, Review, QA, and Done.
- **Recent Organization Activity:** Chronological event stream recording state transitions across the workspace.

### 5.2 Project Portfolio
- Browse all projects within the organization with key metadata: deadline, sprint count, completion percentage, and active lead.
- **Create Project Modal:** Admin and PM can instantiate new projects with customizable keys and sprint cadences.

### 5.3 Requirements & AI Engineering
- Manage functional (`FR`) and non-functional (`NFR`) requirements.
- **AI Ambiguity Scorer:** Calculates a confidence score (0-100%) by detecting vague terminology (e.g., "fast", "user-friendly", "secure") and suggesting quantitative thresholds.
- **AI User Story Generator:** Converts approved requirements directly into structured agile user stories with Gherkin acceptance criteria.
- **Approval Workflow:** Product Owners and PMs can mark requirements as `Approved`, locking them against unauthorized modification.

### 5.4 Living Traceability Matrix
- End-to-end verification table mapping:
  `Requirement ID` ➔ `User Stories` ➔ `Development Tasks` ➔ `QA Test Cases` ➔ `Defects (Bugs)`
- **Orphan Item Alerts:** Automatically highlights unlinked requirements or test cases missing upstream specifications to guarantee 100% test coverage.

### 5.5 Product Backlog & User Stories
- Epic and sprint organization.
- Estimate story points, assignees, and priorities (Critical, High, Medium, Low).
- **One-Click Task Decomposer:** Uses AI heuristics to automatically break stories into frontend, backend, and QA implementation tasks.

### 5.6 Interactive Kanban Board
- Column stages: `Backlog` ➔ `To Do` ➔ `In Progress` ➔ `Code Review` ➔ `QA Testing` ➔ `Done`.
- Move cards across swimlanes. Status changes emit notifications to assignees and update sprint burndown charts in real time.
- Task detail modal provides time logging, blocker flags, and linked commit simulation.

### 5.7 Sprint Velocity & Burndown Analytics
- **Burndown Chart:** Compares the Ideal Burndown line against actual remaining story points across the active sprint.
- **Sprint Summary:** Start date, target completion date, total committed points vs. completed points.
- **Velocity Tracker:** Historical performance comparison over past sprints.

### 5.8 Issues & AI Bug Lab
- Log defects with reproduction steps, environment details, priority, and severity.
- **AI Root Cause Analysis (RCA):** The AI inspects bug symptoms and recommends specific code/architectural fixes (e.g., Redis mutex locking, transaction isolation, debounce handlers).
- **QA Verification Sign-off:** Developers can mark bugs as `Resolved`; only QA Engineers can verify and permanently `Close` them.

### 5.9 QA Test Suites & Execution
- Group test cases by functional domains (e.g., Checkout, Authentication, Real-Time Seat Locking).
- Run test sessions with status toggles: `Passed`, `Failed`, `Blocked`, `Skipped`.
- **Auto-Generate Bug:** If a test case fails, clicking "Log Bug" pre-populates an issue ticket linked directly to the failed test case and requirement.

### 5.10 Documentation Hub & Living Specs
- Live markdown editor for project documentation (SRS, API Specs, Architecture Decisions, User Manuals).
- **AI Document Drafter:** Generates technical outlines and requirements sections based on project state.
- **Version History & Approvals:** Formal audit logging tracking who updated versions and approval timestamps.

### 5.11 Meetings & AI Decision Extractor
- Records meeting agendas, attendee rosters, and raw minutes.
- **AI Action Item & Decision Extractor:** Parses notes to identify Architectural Decision Records (ADRs) and assigns tasks directly to team members' Kanban backlogs.

### 5.12 AI Risk Radar & Mitigation
- Computes risk scores using standard `Probability (%) × Severity` calculations.
- Categorizes risks: Technical, Schedule, Resource, Compliance, and Scope.
- AI provides tailored mitigation procedures to safeguard project milestones.

### 5.13 Executive Reports
- Generates publication-ready status reports (Sprint Status, QA Coverage, Risk Matrix).
- Supports browser printing and PDF export with corporate headers and metadata.

### 5.14 Client Portal & Change Request Engine
- Dedicated interface for the **Client** role.
- **Submit Change Request (CR):** Clients submit proposed scope adjustments.
- **AI Impact Analysis:** Analyzes proposed changes against current requirements, estimating cost, delay, affected code modules, and test suites.
- PM and PO review, accept, or reject CRs with recorded decision rationale.

### 5.15 Research Telemetry & Metrics
- Tracks AI productivity metrics: time saved per automated task, ambiguity reduction percentages, and code-review velocity.
- Designed for academic and corporate process improvement evaluations.

### 5.16 System Settings & Database Management
- **Theme Selection:** Dark Mode and Light Mode.
- **Telemetry Toggle:** Toggle Research Mode tracking.
- **Database Export:** One-click download of the entire IndexedDB database as a formatted JSON backup file (`tkanai_sdlc_export_YYYY-MM-DD.json`).
- **Factory Reset:** Restore seed dataset at any time.

---

## 6. TKanAI Copilot & AI Assistants

The **TKanAI Copilot** is accessible anywhere via the `✨` button in the header.

### Common Inquiries & Prompts
- *"What is our current project status and sprint burndown?"*
- *"Which tasks are currently blocked or delayed?"*
- *"What is the highest risk item facing the project?"*
- *"Show developer workload and capacity distribution."*
- *"Explain the impact of the latest Client Change Request (CR-001)."*

The Copilot queries live project data directly from IndexedDB to provide immediate, context-accurate answers.

---

## 7. Notifications & Activity Feeds

- **Targeted Notification Routing:** When a QA engineer files a bug, the assigned developer receives a notification; when a client submits a CR, the PM and PO are alerted.
- **Notification Center:** Click the Bell icon in the header to view, read, or dismiss alerts.
- **Event Audit Log:** The Organization Dashboard and Project 360 maintain permanent event logs for compliance and traceability.

---

## 8. Global Search (Ctrl+K)

Use `Ctrl + K` (or `Cmd + K` on macOS) to open the spotlight modal. Search across:
- **Tasks & User Stories** (by key or title, e.g., `TASK-101`, `Redis`)
- **Requirements** (e.g., `REQ-001`, `Seat Reservation`)
- **Defects & Bugs** (e.g., `BUG-001`, `Race Condition`)
- **Documents & Specs** (e.g., `SRS`, `API Specification`)

Select any result to jump directly to that record.

---

## 9. Role Permissions Matrix

| Capability | Org Admin | PM | PO | BA | Dev | QA | Designer | DevOps | Client | Stakeholder |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Manage Users & Org** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Create New Project** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Approve Requirements** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Manage Backlog / Sprints**| ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Move Kanban Tasks** | ✅ | ✅ | ❌ | ❌ | ✅* | ✅* | ✅* | ✅* | ❌ | ❌ |
| **Execute Test Suites** | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Sign-off / Close Bugs** | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Edit Documentation** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Approve Documents** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Submit Change Request** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Evaluate & Decide CR** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Access Client Portal** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **View Analytics & Reports**| ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

*\* Developers, QA, Designers, and DevOps can move their own assigned tasks.*

---

## 10. Frequently Asked Questions (FAQ)

#### Q1: Does TKanAI require an active internet connection?
**A:** No. Aside from loading external Google Fonts on initial launch, the entire application, its database (IndexedDB), and all AI simulation engines run 100% locally in your browser.

#### Q2: How does data sync work between multiple browser windows?
**A:** TKanAI leverages the native browser `BroadcastChannel` API. If you open the application in two side-by-side tabs (e.g., Tab 1 as Developer and Tab 2 as QA Lead), any state change in Tab 1 updates Tab 2 in real time.

#### Q3: How do I back up my project data?
**A:** Open **System Settings** in the sidebar and click **Export Database**. A complete JSON dump containing all projects, requirements, tasks, bugs, documents, and meetings will download to your device.

#### Q4: Why do old persona names appear if I edited `seedData.ts`?
**A:** IndexedDB preserves existing records once created. If you updated `seedData.ts`, navigate to **System Settings** and click **Reset Data** to re-seed the database with the latest names.

#### Q5: Can I add new custom roles or workflows?
**A:** Yes. The role architecture is modularly defined in `src/types/roles.ts`, while permissions are managed in `src/types/roles.ts` and `src/db/seedData.ts`.
