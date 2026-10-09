# BUILDCORE — Construction ERP

Enterprise Construction Management, Procurement, Inventory, Project Execution, Financials, and CRM platform built for modern builders, contractors, and real estate developers.

---

## 🏗️ Platform Overview

BUILDCORE streamlines end-to-end operations across large-scale infrastructure and residential construction projects:

- **Project Planning & Execution**: WBS scheduling, milestone tracking, daily progress reports (DPR), site measurement sheets, and Gantt tracking.
- **BOQ & Cost Engineering**: Bill of quantities (BOQ) with variance analysis, material takeoffs, rate analysis, and budget control.
- **Procurement & Supply Chain**: Indents management, RFQs, vendor quotation comparatives, purchase orders (PO), and approval workflows.
- **Inventory & Stores**: Good Received Notes (GRN), store issuances, stock transfers, gate passes, and real-time inventory ledger.
- **Quality & Safety (QA/QC)**: Site snag lists, inspections, compliance checklists, safety audits, and incident reporting.
- **CRM & Client Billing**: Lead pipeline, customer bookings, demand letters, payment schedules, and client RA bills.
- **Finance & Accounts**: Subcontractor bill certification, vendor reconciliations, debit/credit notes, and cash flow forecasting.
- **HRMS & Labour Management**: Site muster roll, contractor labour billing, compliance records, and site payroll.

---

## 🛠️ Technology Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State & Data Fetching**: [TanStack Query v5](https://tanstack.com/query)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts & Visualizations**: [Recharts](https://recharts.org/)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd buildcore-crafted-construction

# Install dependencies
npm install
```

### Development Server

Start the local development server with hot module replacement:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Production Build

Create an optimized production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

### Code Formatting & Linting

```bash
# Run ESLint
npm run lint

# Format code with Prettier
npm run format
```

---

## 📁 Project Structure

```
├── public/                 # Static assets, vector favicons, web app manifest
├── src/
│   ├── api/                # API client configuration and endpoints
│   ├── components/         # Reusable UI components (Radix, layout, forms)
│   ├── hooks/              # Custom React hooks (auth, query, state)
│   ├── lib/                # Utility helpers and formatters
│   ├── mock/               # Mock data for rapid prototyping & offline testing
│   ├── pages/              # Module pages (Projects, Procurement, Stores, Accounts, etc.)
│   ├── services/           # Business logic and data services
│   ├── App.tsx             # Root router and application layout
│   ├── main.tsx            # Application entry point
│   └── styles.css          # Global styling & Tailwind configuration
├── package.json            # Project dependencies and npm scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build configuration
```

---

## 📄 License

Proprietary — All rights reserved by BUILDCORE.
