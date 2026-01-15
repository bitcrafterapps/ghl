# 🚀 GHL Site Builder Platform — Feature Roadmap

> **Last Updated:** January 15, 2026  
> **Purpose:** Strategic roadmap for building the ultimate quick-site generation platform with GHL integration

---

## 📊 Feature Priority Matrix

| Priority | Feature | Need (1-5) | Value (1-5) | Effort | Category |
|----------|---------|------------|-------------|--------|----------|
| **🔴 P1** | GHL Contacts/Leads Sync API | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Medium | Integration |
| **🔴 P1** | GHL Calendar Integration | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Medium | Integration |
| **🔴 P1** | Template Theme Variations | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Medium | Differentiation |
| **🔴 P1** | One-Click Site Deployment | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | High | Core |
| **🟠 P2** | Built-in CRM (GHL Export) | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | High | Core |
| **🟠 P2** | Live Site Preview | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Medium | UX |
| **🟠 P2** | Gallery CMS with Image AI | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Medium | Core |
| **🟠 P2** | Review Aggregation Dashboard | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Medium | Core |
| **🟠 P2** | Multi-Industry Template Library | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | High | Differentiation |
| **🟡 P3** | White-Label Admin Portal | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | High | Scale |
| **🟡 P3** | Site Content Editor (CMS) | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | High | Maintenance |
| **🟡 P3** | Bulk Site Management | ⭐⭐⭐ | ⭐⭐⭐⭐ | Medium | Operations |
| **🟡 P3** | GHL Snapshot Templates | ⭐⭐⭐ | ⭐⭐⭐⭐ | Medium | Integration |
| **🟢 P4** | AI Content Generator | ⭐⭐⭐ | ⭐⭐⭐ | Medium | Enhancement |
| **🟢 P4** | Analytics Dashboard | ⭐⭐⭐ | ⭐⭐⭐ | Medium | Insights |
| **🟢 P4** | SEO Audit Tools | ⭐⭐ | ⭐⭐⭐ | Low | Enhancement |
| **🟢 P4** | Automated Backup System | ⭐⭐ | ⭐⭐⭐ | Low | Maintenance |

---

## 📁 Current Platform Analysis

### **Sitewizard App** (`/templates/sitewizard`)
The current admin platform provides:
- ✅ **Site Builder Wizard** — Multi-tab form for company, branding, services, setup, and GHL integrations
- ✅ **Industry Presets** — 15+ industries with pre-defined services across trades and home services
- ✅ **Token-Based Generation** — JSON configuration that drives template generation
- ✅ **User Authentication** — JWT-based auth with role-based access (Site Admin/Admin)
- ✅ **Emoji & Image Logo Support** — Flexible branding options
- ✅ **GHL Embed Fields** — Calendar, form, chat widget, webhook URL inputs

### **Templates/New** (`/templates/new`)
Full-stack monorepo template with:
- ✅ **Next.js 14 Frontend** — Modern React with App Router
- ✅ **Express.js Backend** — TypeScript API with PostgreSQL
- ✅ **Pre-built Pages** — About, Contact, Free Estimate, Gallery, Reviews, Services, Pricing
- ✅ **GHL Integration Points** — Form embeds, calendar embeds, chat widget placeholders
- ✅ **Drizzle ORM** — Database schema for users, companies, projects, transactions
- ✅ **Payment Ready** — Stripe/Square/PayPal/Braintree configurations in schema

### **Scripts** (`/templates/scripts`)
- ✅ **create-new-site.js** — CLI wizard that copies template, replaces tokens, generates sites
- ✅ **Industry Presets** — HVAC, Plumbing, Electrical, Roofing, Mold, Restoration, Landscaping, etc.
- ✅ **Service Images** — Generated images for each service in `/scripts/images`

### **Documentation** (`/docs/ghl`)
- ✅ GHL Integration Guide (webhooks, pipelines, custom fields)
- ✅ Pricing Tiers ($297/$697/$1,497 monthly)
- ✅ Sales Scripts & Positioning
- ✅ Agency Partner Strategy
- ✅ Comparison charts vs. plain GHL

---

## 🔴 P1 — Critical Features (Weeks 1-4)

### 1. GHL Contacts/Leads API Integration
**Goal:** Two-way sync between your platform and GHL contacts/leads

