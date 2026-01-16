// Site Configuration - Replace tokens with actual values
// This file is the single source of truth for all site content
// Note: {{TOKENS}} are replaced by the create-site.js script

export const siteConfig = {
  // Company Information
  company: {
    name: "Amazon Electric",
    slug: "amazon-electric",
    phone: "9492923136",
    email: "time@gmail.com",
    address: "15 Las Castanetas",
    city: "Rancho Santa Margarita",
    state: "CA",
    stateFullName: "{{STATE_FULL}}",
    zip: "92688",
    license: "A34343",
    yearsInBusiness: "10",
  },
  
  // Company ID from database (for API filtering)
  // Will be null if token is not replaced or not a valid number
  companyId: (() => { const id = "15"; return !isNaN(parseInt(id)) ? parseInt(id) : null; })(),

  // Branding
  branding: {
    logoUrl: "",
    faviconUrl: "{{FAVICON_URL}}",
    primaryColor: "#2563eb",
    secondaryColor: "#f1f5f9",
    accentColor: "#10b981",
    fontHeading: "{{FONT_HEADING}}",
    fontBody: "{{FONT_BODY}}",
    icon: "🔧",
    tagline: "Your tagline here",
  },

  // Industry Configuration
  industry: {
    type: "Roofing",
    slug: "roofing",
    serviceNoun: "{{SERVICE_NOUN}}",
    serviceVerb: "{{SERVICE_VERB}}",
    emergencyService: "false" === "true",
    schemaType: "LocalBusiness",
  },

  // Service Area
  serviceArea: {
    areas: "".split(",").map((s: string) => s.trim()),
    radius: "25",
    primaryCity: "Rancho Santa Margarita",
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
    metaDescription: "Amazon Electric provides professional roofing services in Rancho Santa Margarita, CA. 10+ years experience. Licensed & insured. Call for a free estimate!",
    metaKeywords: "roofing, Rancho Santa Margarita, CA, roof repair, roof replacement, storm damage repair, commercial roofing, gutter services, roof inspection",
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
    "name": "Roof Repair",
    "slug": "roof-repair",
    "shortDescription": "Expert roof repair for all roof types.",
    "longDescription": "Our roof repair experts fix leaks, missing shingles, and structural damage. We extend the life of your roof and protect your home from the elements with quality repairs.",
    "featured": true,
    "image": "/images/services/roof-repair.png"
  },
  {
    "name": "Roof Replacement",
    "slug": "roof-replacement",
    "shortDescription": "Complete roof replacement services.",
    "longDescription": "When it's time for a new roof, trust our professional replacement services. We install durable, high-quality roofing systems that enhance curb appeal and value.",
    "featured": true,
    "image": "/images/services/roof-replacement.png"
  },
  {
    "name": "Storm Damage Repair",
    "slug": "storm-damage-repair",
    "shortDescription": "Emergency storm damage repair services.",
    "longDescription": "We provide rapid response for storm-damaged roofs. From wind to hail damage, our team repairs and restores your roof to protect your home from further weather impact."
  },
  {
    "name": "Commercial Roofing",
    "slug": "commercial-roofing",
    "shortDescription": "Commercial roofing solutions.",
    "longDescription": "We offer specialized roofing solutions for commercial properties. Our team handles flat roofs, TPO, and other commercial systems with expert care and precision."
  },
  {
    "name": "Gutter Services",
    "slug": "gutter-services",
    "shortDescription": "Gutter installation, repair, and cleaning.",
    "longDescription": "Keep your home safe from water damage with our gutter services. We install, repair, and clean gutters to ensure proper water drainage away from your foundation."
  },
  {
    "name": "Roof Inspection",
    "slug": "roof-inspection",
    "shortDescription": "Comprehensive roof inspection and assessment.",
    "longDescription": "Get a clear picture of your roof's condition with our detailed inspections. We identify potential issues early, helping you plan for maintenance and avoid costly repairs.",
    "featured": true,
    "image": "/images/services/roof-inspection.png"
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
