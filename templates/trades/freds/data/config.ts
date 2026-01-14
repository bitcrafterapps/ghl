// Site Configuration - Replace tokens with actual values
// This file is the single source of truth for all site content
// Note: {{TOKENS}} are replaced by the create-site.js script

export const siteConfig = {
  // Company Information
  company: {
    name: "Freds",
    slug: "freds",
    phone: "9594994949",
    email: "sand@dertr.com",
    address: "123 Main",
    city: "Irvine",
    state: "CA",
    stateFullName: "{{STATE_FULL}}",
    zip: "92688",
    license: "A33445",
    yearsInBusiness: "23",
  },

  // Branding
  branding: {
    logoUrl: "",
    faviconUrl: "{{FAVICON_URL}}",
    primaryColor: "#28eb25",
    secondaryColor: "#25ebca",
    accentColor: "#d1eb25",
    fontHeading: "{{FONT_HEADING}}",
    fontBody: "{{FONT_BODY}}",
    icon: "🏠",
    tagline: "Professional Roofing",
  },

  // Industry Configuration
  industry: {
    type: "Roofing",
    slug: "roofing",
    serviceNoun: "{{SERVICE_NOUN}}",
    serviceVerb: "{{SERVICE_VERB}}",
    emergencyService: "true" === "true",
    schemaType: "RoofingContractor",
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
    metaDescription: "Freds provides professional roofing services in Irvine, CA. 23+ years experience. Licensed & insured. Call for a free estimate!",
    metaKeywords: "roofing, Irvine, CA, roof repair, roof replacement, roof inspection, storm damage repair, gutter services, commercial roofing",
  },

  // Site URL
  siteUrl: "https://freds.com",

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
    "name": "Roof Repair",
    "slug": "roof-repair",
    "shortDescription": "Expert roof repair for all roof types.",
    "featured": true
  },
  {
    "name": "Roof Replacement",
    "slug": "roof-replacement",
    "shortDescription": "Complete roof replacement services.",
    "featured": true
  },
  {
    "name": "Roof Inspection",
    "slug": "roof-inspection",
    "shortDescription": "Comprehensive roof inspection and assessment.",
    "featured": true
  },
  {
    "name": "Storm Damage Repair",
    "slug": "storm-damage-repair",
    "shortDescription": "Emergency storm damage repair services."
  },
  {
    "name": "Gutter Services",
    "slug": "gutter-services",
    "shortDescription": "Gutter installation, repair, and cleaning."
  },
  {
    "name": "Commercial Roofing",
    "slug": "commercial-roofing",
    "shortDescription": "Commercial roofing solutions."
  }
];

// Testimonials - will be replaced with JSON array  
export const testimonials: any[] = [];

// FAQ Items - will be replaced with JSON array
export const faqItems: any[] = [
  {
    "question": "How do I know if I need a new roof?",
    "answer": "Signs include missing or curling shingles, granules in gutters, visible daylight through roof boards, and age over 20 years."
  },
  {
    "question": "Does insurance cover storm damage?",
    "answer": "Most homeowner's policies cover storm damage. We work directly with insurance companies."
  },
  {
    "question": "How long does a roof replacement take?",
    "answer": "Most residential roof replacements take 1-3 days, depending on size and complexity."
  }
];

// Gallery Images - will be replaced with JSON array
export const galleryImages: any[] = [];

// Team Members (optional) - will be replaced with JSON array
export const teamMembers: any[] = [];

export default siteConfig;