#### Implementation:
```typescript
// Backend: /api/v1/ghl/contacts.ts
interface GHLContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tags: string[];
  customFields: Record<string, any>;
  source: string;
  createdAt: Date;
}

// Endpoints needed:
POST   /api/v1/ghl/contacts/sync           // Pull contacts from GHL
POST   /api/v1/ghl/contacts                // Push new contact to GHL
GET    /api/v1/ghl/contacts                // List synced contacts
PATCH  /api/v1/ghl/contacts/:id            // Update contact
DELETE /api/v1/ghl/contacts/:id            // Remove from local DB

// Webhook receiver for real-time updates
POST   /api/v1/webhooks/ghl/contact-update
```

#### Database Schema Addition:
```typescript
export const ghlContacts = pgTable('ghl_contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  ghlContactId: varchar('ghl_contact_id', { length: 100 }).unique(),
  companyId: integer('company_id').references(() => companies.id),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  source: varchar('source', { length: 50 }), // 'website_form', 'chat', 'manual'
  status: varchar('status', { length: 20 }), // 'new', 'contacted', 'qualified', 'converted'
  tags: jsonb('tags').$type<string[]>(),
  customFields: jsonb('custom_fields'),
  syncedAt: timestamp('synced_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});
```

### 2. GHL Calendar Integration
**Goal:** Display/manage appointments from GHL calendars in your dashboard

#### Implementation:
```typescript
// Calendar sync endpoints
GET    /api/v1/ghl/calendars                    // List available calendars
GET    /api/v1/ghl/calendars/:id/appointments   // Get appointments
POST   /api/v1/ghl/appointments                 // Create appointment
PATCH  /api/v1/ghl/appointments/:id             // Update appointment

// Frontend component
// /app/calendar/page.tsx - Full calendar view with GHL sync
```

#### GHL API Integration Points:
- **Calendar ID retrieval** via GHL API
- **Appointment CRUD** operations
- **Webhook listeners** for appointment changes
- **Availability checking** for booking widgets

### 3. Template Theme Variations
**Goal:** Each industry template should have 3-5 distinct visual themes

#### Theme System:
```typescript
// /templates/themes/index.ts
export const THEME_PRESETS = {
  modern: {
    name: 'Modern Minimal',
    colors: {
      primary: '#0ea5e9',
      secondary: '#f1f5f9',
      accent: '#10b981',
      headerBg: '#ffffff',
      footerBg: '#0f172a'
    },
    fonts: { heading: 'Inter', body: 'Inter' },
    style: 'clean-lines, whitespace, subtle-shadows'
  },
  bold: {
    name: 'Bold & Dynamic',
    colors: {
      primary: '#dc2626',
      secondary: '#1f2937',
      accent: '#fbbf24',
      headerBg: '#111827',
      footerBg: '#111827'
    },
    fonts: { heading: 'Poppins', body: 'Open Sans' },
    style: 'high-contrast, gradients, strong-cta'
  },
  professional: {
    name: 'Corporate Professional',
    colors: {
      primary: '#1e40af',
      secondary: '#f8fafc',
      accent: '#059669',
      headerBg: '#1e3a5f',
      footerBg: '#1e3a5f'
    },
    fonts: { heading: 'Merriweather', body: 'Source Sans Pro' },
    style: 'traditional, trustworthy, structured'
  },
  warm: {
    name: 'Warm & Inviting',
    colors: {
      primary: '#ea580c',
      secondary: '#fffbeb',
      accent: '#84cc16',
      headerBg: '#7c2d12',
      footerBg: '#7c2d12'
    },
    fonts: { heading: 'Playfair Display', body: 'Lato' },
    style: 'organic, friendly, home-services-feel'
  },
  dark: {
    name: 'Dark Premium',
    colors: {
      primary: '#8b5cf6',
      secondary: '#1e1e2f',
      accent: '#06b6d4',
      headerBg: '#0a0a0f',
      footerBg: '#0a0a0f'
    },
    fonts: { heading: 'Outfit', body: 'Inter' },
    style: 'premium, tech-forward, high-end-contractor'
  }
};
```

#### UI Enhancement in Site Builder:
- Add **Theme Selector** as visual cards with previews
- **Live preview pane** showing how the site will look
- One-click theme switching that updates all color/font fields

### 4. One-Click Site Deployment
**Goal:** Generate and deploy sites to Vercel/Netlify directly from the wizard

