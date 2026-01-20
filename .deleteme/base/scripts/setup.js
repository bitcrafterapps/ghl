#!/usr/bin/env node

/**
 * Site Setup Script for GHL Client Websites
 *
 * Usage:
 *   node scripts/setup.js
 *
 * This interactive script:
 * 1. Prompts for client information
 * 2. Generates a client configuration file
 * 3. Runs token replacement
 * 4. Sets up the project
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

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

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Promisified question
function question(prompt, defaultValue = '') {
  const displayPrompt = defaultValue
    ? `${prompt} ${colors.dim}(${defaultValue})${colors.reset}: `
    : `${prompt}: `;

  return new Promise((resolve) => {
    rl.question(displayPrompt, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

// Industry presets
const industryPresets = {
  hvac: {
    type: 'HVAC',
    slug: 'hvac',
    serviceNoun: 'Services',
    serviceVerb: 'repair',
    emergencyService: true,
    schemaType: 'HVACBusiness',
    services: [
      { name: 'AC Repair', slug: 'ac-repair', shortDescription: 'Fast, reliable air conditioning repair services.' },
      { name: 'AC Installation', slug: 'ac-installation', shortDescription: 'Professional AC system installation.' },
      { name: 'Heating Repair', slug: 'heating-repair', shortDescription: 'Expert heating system repair services.' },
      { name: 'Furnace Installation', slug: 'furnace-installation', shortDescription: 'Quality furnace installation and replacement.' },
      { name: 'HVAC Maintenance', slug: 'hvac-maintenance', shortDescription: 'Preventive maintenance to keep your system running.' },
      { name: 'Duct Cleaning', slug: 'duct-cleaning', shortDescription: 'Professional air duct cleaning services.' },
    ],
    faq: [
      { question: 'How often should I service my HVAC system?', answer: 'We recommend servicing your HVAC system twice a year—once before summer for cooling and once before winter for heating. Regular maintenance prevents breakdowns and extends system life.' },
      { question: 'What are signs my AC needs repair?', answer: 'Common signs include weak airflow, warm air, unusual noises, high energy bills, and frequent cycling. If you notice any of these, call us for a professional inspection.' },
      { question: 'Do you offer emergency HVAC services?', answer: 'Yes! We offer 24/7 emergency service for urgent heating and cooling issues. Call us anytime—we\'re here when you need us.' },
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
      { name: 'Drain Cleaning', slug: 'drain-cleaning', shortDescription: 'Professional drain cleaning and unclogging services.' },
      { name: 'Water Heater Repair', slug: 'water-heater-repair', shortDescription: 'Expert water heater repair and maintenance.' },
      { name: 'Water Heater Installation', slug: 'water-heater-installation', shortDescription: 'New water heater installation services.' },
      { name: 'Leak Detection', slug: 'leak-detection', shortDescription: 'Advanced leak detection technology.' },
      { name: 'Pipe Repair', slug: 'pipe-repair', shortDescription: 'Reliable pipe repair and replacement.' },
      { name: 'Sewer Line Services', slug: 'sewer-line-services', shortDescription: 'Complete sewer line inspection and repair.' },
    ],
    faq: [
      { question: 'What should I do in a plumbing emergency?', answer: 'First, locate and turn off your main water shut-off valve to prevent flooding. Then call us immediately—we offer 24/7 emergency plumbing services.' },
      { question: 'How can I prevent clogged drains?', answer: 'Avoid putting grease, coffee grounds, and food scraps down drains. Use drain screens, and schedule annual drain cleaning to keep pipes clear.' },
      { question: 'When should I replace my water heater?', answer: 'Most water heaters last 10-15 years. Signs you need replacement include rust-colored water, strange noises, leaks, or inconsistent hot water.' },
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
      { name: 'Electrical Repairs', slug: 'electrical-repairs', shortDescription: 'Safe and reliable electrical repair services.' },
      { name: 'Panel Upgrades', slug: 'panel-upgrades', shortDescription: 'Electrical panel upgrade and replacement.' },
      { name: 'Lighting Installation', slug: 'lighting-installation', shortDescription: 'Indoor and outdoor lighting installation.' },
      { name: 'Outlet & Switch Installation', slug: 'outlet-switch-installation', shortDescription: 'New outlet and switch installation.' },
      { name: 'Ceiling Fan Installation', slug: 'ceiling-fan-installation', shortDescription: 'Professional ceiling fan installation.' },
      { name: 'Electrical Inspections', slug: 'electrical-inspections', shortDescription: 'Comprehensive electrical safety inspections.' },
    ],
    faq: [
      { question: 'What are signs of electrical problems?', answer: 'Warning signs include flickering lights, frequent breaker trips, burning smells, sparking outlets, and warm switch plates. If you notice any of these, call us immediately.' },
      { question: 'How often should I have an electrical inspection?', answer: 'We recommend an inspection every 3-5 years for homes, or whenever you purchase a new home. Older homes may need more frequent inspections.' },
      { question: 'Do you handle emergency electrical work?', answer: 'Yes! We provide 24/7 emergency electrical services for power outages, sparking outlets, and other urgent electrical issues.' },
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
      { name: 'Roof Repair', slug: 'roof-repair', shortDescription: 'Expert roof repair for all roof types.' },
      { name: 'Roof Replacement', slug: 'roof-replacement', shortDescription: 'Complete roof replacement services.' },
      { name: 'Roof Inspection', slug: 'roof-inspection', shortDescription: 'Comprehensive roof inspection and assessment.' },
      { name: 'Storm Damage Repair', slug: 'storm-damage-repair', shortDescription: 'Emergency storm damage repair services.' },
      { name: 'Gutter Services', slug: 'gutter-services', shortDescription: 'Gutter installation, repair, and cleaning.' },
      { name: 'Commercial Roofing', slug: 'commercial-roofing', shortDescription: 'Commercial roofing solutions.' },
    ],
    faq: [
      { question: 'How do I know if I need a new roof?', answer: 'Signs include missing or curling shingles, granules in gutters, visible daylight through roof boards, sagging, and age over 20 years. We offer free inspections to assess your roof\'s condition.' },
      { question: 'Does insurance cover storm damage?', answer: 'Most homeowner\'s policies cover storm damage. We work directly with insurance companies and can help you navigate the claims process.' },
      { question: 'How long does a roof replacement take?', answer: 'Most residential roof replacements take 1-3 days, depending on size, weather, and complexity. We\'ll provide a clear timeline before work begins.' },
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
      { name: 'Home Remodeling', slug: 'home-remodeling', shortDescription: 'Complete home remodeling services.' },
      { name: 'Kitchen Remodeling', slug: 'kitchen-remodeling', shortDescription: 'Custom kitchen design and renovation.' },
      { name: 'Bathroom Remodeling', slug: 'bathroom-remodeling', shortDescription: 'Beautiful bathroom transformations.' },
      { name: 'Room Additions', slug: 'room-additions', shortDescription: 'Expand your living space with additions.' },
      { name: 'Deck & Patio', slug: 'deck-patio', shortDescription: 'Custom deck and patio construction.' },
      { name: 'Commercial Construction', slug: 'commercial-construction', shortDescription: 'Commercial building and renovation.' },
    ],
    faq: [
      { question: 'How do I get started on a remodeling project?', answer: 'Start with a free consultation. We\'ll discuss your vision, assess the space, and provide a detailed estimate. From there, we\'ll create a project timeline and begin work.' },
      { question: 'Do you handle permits?', answer: 'Yes! We handle all necessary permits and inspections. We ensure your project meets local building codes and regulations.' },
      { question: 'How long does a typical remodel take?', answer: 'Timeline varies by project scope. A bathroom remodel might take 2-3 weeks, while a full kitchen remodel could take 6-8 weeks. We\'ll provide a detailed schedule upfront.' },
    ],
  },
};

// Generate slug from company name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Main setup function
async function main() {
  console.clear();
  log('\n═══════════════════════════════════════════════════════════════', 'cyan');
  log('              🏗️  GHL Client Website Setup                      ', 'bold');
  log('═══════════════════════════════════════════════════════════════\n', 'cyan');

  log('This wizard will help you configure a new client website.\n', 'dim');

  // Company Information
  log('📋 COMPANY INFORMATION', 'yellow');
  log('─'.repeat(50), 'dim');

  const companyName = await question('Company Name');
  const companySlug = await question('Company Slug (for URLs)', generateSlug(companyName));
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
  Object.keys(industryPresets).forEach((key, i) => {
    log(`  ${i + 1}. ${industryPresets[key].type}`, 'dim');
  });

  const industryKeys = Object.keys(industryPresets);
  const industryChoice = await question('Select industry (1-5)', '1');
  const selectedIndustry = industryKeys[parseInt(industryChoice) - 1] || industryKeys[0];
  const industry = industryPresets[selectedIndustry];

  // Branding
  console.log();
  log('🎨 BRANDING', 'yellow');
  log('─'.repeat(50), 'dim');

  const primaryColor = await question('Primary Color (hex)', '#2563eb');
  const secondaryColor = await question('Secondary Color (hex)', '#1e40af');
  const accentColor = await question('Accent Color (hex)', '#f59e0b');
  const logoUrl = await question('Logo URL (optional)');

  // Service Area
  console.log();
  log('📍 SERVICE AREA', 'yellow');
  log('─'.repeat(50), 'dim');

  const serviceAreas = await question('Service Areas (comma-separated cities)', companyCity);
  const serviceRadius = await question('Service Radius (miles)', '30');

  // GHL Integration
  console.log();
  log('🔗 GHL INTEGRATION (optional)', 'yellow');
  log('─'.repeat(50), 'dim');

  const ghlFormEmbed = await question('GHL Form Embed Code');
  const ghlCalendarEmbed = await question('GHL Calendar Embed Code');
  const ghlChatWidget = await question('GHL Chat Widget Code');
  const ghlTrackingId = await question('GHL Tracking ID');

  // Social Links
  console.log();
  log('🌐 SOCIAL LINKS (optional)', 'yellow');
  log('─'.repeat(50), 'dim');

  const facebookUrl = await question('Facebook URL');
  const instagramUrl = await question('Instagram URL');
  const googleBusinessUrl = await question('Google Business URL');
  const yelpUrl = await question('Yelp URL');

  // SEO
  console.log();
  log('🔍 SEO & ANALYTICS', 'yellow');
  log('─'.repeat(50), 'dim');

  const siteUrl = await question('Site URL', `https://${companySlug}.com`);
  const googleAnalyticsId = await question('Google Analytics ID');
  const googleTagManagerId = await question('Google Tag Manager ID');
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

  rl.close();

  // Build configuration object
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
      yelp: yelpUrl,
      bbb: '',
      nextdoor: '',
    },
    ghl: {
      calendarEmbed: ghlCalendarEmbed,
      formEmbed: ghlFormEmbed,
      chatWidget: ghlChatWidget,
      trackingId: ghlTrackingId,
    },
    seo: {
      googleAnalyticsId: googleAnalyticsId,
      googleTagManagerId: googleTagManagerId,
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

  // Save configuration
  console.log();
  log('💾 SAVING CONFIGURATION', 'yellow');
  log('─'.repeat(50), 'dim');

  const configPath = path.join(process.cwd(), 'client-config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  log(`✓ Configuration saved to: ${configPath}`, 'green');

  // Update package.json name
  const packagePath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    packageJson.name = `${companySlug}-website`;
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    log(`✓ Updated package.json name`, 'green');
  }

  // Run token replacement
  console.log();
  log('🔄 RUNNING TOKEN REPLACEMENT', 'yellow');
  log('─'.repeat(50), 'dim');

  try {
    execSync(`node scripts/replace-tokens.js --config client-config.json`, {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
  } catch (error) {
    log('⚠️  Token replacement had issues. You may need to run it manually.', 'yellow');
  }

  // Final instructions
  console.log();
  log('═══════════════════════════════════════════════════════════════', 'cyan');
  log('                    ✅ SETUP COMPLETE!                          ', 'green');
  log('═══════════════════════════════════════════════════════════════\n', 'cyan');

  log('Next steps:', 'bold');
  log('  1. Review client-config.json and add any missing information', 'dim');
  log('  2. Add testimonials, gallery images, and team members to config', 'dim');
  log('  3. Run: npm install', 'dim');
  log('  4. Run: npm run dev', 'dim');
  log('  5. Deploy to Vercel when ready!\n', 'dim');

  log('Useful commands:', 'bold');
  log('  npm run dev           - Start development server', 'dim');
  log('  npm run build         - Build for production', 'dim');
  log('  npm run lint          - Run linter', 'dim');
  log(`  node scripts/replace-tokens.js --config client-config.json --dry-run`, 'dim');
  log('                        - Preview token replacements\n', 'dim');
}

main().catch(console.error);
