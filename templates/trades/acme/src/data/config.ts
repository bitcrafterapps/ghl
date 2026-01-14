// Site Configuration - Replace tokens with actual values
// This file is the single source of truth for all site content

export const siteConfig = {
  // Company Information
  company: {
    name: "Acme",
    slug: "acme",
    phone: "949494444",
    email: "s@s.com",
    address: "123 main street",
    city: "yt",
    state: "ty",
    stateFullName: "STATE_FULL",
    zip: "92688",
    license: "8348438",
    yearsInBusiness: "YEARS_IN_BUSINESS",
  },

  // Branding
  branding: {
    logoUrl: "/public/logo.png",
    faviconUrl: "FAVICON_URL",
    primaryColor: "PRIMARY_COLOR",
    secondaryColor: "SECONDARY_COLOR",
    accentColor: "ACCENT_COLOR",
    fontHeading: "FONT_HEADING",
    fontBody: "FONT_BODY",
  },

  // Industry Configuration
  industry: {
    type: "HVAC",
    slug: "hvac",
    serviceNoun: "SERVICE_NOUN",
    serviceVerb: "SERVICE_VERB",
    emergencyService: "EMERGENCY_SERVICE",
    schemaType: "SCHEMA_BUSINESS_TYPE",
  },

  // Service Area
  serviceArea: {
    areas: "SERVICE_AREAS".split(",").map(s => s.trim()),
    radius: "SERVICE_RADIUS",
    primaryCity: "PRIMARY_CITY",
  },

  // Social Links
  social: {
    facebook: "FACEBOOK_URL",
    instagram: "INSTAGRAM_URL",
    google: "GOOGLE_BUSINESS_URL",
    yelp: "YELP_URL",
    bbb: "BBB_URL",
    nextdoor: "NEXTDOOR_URL",
  },

  // GHL Integration
  ghl: {
    calendarEmbed: "GHL_CALENDAR_EMBED",
    formEmbed: "GHL_FORM_EMBED",
    chatWidget: "GHL_CHAT_WIDGET",
    trackingId: "GHL_TRACKING_ID",
  },

  // SEO & Analytics
  seo: {
    googleAnalyticsId: "GOOGLE_ANALYTICS_ID",
    googleTagManagerId: "GOOGLE_TAG_MANAGER_ID",
    facebookPixelId: "FACEBOOK_PIXEL_ID",
    metaDescription: "META_DESCRIPTION",
    metaKeywords: "META_KEYWORDS",
  },

  // Site URL
  siteUrl: "http://localhost:3000",

  // Review Stats
  reviews: {
    rating: "RATING_VALUE",
    count: "REVIEW_COUNT",
    googleReviewLink: "GOOGLE_REVIEW_LINK",
  },

  // Business Hours
  hours: {
    weekdays: "8:00 AM - 6:00 PM",
    saturday: "9:00 AM - 4:00 PM",
    sunday: "Closed",
    emergencyNote: "EMERGENCY_HOURS_NOTE",
  },
};

// Services Configuration
export const services: any[] = [
  {
    "name": "AC Repair",
    "slug": "ac-repair",
    "shortDescription": "Fast, reliable air conditioning repair services."
  },
  {
    "name": "AC Installation",
    "slug": "ac-installation",
    "shortDescription": "Professional AC system installation."
  },
  {
    "name": "Heating Repair",
    "slug": "heating-repair",
    "shortDescription": "Expert heating system repair services."
  },
  {
    "name": "Furnace Installation",
    "slug": "furnace-installation",
    "shortDescription": "Quality furnace installation and replacement."
  },
  {
    "name": "HVAC Maintenance",
    "slug": "hvac-maintenance",
    "shortDescription": "Preventive maintenance to keep your system running."
  },
  {
    "name": "Duct Cleaning",
    "slug": "duct-cleaning",
    "shortDescription": "Professional air duct cleaning services."
  }
];

// Testimonials
export const testimonials: any[] = [];

// FAQ Items
export const faqItems: any[] = [
  {
    "question": "How often should I service my HVAC system?",
    "answer": "We recommend servicing your HVAC system twice a year—once before summer for cooling and once before winter for heating."
  },
  {
    "question": "What are signs my AC needs repair?",
    "answer": "Common signs include weak airflow, warm air, unusual noises, high energy bills, and frequent cycling."
  },
  {
    "question": "Do you offer emergency HVAC services?",
    "answer": "Yes! We offer 24/7 emergency service for urgent heating and cooling issues."
  }
];

// Gallery Images
export const galleryImages: any[] = [];

// Team Members (optional)
export const teamMembers: any[] = [];

export default siteConfig;
