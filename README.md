# Approvia — Expense Reimbursement Management System

> A full-stack, multi-role expense reimbursement platform built with Next.js 16, Prisma, and SQLite. Streamline the entire lifecycle of expense submissions, multi-step approvals, and team management.

---

## Table of Contents

1. [Overview](#overview)
2. [Key Features](#key-features)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [Authentication & Authorization](#authentication--authorization)
7. [User Roles](#user-roles)
8. [Core Modules](#core-modules)
9. [API Reference](#api-reference)
10. [Getting Started](#getting-started)
11. [Environment Variables](#environment-variables)
12. [Email Integration](#email-integration)
13. [Currency Handling](#currency-handling)
14. [Deployment Notes](#deployment-notes)

---

## Overview

Approvia is a SaaS-style expense reimbursement management system designed for companies that need structured, multi-level approval workflows. Employees submit expenses in any currency; managers see amounts auto-converted to the company's base currency using live exchange rates. Admins configure approval chains, manage team members, and monitor company-wide analytics from a dedicated dashboard.

The application supports three user roles — Admin, Manager, and Employee — each with a tailored interface and access control enforced both on the frontend (route proxy) and at every API endpoint.

---

## Key Features

### For Employees
- Submit expenses with description, category, date, currency, amount, and optional receipt upload
- Track submission status in real time (Draft → Pending → In Review → Approved / Rejected)
- View full approval history with approver names, decisions, and timestamps
- Dashboard showing total amounts by status (to submit, waiting approval, approved)

### For Managers
- Dedicated approvals dashboard listing all expenses from direct reports
- Filter by status (Pending, Approved, Rejected, All) with live search
- One-click approve or reject with optional comment
- Team overview with per-member spend breakdown and pending request count
- Notification preferences (toggleable: new submissions, escalation alerts, weekly digest, 48-hour reminders)

### For Admins
- Company-wide expense analytics: total count, pending approvals, monthly approved/rejected, approval rate gauge
- Invite and manage team members (set role, assign manager, deactivate accounts)
- Configure multi-step approval chains with sequential or parallel steps
- Per-chain rules: percentage-based auto-approval, named approver shortcut, or hybrid
- Full employee table with inline editing for name, role, and manager relationship

### Platform
- Google OAuth sign-in alongside email/password authentication
- Email verification for new sign-ups; invite-link flow for admin-created accounts
- Forgot password and secure password reset via time-limited tokens
- Multi-currency support: employees submit in any currency; amounts are auto-converted to the company's base currency using live exchange rates (with static fallbacks)
- Responsive design with collapsible sidebar, mobile-friendly tables

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4, shadcn/ui, Radix UI primitives |
| Database | SQLite via libsql (local dev.db) |
| ORM | Prisma 7 with libsql adapter |
| Auth | Custom JWT (jose) — access tokens (15 min) + refresh tokens (30 days) stored as httpOnly cookies |
| Email | Resend (with console-mock fallback when no API key is set) |
| Currency | restcountries.com (country → currency resolution) + exchangerate-api.com (live rates) |
| Icons | Lucide React |
| Validation | Zod |
| Password hashing | bcryptjs |

---

## Project Structure

```
.
├── app/
│   ├── (auth)/                  # Auth group layout (sign-in, sign-up, etc.)
│   │   ├── signIn/page.tsx      # Combined sign-in / sign-up form
│   │   ├── forgot-password/     # Forgot password flow
│   │   ├── reset-password/      # Password reset (token-gated)
│   │   ├── verify-pending/      # Email verification waiting page
│   │   └── error/               # Auth error display
│   ├── api/
│   │   ├── auth/                # Auth REST endpoints (signin, signup, logout, refresh, etc.)
│   │   ├── approvals/           # GET and POST approval actions
│   │   ├── dashboard/stats/     # Admin KPI endpoint
│   │   ├── employees/           # Employee CRUD (admin only)
│   │   ├── expenses/            # Expense creation and personal expense list
│   │   └── users/               # User management with role-based access
│   ├── components/
│   │   ├── auth/                # Shared auth form components (wrappers, fields)
│   │   ├── dashboard/           # AdminDashboard and EmployeeDashboard components
│   │   ├── expenses/            # Expense submission form
│   │   ├── ui/                  # Shadcn-compatible UI primitives (Button, Sidebar, Tooltip, etc.)
│   │   ├── app-sidebar.tsx      # Collapsible sidebar with role-based nav items
│   │   ├── EmployeesTable.tsx   # Admin employee management table
│   │   ├── ManagerDashboard.tsx # Manager approval dashboard
│   │   └── nav-config.ts        # Sidebar navigation definition
│   ├── contexts/
│   │   └── AuthContext.tsx       # React context for auth state + session refresh
│   ├── dashboard/
│   │   ├── layout.tsx           # Dashboard layout with sidebar
│   │   ├── page.tsx             # Role-based dashboard router
│   │   ├── admin/users/         # Admin user management page
│   │   ├── approval-chains/     # Approval chain configuration (admin)
│   │   ├── approvals/           # Manager approvals page (server + client split)
│   │   └── expenses/            # Expense submission page
│   ├── lib/
│   │   ├── api.ts               # Auth URL helper
│   │   ├── utils.ts             # cn() utility (clsx + tailwind-merge)
│   │   └── validations/auth.ts  # Zod schemas for forms
│   ├── globals.css              # Tailwind + shadcn design tokens
│   ├── layout.tsx               # Root layout with AuthProvider
│   └── page.tsx                 # Landing/marketing page
├── lib/
│   ├── api-auth.ts              # getAuthUserId, requireUserId helpers
│   ├── api-auth-extended.ts     # getAuthUser, requireRole with DB lookup
│   ├── auth.ts                  # JWT generation/verification, bcrypt helpers
│   ├── create-session.ts        # Session persistence + cookie helpers
│   ├── currency.ts              # Country→currency resolution, INR conversion
│   ├── email.ts                 # Resend email wrappers
│   ├── env.ts                   # App URL and JWT secret helpers
│   ├── middleware/auth.ts       # Re-export of api-auth helpers
│   ├── prisma.ts                # Prisma client singleton with libsql adapter
│   ├── rate-limit.ts            # In-memory resend-verification rate limiter
│   ├── session-cookies.ts       # Cookie names, set/clear helpers
│   └── token.ts                 # PasswordResetToken generate/consume logic
├── prisma/
│   ├── schema.prisma            # Full Prisma schema
│   └── migrations/              # Migration history
├── components/
│   └── ui/                      # Shadcn-generated UI components (Avatar, Button, Sidebar, etc.)
├── hooks/
│   └── use-mobile.ts            # useIsMobile hook
├── generated/
│   └── prisma/                  # Prisma-generated client (gitignored)
├── proxy.ts                     # Next.js route proxy (replaces middleware.ts)
├── prisma.config.ts             # Prisma config with dotenv
├── next.config.ts
├── tsconfig.json
└── postcss.config.mjs
```

---

## Database Schema

The Prisma schema (`prisma/schema.prisma`) defines the following models:

### Company
Stores company metadata including base currency (resolved from country code at signup).

### User
Central identity model. Fields:
- `role` — `ADMIN | MANAGER | EMPLOYEE`
- `isActive`, `isVerified`, `isPasswordSet` — account lifecycle flags
- `managerId` — self-referential foreign key for reporting hierarchy
- `provider` — `"google"` for OAuth accounts, `null` for email/password

### OAuthAccount
Stores Google OAuth tokens per provider account, linked to User.

### Session
Refresh token store. Tokens are stored as SHA-256 hashes; raw token is set in an httpOnly cookie.

### PasswordResetToken
Covers both `RESET` (forgot-password) and `SETUP` (admin invite) flows. Tokens expire and are marked `usedAt` on consumption.

### Expense
Core expense record with:
- `amount` + `currency` — as submitted by the employee
- `amountConverted` + `exchangeRate` — in company base currency
- `status` — `DRAFT | PENDING | IN_REVIEW | APPROVED | REJECTED`
- `currentStepOrder` — tracks position in approval chain
- `approvalChainId` — chain attached at submission

### ApprovalChain + ApprovalStep
Reusable templates. Steps are ordered (1, 2, 3…). Each step can be:
- `isManagerStep: true` — resolved at runtime to the submitter's manager
- `assignedUserId` — a fixed named approver

### ApprovalRule
Auto-approval logic attached to a chain: percentage-of-approvers, specific-approver, or hybrid.

### ApprovalAction
Immutable log of every approve/reject decision with approver, step, comment, and timestamp.

---

## Authentication & Authorization

### Token Flow

```
POST /api/auth/signin
  → verifies password
  → creates Session (refresh token hash in DB)
  → sets httpOnly cookies:
      access_token  (JWT, 15 min)
      refresh_token (random hex, 30 days)

POST /api/auth/refresh
  → reads refresh_token cookie
  → validates against Session table
  → rotates: deletes old session, creates new
  → issues new access_token + refresh_token cookies

POST /api/auth/logout
  → deletes Session by refresh token hash
  → clears both cookies
```

### Frontend Guard

`proxy.ts` (Next.js route proxy) intercepts all `/dashboard/**` requests, verifies the access JWT, and redirects unauthenticated users to `/signIn?redirect=<path>`.

### API Guard

Every Route Handler calls one of:
- `getAuthUserId(request)` — extracts user ID from JWT (Bearer header or cookie)
- `requireUserId(request)` — returns 401 if not authenticated
- `requireRole(request, "ADMIN")` — returns 403 if role doesn't match
- `getAuthUser(request)` — full DB lookup (includes role, companyId, isActive check)

### Google OAuth

Flow: `/api/auth/google` → Google OAuth consent → `/api/auth/google/callback` → upsert User + OAuthAccount → create session → redirect to `/dashboard`.

New Google users automatically get a company created with a USD default currency. Existing users are matched by email and their profile updated.

---

## User Roles

### ADMIN
- Full access to all company data
- Manage employees (invite, edit role/manager, deactivate)
- Configure approval chains and rules
- View company-wide dashboard with KPIs and recent expenses

### MANAGER
- See and act on expenses from direct reports only
- Approve or reject with optional comment
- View team member list, spend breakdown, pending counts
- Manage personal notification preferences

### EMPLOYEE
- Submit, view, and track own expenses only
- Cannot access approvals or admin pages
- Redirected away from restricted routes

---

## Core Modules

### Expense Submission (`/dashboard/expenses`)
The `ExpenseForm` component collects:
- Description (free text)
- Category (Travel, Meals, Accommodation, Software, Office Supplies, Other)
- Expense date
- Payment method
- Currency (7 supported: USD, EUR, GBP, INR, JPY, AED, SGD)
- Amount
- Remarks
- Receipt file attachment (UI only; upload not wired to storage backend)

On submit, a `POST /api/expenses` request creates the expense with status `PENDING` and attaches it to the submitter's company.

### Approval Workflow (`/dashboard/approvals`)
The approvals page (`page.tsx`) is a server component that:
1. Reads the session cookie and verifies the JWT
2. Fetches expenses scoped to the manager's direct reports (or all company expenses for admins)
3. Passes serialized data to `ApprovalsClient` (client component)

Approval decisions hit `POST /api/approvals`, which records an `ApprovalAction` and updates `expense.status` inside a Prisma transaction.

Amounts are converted to INR for display in the manager view using `convertToINR()` with live rates and static fallbacks.

### Admin Dashboard (`/dashboard`)
Served by `AdminDashboard` component, fetching `/api/dashboard/stats`. Displays:
- Total expenses, pending count, monthly approved/rejected
- SVG gauge chart showing approval rate percentage
- Sortable table of the 10 most recent expenses

### Employee Dashboard (`/dashboard`)
Served by `EmployeeDashboard` component. Shows:
- Pipeline tracker: amounts by status (To Submit → Waiting Approval → Approved)
- Full expense history table with status badges

### Approval Chains (`/dashboard/approval-chains`)
Admin-only form for defining reusable approval chain templates:
- Target user
- Description
- Override manager assignment
- Ordered list of approvers with "required" flags
- Sequential vs. parallel execution toggle
- Minimum approval percentage

### Team Management (`/dashboard/admin/users` and `/dashboard/employees`)
Two overlapping user management surfaces:
- `/dashboard/employees` — legacy table with inline add/edit
- `/dashboard/admin/users` — newer modal-based invite flow

Both use `/api/users` (POST with invite token flow) and `/api/employees` (POST with random temporary password).

---

## API Reference

### Auth Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/signin` | Email/password sign-in; returns JWT + user |
| POST | `/api/auth/signup` | Register new account + company |
| POST | `/api/auth/logout` | Clears session and cookies |
| POST | `/api/auth/refresh` | Rotates refresh token, issues new access token |
| GET | `/api/auth/me` | Returns authenticated user profile |
| GET | `/api/auth/google` | Initiates Google OAuth redirect |
| GET | `/api/auth/google/callback` | OAuth callback; upserts user and redirects |
| GET | `/api/auth/verify-email` | Verifies email via JWT token link |
| POST | `/api/auth/resend-verification` | Resends verification email (rate limited) |
| GET | `/api/auth/verification-status` | Polls verification status by email |
| POST | `/api/auth/forgot-password` | Sends password reset email |
| POST | `/api/auth/reset-password` | Consumes reset token, updates password |
| POST | `/api/auth/setup-password` | Consumes invite token, sets password, auto-logs in |

### Business Endpoints

| Method | Path | Roles | Description |
|---|---|---|---|
| GET | `/api/approvals` | MANAGER, ADMIN | Fetch scoped expenses + team members |
| POST | `/api/approvals` | MANAGER, ADMIN | Approve or reject an expense |
| GET | `/api/dashboard/stats` | ADMIN | Company-wide KPIs and recent expenses |
| GET | `/api/employees` | ADMIN | List all company employees |
| POST | `/api/employees` | ADMIN | Create employee with temp password email |
| PATCH | `/api/employees` | ADMIN | Update employee name/role/manager |
| POST | `/api/expenses` | Any | Submit a new expense |
| GET | `/api/expenses/my` | Any | List own expenses |
| GET | `/api/users` | ADMIN, MANAGER | List users (scoped by role) |
| POST | `/api/users` | ADMIN | Invite user via email (setup-password flow) |
| GET | `/api/users/[id]` | Any | Get single user (scoped by role) |
| PATCH | `/api/users/[id]` | ADMIN | Update role, manager, active status |

---

## Getting Started

### Prerequisites

- Node.js >= 20.9.0
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd approvia

# Install dependencies
npm install

# This also runs `prisma generate` via the postinstall hook
```

### Database Setup

```bash
# Create the SQLite database and apply the schema
npx prisma migrate dev --name init

# Or if using the config file
npx prisma migrate deploy
```

### Running Locally

```bash
npm run dev
```

The app starts at `http://localhost:3000`.

### Building for Production

```bash
npm run build
npm run start
```

The build script runs `prisma generate` before Next.js build.

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Required: Database connection (SQLite via libsql)
DATABASE_URL="file:./prisma/dev.db"

# Required: JWT signing secret (minimum 32 characters)
JWT_SECRET="your-secret-key-at-least-32-chars-long"

# Required: Public app URL for redirect links in emails and OAuth
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: Email sending via Resend
# If not set, emails are logged to console
RESEND_API_KEY="re_xxxxxxxxxxxx"

# Optional: Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### Notes

- `DATABASE_URL` is parsed by the Prisma libsql adapter. The `file:./` prefix is normalized internally.
- Without `RESEND_API_KEY`, all emails (verification, password reset, invitations) are printed to the server console — useful for development.
- Without Google OAuth credentials, the "Continue with Google" button returns a 503 error gracefully.
- In development, if `JWT_SECRET` is missing or too short, a hardcoded development secret is used automatically (never safe for production).

---

## Email Integration

All email sending is centralized in `lib/email.ts` using the Resend SDK. Three email types are supported:

**Welcome / Temporary Password** (`sendWelcomePasswordEmail`)
Sent when an admin creates an employee via the legacy `/api/employees` endpoint. Includes the auto-generated temporary password.

**Password Reset** (`sendPasswordResetEmail`)
Sent via the forgot-password flow. The reset link expires in 1 hour.

**Invitation** (`sendInviteEmail`)
Sent when an admin invites a user via `/api/users`. The link contains a setup token (valid 48 hours) that takes the user to a set-password page, then auto-logs them in.

All email functions degrade gracefully: if `resend` is `null` (no API key), they log the details to console and return without error.

---

## Currency Handling

### Country → Currency Resolution

At signup, the user's selected country code is sent to `getCurrencyForCountry()`, which fetches from `restcountries.com/v3.1/all` and caches the result in memory for the process lifetime. The resolved currency code, symbol, and name are stored on the `Company` record.

### Live Exchange Rate Conversion

`convertToINR(amount, fromCurrency)` fetches from `api.exchangerate-api.com/v4/latest/{currency}` with a 1-hour Next.js fetch cache. If the API call fails, static fallback rates are applied:

| Currency | Fallback rate to INR |
|---|---|
| USD | 83.5 |
| EUR | 90.2 |
| GBP | 105.8 |
| JPY | 0.55 |
| AED | 22.7 |
| SGD | 62.1 |
| Others | 80 |

The manager's approval dashboard always displays amounts in INR regardless of the currency the employee used to submit.

---

## Deployment Notes

### Database

The default setup uses a local SQLite file via libsql. For production deployments, consider:
- Switching to Turso (libsql cloud) by updating `DATABASE_URL` to a `libsql://` connection string
- Or migrating to PostgreSQL using the included `@prisma/adapter-pg` dependency (update the `datasource` block in `schema.prisma`)

### Known Warnings

The dev server output (`dev_output.txt`) shows a Next.js warning about a legacy `middleware.ts` file conflicting with the newer `proxy.ts` convention. If you have a `middleware.ts` present, delete it — only `proxy.ts` should exist.

### Authentication in Production

- Ensure `JWT_SECRET` is set to a cryptographically random string of at least 32 characters
- Set `NEXT_PUBLIC_APP_URL` to your actual domain (used in email links and OAuth callbacks)
- Add your production domain to the Google OAuth authorized redirect URIs in the Google Cloud Console

### Receipt Storage

The expense form includes a receipt file input in the UI, but the file upload is not yet wired to any storage backend. The `receiptUrl` field on the `Expense` model is reserved for a future integration (e.g., Cloudinary or S3).

### Rate Limiting

The only in-memory rate limiter is on the resend-verification endpoint (`lib/rate-limit.ts`): 3 requests per email per 30 minutes. All other endpoints rely on database-level token expiry and one-time-use token invalidation for security.

---

## License

Private — all rights reserved.