#### Implementation:
```typescript
// /api/v1/sites/deploy.ts
interface DeploymentConfig {
  projectName: string;
  siteConfig: SiteConfiguration;
  provider: 'vercel' | 'netlify';
  domain?: string;
}

// Flow:
// 1. Generate site files from template
// 2. Create Git repository (GitHub)
// 3. Connect to Vercel/Netlify
// 4. Deploy and return live URL
// 5. Store deployment info in DB

export const sites = pgTable('sites', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: integer('company_id').references(() => companies.id),
  slug: varchar('slug', { length: 100 }).unique(),
  config: jsonb('config'), // Full site configuration
  provider: varchar('provider', { length: 20 }),
  deploymentUrl: text('deployment_url'),
  customDomain: varchar('custom_domain', { length: 255 }),
  status: varchar('status', { length: 20 }), // 'draft', 'deployed', 'updating'
  lastDeployedAt: timestamp('last_deployed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});
```

---

## 🟠 P2 — High Value Features (Weeks 5-8)

### 5. Built-in CRM with GHL Export
**Goal:** Manage leads/contacts locally with one-click GHL sync

#### Features:
- **Contact List View** with search, filter, sort
- **Contact Detail Page** with activity timeline
- **Lead Pipeline** (kanban-style board)
- **Bulk Operations** (tag, export, sync to GHL)
- **Activity Tracking** (calls, emails, notes)
- **Two-way Sync Toggle** per contact

#### Database Tables:
```typescript
export const contacts = pgTable('contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: integer('company_id').references(() => companies.id),
  ghlContactId: varchar('ghl_contact_id', { length: 100 }),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 50 }),
  zip: varchar('zip', { length: 10 }),
  source: varchar('source', { length: 50 }),
  pipelineStage: varchar('pipeline_stage', { length: 50 }),
  tags: jsonb('tags').$type<string[]>(),
  customFields: jsonb('custom_fields'),
  syncWithGhl: boolean('sync_with_ghl').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const contactActivities = pgTable('contact_activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  contactId: uuid('contact_id').references(() => contacts.id),
  type: varchar('type', { length: 50 }), // 'note', 'call', 'email', 'meeting', 'form_submit'
  title: varchar('title', { length: 255 }),
  description: text('description'),
  metadata: jsonb('metadata'),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow()
});
```

### 6. Live Site Preview
**Goal:** Show real-time preview of the site as users fill out the wizard

#### Implementation:
- **Split-pane layout** in Site Builder (form left, preview right)
- **Hot-reload iframe** that updates on field changes
- **Mobile/Tablet/Desktop toggle** for responsive preview
- **Section navigation** (jump to Hero, Services, About, etc.)

```typescript
// Preview API endpoint
GET /api/v1/preview/render?config=<base64-encoded-json>

// Returns rendered HTML with injected config values
// Uses server-side rendering of the template with current config
```

### 7. Gallery CMS with Image AI
**Goal:** Easy photo upload and organization with AI-powered tagging

#### Features:
- **Drag-and-drop upload** with multi-file support
- **Auto-categorization** using AI image analysis
- **Before/After pairing** tool
- **Caption generation** using AI
- **Gallery layouts** (grid, masonry, slider, lightbox)
- **CDN storage** (Cloudflare R2, AWS S3)

#### Database:
```typescript
export const galleryImages = pgTable('gallery_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  siteId: uuid('site_id').references(() => sites.id),
  url: text('url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  title: varchar('title', { length: 255 }),
  description: text('description'),
  category: varchar('category', { length: 100 }), // 'roofing', 'bathroom', 'kitchen'
  serviceSlug: varchar('service_slug', { length: 100 }),
  isFeatured: boolean('is_featured').default(false),
  isBeforeAfter: boolean('is_before_after').default(false),
  beforeImageId: uuid('before_image_id'),
  position: integer('position').default(0),
  aiTags: jsonb('ai_tags').$type<string[]>(),
  metadata: jsonb('metadata'), // width, height, format, etc.
  createdAt: timestamp('created_at').defaultNow()
});
```

### 8. Review Aggregation Dashboard
**Goal:** Pull reviews from Google, Yelp, Facebook and display in one place

#### Features:
- **Multi-platform sync** (Google Business, Yelp, Facebook)
- **Review response templates**
- **Rating trends over time**
- **Review request automation** (email/SMS templates)
- **Embed review widgets** on generated sites

