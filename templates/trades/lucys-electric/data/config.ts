// Site Configuration - Replace tokens with actual values
// This file is the single source of truth for all site content
// Note: {{TOKENS}} are replaced by the create-site.js script

export const siteConfig = {
  // Company Information
  company: {
    name: "Lucys Electric",
    slug: "lucys-electric",
    phone: "9492923136",
    email: "lucy@genwith.ai",
    address: "15 Las Castanetas",
    city: "Rancho Santa Margarita",
    state: "CA",
    stateFullName: "{{STATE_FULL}}",
    zip: "92688",
    license: "A343445",
    yearsInBusiness: "10",
  },
  
  // Company ID from database (for API filtering)
  // Will be null if token is not replaced or not a valid number
  companyId: (() => { const id = "10"; return !isNaN(parseInt(id)) ? parseInt(id) : null; })(),

  // Branding
  branding: {
    logoUrl: "/images/logo.jpg",
    faviconUrl: "{{FAVICON_URL}}",
    primaryColor: "#2563eb",
    secondaryColor: "#07df73",
    accentColor: "#dcd504",
    fontHeading: "{{FONT_HEADING}}",
    fontBody: "{{FONT_BODY}}",
    icon: "🔧",
    tagline: "We keep you wired",
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
    areas: "RSM, Irvine, Mission Viejo".split(",").map((s: string) => s.trim()),
    radius: "30",
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
    metaDescription: "Lucys Electric provides professional electrical services in Rancho Santa Margarita, CA. 10+ years experience. Licensed & insured. Call for a free estimate!",
    metaKeywords: "electrical, Rancho Santa Margarita, CA, electrical repairs, lighting installation, ceiling fan installation, outlet & switch installation, panel upgrades, electrical inspections",
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
    "featured": true
  },
  {
    "name": "Lighting Installation",
    "slug": "lighting-installation",
    "shortDescription": "Indoor and outdoor lighting installation.",
    "longDescription": "Transform your space with professional lighting installation. We install recessed lighting, chandeliers, and outdoor fixtures to enhance the beauty and functionality of your home.",
    "featured": true
  },
  {
    "name": "Ceiling Fan Installation",
    "slug": "ceiling-fan-installation",
    "shortDescription": "Professional ceiling fan installation.",
    "longDescription": "Stay cool and comfortable with our ceiling fan installation services. We ensure secure mounting and proper wiring for optimal performance and safety."
  },
  {
    "name": "Outlet & Switch Installation",
    "slug": "outlet-switch-installation",
    "shortDescription": "New outlet and switch installation.",
    "longDescription": "Add convenience and safety with new outlets and switches. We install GFCIs, USB outlets, and dimmers, upgrading your home's electrical accessibility."
  },
  {
    "name": "Panel Upgrades",
    "slug": "panel-upgrades",
    "shortDescription": "Electrical panel upgrade and replacement.",
    "longDescription": "Modernize your home's power system with an electrical panel upgrade. We replace outdated panels to handle increased electrical loads, enhancing safety and performance.",
    "featured": true
  },
  {
    "name": "Electrical Inspections",
    "slug": "electrical-inspections",
    "shortDescription": "Comprehensive electrical safety inspections.",
    "longDescription": "Ensure your home's electrical system is up to code with our comprehensive inspections. We identify potential hazards and recommend solutions for a safe home."
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
