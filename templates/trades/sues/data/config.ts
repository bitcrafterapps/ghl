// Site Configuration - Replace tokens with actual values
// This file is the single source of truth for all site content
// Note: {{TOKENS}} are replaced by the create-site.js script

export const siteConfig = {
  // Company Information
  company: {
    name: "Sues",
    slug: "sues",
    phone: "343533555",
    email: "sand@co.com",
    address: "123 Main",
    city: "IRvine",
    state: "CA",
    stateFullName: "{{STATE_FULL}}",
    zip: "92688",
    license: "A8888",
    yearsInBusiness: "2",
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
    icon: "❄️",
    tagline: "Professional HVAC",
  },

  // Industry Configuration
  industry: {
    type: "HVAC",
    slug: "hvac",
    serviceNoun: "{{SERVICE_NOUN}}",
    serviceVerb: "{{SERVICE_VERB}}",
    emergencyService: "true" === "true",
    schemaType: "HVACBusiness",
  },

  // Service Area
  serviceArea: {
    areas: "IRvine".split(",").map((s: string) => s.trim()),
    radius: "30",
    primaryCity: "IRvine",
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
    metaDescription: "Sues provides professional hvac services in IRvine, CA. 2+ years experience. Licensed & insured. Call for a free estimate!",
    metaKeywords: "hvac, IRvine, CA, ac repair, ac installation, heating repair, furnace installation, hvac maintenance, duct cleaning",
  },

  // Site URL
  siteUrl: "https://sues.com",

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
    emergencyNote: "24/7 Emergency Service Available",
  },
};

// Services Configuration - will be replaced with JSON array
export const services: any[] = [
  {
    "name": "AC Repair",
    "slug": "ac-repair",
    "shortDescription": "Fast, reliable air conditioning repair services.",
    "featured": true
  },
  {
    "name": "AC Installation",
    "slug": "ac-installation",
    "shortDescription": "Professional AC system installation.",
    "featured": true
  },
  {
    "name": "Heating Repair",
    "slug": "heating-repair",
    "shortDescription": "Expert heating system repair services.",
    "featured": true
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

// Testimonials - will be replaced with JSON array  
export const testimonials: any[] = [];

// FAQ Items - will be replaced with JSON array
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

// Gallery Images - will be replaced with JSON array
export const galleryImages: any[] = [];

// Team Members (optional) - will be replaced with JSON array
export const teamMembers: any[] = [];

export default siteConfig;
