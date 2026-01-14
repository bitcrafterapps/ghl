// Site Configuration - Replace tokens with actual values
// This file is the single source of truth for all site content

export const siteConfig = {
  // Company Information
  company: {
    name: "{{COMPANY_NAME}}",
    slug: "{{COMPANY_SLUG}}",
    phone: "{{COMPANY_PHONE}}",
    email: "{{COMPANY_EMAIL}}",
    address: "{{COMPANY_ADDRESS}}",
    city: "{{COMPANY_CITY}}",
    state: "{{COMPANY_STATE}}",
    stateFullName: "{{STATE_FULL}}",
    zip: "{{COMPANY_ZIP}}",
    license: "{{COMPANY_LICENSE}}",
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
  },

  // Industry Configuration
  industry: {
    type: "{{INDUSTRY_TYPE}}",
    slug: "{{INDUSTRY_SLUG}}",
    serviceNoun: "{{SERVICE_NOUN}}",
    serviceVerb: "{{SERVICE_VERB}}",
    emergencyService: {{EMERGENCY_SERVICE}},
    schemaType: "{{SCHEMA_BUSINESS_TYPE}}",
  },

  // Service Area
  serviceArea: {
    areas: "{{SERVICE_AREAS}}".split(",").map(s => s.trim()),
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
    weekdays: "{{HOURS_WEEKDAYS}}",
    saturday: "{{HOURS_SATURDAY}}",
    sunday: "{{HOURS_SUNDAY}}",
    emergencyNote: "{{EMERGENCY_HOURS_NOTE}}",
  },
};

// Services Configuration
export const services: any[] = {{SERVICES_JSON}};

// Testimonials
export const testimonials: any[] = {{TESTIMONIALS_JSON}};

// FAQ Items
export const faqItems: any[] = {{FAQ_JSON}};

// Gallery Images
export const galleryImages: any[] = {{GALLERY_JSON}};

// Team Members (optional)
export const teamMembers: any[] = {{TEAM_JSON}};

export default siteConfig;