#### Implementation:
```typescript
export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  siteId: uuid('site_id').references(() => sites.id),
  platform: varchar('platform', { length: 50 }), // 'google', 'yelp', 'facebook'
  platformReviewId: varchar('platform_review_id', { length: 255 }),
  authorName: varchar('author_name', { length: 255 }),
  rating: integer('rating'), // 1-5
  content: text('content'),
  reply: text('reply'),
  repliedAt: timestamp('replied_at'),
  reviewDate: timestamp('review_date'),
  isPublished: boolean('is_published').default(true),
  createdAt: timestamp('created_at').defaultNow()
});
```

### 9. Multi-Industry Template Library
**Goal:** Expand beyond current 15 industries with specialized templates

#### New Industries to Add:
| Category | Industries |
|----------|-----------|
| **Construction** | Concrete, Drywall, Siding, Windows & Doors, Garage Doors, Decks & Patios, Gutters |
| **Home Services** | House Cleaning, Appliance Repair, Locksmith, Moving, Junk Removal, Handyman |
| **Outdoor** | Tree Service, Irrigation, Snow Removal, Pressure Washing, Exterior Painting |
| **Specialty** | Solar Installation, Home Theater, Smart Home, Security Systems, Chimney |
| **Commercial** | Commercial Cleaning, Office Fit-out, Fire Protection, Commercial HVAC |

Each industry should have:
- Pre-written service descriptions
- Industry-specific FAQs
- Tailored SEO meta descriptions
- Appropriate hero imagery prompts
- Relevant schema.org markup

---

## 🟡 P3 — Scale Features (Weeks 9-12)

### 10. White-Label Admin Portal
**Goal:** Allow agencies to have their own branded version of the platform

#### Features:
- **Custom domain** for admin portal
- **Agency branding** (logo, colors, name)
- **Sub-user management** (invite clients)
- **Usage tracking per client**
- **Revenue sharing/billing split**

#### Database:
```typescript
export const agencies = pgTable('agencies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  slug: varchar('slug', { length: 100 }).unique(),
  domain: varchar('domain', { length: 255 }),
  logoUrl: text('logo_url'),
  primaryColor: varchar('primary_color', { length: 7 }),
  ownerId: integer('owner_id').references(() => users.id),
  subscription: varchar('subscription', { length: 50 }), // 'basic', 'pro', 'enterprise'
  maxClients: integer('max_clients').default(10),
  createdAt: timestamp('created_at').defaultNow()
});

export const agencyClients = pgTable('agency_clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  agencyId: uuid('agency_id').references(() => agencies.id),
  companyId: integer('company_id').references(() => companies.id),
  createdAt: timestamp('created_at').defaultNow()
});
```

### 11. Site Content Editor (CMS)
**Goal:** Allow clients to edit their site content without touching code

#### Features:
- **Visual editor** for text content
- **Image replacement** with drag-and-drop
- **Service page editing** (add/remove/reorder)
- **Testimonial management**
- **FAQ editing**
- **Version history** with rollback

#### Implementation Approach:
- Use **content layers** stored in DB that override template defaults
- **Merge function** combines base template + custom content
- **Re-deploy trigger** when content is saved

### 12. Bulk Site Management
**Goal:** Manage multiple client sites from a single dashboard

#### Features:
- **Site list view** with status indicators
- **Bulk deploy** (update all sites to latest template)
- **Health monitoring** (uptime, SSL, performance)
- **Alert system** for issues
- **Comparison view** (see all site configs side-by-side)

### 13. GHL Snapshot Templates
**Goal:** One-click GHL setup with pre-built snapshots

#### Include in Snapshots:
- **Pipelines** (New Lead → Contacted → Quote Sent → Won/Lost)
- **Workflows** (Lead notification, follow-up sequences)
- **SMS Templates** (Initial response, quote reminder, review request)
- **Email Templates** (Welcome, quote, appointment confirmation)
- **Calendar Settings** (Free estimate calendar)
- **Form Templates** (Contact form, quote request)

#### Implementation:
- Export snapshot JSON from master GHL account
- Store in `/templates/ghl-snapshots/`
- Provide download links in admin
- Document import process for clients

---

## 🟢 P4 — Enhancement Features (Ongoing)

