# GHL Client Website Templates

Website templates for GoHighLevel clients in construction and home services industries.

## Directory Structure

```
templates/
├── base/                 # Base template (DO NOT EDIT directly)
├── scripts/
│   └── create-site.js    # Master site generator script
├── trades/               # Subcontractor websites
│   ├── acme-plumbing/    # Example client site
│   └── ...
├── services/             # Home service websites
│   ├── sparkle-cleaning/ # Example client site
│   └── ...
└── site-layout.md        # Template specification
```

## Business Types

### Trades (Subcontractors)
For licensed trade contractors:
- HVAC
- Plumbing
- Electrical
- Roofing
- General Contractor

### Services (Home Services)
For home service companies:
- Mold Remediation
- Restoration
- Carpet & Tile Cleaning
- Pool Service
- Landscaping
- Pest Control
- Cleaning
- Painting
- Flooring
- Fencing

## Quick Start

### Create a New Client Site

```bash
cd /Users/sandyfriedman/ghl/templates
node scripts/create-site.js
```

The wizard will:
1. Ask for business type (trades vs services)
2. Prompt for client information
3. Copy the template to the correct folder
4. Replace all tokens with client data
5. Set up the project ready for development

### Develop the Site

```bash
cd trades/acme-plumbing  # or services/sparkle-cleaning
npm install
npm run dev
```

### Deploy

```bash
npm run build
# Push to GitHub + import to Vercel
```

## Template Features

- **Next.js 14** - React framework with App Router
- **TailwindCSS** - Utility-first CSS
- **Framer Motion** - Animations
- **Radix UI** - Accessible components
- **GHL Integration** - Forms, chat, calendar embeds
- **Token System** - Easy customization via config file

## File Organization

After running the site generator, client sites are organized by business type:

```
templates/
├── trades/
│   ├── base/                  # Template (don't edit)
│   ├── acme-plumbing/         # Plumbing client
│   ├── cool-air-hvac/         # HVAC client
│   └── reliable-electric/     # Electrical client
└── services/
    ├── sparkle-cleaning/      # Cleaning client
    ├── green-thumb-landscape/ # Landscaping client
    └── pest-away/             # Pest control client
```

## Configuration

Each client site has a `client-config.json` with all customizable values:

```json
{
  "company": {
    "name": "Acme Plumbing",
    "phone": "5551234567",
    ...
  },
  "branding": {
    "primaryColor": "#2563eb",
    ...
  },
  "industry": {
    "type": "Plumbing",
    ...
  },
  "services": [...],
  "testimonials": [...],
  "faq": [...]
}
```

## Updating the Base Template

To update all future sites:

1. Edit files in `base/`
2. Test with a new site generation
3. Existing sites are NOT affected (they're copies)

## Bulk Operations

To update multiple existing sites, you'll need to manually apply changes or create a migration script.

## Support

For template issues, see `base/README.md` for detailed documentation.
