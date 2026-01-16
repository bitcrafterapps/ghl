// Site Configuration - Replace tokens with actual values
// This file is the single source of truth for all site content
// Note: {{TOKENS}} are replaced by the create-site.js script

export const siteConfig = {
  // Company Information
  company: {
    name: "AmazonMan",
    slug: "amazonman",
    phone: "9492923136",
    email: "amazonman@gmail.com",
    address: "15 Las Castanetas",
    city: "Rancho Santa Margarita",
    state: "CA",
    stateFullName: "{{STATE_FULL}}",
    zip: "92688",
    license: "A34434",
    yearsInBusiness: "10",
  },
  
  // Company ID from database (for API filtering)
  // Will be null if token is not replaced or not a valid number
  companyId: (() => { const id = "16"; return !isNaN(parseInt(id)) ? parseInt(id) : null; })(),

  // Branding
  branding: {
    logoUrl: "",
    faviconUrl: "{{FAVICON_URL}}",
    primaryColor: "#2563eb",
    secondaryColor: "#f1f5f9",
    accentColor: "#10b981",
    fontHeading: "{{FONT_HEADING}}",
    fontBody: "{{FONT_BODY}}",
    icon: "🔦",
    tagline: "Your tagline here",
  },

  // Industry Configuration
  industry: {
    type: "Electrical",
    slug: "electrical",
    serviceNoun: "{{SERVICE_NOUN}}",
    serviceVerb: "{{SERVICE_VERB}}",
    emergencyService: "false" === "true",
    schemaType: "LocalBusiness",
  },

  // Service Area
  serviceArea: {
    areas: "RSM".split(",").map((s: string) => s.trim()),
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
    metaDescription: "AmazonMan provides professional electrical services in Rancho Santa Margarita, CA. 10+ years experience. Licensed & insured. Call for a free estimate!",
    metaKeywords: "electrical, Rancho Santa Margarita, CA, electrical repairs, lighting installation, outlet & switch installation, ceiling fan installation, electrical inspections, panel upgrades",
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
    emergencyNote: "",
  },
};

// Services Configuration - will be replaced with JSON array
export const services: any[] = [
  {
    "name": "Electrical Repairs",
    "slug": "electrical-repairs",
    "shortDescription": "Safe and reliable electrical repair services.",
    "longDescription": "Our licensed electricians handle all electrical repairs safely and efficiently. From flickering lights to faulty wiring, we troubleshoot and fix issues to ensure your home's safety.",
    "featured": true,
    "image": "/images/services/electrical-repairs.png"
  },
  {
    "name": "Lighting Installation",
    "slug": "lighting-installation",
    "shortDescription": "Indoor and outdoor lighting installation.",
    "longDescription": "Transform your space with professional lighting installation. We install recessed lighting, chandeliers, and outdoor fixtures to enhance the beauty and functionality of your home.",
    "featured": true,
    "image": "/images/services/lighting-installation.png"
  },
  {
    "name": "Outlet & Switch Installation",
    "slug": "outlet-switch-installation",
    "shortDescription": "New outlet and switch installation.",
    "longDescription": "Add convenience and safety with new outlets and switches. We install GFCIs, USB outlets, and dimmers, upgrading your home's electrical accessibility.",
    "image": "/images/services/outlet-switch-installation.png"
  },
  {
    "name": "Ceiling Fan Installation",
    "slug": "ceiling-fan-installation",
    "shortDescription": "Professional ceiling fan installation.",
    "longDescription": "Stay cool and comfortable with our ceiling fan installation services. We ensure secure mounting and proper wiring for optimal performance and safety.",
    "image": "/images/services/ceiling-fan-installation.png"
  },
  {
    "name": "Electrical Inspections",
    "slug": "electrical-inspections",
    "shortDescription": "Comprehensive electrical safety inspections.",
    "longDescription": "Ensure your home's electrical system is up to code with our comprehensive inspections. We identify potential hazards and recommend solutions for a safe home.",
    "image": "/images/services/electrical-inspections.png"
  },
  {
    "name": "Panel Upgrades",
    "slug": "panel-upgrades",
    "shortDescription": "Electrical panel upgrade and replacement.",
    "longDescription": "Modernize your home's power system with an electrical panel upgrade. We replace outdated panels to handle increased electrical loads, enhancing safety and performance.",
    "featured": true,
    "image": "/images/services/panel-upgrades.png"
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
