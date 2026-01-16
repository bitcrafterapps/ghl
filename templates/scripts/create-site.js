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
const crypto = require('crypto');

const TEMPLATES_DIR = path.resolve(__dirname, '..');
const BASE_TEMPLATE = path.join(TEMPLATES_DIR, 'base');

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
      resolve(answer.trim() || defaultValue);
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
      { name: 'AC Repair', slug: 'ac-repair', shortDescription: 'Fast, reliable air conditioning repair services.' },
      { name: 'AC Installation', slug: 'ac-installation', shortDescription: 'Professional AC system installation.' },
      { name: 'Heating Repair', slug: 'heating-repair', shortDescription: 'Expert heating system repair services.' },
      { name: 'Furnace Installation', slug: 'furnace-installation', shortDescription: 'Quality furnace installation and replacement.' },
      { name: 'HVAC Maintenance', slug: 'hvac-maintenance', shortDescription: 'Preventive maintenance to keep your system running.' },
      { name: 'Duct Cleaning', slug: 'duct-cleaning', shortDescription: 'Professional air duct cleaning services.' },
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
      { name: 'Drain Cleaning', slug: 'drain-cleaning', shortDescription: 'Professional drain cleaning and unclogging services.' },
      { name: 'Water Heater Repair', slug: 'water-heater-repair', shortDescription: 'Expert water heater repair and maintenance.' },
      { name: 'Water Heater Installation', slug: 'water-heater-installation', shortDescription: 'New water heater installation services.' },
      { name: 'Leak Detection', slug: 'leak-detection', shortDescription: 'Advanced leak detection technology.' },
      { name: 'Pipe Repair', slug: 'pipe-repair', shortDescription: 'Reliable pipe repair and replacement.' },
      { name: 'Sewer Line Services', slug: 'sewer-line-services', shortDescription: 'Complete sewer line inspection and repair.' },
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
      { name: 'Electrical Repairs', slug: 'electrical-repairs', shortDescription: 'Safe and reliable electrical repair services.' },
      { name: 'Panel Upgrades', slug: 'panel-upgrades', shortDescription: 'Electrical panel upgrade and replacement.' },
      { name: 'Lighting Installation', slug: 'lighting-installation', shortDescription: 'Indoor and outdoor lighting installation.' },
      { name: 'Outlet & Switch Installation', slug: 'outlet-switch-installation', shortDescription: 'New outlet and switch installation.' },
      { name: 'Ceiling Fan Installation', slug: 'ceiling-fan-installation', shortDescription: 'Professional ceiling fan installation.' },
      { name: 'Electrical Inspections', slug: 'electrical-inspections', shortDescription: 'Comprehensive electrical safety inspections.' },
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
      { name: 'Roof Repair', slug: 'roof-repair', shortDescription: 'Expert roof repair for all roof types.' },
      { name: 'Roof Replacement', slug: 'roof-replacement', shortDescription: 'Complete roof replacement services.' },
      { name: 'Roof Inspection', slug: 'roof-inspection', shortDescription: 'Comprehensive roof inspection and assessment.' },
      { name: 'Storm Damage Repair', slug: 'storm-damage-repair', shortDescription: 'Emergency storm damage repair services.' },
      { name: 'Gutter Services', slug: 'gutter-services', shortDescription: 'Gutter installation, repair, and cleaning.' },
      { name: 'Commercial Roofing', slug: 'commercial-roofing', shortDescription: 'Commercial roofing solutions.' },
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
      { name: 'Home Remodeling', slug: 'home-remodeling', shortDescription: 'Complete home remodeling services.' },
      { name: 'Kitchen Remodeling', slug: 'kitchen-remodeling', shortDescription: 'Custom kitchen design and renovation.' },
      { name: 'Bathroom Remodeling', slug: 'bathroom-remodeling', shortDescription: 'Beautiful bathroom transformations.' },
      { name: 'Room Additions', slug: 'room-additions', shortDescription: 'Expand your living space with additions.' },
      { name: 'Deck & Patio', slug: 'deck-patio', shortDescription: 'Custom deck and patio construction.' },
      { name: 'Commercial Construction', slug: 'commercial-construction', shortDescription: 'Commercial building and renovation.' },
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
      { name: 'Mold Inspection', slug: 'mold-inspection', shortDescription: 'Comprehensive mold testing and inspection.' },
      { name: 'Mold Removal', slug: 'mold-removal', shortDescription: 'Safe and thorough mold remediation.' },
      { name: 'Water Damage Restoration', slug: 'water-damage', shortDescription: 'Complete water damage restoration services.' },
      { name: 'Air Quality Testing', slug: 'air-quality-testing', shortDescription: 'Indoor air quality assessment.' },
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
      { name: 'Water Damage Restoration', slug: 'water-damage', shortDescription: '24/7 water damage emergency response.' },
      { name: 'Fire Damage Restoration', slug: 'fire-damage', shortDescription: 'Complete fire and smoke damage restoration.' },
      { name: 'Storm Damage Restoration', slug: 'storm-damage', shortDescription: 'Emergency storm damage repair.' },
      { name: 'Contents Restoration', slug: 'contents-restoration', shortDescription: 'Salvage and restore your belongings.' },
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
      { name: 'Carpet Cleaning', slug: 'carpet-cleaning', shortDescription: 'Deep carpet cleaning for homes and businesses.' },
      { name: 'Tile & Grout Cleaning', slug: 'tile-grout-cleaning', shortDescription: 'Restore your tile and grout to like-new condition.' },
      { name: 'Upholstery Cleaning', slug: 'upholstery-cleaning', shortDescription: 'Professional furniture cleaning.' },
      { name: 'Area Rug Cleaning', slug: 'area-rug-cleaning', shortDescription: 'Specialty cleaning for all rug types.' },
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
      { name: 'Weekly Pool Maintenance', slug: 'weekly-maintenance', shortDescription: 'Complete weekly pool care service.' },
      { name: 'Pool Equipment Repair', slug: 'equipment-repair', shortDescription: 'Pump, filter, and heater repairs.' },
      { name: 'Pool Opening & Closing', slug: 'opening-closing', shortDescription: 'Seasonal pool preparation.' },
      { name: 'Pool Remodeling', slug: 'pool-remodeling', shortDescription: 'Pool renovation and resurfacing.' },
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
      { name: 'Landscape Design', slug: 'landscape-design', shortDescription: 'Custom landscape design services.' },
      { name: 'Lawn Maintenance', slug: 'lawn-maintenance', shortDescription: 'Weekly lawn care and maintenance.' },
      { name: 'Hardscaping', slug: 'hardscaping', shortDescription: 'Patios, walkways, and retaining walls.' },
      { name: 'Irrigation Systems', slug: 'irrigation', shortDescription: 'Sprinkler installation and repair.' },
      { name: 'Tree Service', slug: 'tree-service', shortDescription: 'Tree trimming, removal, and care.' },
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
      { name: 'General Pest Control', slug: 'general-pest-control', shortDescription: 'Comprehensive pest elimination.' },
      { name: 'Termite Treatment', slug: 'termite-treatment', shortDescription: 'Complete termite inspection and treatment.' },
      { name: 'Rodent Control', slug: 'rodent-control', shortDescription: 'Mouse and rat elimination services.' },
      { name: 'Mosquito Control', slug: 'mosquito-control', shortDescription: 'Yard mosquito treatment programs.' },
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
      { name: 'House Cleaning', slug: 'house-cleaning', shortDescription: 'Regular residential cleaning services.' },
      { name: 'Deep Cleaning', slug: 'deep-cleaning', shortDescription: 'Thorough top-to-bottom cleaning.' },
      { name: 'Move In/Out Cleaning', slug: 'move-cleaning', shortDescription: 'Make your move stress-free.' },
      { name: 'Commercial Cleaning', slug: 'commercial-cleaning', shortDescription: 'Office and business cleaning.' },
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
      { name: 'Interior Painting', slug: 'interior-painting', shortDescription: 'Transform your indoor spaces.' },
      { name: 'Exterior Painting', slug: 'exterior-painting', shortDescription: 'Protect and beautify your home exterior.' },
      { name: 'Cabinet Painting', slug: 'cabinet-painting', shortDescription: 'Kitchen cabinet refinishing.' },
      { name: 'Commercial Painting', slug: 'commercial-painting', shortDescription: 'Business and commercial painting.' },
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
      { name: 'Hardwood Flooring', slug: 'hardwood-flooring', shortDescription: 'Hardwood installation and refinishing.' },
      { name: 'Tile Installation', slug: 'tile-installation', shortDescription: 'Tile flooring for any room.' },
      { name: 'Luxury Vinyl Plank', slug: 'lvp-flooring', shortDescription: 'Durable LVP flooring installation.' },
      { name: 'Carpet Installation', slug: 'carpet-installation', shortDescription: 'Professional carpet installation.' },
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
      { name: 'Wood Fencing', slug: 'wood-fencing', shortDescription: 'Classic wood fence installation.' },
      { name: 'Vinyl Fencing', slug: 'vinyl-fencing', shortDescription: 'Low-maintenance vinyl fencing.' },
      { name: 'Chain Link Fencing', slug: 'chain-link', shortDescription: 'Affordable chain link solutions.' },
      { name: 'Fence Repair', slug: 'fence-repair', shortDescription: 'Fence repair and replacement.' },
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

// Copy directory recursively
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Replace tokens in file content
function replaceTokensInFile(filePath, tokenMap) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const tokenRegex = /\{\{([A-Z_]+)\}\}/g;

  const newContent = content.replace(tokenRegex, (match, token) => {
    return tokenMap.hasOwnProperty(token) ? tokenMap[token] : match;
  });

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf-8');
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
  return tokenMap;
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

  rl.close();

  // Generate unique site ID for multi-tenant scoping
  const siteId = crypto.randomUUID();
  log(`\n✓ Generated Site ID: ${siteId}`, 'green');

  // Build configuration
  const config = {
    siteId: siteId,  // Unique identifier for multi-tenant site scoping
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
      yelp: '',
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

  // Create .env file with site ID
  const envContent = `# Auto-generated environment configuration
# Unique Site ID for multi-tenant site scoping
NEXT_PUBLIC_SITE_ID=${siteId}

# API URL (configure for production)
NEXT_PUBLIC_API_URL=http://localhost:3001
`;
  fs.writeFileSync(path.join(destFolder, '.env'), envContent);
  log('✓ Created .env file with site ID', 'green');

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
  log(`   Tokens replaced: ${stats.modified} files\n`, 'dim');

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
