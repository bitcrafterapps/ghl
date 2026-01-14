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
| Company | `Crystal Clear Pools`, `5552468100`, `info@crystalclearpools.com` |
| Branding | `#0891b2`, ``, `Inter` |
| Industry | `Pool Service`, `Pool Experts`, `true` |
| Service Area | `Scottsdale, Phoenix, Paradise Valley, Fountain Hills, Cave Creek, Carefree, Mesa, Tempe`, `Scottsdale`, `30` |
| GHL | ``, ``, `` |
| SEO | `Crystal Clear Pools offers professional pool cleaning, maintenance, and repair services in Scottsdale, AZ. Keep your pool sparkling year-round. Free estimates!`, `` |
| Content | `[
  {
    "name": "Weekly Pool Cleaning",
    "slug": "weekly-pool-cleaning",
    "shortDescription": "Regular weekly cleaning to keep your pool crystal clear and swim-ready all year.",
    "description": "Our comprehensive weekly cleaning service includes skimming, brushing, vacuuming, chemical balancing, and equipment checks. We handle everything so you can just enjoy your pool.",
    "icon": "🏊",
    "image": ""
  },
  {
    "name": "Pool Equipment Repair",
    "slug": "pool-equipment-repair",
    "shortDescription": "Expert repair services for pumps, filters, heaters, and all pool equipment.",
    "description": "From pump failures to filter issues, our certified technicians diagnose and repair all types of pool equipment. We carry parts for most major brands and offer same-day service when possible.",
    "icon": "🔧",
    "image": ""
  },
  {
    "name": "Green Pool Recovery",
    "slug": "green-pool-recovery",
    "shortDescription": "Transform your green, algae-filled pool back to crystal clear in days.",
    "description": "Don't drain your green pool! Our proven recovery process eliminates algae and restores water clarity. We've rescued thousands of neglected pools and can save yours too.",
    "icon": "🌿",
    "image": ""
  },
  {
    "name": "Pool Tile Cleaning",
    "slug": "pool-tile-cleaning",
    "shortDescription": "Remove calcium buildup and restore the beauty of your pool tile.",
    "description": "Our bead blasting and acid washing techniques safely remove stubborn calcium deposits, stains, and discoloration from your pool tile and waterline without damaging surfaces.",
    "icon": "✨",
    "image": ""
  },
  {
    "name": "Pool Resurfacing",
    "slug": "pool-resurfacing",
    "shortDescription": "Revitalize your pool with professional resurfacing and refinishing services.",
    "description": "Whether you need plaster repair, pebble finish, or a complete resurface, we transform worn and stained pool surfaces into beautiful, durable finishes that last for years.",
    "icon": "🎨",
    "image": ""
  },
  {
    "name": "Salt System Installation",
    "slug": "salt-system-installation",
    "shortDescription": "Convert to a salt water pool for softer water and easier maintenance.",
    "description": "Enjoy the benefits of salt water swimming! We install and service salt chlorine generators from leading brands. Say goodbye to harsh chlorine and hello to silky smooth water.",
    "icon": "🧂",
    "image": ""
  }
]`, `[
  {
    "name": "Jennifer Martinez",
    "location": "Scottsdale, AZ",
    "text": "Crystal Clear Pools has maintained our pool for 5 years now. They're always on time, professional, and our pool has never looked better. Highly recommend!",
    "rating": 5,
    "service": "Weekly Pool Cleaning"
  },
  {
    "name": "Robert Thompson",
    "location": "Paradise Valley, AZ",
    "text": "We bought a house with a neglected green pool. Crystal Clear had it sparkling in just 4 days! Amazing transformation and fair pricing.",
    "rating": 5,
    "service": "Green Pool Recovery"
  },
  {
    "name": "Lisa Chen",
    "location": "Phoenix, AZ",
    "text": "Our pool pump died on a Saturday before a party. They came out same day and had us back up and running. Lifesavers! Great emergency service.",
    "rating": 5,
    "service": "Pool Equipment Repair"
  }
]`, `[
  {
    "question": "How often should I have my pool professionally cleaned?",
    "answer": "For most Arizona pools, we recommend weekly service during the swimming season and bi-weekly during cooler months. This keeps chemicals balanced and prevents algae growth in our hot climate."
  },
  {
    "question": "Can you fix my green pool without draining it?",
    "answer": "In most cases, yes! Our green pool recovery process can restore even severely neglected pools without draining. This saves water, money, and gets you swimming faster than a drain and refill."
  },
  {
    "question": "Do you service salt water pools?",
    "answer": "Absolutely! We service both traditional chlorine and salt water pools. We can also convert your existing pool to a salt system if you're interested in making the switch."
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
