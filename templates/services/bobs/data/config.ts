// Site Configuration - Replace tokens with actual values
// This file is the single source of truth for all site content
// Note: {{TOKENS}} are replaced by the create-site.js script

export const siteConfig = {
  // Company Information
  company: {
    name: "bobs",
    slug: "bobs",
    phone: "",
    email: "s@s.com",
    address: "123 Mian",
    city: "COO",
    state: "CA",
    stateFullName: "{{STATE_FULL}}",
    zip: "92556",
    license: "S334",
    yearsInBusiness: "23",
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
    icon: "🌿",
    tagline: "Professional Landscaping",
  },

  // Industry Configuration
  industry: {
    type: "Landscaping",
    slug: "landscaping",
    serviceNoun: "{{SERVICE_NOUN}}",
    serviceVerb: "{{SERVICE_VERB}}",
    emergencyService: "false" === "true",
    schemaType: "HomeAndConstructionBusiness",
  },

  // Service Area
  serviceArea: {
    areas: "COO".split(",").map((s: string) => s.trim()),
    radius: "30",
    primaryCity: "COO",
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
    metaDescription: "bobs provides professional landscaping services in COO, CA. 23+ years experience. Licensed & insured. Call for a free estimate!",
    metaKeywords: "landscaping, COO, CA, landscape design, lawn maintenance, hardscaping, irrigation systems, tree service",
  },

  // Site URL
  siteUrl: "https://bobs.com",

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
    "name": "Landscape Design",
    "slug": "landscape-design",
    "shortDescription": "Custom landscape design services.",
    "featured": true
  },
  {
    "name": "Lawn Maintenance",
    "slug": "lawn-maintenance",
    "shortDescription": "Weekly lawn care and maintenance.",
    "featured": true
  },
  {
    "name": "Hardscaping",
    "slug": "hardscaping",
    "shortDescription": "Patios, walkways, and retaining walls.",
    "featured": true
  },
  {
    "name": "Irrigation Systems",
    "slug": "irrigation",
    "shortDescription": "Sprinkler installation and repair."
  },
  {
    "name": "Tree Service",
    "slug": "tree-service",
    "shortDescription": "Tree trimming, removal, and care."
  }
];

// Testimonials - will be replaced with JSON array  
export const testimonials: any[] = [];

// FAQ Items - will be replaced with JSON array
export const faqItems: any[] = [
  {
    "question": "How much does landscaping cost?",
    "answer": "Costs vary widely based on scope. We provide free estimates for all projects."
  },
  {
    "question": "Do you offer maintenance plans?",
    "answer": "Yes! We offer weekly, bi-weekly, and monthly maintenance packages."
  }
];

// Gallery Images - will be replaced with JSON array
export const galleryImages: any[] = [];

// Team Members (optional) - will be replaced with JSON array
export const teamMembers: any[] = [];

export default siteConfig;
