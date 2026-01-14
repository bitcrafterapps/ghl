// Site Configuration - Replace tokens with actual values
// This file is the single source of truth for all site content
// Note: {{TOKENS}} are replaced by the create-site.js script

export const siteConfig = {
  // Company Information
  company: {
    name: "Frnakies",
    slug: "frnakies",
    phone: "3435535",
    email: "s@s.com",
    address: "23243 M",
    city: "Irifi",
    state: "CA",
    stateFullName: "{{STATE_FULL}}",
    zip: "92688",
    license: "4sdff",
    yearsInBusiness: "34",
  },

  // Branding
  branding: {
    logoUrl: "",
    faviconUrl: "{{FAVICON_URL}}",
    primaryColor: "#2563eb",
    secondaryColor: "#1e40af",
    accentColor: "#f59e0b",
    fontHeading: "{{FONT_HEADING}}",
    fontBody: "{{FONT_BODY}}",
    icon: "🏊",
    tagline: "Professional Pool Service",
  },

  // Industry Configuration
  industry: {
    type: "Pool Service",
    slug: "pool-service",
    serviceNoun: "{{SERVICE_NOUN}}",
    serviceVerb: "{{SERVICE_VERB}}",
    emergencyService: "false" === "true",
    schemaType: "HomeAndConstructionBusiness",
  },

  // Service Area
  serviceArea: {
    areas: "Irifi".split(",").map((s: string) => s.trim()),
    radius: "30",
    primaryCity: "Irifi",
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
    metaDescription: "Frnakies provides professional pool service services in Irifi, CA. 34+ years experience. Licensed & insured. Call for a free estimate!",
    metaKeywords: "pool service, Irifi, CA, weekly pool maintenance, pool equipment repair, pool opening & closing, pool remodeling",
  },

  // Site URL
  siteUrl: "https://frnakies.com",

  // Review Stats
  reviews: {
    rating: "4.9",
    count: "100",
    googleReviewLink: "",
  },

  // Business Hours
  hours: {
    weekdays: "8:00 AM - 6:00 PM",
    saturday: "9:00 AM - 4:00 PM",
    sunday: "Closed",
    emergencyNote: "",
  },
};

// Services Configuration - will be replaced with JSON array
export const services: any[] = [
  {
    "name": "Weekly Pool Maintenance",
    "slug": "weekly-maintenance",
    "shortDescription": "Complete weekly pool care service.",
    "featured": true
  },
  {
    "name": "Pool Equipment Repair",
    "slug": "equipment-repair",
    "shortDescription": "Pump, filter, and heater repairs.",
    "featured": true
  },
  {
    "name": "Pool Opening & Closing",
    "slug": "opening-closing",
    "shortDescription": "Seasonal pool preparation.",
    "featured": true
  },
  {
    "name": "Pool Remodeling",
    "slug": "pool-remodeling",
    "shortDescription": "Pool renovation and resurfacing."
  }
];

// Testimonials - will be replaced with JSON array  
export const testimonials: any[] = [];

// FAQ Items - will be replaced with JSON array
export const faqItems: any[] = [
  {
    "question": "How often should I have my pool serviced?",
    "answer": "We recommend weekly service to maintain proper chemistry and equipment function."
  },
  {
    "question": "When should I open my pool for summer?",
    "answer": "In most areas, opening in late April to early May is ideal when temperatures consistently reach 70°F."
  }
];

// Gallery Images - will be replaced with JSON array
export const galleryImages: any[] = [];

// Team Members (optional) - will be replaced with JSON array
export const teamMembers: any[] = [];

export default siteConfig;
