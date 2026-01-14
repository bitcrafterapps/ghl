#!/usr/bin/env node

/**
 * Token Replacement Script for GHL Client Websites
 *
 * Usage:
 *   node scripts/replace-tokens.js --config path/to/client-config.json
 *   node scripts/replace-tokens.js --config path/to/client-config.json --dry-run
 *
 * This script replaces all {{TOKEN}} placeholders in the codebase with values
 * from the client configuration file.
 */

const fs = require('fs');
const path = require('path');

// Files and directories to process
const INCLUDE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.md', '.html'];
const EXCLUDE_DIRS = ['node_modules', '.next', '.git', 'scripts'];
const EXCLUDE_FILES = ['package-lock.json', 'yarn.lock'];

// Color helpers for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    config: null,
    dryRun: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--config' || args[i] === '-c') {
      options.config = args[i + 1];
      i++;
    } else if (args[i] === '--dry-run' || args[i] === '-d') {
      options.dryRun = true;
    } else if (args[i] === '--help' || args[i] === '-h') {
      options.help = true;
    }
  }

  return options;
}

// Print usage help
function printHelp() {
  console.log(`
Token Replacement Script for GHL Client Websites

Usage:
  node scripts/replace-tokens.js --config <path> [options]

Options:
  -c, --config <path>   Path to client configuration JSON file (required)
  -d, --dry-run         Show what would be replaced without making changes
  -h, --help            Show this help message

Example:
  node scripts/replace-tokens.js --config ../clients/acme-plumbing/config.json
  node scripts/replace-tokens.js -c config.json --dry-run
`);
}

