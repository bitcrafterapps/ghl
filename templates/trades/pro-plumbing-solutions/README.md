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
| Company | `Pro Plumbing Solutions`, `5559876543`, `info@proplumbingsolutions.com` |
| Branding | `#0066cc`, ``, `Inter` |
| Industry | `Plumbing`, `Plumbers`, `true` |
| Service Area | `Austin, Round Rock, Cedar Park, Georgetown, Pflugerville, Lakeway, Bee Cave`, `Austin`, `25` |
| GHL | ``, ``, `` |
| SEO | `Pro Plumbing Solutions provides expert plumbing services in Austin, TX. Licensed plumbers available 24/7 for emergencies. Call for a free estimate!`, `` |
| Content | `[
  {
    "name": "Drain Cleaning",
    "slug": "drain-cleaning",
    "shortDescription": "Professional drain cleaning to remove clogs and keep your pipes flowing freely.",
    "description": "Our expert plumbers use advanced equipment to clear stubborn clogs and clean your drains thoroughly. We handle kitchen sinks, bathroom drains, main sewer lines, and more.",
    "icon": "🚿",
    "image": ""
  },
  {
    "name": "Water Heater Services",
    "slug": "water-heater-services",
    "shortDescription": "Installation, repair, and maintenance for all types of water heaters.",
    "description": "From tankless to traditional water heaters, we provide expert installation, repair, and maintenance services. Get reliable hot water when you need it.",
    "icon": "🔥",
    "image": ""
  },
  {
    "name": "Leak Detection & Repair",
    "slug": "leak-detection-repair",
    "shortDescription": "Find and fix hidden leaks before they cause major damage to your property.",
    "description": "Using state-of-the-art leak detection technology, we locate hidden leaks in walls, floors, and underground pipes. Quick repairs prevent water damage and save you money.",
    "icon": "💧",
    "image": ""
  },
  {
    "name": "Toilet Repair & Installation",
    "slug": "toilet-repair-installation",
    "shortDescription": "Expert toilet repairs and new installations for residential and commercial properties.",
    "description": "From running toilets to complete replacements, our plumbers handle all toilet services. We install water-efficient models that save you money on utility bills.",
    "icon": "🚽",
    "image": ""
  },
  {
    "name": "Sewer Line Services",
    "slug": "sewer-line-services",
    "shortDescription": "Complete sewer line inspection, cleaning, repair, and replacement services.",
    "description": "We use camera inspection to diagnose sewer problems accurately. Our team handles everything from routine cleaning to full sewer line replacement with minimal disruption.",
    "icon": "🔧",
    "image": ""
  },
  {
    "name": "Emergency Plumbing",
    "slug": "emergency-plumbing",
    "shortDescription": "24/7 emergency plumbing services when you need help fast.",
    "description": "Plumbing emergencies don't wait, and neither do we. Our emergency team is available around the clock to handle burst pipes, major leaks, and other urgent issues.",
    "icon": "🚨",
    "image": ""
  }
]`, `[
  {
    "name": "Mike Johnson",
    "location": "Austin, TX",
    "text": "Had a burst pipe at 2 AM and Pro Plumbing was here within 30 minutes. They fixed the problem quickly and professionally. Can't recommend them enough!",
    "rating": 5,
    "service": "Emergency Plumbing"
  },
  {
    "name": "Sarah Williams",
    "location": "Round Rock, TX",
    "text": "Finally found a plumber I can trust! They installed our new tankless water heater and explained everything clearly. Fair pricing and excellent work.",
    "rating": 5,
    "service": "Water Heater Services"
  },
  {
    "name": "David Chen",
    "location": "Cedar Park, TX",
    "text": "The team was punctual, professional, and cleaned up after themselves. They fixed our slow drains and even gave us tips to prevent future clogs. Great service!",
    "rating": 5,
    "service": "Drain Cleaning"
  }
]`, `[
  {
    "question": "Do you offer 24/7 emergency plumbing services?",
    "answer": "Yes! We understand that plumbing emergencies can happen at any time. Our emergency team is available 24 hours a day, 7 days a week to handle urgent issues like burst pipes, major leaks, and sewer backups."
  },
  {
    "question": "How much does a typical plumbing service call cost?",
    "answer": "Service call costs vary depending on the issue. We provide free estimates for most jobs and always discuss pricing before starting any work. There are no hidden fees or surprise charges."
  },
  {
    "question": "Are your plumbers licensed and insured?",
    "answer": "Absolutely! All our plumbers are fully licensed, bonded, and insured. We maintain the highest standards of professionalism and stay up-to-date with the latest plumbing codes and techniques."
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
