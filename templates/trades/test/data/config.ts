// Site Configuration - Replace tokens with actual values
// This file is the single source of truth for all site content
// Note: {{TOKENS}} are replaced by the create-site.js script

export const siteConfig = {
  // Company Information
  company: {
    name: "Acme",
    slug: "test",
    phone: "8383838",
    email: "sandy@.com",
    address: "123",
    city: "irvine",
    state: "CA",
    stateFullName: "{{STATE_FULL}}",
    zip: "",
    license: "",
    yearsInBusiness: "{{YEARS_IN_BUSINESS}}",
  },

  // Branding
  branding: {
    logoUrl: "{{LOGO_URL}}",
    faviconUrl: "{{FAVICON_URL}}",
    primaryColor: "{{PRIMARY_COLOR}}",
    secondaryColor: "{{SECONDARY_COLOR}}",
    accentColor: "{{ACCENT_COLOR}}",
    fontHeading: "{{FONT_HEADING}}",
    fontBody: "{{FONT_BODY}}",
    icon: "{{COMPANY_ICON}}",
    tagline: "{{COMPANY_TAGLINE}}",
  },

  // Industry Configuration
  industry: {
    type: "HVAC",
    slug: "hvac",
    serviceNoun: "{{SERVICE_NOUN}}",
    serviceVerb: "{{SERVICE_VERB}}",
    emergencyService: "{{EMERGENCY_SERVICE}}" === "true",
    schemaType: "{{SCHEMA_BUSINESS_TYPE}}",
  },

  // Service Area
  serviceArea: {
    areas: "{{SERVICE_AREAS}}".split(",").map((s: string) => s.trim()),
    radius: "{{SERVICE_RADIUS}}",
    primaryCity: "{{PRIMARY_CITY}}",
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
    calendarEmbed: "{{GHL_CALENDAR_EMBED}}",
    formEmbed: "{{GHL_FORM_EMBED}}",
    chatWidget: "{{GHL_CHAT_WIDGET}}",
    trackingId: "{{GHL_TRACKING_ID}}",
  },

  // SEO & Analytics
  seo: {
    googleAnalyticsId: "{{GOOGLE_ANALYTICS_ID}}",
    googleTagManagerId: "{{GOOGLE_TAG_MANAGER_ID}}",
    facebookPixelId: "{{FACEBOOK_PIXEL_ID}}",
    metaDescription: "{{META_DESCRIPTION}}",
    metaKeywords: "{{META_KEYWORDS}}",
  },

  // Site URL
  siteUrl: "{{SITE_URL}}",

  // Review Stats
  reviews: {
    rating: "{{RATING_VALUE}}",
    count: "{{REVIEW_COUNT}}",
    googleReviewLink: "{{GOOGLE_REVIEW_LINK}}",
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
