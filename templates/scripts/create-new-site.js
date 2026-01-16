#!/usr/bin/env node

/**
 * GHL Client Website Generator
 *
 * This script:
 * 1. Prompts for client information and business type
 * 2. Copies the base template to trades/ or services/ folder
 * 3. Replaces all tokens with client configuration
 * 4. Sets up the project ready for development
 *
 * Usage:
 *   node scripts/create-site.js
 *   node scripts/create-site.js --name "Acme Plumbing" --type trades
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const TEMPLATES_DIR = path.resolve(__dirname, '..');
const BASE_TEMPLATE = path.join(TEMPLATES_DIR, 'new', 'apps', 'frontend');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt, defaultValue = '') {
  const displayPrompt = defaultValue
    ? `${prompt} ${colors.dim}(${defaultValue})${colors.reset}: `
    : `${prompt}: `;

  return new Promise((resolve) => {
    rl.question(displayPrompt, (answer) => {
      // Sanitize input: remove backslashes, escape sequences, and control characters
      let sanitized = (answer || '').trim();
      // Remove backslashes that could break JSON/JS strings
      sanitized = sanitized.replace(/\\/g, '');
      // Remove control characters (except newlines which are already trimmed)
      sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
      resolve(sanitized || defaultValue);
    });
  });
}

// Business types - determines folder location
const businessTypes = {
  trades: {
    name: 'Trades / Subcontractors',
    folder: 'trades',
    description: 'HVAC, Plumbing, Electrical, Roofing contractors',
    industries: ['hvac', 'plumbing', 'electrical', 'roofing', 'general-contractor'],
  },
  services: {
    name: 'Home Services',
    folder: 'services',
    description: 'Cleaning, Landscaping, Pool, Pest Control, etc.',
    industries: ['mold-remediation', 'restoration', 'carpet-cleaning', 'pool-service', 'landscaping', 'pest-control', 'cleaning', 'painting', 'flooring', 'fencing'],
  },
};

// Industry presets
const industryPresets = {
  // Trades
  hvac: {
    type: 'HVAC',
    slug: 'hvac',
    serviceNoun: 'Services',
    serviceVerb: 'repair',
    emergencyService: true,
    schemaType: 'HVACBusiness',
    services: [
      {
        name: 'AC Repair',
        slug: 'ac-repair',
        shortDescription: 'Fast, reliable air conditioning repair services.',
        longDescription: "Our expert AC repair service quickly diagnoses and fixes all cooling issues, from refrigerant leaks to compressor failures. We restore comfort to your home efficiently, ensuring your system operates at peak performance during the hottest days.",
        featured: true
      },
      {
        name: 'AC Installation',
        slug: 'ac-installation',
        shortDescription: 'Professional AC system installation.',
        longDescription: "We provide professional AC installation for energy-efficient systems tailored to your home's needs. Our team ensures proper sizing and seamless integration for maximum comfort and savings.",
        featured: true
      },
      {
        name: 'Heating Repair',
        slug: 'heating-repair',
        shortDescription: 'Expert heating system repair services.',
        longDescription: "Don't let the cold inside. Our heating repair specialists troubleshoot and repair furnaces and heat pumps promptly, ensuring your home stays warm and safe throughout the winter.",
        featured: true
      },
      {
        name: 'Furnace Installation',
        slug: 'furnace-installation',
        shortDescription: 'Quality furnace installation and replacement.',
        longDescription: "Upgrade your comfort with our top-tier furnace installation services. We install reliable, high-efficiency heating systems that provide consistent warmth and lower energy bills."
      },
      {
        name: 'HVAC Maintenance',
        slug: 'hvac-maintenance',
        shortDescription: 'Preventive maintenance to keep your system running.',
        longDescription: "Extend the life of your system with our comprehensive HVAC maintenance. Regular tune-ups prevent costly breakdowns, improve efficiency, and ensure cleaner air for your family."
      },
      {
        name: 'Duct Cleaning',
        slug: 'duct-cleaning',
        shortDescription: 'Professional air duct cleaning services.',
        longDescription: "Breathe easier with our professional duct cleaning services. We remove dust, allergens, and debris from your air ducts, improving indoor air quality and system efficiency."
      },
    ],
    faq: [
      { question: 'How often should I service my HVAC system?', answer: 'We recommend servicing your HVAC system twice a year—once before summer for cooling and once before winter for heating.' },
      { question: 'What are signs my AC needs repair?', answer: 'Common signs include weak airflow, warm air, unusual noises, high energy bills, and frequent cycling.' },
      { question: 'Do you offer emergency HVAC services?', answer: 'Yes! We offer 24/7 emergency service for urgent heating and cooling issues.' },
    ],
  },
  plumbing: {
    type: 'Plumbing',
    slug: 'plumbing',
    serviceNoun: 'Services',
    serviceVerb: 'repair',
    emergencyService: true,
    schemaType: 'Plumber',
    services: [
      {
        name: 'Drain Cleaning',
        slug: 'drain-cleaning',
        shortDescription: 'Professional drain cleaning and unclogging services.',
        longDescription: "Our thorough drain cleaning service removes stubborn clogs and buildup, restoring proper flow to your plumbing. We use advanced tools to clear blockages safely and effectively.",
        featured: true
      },
      {
        name: 'Water Heater Repair',
        slug: 'water-heater-repair',
        shortDescription: 'Expert water heater repair and maintenance.',
        longDescription: "Experiencing water heater issues? Our technicians repair all makes and models, restoring hot water quickly. We address leaks, heating element failures, and thermostat issues.",
        featured: true
      },
      {
        name: 'Water Heater Installation',
        slug: 'water-heater-installation',
        shortDescription: 'New water heater installation services.',
        longDescription: "Upgrade to a new, efficient water heater. We install traditional tank and tankless systems, ensuring reliable hot water and energy savings for your home.",
        featured: true
      },
      {
        name: 'Leak Detection',
        slug: 'leak-detection',
        shortDescription: 'Advanced leak detection technology.',
        longDescription: "Hidden leaks can cause major damage. Our non-invasive leak detection technology pinpoints the exact location of leaks, allowing us to repair them with minimal disruption."
      },
      {
        name: 'Pipe Repair',
        slug: 'pipe-repair',
        shortDescription: 'Reliable pipe repair and replacement.',
        longDescription: "From burst pipes to corrosion, our pipe repair services address all types of piping issues. We ensure watertight, durable repairs to protect your home from water damage."
      },
      {
        name: 'Sewer Line Services',
        slug: 'sewer-line-services',
        shortDescription: 'Complete sewer line inspection and repair.',
        longDescription: "We offer complete sewer line inspection, repair, and replacement. Using camera inspections, we identify issues and provide effective solutions for your sewer system."
      },
    ],
    faq: [
      { question: 'What should I do in a plumbing emergency?', answer: 'Turn off your main water shut-off valve and call us immediately—we offer 24/7 emergency plumbing services.' },
      { question: 'How can I prevent clogged drains?', answer: 'Avoid putting grease, coffee grounds, and food scraps down drains. Use drain screens and schedule annual drain cleaning.' },
      { question: 'When should I replace my water heater?', answer: 'Most water heaters last 10-15 years. Signs include rust-colored water, strange noises, leaks, or inconsistent hot water.' },
    ],
  },
  electrical: {
    type: 'Electrical',
    slug: 'electrical',
    serviceNoun: 'Services',
    serviceVerb: 'repair',
    emergencyService: true,
    schemaType: 'Electrician',
    services: [
      {
        name: 'Electrical Repairs',
        slug: 'electrical-repairs',
        shortDescription: 'Safe and reliable electrical repair services.',
        longDescription: "Our licensed electricians handle all electrical repairs safely and efficiently. From flickering lights to faulty wiring, we troubleshoot and fix issues to ensure your home's safety.",
        featured: true
      },
      {
        name: 'Panel Upgrades',
        slug: 'panel-upgrades',
        shortDescription: 'Electrical panel upgrade and replacement.',
        longDescription: "Modernize your home's power system with an electrical panel upgrade. We replace outdated panels to handle increased electrical loads, enhancing safety and performance.",
        featured: true
      },
      {
        name: 'Lighting Installation',
        slug: 'lighting-installation',
        shortDescription: 'Indoor and outdoor lighting installation.',
        longDescription: "Transform your space with professional lighting installation. We install recessed lighting, chandeliers, and outdoor fixtures to enhance the beauty and functionality of your home.",
        featured: true
      },
      {
        name: 'Outlet & Switch Installation',
        slug: 'outlet-switch-installation',
        shortDescription: 'New outlet and switch installation.',
        longDescription: "Add convenience and safety with new outlets and switches. We install GFCIs, USB outlets, and dimmers, upgrading your home's electrical accessibility."
      },
      {
        name: 'Ceiling Fan Installation',
        slug: 'ceiling-fan-installation',
        shortDescription: 'Professional ceiling fan installation.',
        longDescription: "Stay cool and comfortable with our ceiling fan installation services. We ensure secure mounting and proper wiring for optimal performance and safety."
      },
      {
        name: 'Electrical Inspections',
        slug: 'electrical-inspections',
        shortDescription: 'Comprehensive electrical safety inspections.',
        longDescription: "Ensure your home's electrical system is up to code with our comprehensive inspections. We identify potential hazards and recommend solutions for a safe home."
      },
    ],
    faq: [
      { question: 'What are signs of electrical problems?', answer: 'Warning signs include flickering lights, frequent breaker trips, burning smells, sparking outlets, and warm switch plates.' },
      { question: 'How often should I have an electrical inspection?', answer: 'We recommend an inspection every 3-5 years for homes, or whenever you purchase a new home.' },
      { question: 'Do you handle emergency electrical work?', answer: 'Yes! We provide 24/7 emergency electrical services.' },
    ],
  },
  roofing: {
    type: 'Roofing',
    slug: 'roofing',
    serviceNoun: 'Services',
    serviceVerb: 'repair',
    emergencyService: true,
    schemaType: 'RoofingContractor',
    services: [
      {
        name: 'Roof Repair',
        slug: 'roof-repair',
        shortDescription: 'Expert roof repair for all roof types.',
        longDescription: "Our roof repair experts fix leaks, missing shingles, and structural damage. We extend the life of your roof and protect your home from the elements with quality repairs.",
        featured: true
      },
      {
        name: 'Roof Replacement',
        slug: 'roof-replacement',
        shortDescription: 'Complete roof replacement services.',
        longDescription: "When it's time for a new roof, trust our professional replacement services. We install durable, high-quality roofing systems that enhance curb appeal and value.",
        featured: true
      },
      {
        name: 'Roof Inspection',
        slug: 'roof-inspection',
        shortDescription: 'Comprehensive roof inspection and assessment.',
        longDescription: "Get a clear picture of your roof's condition with our detailed inspections. We identify potential issues early, helping you plan for maintenance and avoid costly repairs.",
        featured: true
      },
      {
        name: 'Storm Damage Repair',
        slug: 'storm-damage-repair',
        shortDescription: 'Emergency storm damage repair services.',
        longDescription: "We provide rapid response for storm-damaged roofs. From wind to hail damage, our team repairs and restores your roof to protect your home from further weather impact."
      },
      {
        name: 'Gutter Services',
        slug: 'gutter-services',
        shortDescription: 'Gutter installation, repair, and cleaning.',
        longDescription: "Keep your home safe from water damage with our gutter services. We install, repair, and clean gutters to ensure proper water drainage away from your foundation."
      },
      {
        name: 'Commercial Roofing',
        slug: 'commercial-roofing',
        shortDescription: 'Commercial roofing solutions.',
        longDescription: "We offer specialized roofing solutions for commercial properties. Our team handles flat roofs, TPO, and other commercial systems with expert care and precision."
      },
    ],
    faq: [
      { question: 'How do I know if I need a new roof?', answer: 'Signs include missing or curling shingles, granules in gutters, visible daylight through roof boards, and age over 20 years.' },
      { question: 'Does insurance cover storm damage?', answer: 'Most homeowner\'s policies cover storm damage. We work directly with insurance companies.' },
      { question: 'How long does a roof replacement take?', answer: 'Most residential roof replacements take 1-3 days, depending on size and complexity.' },
    ],
  },
  'general-contractor': {
    type: 'General Contractor',
    slug: 'general-contractor',
    serviceNoun: 'Services',
    serviceVerb: 'build',
    emergencyService: false,
    schemaType: 'GeneralContractor',
    services: [
      {
        name: 'Home Remodeling',
        slug: 'home-remodeling',
        shortDescription: 'Complete home remodeling services.',
        longDescription: "Transform your living space with our full-service home remodeling. We manage every aspect of your project, delivering high-quality craftsmanship and your dream home.",
        featured: true
      },
      {
        name: 'Kitchen Remodeling',
        slug: 'kitchen-remodeling',
        shortDescription: 'Custom kitchen design and renovation.',
        longDescription: "Create the kitchen of your dreams. Our custom kitchen remodeling services include design, cabinetry, countertops, and appliances for a beautiful, functional space.",
        featured: true
      },
      {
        name: 'Bathroom Remodeling',
        slug: 'bathroom-remodeling',
        shortDescription: 'Beautiful bathroom transformations.',
        longDescription: "Update your bathroom with our expert remodeling services. From modern fixtures to tile work, we create relaxing, stylish bathrooms tailored to your needs.",
        featured: true
      },
      {
        name: 'Room Additions',
        slug: 'room-additions',
        shortDescription: 'Expand your living space with additions.',
        longDescription: "Need more space? Our room addition services expand your home seamlessly. We handle everything from design to construction, giving you the extra room you need."
      },
      {
        name: 'Deck & Patio',
        slug: 'deck-patio',
        shortDescription: 'Custom deck and patio construction.',
        longDescription: "Enhance your outdoor living with a custom deck or patio. We design and build durable, attractive outdoor spaces perfect for relaxation and entertaining."
      },
      {
        name: 'Commercial Construction',
        slug: 'commercial-construction',
        shortDescription: 'Commercial building and renovation.',
        longDescription: "We provide reliable commercial construction services for businesses. From tenant improvements to new builds, we deliver quality projects on time and on budget."
      },
    ],
    faq: [
      { question: 'How do I get started on a remodeling project?', answer: 'Start with a free consultation. We\'ll discuss your vision, assess the space, and provide a detailed estimate.' },
      { question: 'Do you handle permits?', answer: 'Yes! We handle all necessary permits and inspections.' },
      { question: 'How long does a typical remodel take?', answer: 'Timeline varies by project scope. A bathroom remodel might take 2-3 weeks, while a full kitchen could take 6-8 weeks.' },
    ],
  },
  // Services
  'mold-remediation': {
    type: 'Mold Remediation',
    slug: 'mold-remediation',
    serviceNoun: 'Services',
    serviceVerb: 'remove',
    emergencyService: true,
    schemaType: 'HomeAndConstructionBusiness',
    services: [
      {
        name: 'Mold Inspection',
        slug: 'mold-inspection',
        shortDescription: 'Comprehensive mold testing and inspection.',
        longDescription: "Our comprehensive mold testing and inspection services identify hidden mold growth and moisture sources. We use advanced detection equipment to ensure your home is safe and mold-free.",
        featured: true
      },
      {
        name: 'Mold Removal',
        slug: 'mold-removal',
        shortDescription: 'Safe and thorough mold remediation.',
        longDescription: "Safe and thorough mold remediation is our specialty. We contain the area, remove contaminated materials, and treat surfaces to prevent future growth, restoring a healthy environment.",
        featured: true
      },
      {
        name: 'Water Damage Restoration',
        slug: 'water-damage',
        shortDescription: 'Complete water damage restoration services.',
        longDescription: "Mold often follows water damage. Our restoration services address the root cause, drying out affected areas and repairing damage to prevent mold recurrence.",
        featured: true
      },
      {
        name: 'Air Quality Testing',
        slug: 'air-quality-testing',
        shortDescription: 'Indoor air quality assessment.',
        longDescription: "Breathe easier with our indoor air quality assessment. We test for mold spores and other allergens, providing detailed reports and recommendations for improvement."
      },
    ],
    faq: [
      { question: 'How do I know if I have mold?', answer: 'Signs include musty odors, visible growth, water stains, and allergy symptoms that worsen at home.' },
      { question: 'Is mold dangerous?', answer: 'Some molds can cause health issues, especially for those with allergies or respiratory conditions. Professional assessment is recommended.' },
    ],
  },
  restoration: {
    type: 'Restoration',
    slug: 'restoration',
    serviceNoun: 'Services',
    serviceVerb: 'restore',
    emergencyService: true,
    schemaType: 'HomeAndConstructionBusiness',
    services: [
      {
        name: 'Water Damage Restoration',
        slug: 'water-damage',
        shortDescription: '24/7 water damage emergency response.',
        longDescription: "We offer 24/7 emergency response for water damage. Our team extracts water, dries structures, and restores your property to pre-loss condition quickly and effectively.",
        featured: true
      },
      {
        name: 'Fire Damage Restoration',
        slug: 'fire-damage',
        shortDescription: 'Complete fire and smoke damage restoration.',
        longDescription: "Recovering from a fire is difficult. We handle smoke and soot removal, deodorization, and structural repairs to restore your home and peace of mind.",
        featured: true
      },
      {
        name: 'Storm Damage Restoration',
        slug: 'storm-damage',
        shortDescription: 'Emergency storm damage repair.',
        longDescription: "When storms strike, we are here to help. From wind damage to flooding, our emergency restoration services secure your property and begin repairs immediately.",
        featured: true
      },
      {
        name: 'Contents Restoration',
        slug: 'contents-restoration',
        shortDescription: 'Salvage and restore your belongings.',
        longDescription: "We don't just restore buildings; we save belongings too. Our contents restoration service cleans and deodorizes furniture, electronics, and personal items affected by disaster."
      },
    ],
    faq: [
      { question: 'What should I do after water damage?', answer: 'Turn off water source if possible, avoid electrical hazards, and call us immediately. Time is critical to prevent mold.' },
      { question: 'Do you work with insurance?', answer: 'Yes! We work directly with all major insurance companies and can help with the claims process.' },
    ],
  },
  'carpet-cleaning': {
    type: 'Carpet & Tile Cleaning',
    slug: 'carpet-cleaning',
    serviceNoun: 'Services',
    serviceVerb: 'clean',
    emergencyService: false,
    schemaType: 'HomeAndConstructionBusiness',
    services: [
      {
        name: 'Carpet Cleaning',
        slug: 'carpet-cleaning',
        shortDescription: 'Deep carpet cleaning for homes and businesses.',
        longDescription: "Revitalize your carpets with our deep cleaning services. We remove tough stains, dirt, and allergens using eco-friendly solutions, leaving your carpets fresh and soft.",
        featured: true
      },
      {
        name: 'Tile & Grout Cleaning',
        slug: 'tile-grout-cleaning',
        shortDescription: 'Restore your tile and grout to like-new condition.',
        longDescription: "Restore the shine to your floors. Our specialized tile and grout cleaning removes embedded dirt and grime that regular mopping can't reach, making surfaces look new again.",
        featured: true
      },
      {
        name: 'Upholstery Cleaning',
        slug: 'upholstery-cleaning',
        shortDescription: 'Professional furniture cleaning.',
        longDescription: "Extend the life of your furniture with professional upholstery cleaning. We safely clean all fabric types, removing stains and odors to refresh your living space.",
        featured: true
      },
      {
        name: 'Area Rug Cleaning',
        slug: 'area-rug-cleaning',
        shortDescription: 'Specialty cleaning for all rug types.',
        longDescription: "We provide specialized care for area rugs, from wool to synthetic. our gentle but effective cleaning preserves colors and fibers while removing deep-set dirt."
      },
    ],
    faq: [
      { question: 'How often should I clean my carpets?', answer: 'We recommend professional cleaning every 12-18 months for most homes, more often for homes with pets or allergies.' },
      { question: 'How long does carpet take to dry?', answer: 'With our low-moisture cleaning method, carpets typically dry within 2-4 hours.' },
    ],
  },
  'pool-service': {
    type: 'Pool Service',
    slug: 'pool-service',
    serviceNoun: 'Services',
    serviceVerb: 'maintain',
    emergencyService: false,
    schemaType: 'HomeAndConstructionBusiness',
    services: [
      {
        name: 'Weekly Pool Maintenance',
        slug: 'weekly-maintenance',
        shortDescription: 'Complete weekly pool care service.',
        longDescription: "Enjoy a pristine pool without the work. Our weekly maintenance includes skimming, vacuuming, chemical balancing, and equipment checks for a sparkling clean pool.",
        featured: true
      },
      {
        name: 'Pool Equipment Repair',
        slug: 'equipment-repair',
        shortDescription: 'Pump, filter, and heater repairs.',
        longDescription: "Keep your pool running smoothly with our equipment repair services. We fix pumps, filters, heaters, and automation systems to ensure optimal performance.",
        featured: true
      },
      {
        name: 'Pool Opening & Closing',
        slug: 'opening-closing',
        shortDescription: 'Seasonal pool preparation.',
        longDescription: "Make seasonal transitions easy. We handle professional pool opening in spring and winterization in fall, protecting your investment year-round.",
        featured: true
      },
      {
        name: 'Pool Remodeling',
        slug: 'pool-remodeling',
        shortDescription: 'Pool renovation and resurfacing.',
        longDescription: "Transform your pool with our remodeling services. From resurfacing and tile replacement to adding water features, we upgrade your pool's aesthetics and functionality."
      },
    ],
    faq: [
      { question: 'How often should I have my pool serviced?', answer: 'We recommend weekly service to maintain proper chemistry and equipment function.' },
      { question: 'When should I open my pool for summer?', answer: 'In most areas, opening in late April to early May is ideal when temperatures consistently reach 70°F.' },
    ],
  },
  landscaping: {
    type: 'Landscaping',
    slug: 'landscaping',
    serviceNoun: 'Services',
    serviceVerb: 'design',
    emergencyService: false,
    schemaType: 'HomeAndConstructionBusiness',
    services: [
      {
        name: 'Landscape Design',
        slug: 'landscape-design',
        shortDescription: 'Custom landscape design services.',
        longDescription: "Our custom landscape design services bring your vision to life. We create beautiful, functional outdoor spaces tailored to your style and local climate.",
        featured: true
      },
      {
        name: 'Lawn Maintenance',
        slug: 'lawn-maintenance',
        shortDescription: 'Weekly lawn care and maintenance.',
        longDescription: "Keep your lawn lush and healthy with our weekly maintenance. Mowing, edging, and fertilization ensure your yard looks its best throughout the season.",
        featured: true
      },
      {
        name: 'Hardscaping',
        slug: 'hardscaping',
        shortDescription: 'Patios, walkways, and retaining walls.',
        longDescription: "Add structure and elegance with hardscaping. We design and install patios, walkways, retaining walls, and fire pits using high-quality stone and pavers.",
        featured: true
      },
      {
        name: 'Irrigation Systems',
        slug: 'irrigation',
        shortDescription: 'Sprinkler installation and repair.',
        longDescription: "Efficient watering is key to a healthy landscape. We design, install, and repair irrigation systems to ensure your plants get the right amount of water."
      },
      {
        name: 'Tree Service',
        slug: 'tree-service',
        shortDescription: 'Tree trimming, removal, and care.',
        longDescription: "Maintain the health and safety of your trees. Our certified arborists offer trimming, pruning, and removal services to protect your property and enhance curb appeal."
      },
    ],
    faq: [
      { question: 'How much does landscaping cost?', answer: 'Costs vary widely based on scope. We provide free estimates for all projects.' },
      { question: 'Do you offer maintenance plans?', answer: 'Yes! We offer weekly, bi-weekly, and monthly maintenance packages.' },
    ],
  },
  'pest-control': {
    type: 'Pest Control',
    slug: 'pest-control',
    serviceNoun: 'Services',
    serviceVerb: 'eliminate',
    emergencyService: true,
    schemaType: 'HomeAndConstructionBusiness',
    services: [
      {
        name: 'General Pest Control',
        slug: 'general-pest-control',
        shortDescription: 'Comprehensive pest elimination.',
        longDescription: "Protect your home from unwanted guests. Our comprehensive pest control eliminates ants, spiders, roaches, and more, creating a bug-free environment.",
        featured: true
      },
      {
        name: 'Termite Treatment',
        slug: 'termite-treatment',
        shortDescription: 'Complete termite inspection and treatment.',
        longDescription: "Termites cause billions in damage. Our termite inspections and treatments detect colonies early and provide long-lasting protection for your home's structure.",
        featured: true
      },
      {
        name: 'Rodent Control',
        slug: 'rodent-control',
        shortDescription: 'Mouse and rat elimination services.',
        longDescription: "Eliminate mice and rats with our effective rodent control. We seal entry points and remove pests to prevent contamination and damage to your home.",
        featured: true
      },
      {
        name: 'Mosquito Control',
        slug: 'mosquito-control',
        shortDescription: 'Yard mosquito treatment programs.',
        longDescription: "Reclaim your yard with our mosquito control services. Barrier sprays and treatment programs reduce mosquito populations, making outdoor time safe and enjoyable."
      },
    ],
    faq: [
      { question: 'Are your treatments safe for pets and children?', answer: 'Yes! We use EPA-approved products and can recommend specific precautions for your situation.' },
      { question: 'How often should I have pest control?', answer: 'We recommend quarterly treatments for ongoing protection against common pests.' },
    ],
  },
  cleaning: {
    type: 'Cleaning',
    slug: 'cleaning',
    serviceNoun: 'Services',
    serviceVerb: 'clean',
    emergencyService: false,
    schemaType: 'HomeAndConstructionBusiness',
    services: [
      {
        name: 'House Cleaning',
        slug: 'house-cleaning',
        shortDescription: 'Regular residential cleaning services.',
        longDescription: "Come home to a spotless house. Our regular cleaning services cover dusting, vacuuming, mopping, and sanitizing, giving you more time to do what you love.",
        featured: true
      },
      {
        name: 'Deep Cleaning',
        slug: 'deep-cleaning',
        shortDescription: 'Thorough top-to-bottom cleaning.',
        longDescription: "Our deep cleaning service targets hidden dirt and grime. We clean baseboards, inside appliances, and hard-to-reach areas for a truly thorough clean.",
        featured: true
      },
      {
        name: 'Move In/Out Cleaning',
        slug: 'move-cleaning',
        shortDescription: 'Make your move stress-free.',
        longDescription: "Make your move stress-free. Our move-in/out cleaning ensures your new home is ready or you get your deposit back, scrubbing every corner.",
        featured: true
      },
      {
        name: 'Commercial Cleaning',
        slug: 'commercial-cleaning',
        shortDescription: 'Office and business cleaning.',
        longDescription: "Maintain a professional image with our commercial cleaning. We keep offices, retail spaces, and facilities clean and sanitary for employees and customers."
      },
    ],
    faq: [
      { question: 'Do I need to provide cleaning supplies?', answer: 'No! We bring all our own professional-grade supplies and equipment.' },
      { question: 'How do I prepare for a cleaning?', answer: 'Just pick up personal items and clutter. We handle the rest!' },
    ],
  },
  painting: {
    type: 'Painting',
    slug: 'painting',
    serviceNoun: 'Services',
    serviceVerb: 'paint',
    emergencyService: false,
    schemaType: 'HomeAndConstructionBusiness',
    services: [
      {
        name: 'Interior Painting',
        slug: 'interior-painting',
        shortDescription: 'Transform your indoor spaces.',
        longDescription: "Transform your indoor spaces with professional interior painting. We offer color consultation, meticulous prep, and flawless finish for walls, ceilings, and trim.",
        featured: true
      },
      {
        name: 'Exterior Painting',
        slug: 'exterior-painting',
        shortDescription: 'Protect and beautify your home exterior.',
        longDescription: "Boost curb appeal and protection with exterior painting. We use high-quality, weather-resistant paints to revitalize your home's siding and trim.",
        featured: true
      },
      {
        name: 'Cabinet Painting',
        slug: 'cabinet-painting',
        shortDescription: 'Kitchen cabinet refinishing.',
        longDescription: "Update your kitchen without a full remodel. Our cabinet painting and refinishing give your cabinets a factory-like finish at a fraction of the replacement cost.",
        featured: true
      },
      {
        name: 'Commercial Painting',
        slug: 'commercial-painting',
        shortDescription: 'Business and commercial painting.',
        longDescription: "We specialize in commercial painting for businesses. Our team works efficiently to minimize downtime while delivering durable, professional results."
      },
    ],
    faq: [
      { question: 'How long does interior painting take?', answer: 'Most rooms can be completed in 1-2 days. A whole house typically takes 3-5 days.' },
      { question: 'Do you move furniture?', answer: 'Yes! We move and cover all furniture as part of our prep work.' },
    ],
  },
  flooring: {
    type: 'Flooring',
    slug: 'flooring',
    serviceNoun: 'Services',
    serviceVerb: 'install',
    emergencyService: false,
    schemaType: 'HomeAndConstructionBusiness',
    services: [
      {
        name: 'Hardwood Flooring',
        slug: 'hardwood-flooring',
        shortDescription: 'Hardwood installation and refinishing.',
        longDescription: "Add timeless elegance with hardwood flooring. We offer expert installation of solid and engineered wood, as well as refinishing to restore old floors.",
        featured: true
      },
      {
        name: 'Tile Installation',
        slug: 'tile-installation',
        shortDescription: 'Tile flooring for any room.',
        longDescription: "Upgrade your kitchen or bath with professional tile installation. We install ceramic, porcelain, and stone tile with precision alignment and grouting.",
        featured: true
      },
      {
        name: 'Luxury Vinyl Plank',
        slug: 'lvp-flooring',
        shortDescription: 'Durable LVP flooring installation.',
        longDescription: "Get the look of wood or stone with durable Luxury Vinyl Plank (LVP). Our installation guarantees a waterproof, scratch-resistant floor perfect for high-traffic areas.",
        featured: true
      },
      {
        name: 'Carpet Installation',
        slug: 'carpet-installation',
        shortDescription: 'Professional carpet installation.',
        longDescription: "Enjoy comfort and warmth with new carpet. We provide professional installation of a wide range of styles and textures to suit any room."
      },
    ],
    faq: [
      { question: 'How long does flooring installation take?', answer: 'Most rooms can be completed in 1-2 days. Hardwood refinishing may add dry time.' },
      { question: 'Do you remove old flooring?', answer: 'Yes! Removal and disposal of old flooring is included in our quotes.' },
    ],
  },
  fencing: {
    type: 'Fencing',
    slug: 'fencing',
    serviceNoun: 'Services',
    serviceVerb: 'install',
    emergencyService: false,
    schemaType: 'HomeAndConstructionBusiness',
    services: [
      {
        name: 'Wood Fencing',
        slug: 'wood-fencing',
        shortDescription: 'Classic wood fence installation.',
        longDescription: "Classic and versatile, wood fencing offers privacy and beauty. We design and install custom cedar and pine fences to define your property boundaries.",
        featured: true
      },
      {
        name: 'Vinyl Fencing',
        slug: 'vinyl-fencing',
        shortDescription: 'Low-maintenance vinyl fencing.',
        longDescription: "Choose low-maintenance vinyl fencing for durability and style. It resists rotting and fading, providing a long-lasting solution with minimal upkeep.",
        featured: true
      },
      {
        name: 'Chain Link Fencing',
        slug: 'chain-link',
        shortDescription: 'Affordable chain link solutions.',
        longDescription: "Secure your property affordably with chain link fencing. Ideal for pets and security, we offer galvanized and color-coated options.",
        featured: true
      },
      {
        name: 'Fence Repair',
        slug: 'fence-repair',
        shortDescription: 'Fence repair and replacement.',
        longDescription: "Extend the life of your fence with our repair services. We fix leaning posts, broken pickets, and sagging gates to keep your fence secure and attractive."
      },
    ],
    faq: [
      { question: 'Do I need a permit for a fence?', answer: 'Permit requirements vary by location. We handle all permit applications.' },
      { question: 'How long does fence installation take?', answer: 'Most residential fences are completed in 1-3 days.' },
    ],
  },
};

function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Copy directory recursively, excluding build artifacts
function copyDir(src, dest, excludeDirs = ['.next', 'node_modules', '.git', '.turbo', 'dist', 'build', '.cache']) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Skip excluded directories
      if (excludeDirs.includes(entry.name)) {
        continue;
      }
      copyDir(srcPath, destPath, excludeDirs);
    } else if (entry.isFile()) {
      // Only copy regular files (skip symlinks, sockets, etc.)
      try {
        fs.copyFileSync(srcPath, destPath);
      } catch (err) {
        // Skip files that can't be copied (sockets, broken symlinks, etc.)
        if (err.code !== 'ENOTSUP' && err.code !== 'ENOENT') {
          throw err;
        }
      }
    }
  }
}

// Replace tokens in file content
function replaceTokensInFile(filePath, tokenMap) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Pattern 1: {{TOKEN}} - used in most template files
  const curlBraceRegex = /\{\{([A-Z_]+)\}\}/g;
  content = content.replace(curlBraceRegex, (match, token) => {
    return tokenMap.hasOwnProperty(token) ? tokenMap[token] : match;
  });

  // Pattern 2: __TOKEN__ - used in CSS files where curly braces cause issues
  const underscoreRegex = /__([A-Z_]+)__/g;
  content = content.replace(underscoreRegex, (match, token) => {
    return tokenMap.hasOwnProperty(token) ? tokenMap[token] : match;
  });

  const originalContent = fs.readFileSync(filePath, 'utf-8');
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  }
  return false;
}

// Process all files recursively
function processFiles(dir, tokenMap, stats = { modified: 0, processed: 0 }) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const excludeDirs = ['node_modules', '.next', '.git'];
  const includeExts = ['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.md', '.html'];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!excludeDirs.includes(entry.name)) {
        processFiles(fullPath, tokenMap, stats);
      }
    } else {
      const ext = path.extname(entry.name);
      if (includeExts.includes(ext) && entry.name !== 'package-lock.json') {
        stats.processed++;
        if (replaceTokensInFile(fullPath, tokenMap)) {
          stats.modified++;
        }
      }
    }
  }

  return stats;
}

// Flatten config to token map
function configToTokenMap(config) {
  const tokenMap = {};

  function flatten(obj, prefix = '') {
    for (const [key, value] of Object.entries(obj)) {
      const tokenKey = prefix ? `${prefix}_${key}` : key;

      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        flatten(value, tokenKey);
      } else if (Array.isArray(value)) {
        tokenMap[tokenKey.toUpperCase() + '_JSON'] = JSON.stringify(value, null, 2);
      } else {
        tokenMap[tokenKey.toUpperCase()] = String(value);
      }
    }
  }

  flatten(config);

  // Add explicit aliases for template tokens that don't match the flattened keys
  // These map the template token names to the actual config values

  // Site URL (template uses SITE_URL, flatten creates SITEURL)
  tokenMap['SITE_URL'] = config.siteUrl || '';

  // SEO tokens (template uses META_*, flatten creates SEO_META*)
  tokenMap['META_DESCRIPTION'] = config.seo?.metaDescription || '';
  tokenMap['META_KEYWORDS'] = config.seo?.metaKeywords || '';
  tokenMap['GOOGLE_ANALYTICS_ID'] = config.seo?.googleAnalyticsId || '';

  // Industry tokens (template uses INDUSTRY_*, but schemaType becomes INDUSTRY_SCHEMATYPE)
  tokenMap['SCHEMA_BUSINESS_TYPE'] = config.industry?.schemaType || 'LocalBusiness';

  // Reviews tokens  
  tokenMap['RATING_VALUE'] = config.reviews?.rating || '4.9';
  tokenMap['REVIEW_COUNT'] = config.reviews?.count || '100';
  tokenMap['GOOGLE_REVIEW_LINK'] = config.reviews?.googleReviewLink || '';

  // Branding tokens
  tokenMap['LOGO_URL'] = config.branding?.logoUrl || '';
  tokenMap['PRIMARY_COLOR'] = config.branding?.primaryColor || '#2563eb';
  tokenMap['SECONDARY_COLOR'] = config.branding?.secondaryColor || '#1e40af';
  tokenMap['ACCENT_COLOR'] = config.branding?.accentColor || '#f59e0b';
  tokenMap['HEADER_FOOTER_BG'] = config.branding?.headerFooterBg || '#1e293b';
  tokenMap['HEADER_FOOTER_TEXT'] = config.branding?.headerFooterText || '#ffffff';
  tokenMap['HERO_BG_FROM'] = config.branding?.heroBgFrom || ''; // Empty = default gradient
  tokenMap['HERO_BG_TO'] = config.branding?.heroBgTo || ''; // Empty = default gradient
  tokenMap['HERO_PATTERN'] = config.branding?.heroPattern || 'none'; // Default = no pattern

  // Company icon/tagline tokens with smart defaults based on industry
  const industryIcons = {
    'hvac': '❄️',
    'plumbing': '🔧',
    'electrical': '⚡',
    'roofing': '🏠',
    'general-contractor': '🔨',
    'mold-remediation': '🧹',
    'restoration': '🏗️',
    'carpet-cleaning': '✨',
    'pool-service': '🏊',
    'landscaping': '🌿',
    'pest-control': '🐛',
    'cleaning': '🧽',
    'painting': '🎨',
    'flooring': '🪵',
    'fencing': '🚧',
  };
  const defaultIcon = industryIcons[config.industry?.slug] || '🏢';
  tokenMap['COMPANY_ICON'] = config.branding?.icon || defaultIcon;
  tokenMap['COMPANY_TAGLINE'] = config.branding?.tagline || `Professional ${config.industry?.type || 'Services'}`;

  // GHL tokens
  tokenMap['GHL_FORM_EMBED'] = config.ghl?.formEmbed || '';
  tokenMap['GHL_CALENDAR_EMBED'] = config.ghl?.calendarEmbed || '';
  tokenMap['GHL_CHAT_WIDGET'] = config.ghl?.chatWidget || '';
  tokenMap['GHL_WEBHOOK_URL'] = config.ghl?.webhookUrl || '#';

  // Service areas (convert array/string to comma-separated)
  const areasValue = config.serviceArea?.areas;
  tokenMap['SERVICE_AREAS'] = Array.isArray(areasValue)
    ? areasValue.join(', ')
    : (areasValue || '');
  tokenMap['SERVICE_RADIUS'] = config.serviceArea?.radius || '30';
  tokenMap['PRIMARY_CITY'] = config.serviceArea?.primaryCity || config.company?.city || '';

  // Hours tokens
  tokenMap['HOURS_WEEKDAYS'] = config.hours?.weekdays || '8:00 AM - 6:00 PM';
  tokenMap['HOURS_SATURDAY'] = config.hours?.saturday || '9:00 AM - 4:00 PM';
  tokenMap['HOURS_SUNDAY'] = config.hours?.sunday || 'Closed';
  tokenMap['EMERGENCY_NOTE'] = config.hours?.emergencyNote || '';
  tokenMap['EMERGENCY_HOURS_NOTE'] = config.hours?.emergencyNote || '';
  tokenMap['EMERGENCY_SERVICE'] = String(config.industry?.emergencyService || false);

  // Company tokens (ensure defaults)
  tokenMap['YEARS_IN_BUSINESS'] = config.company?.yearsInBusiness || '1';

  // Ensure JSON arrays are available as separate tokens
  tokenMap['SERVICES_JSON'] = JSON.stringify(config.services || [], null, 2);
  tokenMap['TESTIMONIALS_JSON'] = JSON.stringify(config.testimonials || [], null, 2);
  tokenMap['FAQ_JSON'] = JSON.stringify(config.faq || [], null, 2);
  tokenMap['GALLERY_JSON'] = JSON.stringify(config.gallery || [], null, 2);
  tokenMap['TEAM_JSON'] = JSON.stringify(config.team || [], null, 2);

  // Login page value proposition tokens
  // Use the first service's short description for the headline
  const firstService = config.services?.[0];
  tokenMap['VALUE_PROP_HEADLINE'] = firstService?.shortDescription || `Professional ${config.industry?.type || 'Services'}`;
  tokenMap['VALUE_PROP_DESCRIPTION'] = ''; // Empty by default

  return tokenMap;
}

// Set up database with company and admin user
async function setupDatabase(databaseUrl, companyData, adminEmail, schemaName = 'public') {
  if (!databaseUrl) {
    log('⚠️  No database URL provided, skipping database setup', 'yellow');
    return null;
  }

  log('\n🗄️  SETTING UP DATABASE', 'yellow');
  log('─'.repeat(50), 'dim');

  // Check if this is a local database
  let isLocalDatabase = false;
  try {
    const url = new URL(databaseUrl);
    const host = url.hostname;
    isLocalDatabase = host === 'localhost' || host === '127.0.0.1' || host === 'postgres' || host === 'db';
  } catch (e) {
    log('Could not parse DATABASE_URL', 'red');
  }

  // Add sslmode for remote databases
  let secureConnectionString = databaseUrl;
  if (!isLocalDatabase && !databaseUrl.includes('sslmode=')) {
    secureConnectionString += (databaseUrl.includes('?') ? '&' : '?') + 'sslmode=require';
  }

  const url = new URL(secureConnectionString);
  const pool = new Pool({
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    ssl: isLocalDatabase ? false : { rejectUnauthorized: false },
  });

  try {
    // Set search path
    const client = await pool.connect();
    await client.query(`SET search_path TO ${schemaName}, public`);

    log('Connected to database', 'dim');

    // Check if company already exists
    const existingCompany = await client.query(
      'SELECT id FROM companies WHERE name = $1',
      [companyData.name]
    );

    let companyId;

    if (existingCompany.rows.length > 0) {
      companyId = existingCompany.rows[0].id;
      log(`✓ Company "${companyData.name}" already exists (ID: ${companyId})`, 'green');
    } else {
      // Insert company
      const companyResult = await client.query(
        `INSERT INTO companies (name, "addressLine1", city, state, zip, email, phone, industry, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         RETURNING id`,
        [
          companyData.name,
          companyData.address,
          companyData.city,
          companyData.state,
          companyData.zip,
          companyData.email,
          companyData.phone,
          companyData.industry
        ]
      );
      companyId = companyResult.rows[0].id;
      log(`✓ Company "${companyData.name}" created (ID: ${companyId})`, 'green');
    }

    // Check if admin user already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [adminEmail]
    );

    let userId;

    if (existingUser.rows.length > 0) {
      userId = existingUser.rows[0].id;
      log(`✓ Admin user "${adminEmail}" already exists (ID: ${userId})`, 'green');

      // Update roles to include Site Admin if not present
      await client.query(
        `UPDATE users SET roles = CASE
           WHEN 'Site Admin' = ANY(roles) THEN roles
           ELSE array_append(roles, 'Site Admin')
         END
         WHERE id = $1`,
        [userId]
      );
    } else {
      // Hash password
      const hashedPassword = await bcrypt.hash('admin123', 10);

      // Insert admin user
      const userResult = await client.query(
        `INSERT INTO users (email, "firstName", "lastName", password, roles, "emailNotify", "smsNotify", theme, status, "companyName", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
         RETURNING id`,
        [
          adminEmail,
          'Admin',
          'User',
          hashedPassword,
          ['Admin'],
          true,
          false,
          'dark',
          'active',
          companyData.name
        ]
      );
      userId = userResult.rows[0].id;
      log(`✓ Admin user "${adminEmail}" created (ID: ${userId}) with password: admin123`, 'green');
    }

    // Check if user-company association exists
    const existingAssociation = await client.query(
      'SELECT id FROM company_users WHERE "companyId" = $1 AND "userId" = $2',
      [companyId, userId]
    );

    if (existingAssociation.rows.length === 0) {
      // Link user to company
      await client.query(
        `INSERT INTO company_users ("companyId", "userId", "createdAt", "updatedAt")
         VALUES ($1, $2, NOW(), NOW())`,
        [companyId, userId]
      );
      log(`✓ Admin user linked to company`, 'green');
    } else {
      log(`✓ Admin user already linked to company`, 'green');
    }

    client.release();
    await pool.end();

    return { companyId, userId };
  } catch (error) {
    log(`Error setting up database: ${error.message}`, 'red');
    if (error.stack) {
      log(`Stack trace: ${error.stack}`, 'dim');
    }
    if (error.code) {
      log(`Error code: ${error.code}`, 'dim');
    }
    try {
      await pool.end();
    } catch (poolError) {
      // Ignore pool cleanup errors
    }
    return null;
  }
}

async function main() {
  console.clear();
  log('\n═══════════════════════════════════════════════════════════════', 'cyan');
  log('           🏗️  GHL Client Website Generator                     ', 'bold');
  log('═══════════════════════════════════════════════════════════════\n', 'cyan');

  // Check if base template exists
  if (!fs.existsSync(BASE_TEMPLATE)) {
    log(`Error: Base template not found at ${BASE_TEMPLATE}`, 'red');
    process.exit(1);
  }

  log('This wizard will create a new client website from the template.\n', 'dim');

  // Business Type Selection
  log('📁 BUSINESS TYPE', 'yellow');
  log('─'.repeat(50), 'dim');
  log('1. Trades / Subcontractors (HVAC, Plumbing, Electrical, Roofing)', 'dim');
  log('2. Home Services (Cleaning, Landscaping, Pool, Pest Control, etc.)\n', 'dim');

  const businessTypeChoice = await question('Select business type (1 or 2)', '1');
  const businessType = businessTypeChoice === '2' ? 'services' : 'trades';
  const businessTypeInfo = businessTypes[businessType];

  log(`\n✓ Selected: ${businessTypeInfo.name}\n`, 'green');

  // Company Information
  log('📋 COMPANY INFORMATION', 'yellow');
  log('─'.repeat(50), 'dim');

  const companyName = await question('Company Name');
  const companySlug = await question('Company Slug (for URLs/folder)', generateSlug(companyName));
  const companyPhone = await question('Phone Number (10 digits)');
  const companyEmail = await question('Email Address');
  const companyAddress = await question('Street Address');
  const companyCity = await question('City');
  const companyState = await question('State (2 letter)', 'CA');
  const companyStateFullName = await question('State Full Name', 'California');
  const companyZip = await question('ZIP Code');
  const companyLicense = await question('License Number (optional)');
  const yearsInBusiness = await question('Years in Business', '10');

  // Industry Selection
  console.log();
  log('🏭 INDUSTRY SELECTION', 'yellow');
  log('─'.repeat(50), 'dim');
  log('Available industries:', 'dim');

  const availableIndustries = businessTypeInfo.industries;
  availableIndustries.forEach((key, i) => {
    const preset = industryPresets[key];
    log(`  ${i + 1}. ${preset.type}`, 'dim');
  });

  const industryChoice = await question(`Select industry (1-${availableIndustries.length})`, '1');
  const selectedIndustryKey = availableIndustries[parseInt(industryChoice) - 1] || availableIndustries[0];
  const industry = industryPresets[selectedIndustryKey];

  log(`\n✓ Selected: ${industry.type}\n`, 'green');

  // Branding
  log('🎨 BRANDING', 'yellow');
  log('─'.repeat(50), 'dim');

  const primaryColor = await question('Primary Color (hex)', '#2563eb');
  const secondaryColor = await question('Secondary Color (hex)', '#1e40af');
  const accentColor = await question('Accent Color (hex)', '#f59e0b');
  const headerFooterBg = await question('Header/Footer Background (hex)', '#1e293b');
  const headerFooterText = await question('Header/Footer Text Color (hex)', '#ffffff');
  const logoUrl = await question('Logo URL (optional)');

  // Service Area
  console.log();
  log('📍 SERVICE AREA', 'yellow');
  log('─'.repeat(50), 'dim');

  const serviceAreas = await question('Service Areas (comma-separated cities)', companyCity);
  const serviceRadius = await question('Service Radius (miles)', '30');

  // GHL Integration (optional)
  console.log();
  log('🔗 GHL INTEGRATION (optional - press Enter to skip)', 'yellow');
  log('─'.repeat(50), 'dim');

  const ghlFormEmbed = await question('GHL Form Embed Code');
  const ghlCalendarEmbed = await question('GHL Calendar Embed Code');
  const ghlChatWidget = await question('GHL Chat Widget Code');
  const ghlWebhookUrl = await question('GHL Webhook URL (for lead forms)');
  const ghlTrackingId = await question('GHL Tracking ID');

  // Social Links (optional)
  console.log();
  log('🌐 SOCIAL LINKS (optional)', 'yellow');
  log('─'.repeat(50), 'dim');

  const facebookUrl = await question('Facebook URL');
  const instagramUrl = await question('Instagram URL');
  const googleBusinessUrl = await question('Google Business URL');

  // SEO
  console.log();
  log('🔍 SEO & REVIEWS', 'yellow');
  log('─'.repeat(50), 'dim');

  const siteUrl = await question('Site URL', `https://${companySlug}.com`);
  const googleAnalyticsId = await question('Google Analytics ID');
  const ratingValue = await question('Google Rating (e.g., 4.9)', '4.9');
  const reviewCount = await question('Number of Reviews', '100');
  const googleReviewLink = await question('Google Review Link');

  // Business Hours
  console.log();
  log('🕐 BUSINESS HOURS', 'yellow');
  log('─'.repeat(50), 'dim');

  const hoursWeekdays = await question('Weekday Hours', '8:00 AM - 6:00 PM');
  const hoursSaturday = await question('Saturday Hours', '9:00 AM - 4:00 PM');
  const hoursSunday = await question('Sunday Hours', 'Closed');

  // Database Setup
  console.log();
  log('🗄️  DATABASE SETUP', 'yellow');
  log('─'.repeat(50), 'dim');
  log('Provide a database URL to automatically set up company and admin user.', 'dim');
  log('The admin user will be created with the company email and password: admin123', 'dim');
  log('Press Enter to use the default local database.\n', 'dim');

  const defaultDbUrl = 'postgresql://postgres:123@localhost:5432/postgres';
  const databaseUrl = await question('Database URL', defaultDbUrl);
  const databaseSchema = await question('Database Schema', 'ghl');

  rl.close();

  // Build configuration
  const config = {
    company: {
      name: companyName,
      slug: companySlug,
      phone: companyPhone,
      email: companyEmail,
      address: companyAddress,
      city: companyCity,
      state: companyState,
      stateFullName: companyStateFullName,
      zip: companyZip,
      license: companyLicense,
      yearsInBusiness: yearsInBusiness,
    },
    branding: {
      logoUrl: logoUrl,
      faviconUrl: '',
      primaryColor: primaryColor,
      secondaryColor: secondaryColor,
      accentColor: accentColor,
      headerFooterBg: headerFooterBg,
      headerFooterText: headerFooterText,
      fontHeading: 'Poppins',
      fontBody: 'Inter',
    },
    industry: industry,
    serviceArea: {
      areas: serviceAreas,
      radius: serviceRadius,
      primaryCity: companyCity,
    },
    social: {
      facebook: facebookUrl,
      instagram: instagramUrl,
      google: googleBusinessUrl,
      yelp: '',
      bbb: '',
      nextdoor: '',
    },
    ghl: {
      calendarEmbed: ghlCalendarEmbed,
      formEmbed: ghlFormEmbed,
      chatWidget: ghlChatWidget,
      webhookUrl: ghlWebhookUrl,
      trackingId: ghlTrackingId,
    },
    seo: {
      googleAnalyticsId: googleAnalyticsId,
      googleTagManagerId: '',
      facebookPixelId: '',
      metaDescription: `${companyName} provides professional ${industry.type.toLowerCase()} services in ${companyCity}, ${companyState}. ${yearsInBusiness}+ years experience. Licensed & insured. Call for a free estimate!`,
      metaKeywords: `${industry.type.toLowerCase()}, ${companyCity}, ${companyState}, ${industry.services.map(s => s.name.toLowerCase()).join(', ')}`,
    },
    siteUrl: siteUrl,
    reviews: {
      rating: ratingValue,
      count: reviewCount,
      googleReviewLink: googleReviewLink,
    },
    hours: {
      weekdays: hoursWeekdays,
      saturday: hoursSaturday,
      sunday: hoursSunday,
      emergencyNote: industry.emergencyService ? '24/7 Emergency Service Available' : '',
    },
    services: industry.services,
    testimonials: [],
    faq: industry.faq,
    gallery: [],
    team: [],
  };

  // Create destination path
  const destFolder = path.join(TEMPLATES_DIR, businessTypeInfo.folder, companySlug);

  // Check if folder already exists
  if (fs.existsSync(destFolder)) {
    log(`\n⚠️  Folder already exists: ${destFolder}`, 'yellow');
    log('Please choose a different company slug or delete the existing folder.\n', 'dim');
    process.exit(1);
  }

  // Copy template
  console.log();
  log('📦 CREATING SITE', 'yellow');
  log('─'.repeat(50), 'dim');

  log(`Copying template to: ${destFolder}`, 'dim');
  copyDir(BASE_TEMPLATE, destFolder);
  log('✓ Template copied', 'green');

  // Copy service images
  console.log();
  log('🖼️  COPYING IMAGES', 'yellow');
  log('─'.repeat(50), 'dim');
  const scriptsImagesDir = path.join(TEMPLATES_DIR, 'scripts', 'images');
  const publicImagesServicesDir = path.join(destFolder, 'public', 'images', 'services');

  // Ensure destination directory exists
  if (!fs.existsSync(publicImagesServicesDir)) {
    fs.mkdirSync(publicImagesServicesDir, { recursive: true });
  }

  // Iterate services and copy images if available
  if (config.services && Array.isArray(config.services)) {
    // Clone services to avoid mutating the original industryPresets if we want to be safe, 
    // though for this script it doesn't matter much. 
    // We will update config.services in place.
    config.services.forEach(service => {
      const imageSlug = service.slug;
      const industryImageSlug = `${config.industry.slug}-${service.slug}`;

      // Check for png
      const srcImagePng = path.join(scriptsImagesDir, `${imageSlug}.png`);
      const srcImageWebp = path.join(scriptsImagesDir, `${imageSlug}.webp`);
      const srcIndustryImagePng = path.join(scriptsImagesDir, `${industryImageSlug}.png`);
      const srcIndustryImageWebp = path.join(scriptsImagesDir, `${industryImageSlug}.webp`);

      let srcImage = null;
      let ext = '';

      if (fs.existsSync(srcIndustryImagePng)) {
        srcImage = srcIndustryImagePng;
        ext = '.png';
      } else if (fs.existsSync(srcIndustryImageWebp)) {
        srcImage = srcIndustryImageWebp;
        ext = '.webp';
      } else if (fs.existsSync(srcImagePng)) {
        srcImage = srcImagePng;
        ext = '.png';
      } else if (fs.existsSync(srcImageWebp)) {
        srcImage = srcImageWebp;
        ext = '.webp';
      }

      if (srcImage) {
        const destImage = path.join(publicImagesServicesDir, `${imageSlug}${ext}`);
        try {
          fs.copyFileSync(srcImage, destImage);
          service.image = `/images/services/${imageSlug}${ext}`;
          log(`✓ Copied image for ${service.name}`, 'dim');
        } catch (err) {
          log(`! Failed to copy image for ${service.name}: ${err.message}`, 'red');
        }
      } else {
        log(`- No image found for ${service.name} (${imageSlug})`, 'dim');
      }
    });
  }
  log('✓ Processed service images', 'green');
  console.log();

  // Save configuration
  const configPath = path.join(destFolder, 'client-config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  log('✓ Configuration saved', 'green');

  // Update package.json name
  const packagePath = path.join(destFolder, 'package.json');
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    packageJson.name = `${companySlug}-website`;
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    log('✓ Updated package.json', 'green');
  }

  // Convert config to token map and replace
  log('Replacing tokens...', 'dim');
  const tokenMap = configToTokenMap(config);
  const stats = processFiles(destFolder, tokenMap);
  log(`✓ Replaced tokens in ${stats.modified} files`, 'green');

  // Post-process config.ts to replace array placeholders with actual data
  const configFilePath = path.join(destFolder, 'data', 'config.ts');
  if (fs.existsSync(configFilePath)) {
    log('Injecting services and data arrays...', 'dim');
    let configContent = fs.readFileSync(configFilePath, 'utf-8');

    // Replace services array
    const servicesJson = JSON.stringify(config.services || [], null, 2);
    configContent = configContent.replace(
      'export const services: any[] = [];',
      `export const services: any[] = ${servicesJson};`
    );

    // Replace testimonials array
    const testimonialsJson = JSON.stringify(config.testimonials || [], null, 2);
    configContent = configContent.replace(
      'export const testimonials: any[] = [];',
      `export const testimonials: any[] = ${testimonialsJson};`
    );

    // Replace FAQ array
    const faqJson = JSON.stringify(config.faq || [], null, 2);
    configContent = configContent.replace(
      'export const faqItems: any[] = [];',
      `export const faqItems: any[] = ${faqJson};`
    );

    // Replace gallery array
    const galleryJson = JSON.stringify(config.gallery || [], null, 2);
    configContent = configContent.replace(
      'export const galleryImages: any[] = [];',
      `export const galleryImages: any[] = ${galleryJson};`
    );

    // Replace team array
    const teamJson = JSON.stringify(config.team || [], null, 2);
    configContent = configContent.replace(
      'export const teamMembers: any[] = [];',
      `export const teamMembers: any[] = ${teamJson};`
    );

    fs.writeFileSync(configFilePath, configContent);
    log('✓ Injected data arrays into config.ts', 'green');
  }

  // Set up database if URL provided
  let dbResult = null;
  if (databaseUrl) {
    dbResult = await setupDatabase(
      databaseUrl,
      {
        name: companyName,
        address: companyAddress,
        city: companyCity,
        state: companyState,
        zip: companyZip,
        email: companyEmail,
        phone: companyPhone,
        industry: selectedIndustryKey
      },
      companyEmail,
      databaseSchema
    );

    // If database setup was successful, inject the companyId into config.ts
    if (dbResult && dbResult.companyId) {
      const configFilePath = path.join(destFolder, 'data', 'config.ts');
      if (fs.existsSync(configFilePath)) {
        let configContent = fs.readFileSync(configFilePath, 'utf-8');
        // Replace the {{COMPANY_ID}} token with the actual company ID
        configContent = configContent.replace(/\{\{COMPANY_ID\}\}/g, String(dbResult.companyId));
        fs.writeFileSync(configFilePath, configContent);
        log(`✓ Injected company ID ${dbResult.companyId} into config.ts`, 'green');
      }
    }
  }

  // Summary
  console.log();
  log('═══════════════════════════════════════════════════════════════', 'cyan');
  log('                    ✅ SITE CREATED!                            ', 'green');
  log('═══════════════════════════════════════════════════════════════\n', 'cyan');

  log('📁 Location:', 'bold');
  log(`   ${destFolder}\n`, 'dim');

  log('📊 Summary:', 'bold');
  log(`   Business Type: ${businessTypeInfo.name}`, 'dim');
  log(`   Industry: ${industry.type}`, 'dim');
  log(`   Files processed: ${stats.processed}`, 'dim');
  log(`   Tokens replaced: ${stats.modified} files`, 'dim');
  if (dbResult) {
    log(`   Company ID: ${dbResult.companyId}`, 'dim');
    log(`   Admin User ID: ${dbResult.userId}`, 'dim');
    log(`   Admin Login: ${companyEmail} / admin123`, 'dim');
  }
  console.log();

  log('🚀 Next Steps:', 'bold');
  log(`   1. cd ${destFolder}`, 'dim');
  log('   2. npm install', 'dim');
  log('   3. npm run dev', 'dim');
  log('   4. Add images to public/images/', 'dim');
  log('   5. Add testimonials to client-config.json', 'dim');
  log('   6. Deploy to Vercel!\n', 'dim');
}

main().catch((error) => {
  log(`Error: ${error.message}`, 'red');
  process.exit(1);
});
