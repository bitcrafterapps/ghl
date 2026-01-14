// Site Configuration - Replace tokens with actual values
// This file is the single source of truth for all site content
// Note: {{TOKENS}} are replaced by the create-site.js script

export const siteConfig = {
  // Company Information
  company: {
    name: "Test 4",
    slug: "test-4",
    phone: "232343",
    email: "sandy@friedman.com",
    address: "123 Main",
    city: "Irivne",
    state: "CA",
    stateFullName: "{{STATE_FULL}}",
    zip: "92688",
    license: "3443",
    yearsInBusiness: "{{YEARS_IN_BUSINESS}}",
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
    icon: "⚡",
    tagline: "Professional Electrical",
  },

  // Industry Configuration
  industry: {
    type: "Electrical",
    slug: "electrical",
    serviceNoun: "{{SERVICE_NOUN}}",
    serviceVerb: "{{SERVICE_VERB}}",
    emergencyService: "true" === "true",
    schemaType: "Electrician",
  },

  // Service Area
  serviceArea: {
    areas: "Irivne".split(",").map((s: string) => s.trim()),
    radius: "30",
    primaryCity: "Irivne",
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
    metaDescription: "Test 4 provides professional electrical services in Irivne, CA. 12+ years experience. Licensed & insured. Call for a free estimate!",
    metaKeywords: "electrical, Irivne, CA, electrical repairs, panel upgrades, lighting installation, outlet & switch installation, ceiling fan installation, electrical inspections",
  },

  // Site URL
  siteUrl: "https://test-4.com",

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
    emergencyNote: "{{EMERGENCY_HOURS_NOTE}}",
  },
};

// Services Configuration - will be replaced with JSON array
export const services: any[] = [];

// Testimonials - will be replaced with JSON array  
export const testimonials: any[] = [];

// FAQ Items - will be replaced with JSON array
export const faqItems: any[] = [];

// Gallery Images - will be replaced with JSON array
export const galleryImages: any[] = [];

// Team Members (optional) - will be replaced with JSON array
export const teamMembers: any[] = [];

export default siteConfig;
