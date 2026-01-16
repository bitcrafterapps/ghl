// Site Configuration - Replace tokens with actual values
// This file is the single source of truth for all site content
// Note: {{TOKENS}} are replaced by the create-site.js script

export const siteConfig = {
  // Company Information
  company: {
    name: "SAmazon",
    slug: "samazon",
    phone: "9492923136",
    email: "sssandyrfriedman@gmail.com",
    address: "15 Las Castanetas",
    city: "Rancho Santa Margarita",
    state: "CA",
    stateFullName: "{{STATE_FULL}}",
    zip: "92688",
    license: "A344343",
    yearsInBusiness: "10",
  },
  
  // Company ID from database (for API filtering)
  // Will be null if token is not replaced or not a valid number
  companyId: (() => { const id = "17"; return !isNaN(parseInt(id)) ? parseInt(id) : null; })(),

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
    type: "General Contractor",
    slug: "general-contractor",
    serviceNoun: "{{SERVICE_NOUN}}",
    serviceVerb: "{{SERVICE_VERB}}",
    emergencyService: "false" === "true",
    schemaType: "LocalBusiness",
  },

  // Service Area
  serviceArea: {
    areas: "RSM".split(",").map((s: string) => s.trim()),
    radius: "25",
    primaryCity: "RSM",
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
    metaDescription: "SAmazon provides professional general contractor services in Rancho Santa Margarita, CA. 10+ years experience. Licensed & insured. Call for a free estimate!",
    metaKeywords: "general contractor, Rancho Santa Margarita, CA, home remodeling, kitchen remodeling, bathroom remodeling, room additions, commercial construction, deck & patio",
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
    "name": "Home Remodeling",
    "slug": "home-remodeling",
    "shortDescription": "Complete home remodeling services.",
    "longDescription": "Transform your living space with our full-service home remodeling. We manage every aspect of your project, delivering high-quality craftsmanship and your dream home.",
    "featured": true,
    "image": "/images/services/home-remodeling.png"
  },
  {
    "name": "Kitchen Remodeling",
    "slug": "kitchen-remodeling",
    "shortDescription": "Custom kitchen design and renovation.",
    "longDescription": "Create the kitchen of your dreams. Our custom kitchen remodeling services include design, cabinetry, countertops, and appliances for a beautiful, functional space.",
    "featured": true,
    "image": "/images/services/kitchen-remodeling.png"
  },
  {
    "name": "Bathroom Remodeling",
    "slug": "bathroom-remodeling",
    "shortDescription": "Beautiful bathroom transformations.",
    "longDescription": "Update your bathroom with our expert remodeling services. From modern fixtures to tile work, we create relaxing, stylish bathrooms tailored to your needs.",
    "featured": true,
    "image": "/images/services/bathroom-remodeling.png"
  },
  {
    "name": "Room Additions",
    "slug": "room-additions",
    "shortDescription": "Expand your living space with additions.",
    "longDescription": "Need more space? Our room addition services expand your home seamlessly. We handle everything from design to construction, giving you the extra room you need.",
    "image": "/images/services/room-additions.png"
  },
  {
    "name": "Commercial Construction",
    "slug": "commercial-construction",
    "shortDescription": "Commercial building and renovation.",
    "longDescription": "We provide reliable commercial construction services for businesses. From tenant improvements to new builds, we deliver quality projects on time and on budget.",
    "image": "/images/services/commercial-construction.png"
  },
  {
    "name": "Deck & Patio",
    "slug": "deck-patio",
    "shortDescription": "Custom deck and patio construction.",
    "longDescription": "Enhance your outdoor living with a custom deck or patio. We design and build durable, attractive outdoor spaces perfect for relaxation and entertaining.",
    "image": "/images/services/deck-patio.png"
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
