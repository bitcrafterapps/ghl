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
| Company | `Spark Electric`, `5551234567`, `info@sparkelectric.com` |
| Branding | `#f59e0b`, ``, `Poppins` |
| Industry | `Electrical`, `Services`, `true` |
| Service Area | `Phoenix, Scottsdale, Tempe, Mesa, Chandler, Gilbert, Glendale`, `Phoenix`, `35` |
| GHL | ``, ``, `` |
| SEO | `Spark Electric provides professional electrical services in Phoenix, AZ. 12+ years experience. Licensed & insured. Call for a free estimate!`, `` |
| Content | `[
  {
    "name": "Electrical Repairs",
    "slug": "electrical-repairs",
    "shortDescription": "Safe and reliable electrical repair services."
  },
  {
    "name": "Panel Upgrades",
    "slug": "panel-upgrades",
    "shortDescription": "Electrical panel upgrade and replacement."
  },
  {
    "name": "Lighting Installation",
    "slug": "lighting-installation",
    "shortDescription": "Indoor and outdoor lighting installation."
  },
  {
    "name": "Outlet & Switch Installation",
    "slug": "outlet-switch-installation",
    "shortDescription": "New outlet and switch installation."
  },
  {
    "name": "Ceiling Fan Installation",
    "slug": "ceiling-fan-installation",
    "shortDescription": "Professional ceiling fan installation."
  },
  {
    "name": "Electrical Inspections",
    "slug": "electrical-inspections",
    "shortDescription": "Comprehensive electrical safety inspections."
  }
]`, `[
  {
    "name": "Mike R.",
    "location": "Phoenix, AZ",
    "rating": 5,
    "text": "Spark Electric was fantastic! They upgraded our panel same day and the price was exactly as quoted. Very professional team.",
    "service": "Panel Upgrade"
  },
  {
    "name": "Sarah L.",
    "location": "Scottsdale, AZ",
    "rating": 5,
    "text": "Called them for an emergency at 10pm and they were here within 30 minutes. Fixed the issue quickly. Highly recommend!",
    "service": "Emergency Service"
  },
  {
    "name": "Tom K.",
    "location": "Tempe, AZ",
    "rating": 5,
    "text": "Great experience with outdoor lighting installation. The team was knowledgeable and cleaned up everything after.",
    "service": "Lighting Installation"
  }
]`, `[
  {
    "question": "What are signs of electrical problems?",
    "answer": "Warning signs include flickering lights, frequent breaker trips, burning smells, sparking outlets, and warm switch plates. If you notice any of these, call us immediately."
  },
  {
    "question": "How often should I have an electrical inspection?",
    "answer": "We recommend an inspection every 3-5 years for homes, or whenever you purchase a new home. Older homes may need more frequent inspections."
  },
  {
    "question": "Do you handle emergency electrical work?",
    "answer": "Yes! We provide 24/7 emergency electrical services for power outages, sparking outlets, and other urgent electrical issues."
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
