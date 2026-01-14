// Site Configuration - Replace tokens with actual values
// This file is the single source of truth for all site content

export const siteConfig = {
  // Company Information
  company: {
    name: "Pro Plumbing Solutions",
    slug: "pro-plumbing-solutions",
    phone: "5559876543",
    email: "info@proplumbingsolutions.com",
    address: "123 Main Street",
    city: "Austin",
    state: "TX",
    stateFullName: "Texas",
    zip: "78701",
    license: "PLMB-45678",
    yearsInBusiness: "15",
  },

  // Branding
  branding: {
    logoUrl: "",
    faviconUrl: "",
    primaryColor: "#0066cc",
    secondaryColor: "#004499",
    accentColor: "#22c55e",
    fontHeading: "Inter",
    fontBody: "Inter",
  },

  // Industry Configuration
  industry: {
    type: "Plumbing",
    slug: "plumbing",
    serviceNoun: "Plumbers",
    serviceVerb: "plumbing",
    emergencyService: true,
    schemaType: "Plumber",
  },

  // Service Area
  serviceArea: {
    areas: "Austin, Round Rock, Cedar Park, Georgetown, Pflugerville, Lakeway, Bee Cave".split(",").map(s => s.trim()),
    radius: "25",
    primaryCity: "Austin",
  },

  // Social Links
  social: {
    facebook: "",
    instagram: "",
    google: "",
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
    metaDescription: "Pro Plumbing Solutions provides expert plumbing services in Austin, TX. Licensed plumbers available 24/7 for emergencies. Call for a free estimate!",
    metaKeywords: "plumber austin, plumbing services, emergency plumber, drain cleaning, water heater repair",
  },

  // Site URL
  siteUrl: "",

  // Review Stats
  reviews: {
    rating: "4.9",
    count: "185",
    googleReviewLink: "https://g.page/r/example/review",
  },

  // Business Hours
  hours: {
    weekdays: "7:00 AM - 7:00 PM",
    saturday: "8:00 AM - 5:00 PM",
    sunday: "Emergency Only",
    emergencyNote: "24/7 Emergency Service Available",
  },
};

// Services Configuration
export const services: any[] = [
  {
    "name": "Drain Cleaning",
    "slug": "drain-cleaning",
    "shortDescription": "Professional drain cleaning to remove clogs and keep your pipes flowing freely.",
    "description": "Our expert plumbers use advanced equipment to clear stubborn clogs and clean your drains thoroughly. We handle kitchen sinks, bathroom drains, main sewer lines, and more.",
    "icon": "🚿",
    "image": ""
  },
  {
    "name": "Water Heater Services",
    "slug": "water-heater-services",
    "shortDescription": "Installation, repair, and maintenance for all types of water heaters.",
    "description": "From tankless to traditional water heaters, we provide expert installation, repair, and maintenance services. Get reliable hot water when you need it.",
    "icon": "🔥",
    "image": ""
  },
  {
    "name": "Leak Detection & Repair",
    "slug": "leak-detection-repair",
    "shortDescription": "Find and fix hidden leaks before they cause major damage to your property.",
    "description": "Using state-of-the-art leak detection technology, we locate hidden leaks in walls, floors, and underground pipes. Quick repairs prevent water damage and save you money.",
    "icon": "💧",
    "image": ""
  },
  {
    "name": "Toilet Repair & Installation",
    "slug": "toilet-repair-installation",
    "shortDescription": "Expert toilet repairs and new installations for residential and commercial properties.",
    "description": "From running toilets to complete replacements, our plumbers handle all toilet services. We install water-efficient models that save you money on utility bills.",
    "icon": "🚽",
    "image": ""
  },
  {
    "name": "Sewer Line Services",
    "slug": "sewer-line-services",
    "shortDescription": "Complete sewer line inspection, cleaning, repair, and replacement services.",
    "description": "We use camera inspection to diagnose sewer problems accurately. Our team handles everything from routine cleaning to full sewer line replacement with minimal disruption.",
    "icon": "🔧",
    "image": ""
  },
  {
    "name": "Emergency Plumbing",
    "slug": "emergency-plumbing",
    "shortDescription": "24/7 emergency plumbing services when you need help fast.",
    "description": "Plumbing emergencies don't wait, and neither do we. Our emergency team is available around the clock to handle burst pipes, major leaks, and other urgent issues.",
    "icon": "🚨",
    "image": ""
  }
];

// Testimonials
export const testimonials: any[] = [
  {
    "name": "Mike Johnson",
    "location": "Austin, TX",
    "text": "Had a burst pipe at 2 AM and Pro Plumbing was here within 30 minutes. They fixed the problem quickly and professionally. Can't recommend them enough!",
    "rating": 5,
    "service": "Emergency Plumbing"
  },
  {
    "name": "Sarah Williams",
    "location": "Round Rock, TX",
    "text": "Finally found a plumber I can trust! They installed our new tankless water heater and explained everything clearly. Fair pricing and excellent work.",
    "rating": 5,
    "service": "Water Heater Services"
  },
  {
    "name": "David Chen",
    "location": "Cedar Park, TX",
    "text": "The team was punctual, professional, and cleaned up after themselves. They fixed our slow drains and even gave us tips to prevent future clogs. Great service!",
    "rating": 5,
    "service": "Drain Cleaning"
  }
];

// FAQ Items
export const faqItems: any[] = [
  {
    "question": "Do you offer 24/7 emergency plumbing services?",
    "answer": "Yes! We understand that plumbing emergencies can happen at any time. Our emergency team is available 24 hours a day, 7 days a week to handle urgent issues like burst pipes, major leaks, and sewer backups."
  },
  {
    "question": "How much does a typical plumbing service call cost?",
    "answer": "Service call costs vary depending on the issue. We provide free estimates for most jobs and always discuss pricing before starting any work. There are no hidden fees or surprise charges."
  },
  {
    "question": "Are your plumbers licensed and insured?",
    "answer": "Absolutely! All our plumbers are fully licensed, bonded, and insured. We maintain the highest standards of professionalism and stay up-to-date with the latest plumbing codes and techniques."
  }
];

// Gallery Images
export const galleryImages: any[] = [];

// Team Members (optional)
export const teamMembers: any[] = [];

export default siteConfig;
