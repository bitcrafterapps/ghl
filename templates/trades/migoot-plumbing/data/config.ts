// Site Configuration - Replace tokens with actual values
// This file is the single source of truth for all site content
// Note: {{TOKENS}} are replaced by the create-site.js script

export const siteConfig = {
  // Company Information
  company: {
    name: "Migoot Plumbing",
    slug: "migoot-plumbing",
    phone: "9492923136",
    email: "maya@genwith.ai",
    address: "15 Las Castanetas",
    city: "Rancho Santa Margarita",
    state: "CA",
    stateFullName: "{{STATE_FULL}}",
    zip: "92688",
    license: "A33434434",
    yearsInBusiness: "10",
  },
  
  // Company ID from database (for API filtering)
  // Will be null if token is not replaced or not a valid number
  companyId: (() => { const id = "7"; return !isNaN(parseInt(id)) ? parseInt(id) : null; })(),

  // Branding
  branding: {
    logoUrl: "/images/logo.jpg",
    faviconUrl: "{{FAVICON_URL}}",
    primaryColor: "#2563eb",
    secondaryColor: "#f1f5f9",
    accentColor: "#10b981",
    fontHeading: "{{FONT_HEADING}}",
    fontBody: "{{FONT_BODY}}",
    icon: "🔧",
    tagline: "Your tagline here",
  },

  // Industry Configuration
  industry: {
    type: "Plumbing",
    slug: "plumbing",
    serviceNoun: "{{SERVICE_NOUN}}",
    serviceVerb: "{{SERVICE_VERB}}",
    emergencyService: "true" === "true",
    schemaType: "LocalBusiness",
  },

  // Service Area
  serviceArea: {
    areas: "RSM, Mission Viejo, Irvine".split(",").map((s: string) => s.trim()),
    radius: "25",
    primaryCity: "RSM",
  },

  // Social Links
  social: {
    facebook: "{{FACEBOOK_URL}}",
    instagram: "{{INSTAGRAM_URL}}",
    google: "{{GOOGLE_BUSINESS_URL}}",
    yelp: "{{YELP_URL}}",
    bbb: "{{BBB_URL}}",
    nextdoor: "{{NEXTDOOR_URL}}",
  },

  // GHL Integration
  ghl: {
    calendarEmbed: "",
    formEmbed: "",
    chatWidget: "",
    trackingId: "{{GHL_TRACKING_ID}}",
  },

  // SEO & Analytics
  seo: {
    googleAnalyticsId: "",
    googleTagManagerId: "{{GOOGLE_TAG_MANAGER_ID}}",
    facebookPixelId: "{{FACEBOOK_PIXEL_ID}}",
    metaDescription: "Migoot Plumbing provides professional plumbing services in Rancho Santa Margarita, CA. 10+ years experience. Licensed & insured. Call for a free estimate!",
    metaKeywords: "plumbing, Rancho Santa Margarita, CA, drain cleaning, water heater installation, pipe repair",
  },

  // Site URL
  siteUrl: "",

  // Review Stats
  reviews: {
    rating: "5.0",
    count: "100",
    googleReviewLink: "",
  },

  // Business Hours
  hours: {
    weekdays: "8:00 AM - 6:00 PM",
    saturday: "9:00 AM - 4:00 PM",
    sunday: "Closed",
    emergencyNote: "24/7 Emergency Service Available",
  },
};

// Services Configuration - will be replaced with JSON array
export const services: any[] = [
  {
    "name": "Drain Cleaning",
    "slug": "drain-cleaning",
    "shortDescription": "Professional drain cleaning and unclogging services.",
    "longDescription": "Our thorough drain cleaning service removes stubborn clogs and buildup, restoring proper flow to your plumbing. We use advanced tools to clear blockages safely and effectively.",
    "featured": true
  },
  {
    "name": "Water Heater Installation",
    "slug": "water-heater-installation",
    "shortDescription": "New water heater installation services.",
    "longDescription": "Upgrade to a new, efficient water heater. We install traditional tank and tankless systems, ensuring reliable hot water and energy savings for your home.",
    "featured": true
  },
  {
    "name": "Pipe Repair",
    "slug": "pipe-repair",
    "shortDescription": "Reliable pipe repair and replacement.",
    "longDescription": "From burst pipes to corrosion, our pipe repair services address all types of piping issues. We ensure watertight, durable repairs to protect your home from water damage."
  }
];

// Testimonials - will be replaced with JSON array  
export const testimonials: any[] = [];

// FAQ Items - will be replaced with JSON array
export const faqItems: any[] = [];

// Gallery Images - will be replaced with JSON array
export const galleryImages: any[] = [];

// Team Members (optional) - will be replaced with JSON array
export const teamMembers: any[] = [];

export default siteConfig;
