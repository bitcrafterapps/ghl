const fs = require('fs');
const path = require('path');

// Extract industry presets from create-new-site.js involves parsing or importing. 
// Since create-new-site.js is a script, importing it might run it. 
// So interpret the presets directly here or copy them. 
// For this helper, I'll define a helper to read the file and extract the CONST if possible, 
// or just copy the structure since I have it in context. 
// Actually, to be robust, I should probably copy the current industryPresets object here
// so this script is standalone.

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
                featured: true
            },
            {
                name: 'Water Heater Repair',
                slug: 'water-heater-repair',
                featured: true
            },
            {
                name: 'Water Heater Installation',
                slug: 'water-heater-installation',
                featured: true
            },
            {
                name: 'Leak Detection',
                slug: 'leak-detection'
            },
            {
                name: 'Pipe Repair',
                slug: 'pipe-repair'
            },
            {
                name: 'Sewer Line Services',
                slug: 'sewer-line-services'
            },
        ],
    },
    electrical: {
        type: 'Electrical',
        slug: 'electrical',
        services: [
            { name: 'Electrical Repairs', slug: 'electrical-repairs', featured: true },
            { name: 'Panel Upgrades', slug: 'panel-upgrades', featured: true },
            { name: 'Lighting Installation', slug: 'lighting-installation', featured: true },
            { name: 'Outlet & Switch Installation', slug: 'outlet-switch-installation' },
            { name: 'Ceiling Fan Installation', slug: 'ceiling-fan-installation' },
            { name: 'Electrical Inspections', slug: 'electrical-inspections' },
        ],
    },
    roofing: {
        type: 'Roofing',
        slug: 'roofing',
        services: [
            { name: 'Roof Repair', slug: 'roof-repair', featured: true },
            { name: 'Roof Replacement', slug: 'roof-replacement', featured: true },
            { name: 'Roof Inspection', slug: 'roof-inspection', featured: true },
            { name: 'Storm Damage Repair', slug: 'storm-damage-repair' },
            { name: 'Gutter Services', slug: 'gutter-services' },
            { name: 'Commercial Roofing', slug: 'commercial-roofing' },
        ],
    },
    'general-contractor': {
        type: 'General Contractor',
        slug: 'general-contractor',
        services: [
            { name: 'Home Remodeling', slug: 'home-remodeling', featured: true },
            { name: 'Kitchen Remodeling', slug: 'kitchen-remodeling', featured: true },
            { name: 'Bathroom Remodeling', slug: 'bathroom-remodeling', featured: true },
            { name: 'Room Additions', slug: 'room-additions' },
            { name: 'Deck & Patio', slug: 'deck-patio' },
            { name: 'Commercial Construction', slug: 'commercial-construction' },
        ],
    },
    'mold-remediation': {
        type: 'Mold Remediation',
        slug: 'mold-remediation',
        services: [
            { name: 'Mold Inspection', slug: 'mold-inspection', featured: true },
            { name: 'Mold Removal', slug: 'mold-removal', featured: true },
            { name: 'Water Damage Restoration', slug: 'water-damage', featured: true },
            { name: 'Air Quality Testing', slug: 'air-quality-testing' },
        ],
    },
    restoration: {
        type: 'Restoration',
        slug: 'restoration',
        services: [
            { name: 'Water Damage Restoration', slug: 'water-damage', featured: true },
            { name: 'Fire Damage Restoration', slug: 'fire-damage', featured: true },
            { name: 'Storm Damage Restoration', slug: 'storm-damage', featured: true },
            { name: 'Contents Restoration', slug: 'contents-restoration' },
        ],
    },
    'carpet-cleaning': {
        type: 'Carpet & Tile Cleaning',
        slug: 'carpet-cleaning',
        services: [
            { name: 'Carpet Cleaning', slug: 'carpet-cleaning', featured: true },
            { name: 'Tile & Grout Cleaning', slug: 'tile-grout-cleaning', featured: true },
            { name: 'Upholstery Cleaning', slug: 'upholstery-cleaning', featured: true },
            { name: 'Area Rug Cleaning', slug: 'area-rug-cleaning' },
        ],
    },
    'pool-service': {
        type: 'Pool Service',
        slug: 'pool-service',
        services: [
            { name: 'Weekly Pool Maintenance', slug: 'weekly-maintenance', featured: true },
            { name: 'Pool Equipment Repair', slug: 'equipment-repair', featured: true },
            { name: 'Pool Opening & Closing', slug: 'opening-closing', featured: true },
            { name: 'Pool Remodeling', slug: 'pool-remodeling' },
        ],
    },
    landscaping: {
        type: 'Landscaping',
        slug: 'landscaping',
        services: [
            { name: 'Landscape Design', slug: 'landscape-design', featured: true },
            { name: 'Lawn Maintenance', slug: 'lawn-maintenance', featured: true },
            { name: 'Hardscaping', slug: 'hardscaping', featured: true },
            { name: 'Irrigation Systems', slug: 'irrigation' },
            { name: 'Tree Service', slug: 'tree-service' },
        ],
    },
    'pest-control': {
        type: 'Pest Control',
        slug: 'pest-control',
        services: [
            { name: 'General Pest Control', slug: 'general-pest-control', featured: true },
            { name: 'Termite Treatment', slug: 'termite-treatment', featured: true },
            { name: 'Rodent Control', slug: 'rodent-control', featured: true },
            { name: 'Mosquito Control', slug: 'mosquito-control' },
        ],
    },
    cleaning: {
        type: 'Cleaning',
        slug: 'cleaning',
        services: [
            { name: 'House Cleaning', slug: 'house-cleaning', featured: true },
            { name: 'Deep Cleaning', slug: 'deep-cleaning', featured: true },
            { name: 'Move In/Out Cleaning', slug: 'move-cleaning', featured: true },
            { name: 'Commercial Cleaning', slug: 'commercial-cleaning' },
        ],
    },
    painting: {
        type: 'Painting',
        slug: 'painting',
        services: [
            { name: 'Interior Painting', slug: 'interior-painting', featured: true },
            { name: 'Exterior Painting', slug: 'exterior-painting', featured: true },
            { name: 'Cabinet Painting', slug: 'cabinet-painting', featured: true },
            { name: 'Commercial Painting', slug: 'commercial-painting' },
        ],
    },
    flooring: {
        type: 'Flooring',
        slug: 'flooring',
        services: [
            { name: 'Hardwood Flooring', slug: 'hardwood-flooring', featured: true },
            { name: 'Tile Installation', slug: 'tile-installation', featured: true },
            { name: 'Luxury Vinyl Plank', slug: 'lvp-flooring', featured: true },
            { name: 'Carpet Installation', slug: 'carpet-installation' },
        ],
    },
    fencing: {
        type: 'Fencing',
        slug: 'fencing',
        services: [
            { name: 'Wood Fencing', slug: 'wood-fencing', featured: true },
            { name: 'Vinyl Fencing', slug: 'vinyl-fencing', featured: true },
            { name: 'Chain Link Fencing', slug: 'chain-link', featured: true },
            { name: 'Fence Repair', slug: 'fence-repair' },
        ],
    },
};

