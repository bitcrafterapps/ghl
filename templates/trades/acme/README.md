# GHL Client Website Template

A fully customizable, token-based website template for GoHighLevel clients in the construction and home services industry.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Radix UI** - Accessible component primitives
- **Lucide Icons** - Beautiful icons
- **TypeScript** - Type safety

## Quick Start

### Option 1: Interactive Setup (Recommended)

```bash
# Install dependencies
npm install

# Run the interactive setup wizard
npm run setup
```

The setup wizard will:
1. Prompt you for client information
2. Generate a configuration file
3. Replace all tokens automatically
4. Prepare the site for development

### Option 2: Manual Setup

1. Copy `client-config.example.json` to `client-config.json`
2. Edit with your client's information
3. Run token replacement:

```bash
node scripts/replace-tokens.js --config client-config.json
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
├── public/                 # Static assets
├── scripts/
│   ├── replace-tokens.js  # Token replacement script
│   └── setup.js           # Interactive setup wizard
├── src/
│   ├── app/               # Next.js pages
│   ├── components/
│   │   ├── layout/        # Header, Footer, FloatingElements
│   │   ├── sections/      # Homepage sections
│   │   └── ui/            # Reusable UI components
│   ├── data/
│   │   └── config.ts      # Site configuration (tokenized)
│   ├── lib/
│   │   └── utils.ts       # Utility functions
│   └── styles/
│       └── globals.css    # Global styles
├── client-config.json     # Client configuration (generated)
└── client-config.example.json  # Example configuration
```

## Token System

All customizable content uses `{{TOKEN_NAME}}` placeholders. Tokens are replaced using the client configuration file.

### Token Categories

| Category | Example Tokens |
|----------|---------------|
| Company | `Acme`, `949494444`, `s@s.com` |
| Branding | `{{PRIMARY_COLOR}}`, `{{LOGO_URL}}`, `{{FONT_HEADING}}` |
| Industry | `HVAC`, `{{SERVICE_NOUN}}`, `{{EMERGENCY_SERVICE}}` |
| Service Area | `{{SERVICE_AREAS}}`, `{{PRIMARY_CITY}}`, `{{SERVICE_RADIUS}}` |
| GHL | `{{GHL_FORM_EMBED}}`, `{{GHL_CHAT_WIDGET}}`, `{{GHL_TRACKING_ID}}` |
| SEO | `{{META_DESCRIPTION}}`, `{{GOOGLE_ANALYTICS_ID}}` |
| Content | `[
  {
    "name": "AC Repair",
    "slug": "ac-repair",
    "shortDescription": "Fast, reliable air conditioning repair services."
  },
  {
    "name": "AC Installation",
    "slug": "ac-installation",
    "shortDescription": "Professional AC system installation."
  },
  {
    "name": "Heating Repair",
    "slug": "heating-repair",
    "shortDescription": "Expert heating system repair services."
  },
  {
    "name": "Furnace Installation",
    "slug": "furnace-installation",
    "shortDescription": "Quality furnace installation and replacement."
  },
  {
    "name": "HVAC Maintenance",
    "slug": "hvac-maintenance",
    "shortDescription": "Preventive maintenance to keep your system running."
  },
  {
    "name": "Duct Cleaning",
    "slug": "duct-cleaning",
    "shortDescription": "Professional air duct cleaning services."
  }
]`, `[]`, `[
  {
    "question": "How often should I service my HVAC system?",
    "answer": "We recommend servicing your HVAC system twice a year—once before summer for cooling and once before winter for heating."
  },
  {
    "question": "What are signs my AC needs repair?",
    "answer": "Common signs include weak airflow, warm air, unusual noises, high energy bills, and frequent cycling."
  },
  {
    "question": "Do you offer emergency HVAC services?",
    "answer": "Yes! We offer 24/7 emergency service for urgent heating and cooling issues."
  }
]` |

## Supported Industries

- HVAC
- Plumbing
- Electrical
- Roofing
- General Contractor

Each industry comes with pre-configured:
- Service offerings
- FAQ content
- Schema markup type
- Emergency service settings

## GHL Integration

The template is designed to integrate seamlessly with GoHighLevel:

- **Form Embeds** - Quote/estimate forms
- **Calendar Embeds** - Booking/scheduling
- **Chat Widget** - AI chatbot
- **Tracking** - Lead attribution

Add your GHL embed codes to the configuration file.

## Customization

### Colors

Edit `src/styles/globals.css`:

```css
:root {
  --primary: #2563eb;
  --secondary: #1e40af;
  --accent: #f59e0b;
}
```

### Content

All content is centralized in `src/data/config.ts` and populated from the client configuration.

### Components

Section components are modular and located in `src/components/sections/`:

- `hero.tsx` - Hero section with form
- `trust-bar.tsx` - Trust indicators
- `services.tsx` - Services grid
- `why-choose-us.tsx` - Value propositions
- `testimonials.tsx` - Customer reviews
- `service-area.tsx` - Service area map
- `gallery-preview.tsx` - Project gallery
- `faq.tsx` - FAQ accordion
- `cta.tsx` - Call-to-action banner

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Deploy

### Manual

```bash
npm run build
npm start
```

## Scripts Reference

### Token Replacement

```bash
# Replace all tokens
node scripts/replace-tokens.js --config client-config.json

# Preview changes without modifying files
node scripts/replace-tokens.js --config client-config.json --dry-run

# Show help
node scripts/replace-tokens.js --help
```

### Setup Wizard

```bash
npm run setup
```

## Creating a New Client Site

1. Copy the entire `base/` folder to a new directory
2. Run the setup wizard OR manually configure
3. Add client-specific images to `public/images/`
4. Customize as needed
5. Deploy

## License

Proprietary - JobCapture.ai
