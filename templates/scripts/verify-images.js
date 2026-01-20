const fs = require('fs');
const path = require('path');

// Extract industryPresets from the file content
// Since we can't easily require the file because it has other code, we'll read it and eval the object part or regex it.
// Actually, the file is a valid node script, but it runs `main()` at the end. 
// We will just do a regex parse to be safe and avoid executing the script.

const apiFile = '/Users/sandyfriedman/ghl/templates/scripts/create-site-api.js';
const imagesDir = '/Users/sandyfriedman/ghl/templates/scripts/images';

const content = fs.readFileSync(apiFile, 'utf8');

// Find the industryPresets object
// We know it starts with "const industryPresets = {" and ends before "function generateSlug"
const startMarker = 'const industryPresets = {';
const endMarker = '};'; // This is too generic, let's find the closing brace before generateSlug
const nextFunction = 'function generateSlug';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(nextFunction);

if (startIndex === -1 || endIndex === -1) {
    console.error('Could not find industryPresets block');
    process.exit(1);
}

const block = content.substring(startIndex, endIndex);
// Clean it up to be parseable JSON-ish or just eval it
// We will evaluate it in a sandbox or just constructing a function
const evalCode = block + '; return industryPresets;';
const industryPresets = new Function(evalCode)();

const missing = [];
const existing = [];

Object.keys(industryPresets).forEach(industryKey => {
    const industry = industryPresets[industryKey];
    const industrySlug = industry.slug;

    industry.services.forEach(service => {
        const serviceSlug = service.slug;
        const expectedFilename = `${industrySlug}-${serviceSlug}.png`;
        const expectedPath = path.join(imagesDir, expectedFilename);

        if (!fs.existsSync(expectedPath)) {
            missing.push({
                industry: industrySlug,
                service: serviceSlug,
                filename: expectedFilename,
                prompt: `Industry: ${industry.type}, Service: ${service.name}. Description: ${service.shortDescription}`
            });
        } else {
            existing.push(expectedFilename);
        }
    });
});

console.log(`Total Services Found: ${existing.length + missing.length}`);
console.log(`Existing Images: ${existing.length}`);
console.log(`Missing Images: ${missing.length}`);

if (missing.length > 0) {
    console.log('--- Missing Images List ---');
    missing.forEach(m => console.log(m.filename));
    console.log(JSON.stringify(missing, null, 2));
} else {
    console.log('All images exist!');
}
