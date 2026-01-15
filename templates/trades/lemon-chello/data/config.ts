// Site Configuration - Replace tokens with actual values
// This file is the single source of truth for all site content
// Note: {{TOKENS}} are replaced by the create-site.js script

export const siteConfig = {
  // Company Information
  company: {
    name: "Lemon Chello",
    slug: "lemon-chello",
    phone: "949 292 31356",
    email: "s@s.com",
    address: "123 Main",
    city: "Irvine",
    state: "CA",
    stateFullName: "{{STATE_FULL}}",
    zip: "92668",
    license: "A33434",
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
    metaDescription: "Lemon Chello provides professional hvac services in Irvine, CA. 12+ years experience. Licensed & insured. Call for a free estimate!",
    metaKeywords: "hvac, Irvine, CA, ac repair, ac installation, heating repair, furnace installation, hvac maintenance, duct cleaning",
  },

  // Site URL
  siteUrl: "https://lemon-chello.com",

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
    "longDescription": "Our expert AC repair service quickly diagnoses and fixes all cooling issues, from refrigerant leaks to compressor failures. We restore comfort to your home efficiently, ensuring your system operates at peak performance during the hottest days.",
    "featured": true,
    "image": "/images/services/ac-repair.png"
  },
  {
    "name": "AC Installation",
    "slug": "ac-installation",
    "shortDescription": "Professional AC system installation.",
    "longDescription": "We provide professional AC installation for energy-efficient systems tailored to your home's needs. Our team ensures proper sizing and seamless integration for maximum comfort and savings.",
    "featured": true
  },
  {
    "name": "Heating Repair",
    "slug": "heating-repair",
    "shortDescription": "Expert heating system repair services.",
    "longDescription": "Don't let the cold inside. Our heating repair specialists troubleshoot and repair furnaces and heat pumps promptly, ensuring your home stays warm and safe throughout the winter.",
    "featured": true
  },
  {
    "name": "Furnace Installation",
    "slug": "furnace-installation",
    "shortDescription": "Quality furnace installation and replacement.",
    "longDescription": "Upgrade your comfort with our top-tier furnace installation services. We install reliable, high-efficiency heating systems that provide consistent warmth and lower energy bills."
  },
  {
    "name": "HVAC Maintenance",
    "slug": "hvac-maintenance",
    "shortDescription": "Preventive maintenance to keep your system running.",
    "longDescription": "Extend the life of your system with our comprehensive HVAC maintenance. Regular tune-ups prevent costly breakdowns, improve efficiency, and ensure cleaner air for your family."
  },
  {
    "name": "Duct Cleaning",
    "slug": "duct-cleaning",
    "shortDescription": "Professional air duct cleaning services.",
    "longDescription": "Breathe easier with our professional duct cleaning services. We remove dust, allergens, and debris from your air ducts, improving indoor air quality and system efficiency."
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