const IMAGES_DIR = path.resolve(__dirname, 'images');
if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

console.log(`Generating image prompts for services...`);
console.log(`Images will be saved to: ${IMAGES_DIR} (mock run)`);
console.log('-----------------------------------');

Object.values(industryPresets).forEach(industry => {
    console.log(`\nIndustry: ${industry.type}`);
    industry.services.forEach(service => {
        const prompt = `A highly realistic, professional photograph representing ${service.name} in a real-world construction or service environment.

The image should clearly and immediately communicate ${service.name} through authentic tools, materials, equipment, and setting commonly associated with this type of work.

Style: photorealistic commercial photography, modern, natural, documentary-style realism.

Environment: real job site, residential or commercial setting appropriate to ${service.name} (clean, well-maintained, realistic—not staged or messy).

Lighting: natural daylight or soft practical lighting consistent with the environment; realistic shadows and reflections.

Composition: cinematic but grounded; subject in focus with subtle background context; balanced framing with visual clarity at small card sizes; no exaggerated blur.

Mood: trustworthy, skilled craftsmanship, reliability, professionalism, high-quality service.

Details: realistic textures (metal, concrete, wood, tile, pipes, wiring, water, tools); accurate scale and proportions; believable wear and use.

Exclusions: no visible logos, no text overlays, no watermarks, no staged poses, no dramatic or artificial effects.`;

        console.log(`\n[${service.slug}]`);
        console.log(`PROMPT: ${prompt.replace(/\n/g, ' ')}`);
        console.log(`SAVE PATH: ${path.join(IMAGES_DIR, service.slug + '.png')}`);
    });
});
