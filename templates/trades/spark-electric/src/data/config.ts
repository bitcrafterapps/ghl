// Site Configuration - Replace tokens with actual values
// This file is the single source of truth for all site content

export const siteConfig = {
  // Company Information
  company: {
    name: "Spark Electric",
    slug: "spark-electric",
    phone: "5551234567",
    email: "info@sparkelectric.com",
    address: "456 Volt Avenue",
    city: "Phoenix",
    state: "AZ",
    stateFullName: "Arizona",
    zip: "85001",
    license: "ELEC98765",
    yearsInBusiness: "12",
  },

  // Branding
  branding: {
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#f59e0b",
    secondaryColor: "#d97706",
    accentColor: "#3b82f6",
    fontHeading: "Poppins",
    fontBody: "Inter",
  },

  // Industry Configuration
  industry: {
    type: "Electrical",
    slug: "electrical",
    serviceNoun: "Services",
    serviceVerb: "repair",
    emergencyService: true,
    schemaType: "Electrician",
  },

  // Service Area
  serviceArea: {
    areas: "Phoenix, Scottsdale, Tempe, Mesa, Chandler, Gilbert, Glendale".split(",").map(s => s.trim()),
    radius: "35",
    primaryCity: "Phoenix",
  },

  // Social Links
  social: {
    facebook: "https://facebook.com/sparkelectric",
    instagram: "https://instagram.com/sparkelectric",
    google: "https://g.page/sparkelectric",
    yelp: "",
    bbb: "",
    nextdoor: "",
  },

  // GHL Integration
  ghl: {
    calendarEmbed: "",
    formEmbed: "",
    chatWidget: "",
    trackingId: "",
  },

  // SEO & Analytics
  seo: {
    googleAnalyticsId: "",
    googleTagManagerId: "",
    facebookPixelId: "",
    metaDescription: "Spark Electric provides professional electrical services in Phoenix, AZ. 12+ years experience. Licensed & insured. Call for a free estimate!",
    metaKeywords: "electrical, Phoenix, Arizona, electrical repairs, panel upgrades, lighting installation",
  },

  // Site URL
  siteUrl: "https://sparkelectric.com",

  // Review Stats
  reviews: {
    rating: "4.8",
    count: "156",
    googleReviewLink: "https://g.page/sparkelectric/review",
  },

  // Business Hours
  hours: {
    weekdays: "7:00 AM - 5:00 PM",
    saturday: "8:00 AM - 2:00 PM",
    sunday: "Emergency Only",
    emergencyNote: "24/7 Emergency Service Available",
  },
};

// Services Configuration
export const services: any[] = [
  {
    "name": "Electrical Repairs",
    "slug": "electrical-repairs",
    "shortDescription": "Safe and reliable electrical repair services."
  },
  {
    "name": "Panel Upgrades",
    "slug": "panel-upgrades",
    "shortDescription": "Electrical panel upgrade and replacement."
  },
  {
    "name": "Lighting Installation",
    "slug": "lighting-installation",
    "shortDescription": "Indoor and outdoor lighting installation."
  },
  {
    "name": "Outlet & Switch Installation",
    "slug": "outlet-switch-installation",
    "shortDescription": "New outlet and switch installation."
  },
  {
    "name": "Ceiling Fan Installation",
    "slug": "ceiling-fan-installation",
    "shortDescription": "Professional ceiling fan installation."
  },
  {
    "name": "Electrical Inspections",
    "slug": "electrical-inspections",
    "shortDescription": "Comprehensive electrical safety inspections."
  }
];

// Testimonials
export const testimonials: any[] = [
  {
    "name": "Mike R.",
    "location": "Phoenix, AZ",
    "rating": 5,
    "text": "Spark Electric was fantastic! They upgraded our panel same day and the price was exactly as quoted. Very professional team.",
    "service": "Panel Upgrade"
  },
  {
    "name": "Sarah L.",
    "location": "Scottsdale, AZ",
    "rating": 5,
    "text": "Called them for an emergency at 10pm and they were here within 30 minutes. Fixed the issue quickly. Highly recommend!",
    "service": "Emergency Service"
  },
  {
    "name": "Tom K.",
    "location": "Tempe, AZ",
    "rating": 5,
    "text": "Great experience with outdoor lighting installation. The team was knowledgeable and cleaned up everything after.",
    "service": "Lighting Installation"
  }
];

// FAQ Items
export const faqItems: any[] = [
  {
    "question": "What are signs of electrical problems?",
    "answer": "Warning signs include flickering lights, frequent breaker trips, burning smells, sparking outlets, and warm switch plates. If you notice any of these, call us immediately."
  },
  {
    "question": "How often should I have an electrical inspection?",
    "answer": "We recommend an inspection every 3-5 years for homes, or whenever you purchase a new home. Older homes may need more frequent inspections."
  },
  {
    "question": "Do you handle emergency electrical work?",
    "answer": "Yes! We provide 24/7 emergency electrical services for power outages, sparking outlets, and other urgent electrical issues."
  }
];

// Gallery Images
export const galleryImages: any[] = [];

// Team Members (optional)
export const teamMembers: any[] = [];

export default siteConfig;
