# GHL Contractor Automation Platform

AI-powered job capture, booking, and revenue recovery system for construction and service contractors. Built on GoHighLevel with custom Next.js frontends and Node.js backend.

## Overview

This platform helps contractors capture more jobs through:
- Missed call → instant SMS recovery
- AI job qualification & photo-based damage analysis
- Automatic estimate booking
- Quote follow-up automation
- Review generation engine

## Project Structure

```
ghl/
├── templates/           # Site generation system
│   ├── backend/         # Shared Node.js/Express API server
│   ├── new/apps/frontend/  # Tokenized Next.js template for generated sites
│   ├── scripts/         # Site generation scripts
│   └── sitewizard/      # Admin dashboard for managing sites
├── website/             # Marketing website (jobcapture.ai)
├── generated/           # Output directory for generated client sites
├── docs/                # Documentation
├── leads/               # Lead generation resources
└── niches/              # Industry-specific configurations
```

## Tech Stack

- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express, Drizzle ORM, PostgreSQL
- **Infrastructure:** Vercel, GoHighLevel API
- **Payments:** Stripe

## Getting Started

### Backend API

```bash
cd templates/backend
npm install
npm run dev
```

### Site Wizard (Admin Dashboard)

```bash
cd templates/sitewizard
npm install
npm run dev
```

### Marketing Website

```bash
cd website
npm install
npm run dev
```

## Site Generation

Generate a new client site using the Site Wizard at `/site-builder` or via API:

```bash
cd templates/scripts
node create-site-api.js
```

Generated sites are output to `generated/{trades|services}/{company-slug}/`.

## Target Markets

### Primary - Construction & Trades
- General Contractors
- HVAC
- Electrical
- Plumbing
- Roofing

### Secondary - Restoration & Cleaning
- Mold remediation
- Water/fire restoration
- Carpet & tile cleaning

## Documentation

- [GHL Integration Guide](./GHL-INTEGRATION-GUIDE.md)
- [Business Overview](./overview.md)
- [Additional Docs](./docs/)

## License

Proprietary - All rights reserved.