// Load and validate client configuration
function loadConfig(configPath) {
  const absolutePath = path.resolve(process.cwd(), configPath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Configuration file not found: ${absolutePath}`);
  }

  const content = fs.readFileSync(absolutePath, 'utf-8');
  const config = JSON.parse(content);

  // Build token map with explicit mappings to match template tokens
  const tokenMap = {};

  // Company Information
  if (config.company) {
    tokenMap['COMPANY_NAME'] = config.company.name || '';
    tokenMap['COMPANY_SLUG'] = config.company.slug || '';
    tokenMap['COMPANY_PHONE'] = config.company.phone || '';
    tokenMap['COMPANY_EMAIL'] = config.company.email || '';
    tokenMap['COMPANY_ADDRESS'] = config.company.address || '';
    tokenMap['COMPANY_CITY'] = config.company.city || '';
    tokenMap['COMPANY_STATE'] = config.company.state || '';
    tokenMap['STATE_FULL'] = config.company.stateFullName || '';
    tokenMap['COMPANY_ZIP'] = config.company.zip || '';
    tokenMap['COMPANY_LICENSE'] = config.company.license || '';
    tokenMap['YEARS_IN_BUSINESS'] = config.company.yearsInBusiness || '';
  }

  // Branding
  if (config.branding) {
    tokenMap['LOGO_URL'] = config.branding.logoUrl || '';
    tokenMap['FAVICON_URL'] = config.branding.faviconUrl || '';
    tokenMap['PRIMARY_COLOR'] = config.branding.primaryColor || '#2563eb';
    tokenMap['SECONDARY_COLOR'] = config.branding.secondaryColor || '#1e40af';
    tokenMap['ACCENT_COLOR'] = config.branding.accentColor || '#f59e0b';
    tokenMap['FONT_HEADING'] = config.branding.fontHeading || 'Poppins';
    tokenMap['FONT_BODY'] = config.branding.fontBody || 'Inter';
  }

  // Industry
  if (config.industry) {
    tokenMap['INDUSTRY_TYPE'] = config.industry.type || '';
    tokenMap['INDUSTRY_SLUG'] = config.industry.slug || '';
    tokenMap['SERVICE_NOUN'] = config.industry.serviceNoun || 'Services';
    tokenMap['SERVICE_VERB'] = config.industry.serviceVerb || 'repair';
    tokenMap['EMERGENCY_SERVICE'] = String(config.industry.emergencyService || false);
    tokenMap['SCHEMA_BUSINESS_TYPE'] = config.industry.schemaType || 'LocalBusiness';
  }

  // Service Area
  if (config.serviceArea) {
    tokenMap['SERVICE_AREAS'] = config.serviceArea.areas || '';
    tokenMap['SERVICE_RADIUS'] = config.serviceArea.radius || '30';
    tokenMap['PRIMARY_CITY'] = config.serviceArea.primaryCity || '';
  }

  // Social Links
  if (config.social) {
    tokenMap['FACEBOOK_URL'] = config.social.facebook || '';
    tokenMap['INSTAGRAM_URL'] = config.social.instagram || '';
    tokenMap['GOOGLE_BUSINESS_URL'] = config.social.google || '';
    tokenMap['YELP_URL'] = config.social.yelp || '';
    tokenMap['BBB_URL'] = config.social.bbb || '';
    tokenMap['NEXTDOOR_URL'] = config.social.nextdoor || '';
  }

  // GHL Integration
  if (config.ghl) {
    tokenMap['GHL_CALENDAR_EMBED'] = config.ghl.calendarEmbed || '';
    tokenMap['GHL_FORM_EMBED'] = config.ghl.formEmbed || '';
    tokenMap['GHL_CHAT_WIDGET'] = config.ghl.chatWidget || '';
    tokenMap['GHL_TRACKING_ID'] = config.ghl.trackingId || '';
  }

  // SEO
  if (config.seo) {
    tokenMap['GOOGLE_ANALYTICS_ID'] = config.seo.googleAnalyticsId || '';
    tokenMap['GOOGLE_TAG_MANAGER_ID'] = config.seo.googleTagManagerId || '';
    tokenMap['FACEBOOK_PIXEL_ID'] = config.seo.facebookPixelId || '';
    tokenMap['META_DESCRIPTION'] = config.seo.metaDescription || '';
    tokenMap['META_KEYWORDS'] = config.seo.metaKeywords || '';
  }

  // Site URL
  tokenMap['SITE_URL'] = config.siteUrl || '';

  // Reviews
  if (config.reviews) {
    tokenMap['RATING_VALUE'] = config.reviews.rating || '4.9';
    tokenMap['REVIEW_COUNT'] = config.reviews.count || '100';
    tokenMap['GOOGLE_REVIEW_LINK'] = config.reviews.googleReviewLink || '';
  }

  // Hours
  if (config.hours) {
    tokenMap['HOURS_WEEKDAYS'] = config.hours.weekdays || '8:00 AM - 6:00 PM';
    tokenMap['HOURS_SATURDAY'] = config.hours.saturday || '9:00 AM - 4:00 PM';
    tokenMap['HOURS_SUNDAY'] = config.hours.sunday || 'Closed';
    tokenMap['EMERGENCY_HOURS_NOTE'] = config.hours.emergencyNote || '';
  }

  // Arrays as JSON
  if (config.services) {
    tokenMap['SERVICES_JSON'] = JSON.stringify(config.services, null, 2);
  }
  if (config.testimonials) {
    tokenMap['TESTIMONIALS_JSON'] = JSON.stringify(config.testimonials, null, 2);
  }
  if (config.faq) {
    tokenMap['FAQ_JSON'] = JSON.stringify(config.faq, null, 2);
  }
  if (config.gallery) {
    tokenMap['GALLERY_JSON'] = JSON.stringify(config.gallery, null, 2);
  }
  if (config.team) {
    tokenMap['TEAM_JSON'] = JSON.stringify(config.team, null, 2);
  }

  return tokenMap;
}

// Get all files to process
function getFilesToProcess(dir, files = []) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(item)) {
        getFilesToProcess(fullPath, files);
      }
    } else if (stat.isFile()) {
      const ext = path.extname(item);
      if (INCLUDE_EXTENSIONS.includes(ext) && !EXCLUDE_FILES.includes(item)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

// Replace tokens in file content
function replaceTokens(content, tokenMap) {
  const tokenRegex = /\{\{([A-Z_]+)\}\}/g;
  let replacements = [];

  const newContent = content.replace(tokenRegex, (match, token) => {
    if (tokenMap.hasOwnProperty(token)) {
      replacements.push({ token, value: tokenMap[token] });
      return tokenMap[token];
    }
    return match; // Keep original if token not found
  });

  return { newContent, replacements };
}

// Find unreplaced tokens
function findUnreplacedTokens(content) {
  const tokenRegex = /\{\{([A-Z_]+)\}\}/g;
  const tokens = [];
  let match;

  while ((match = tokenRegex.exec(content)) !== null) {
    if (!tokens.includes(match[1])) {
      tokens.push(match[1]);
    }
  }

  return tokens;
}

// Main function
async function main() {
  const options = parseArgs();

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  if (!options.config) {
    log('Error: Configuration file path is required', 'red');
    printHelp();
    process.exit(1);
  }

  log('\n🔧 GHL Client Website Token Replacement\n', 'cyan');

  // Load configuration
  log(`Loading configuration from: ${options.config}`, 'dim');
  let tokenMap;
  try {
    tokenMap = loadConfig(options.config);
    log(`✓ Loaded ${Object.keys(tokenMap).length} tokens\n`, 'green');
  } catch (error) {
    log(`Error loading configuration: ${error.message}`, 'red');
    process.exit(1);
  }

  // Get files to process
  const projectRoot = process.cwd();
  const files = getFilesToProcess(projectRoot);
  log(`Found ${files.length} files to process\n`, 'dim');

  // Process each file
  let totalReplacements = 0;
  let filesModified = 0;
  const allUnreplacedTokens = new Set();

  for (const file of files) {
    const relativePath = path.relative(projectRoot, file);
    const content = fs.readFileSync(file, 'utf-8');

    const { newContent, replacements } = replaceTokens(content, tokenMap);
    const unreplacedTokens = findUnreplacedTokens(newContent);

    unreplacedTokens.forEach(token => allUnreplacedTokens.add(token));

    if (replacements.length > 0) {
      filesModified++;
      totalReplacements += replacements.length;

      if (options.dryRun) {
        log(`📄 ${relativePath}`, 'yellow');
        replacements.forEach(({ token, value }) => {
          const displayValue = value.length > 50 ? value.substring(0, 50) + '...' : value;
          log(`   {{${token}}} → ${displayValue}`, 'dim');
        });
      } else {
        fs.writeFileSync(file, newContent, 'utf-8');
        log(`✓ ${relativePath} (${replacements.length} replacements)`, 'green');
      }
    }
  }

  // Summary
  console.log('\n' + '─'.repeat(50) + '\n');

  if (options.dryRun) {
    log('DRY RUN - No files were modified\n', 'yellow');
  }

  log(`📊 Summary:`, 'cyan');
  log(`   Files processed: ${files.length}`);
  log(`   Files ${options.dryRun ? 'would be ' : ''}modified: ${filesModified}`);
  log(`   Total replacements: ${totalReplacements}`);

  if (allUnreplacedTokens.size > 0) {
    log(`\n⚠️  Unreplaced tokens found:`, 'yellow');
    allUnreplacedTokens.forEach(token => {
      log(`   {{${token}}}`, 'dim');
    });
    log(`\nAdd these to your config file or verify they are intentional.`, 'dim');
  }

  log('\n✅ Token replacement complete!\n', 'green');
}

main().catch(error => {
  log(`Error: ${error.message}`, 'red');
  process.exit(1);
});
