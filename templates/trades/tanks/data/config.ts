// Site Configuration - Replace tokens with actual values
// This file is the single source of truth for all site content
// Note: {{TOKENS}} are replaced by the create-site.js script

export const siteConfig = {
  // Company Information
  company: {
    name: "Tanks",
    slug: "tanks",
    phone: "34535355",
    email: "s@s.com",
    address: "123 Mina",
    city: "Irivne",
    state: "CA",
    stateFullName: "{{STATE_FULL}}",
    zip: "93848",
    license: "A445",
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
    areas: "Irivne".split(",").map((s: string) => s.trim()),
    radius: "30",
    primaryCity: "Irivne",
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
    metaDescription: "Tanks provides professional plumbing services in Irivne, CA. 23+ years experience. Licensed & insured. Call for a free estimate!",
    metaKeywords: "plumbing, Irivne, CA, drain cleaning, water heater repair, water heater installation, leak detection, pipe repair, sewer line services",
  },

  // Site URL
  siteUrl: "https://tanks.com",

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
    "longDescription": "Our thorough drain cleaning service removes stubborn clogs and buildup, restoring proper flow to your plumbing. We use advanced tools to clear blockages safely and effectively.",
    "featured": true
  },
  {
    "name": "Water Heater Repair",
    "slug": "water-heater-repair",
    "shortDescription": "Expert water heater repair and maintenance.",
    "longDescription": "Experiencing water heater issues? Our technicians repair all makes and models, restoring hot water quickly. We address leaks, heating element failures, and thermostat issues.",
    "featured": true
  },
  {
    "name": "Water Heater Installation",
    "slug": "water-heater-installation",
    "shortDescription": "New water heater installation services.",
    "longDescription": "Upgrade to a new, efficient water heater. We install traditional tank and tankless systems, ensuring reliable hot water and energy savings for your home.",
    "featured": true
  },
  {
    "name": "Leak Detection",
    "slug": "leak-detection",
    "shortDescription": "Advanced leak detection technology.",
    "longDescription": "Hidden leaks can cause major damage. Our non-invasive leak detection technology pinpoints the exact location of leaks, allowing us to repair them with minimal disruption."
  },
  {
    "name": "Pipe Repair",
    "slug": "pipe-repair",
    "shortDescription": "Reliable pipe repair and replacement.",
    "longDescription": "From burst pipes to corrosion, our pipe repair services address all types of piping issues. We ensure watertight, durable repairs to protect your home from water damage."
  },
  {
    "name": "Sewer Line Services",
    "slug": "sewer-line-services",
    "shortDescription": "Complete sewer line inspection and repair.",
    "longDescription": "We offer complete sewer line inspection, repair, and replacement. Using camera inspections, we identify issues and provide effective solutions for your sewer system."
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