### 14. AI Content Generator
- **Hero headline generator** — Input industry + USP, get 5 options
- **Service description writer** — Expand short descriptions to full pages
- **FAQ generator** — Generate common questions for industry
- **Testimonial suggestions** — Draft realistic review templates
- **SEO meta generator** — Auto-generate title/description/keywords

### 15. Analytics Dashboard
- **Site traffic** (via GA integration)
- **Lead conversion** tracking
- **Form submission** reports
- **Call tracking** integration
- **ROI calculator**

### 16. SEO Audit Tools
- **Page speed analysis**
- **Mobile-friendliness** check
- **Meta tag validation**
- **Schema markup** verification
- **Broken link detection**

### 17. Automated Backup System
- **Daily config backups**
- **Site snapshot** before updates
- **One-click restore**
- **Export to ZIP**

---

## 🛠️ Technical Recommendations

### Immediate Improvements

1. **Add GHL API Service Layer**
```typescript
// /templates/new/backend/services/ghl.service.ts
export class GHLService {
  private apiKey: string;
  private locationId: string;
  
  async getContacts(params: ContactQueryParams): Promise<GHLContact[]>
  async createContact(contact: CreateContactDTO): Promise<GHLContact>
  async updateContact(id: string, update: UpdateContactDTO): Promise<GHLContact>
  async getCalendars(): Promise<GHLCalendar[]>
  async getAppointments(calendarId: string, start: Date, end: Date): Promise<Appointment[]>
  async createOpportunity(opportunity: CreateOpportunityDTO): Promise<GHLOpportunity>
}
```

2. **Environment Configuration**
```bash
# .env additions
GHL_API_KEY=
GHL_LOCATION_ID=
GHL_WEBHOOK_SECRET=
VERCEL_TOKEN=
GITHUB_TOKEN=
CLOUDFLARE_R2_ACCESS_KEY=
```

3. **Webhook Handlers**
```typescript
// /api/v1/webhooks/ghl/index.ts
// Handle: contact.created, contact.updated, appointment.created, etc.
```

### Architecture Changes

1. **Move to Monorepo Workspaces** — Already partially done with `templates/new`
2. **Add Redis for Caching** — GHL API rate limiting, session management
3. **Implement Job Queue** — Bull/BullMQ for deployments, syncs, image processing
4. **Add CDN for Assets** — Cloudflare R2 or AWS S3 for uploaded images

---

## 📅 Suggested Timeline

| Phase | Duration | Focus | Deliverables |
|-------|----------|-------|-------------|
| **Phase 1** | Weeks 1-4 | Core GHL Integration | Contacts API, Calendar, Theme Variations, Deploy Flow |
| **Phase 2** | Weeks 5-8 | Client Value | CRM, Live Preview, Gallery CMS, Reviews |
| **Phase 3** | Weeks 9-12 | Scale & Agency | White-label, Content Editor, Bulk Management |
| **Phase 4** | Ongoing | Polish | AI features, Analytics, SEO tools, Backups |

---

## 💰 Revenue Impact

### Per Feature Revenue Potential

| Feature | Tier Impact | Price Justification |
|---------|------------|---------------------|
| GHL Contacts Sync | +$100/mo | "Unified lead management" |
| Calendar Integration | +$50/mo | "Integrated scheduling" |
| Theme Variations | +$0 (differentiation) | Sites look unique |
| One-Click Deploy | +$100/mo | "Managed hosting included" |
| Built-in CRM | +$100/mo | "All-in-one platform" |
| Gallery CMS | +$50/mo | "Professional portfolios" |
| Review Dashboard | +$100/mo | "Reputation management" |
| White-Label | +$197-497/agency | New revenue stream |

### Revenue Projections

With all P1 + P2 features:
- **Starter:** $297 → $397/mo
- **Growth:** $697 → $997/mo  
- **Pro:** $1,497 → $1,997/mo

Plus agency licensing: **$297-597/mo per agency**

---

## ✅ Next Steps

1. **Prioritize P1 Features** — Start with GHL Contacts API integration
2. **Set up GHL Developer Account** — Get API credentials and webhook testing
3. **Build Theme Variation System** — Create 5 base themes
4. **Implement Deployment Pipeline** — GitHub + Vercel automation
5. **Create Technical Specs** — Detailed specs for each P1 feature

---

*This roadmap is a living document. Update priorities based on customer feedback and market demands.*
