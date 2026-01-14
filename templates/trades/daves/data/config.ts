// Site Configuration - Replace tokens with actual values
// This file is the single source of truth for all site content
// Note: {{TOKENS}} are replaced by the create-site.js script

export const siteConfig = {
  // Company Information
  company: {
    name: "Daves",
    slug: "daves",
    phone: "3435445353",
    email: "sand@djf.com",
    address: "123 M",
    city: "Irvine",
    state: "CA",
    stateFullName: "{{STATE_FULL}}",
    zip: "92688",
    license: "A3434",
    yearsInBusiness: "12",
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
    icon: "🔧",
    tagline: "Professional Plumbing",
  },

  // Industry Configuration
  industry: {
    type: "Plumbing",
    slug: "plumbing",
    serviceNoun: "{{SERVICE_NOUN}}",
    serviceVerb: "{{SERVICE_VERB}}",
    emergencyService: "true" === "true",
    schemaType: "Plumber",
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
    metaDescription: "Daves provides professional plumbing services in Irvine, CA. 12+ years experience. Licensed & insured. Call for a free estimate!",
    metaKeywords: "plumbing, Irvine, CA, drain cleaning, water heater repair, water heater installation, leak detection, pipe repair, sewer line services",
  },

  // Site URL
  siteUrl: "https://daves.com",

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
    "name": "Drain Cleaning",
    "slug": "drain-cleaning",
    "shortDescription": "Professional drain cleaning and unclogging services.",
    "featured": true
  },
  {
    "name": "Water Heater Repair",
    "slug": "water-heater-repair",
    "shortDescription": "Expert water heater repair and maintenance.",
    "featured": true
  },
  {
    "name": "Water Heater Installation",
    "slug": "water-heater-installation",
    "shortDescription": "New water heater installation services.",
    "featured": true
  },
  {
    "name": "Leak Detection",
    "slug": "leak-detection",
    "shortDescription": "Advanced leak detection technology."
  },
  {
    "name": "Pipe Repair",
    "slug": "pipe-repair",
    "shortDescription": "Reliable pipe repair and replacement."
  },
  {
    "name": "Sewer Line Services",
    "slug": "sewer-line-services",
    "shortDescription": "Complete sewer line inspection and repair."
  }
];

// Testimonials - will be replaced with JSON array  
export const testimonials: any[] = [];

// FAQ Items - will be replaced with JSON array
export const faqItems: any[] = [
  {
    "question": "What should I do in a plumbing emergency?",
    "answer": "Turn off your main water shut-off valve and call us immediately—we offer 24/7 emergency plumbing services."
  },
  {
    "question": "How can I prevent clogged drains?",
    "answer": "Avoid putting grease, coffee grounds, and food scraps down drains. Use drain screens and schedule annual drain cleaning."
  },
  {
    "question": "When should I replace my water heater?",
    "answer": "Most water heaters last 10-15 years. Signs include rust-colored water, strange noises, leaks, or inconsistent hot water."
  }
];

// Gallery Images - will be replaced with JSON array
export const galleryImages: any[] = [];

// Team Members (optional) - will be replaced with JSON array
export const teamMembers: any[] = [];

export default siteConfig;
