// Site Configuration - Replace tokens with actual values
// This file is the single source of truth for all site content
// Note: {{TOKENS}} are replaced by the create-site.js script

export const siteConfig = {
  // Company Information
  company: {
    name: "Sandmans Pools",
    slug: "sandmans-pools",
    phone: "9939-334",
    email: "sandy@ds.com",
    address: "123 Mian",
    city: "Irvine",
    state: "CA",
    stateFullName: "{{STATE_FULL}}",
    zip: "92688",
    license: "A22243",
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
    areas: "Irvine".split(",").map((s: string) => s.trim()),
    radius: "30",
    primaryCity: "Irvine",
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
    metaDescription: "Sandmans Pools provides professional pool service services in Irvine, CA. 24+ years experience. Licensed & insured. Call for a free estimate!",
    metaKeywords: "pool service, Irvine, CA, weekly pool maintenance, pool equipment repair, pool opening & closing, pool remodeling",
  },

  // Site URL
  siteUrl: "https://sandmans-pools.com",

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
