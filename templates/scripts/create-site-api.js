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
const crypto = require('crypto');

const TEMPLATES_DIR = path.resolve(__dirname, '..');
const BASE_TEMPLATE = path.join(TEMPLATES_DIR, 'frontend');
const GENERATED_DIR = path.resolve(__dirname, '../../generated');

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
    serviceVerb: 'installation',
    emergencyService: true,
    schemaType: 'HVACBusiness',
    services: [
      {
        name: 'AC Repair',
        slug: 'ac-repair',
        shortDescription: 'Fast, reliable air conditioning repair services.',
        longDescription: "Our expert AC repair service quickly diagnoses and fixes all cooling issues, from refrigerant leaks to compressor failures. We utilize advanced diagnostic tools to pinpoint the root cause, preventing recurring problems and saving you money on future repairs. Our technicians are trained on all major brands and models, ensuring a precise fix regardless of your system's age. We restore comfort to your home efficiently, ensuring your system operates at peak performance during the hottest days. We know that a broken AC is an emergency, which is why we offer flexible scheduling and prompt arrival times. Our trucks are fully stocked with common parts to minimize waiting and get your system up and running in a single visit. Choose us for transparent pricing and a commitment to restoring your home's cool comfort without delay.",
        featured: true
      },
      {
        name: 'AC Installation',
        slug: 'ac-installation',
        shortDescription: 'Professional AC system installation.',
        longDescription: "We provide professional AC installation for energy-efficient systems tailored to your home's needs. Our team conducts a thorough load calculation to ensure proper sizing, which is critical for efficiency and longevity. We handle the entire process, from removing your old unit to optimizing the new airflow for every room. Seamless integration leads to maximum comfort and significant energy savings from day one. Investing in a new AC system is a major decision, and we are here to support you with expert advice and flexible financing options. We stand behind our workmanship with a satisfaction guarantee, ensuring your new unit performs exactly as promised. Let us help you select the perfect system that balances performance, noise levels, and energy efficiency for your unique home.",
        featured: true
      },
      {
        name: 'Heating Repair',
        slug: 'heating-repair',
        shortDescription: 'Expert heating system repair services.',
        longDescription: "Don't let the cold inside. Our heating repair specialists troubleshoot and repair furnaces and heat pumps promptly, regardless of the make or model. We address issues like pilot light failures, cracked heat exchangers, and thermostat malfunctions with safety as our top priority. By restoring your system's efficiency, we help eliminate cold spots and ensure consistent warmth throughout your home. Ignoring small heater issues can lead to dangerous carbon monoxide leaks or complete system failure when you need it most. Our thorough troubleshooting process catches these risks early, protecting your family and property. We provide clear, upfront estimates before any work begins, so you are never caught off guard by the cost of essential winter repairs.",
        featured: true
      },
      {
        name: 'Furnace Installation',
        slug: 'furnace-installation',
        shortDescription: 'Quality furnace installation and replacement.',
        longDescription: "Upgrade your comfort with our top-tier furnace installation services. We install reliable, high-efficiency heating systems that provide consistent warmth and lower energy bills. Our installation process includes a full inspection of your ductwork and ventilation to maximize system performance. We guide you through selecting the best unit for your budget and comfort goals. A modern furnace not only keeps you warm but also improves indoor air quality and humidity control. We carefully install your new unit to manufacturer specifications, validating warranties and ensuring optimal safety. From the initial consultation to the final thermostat programming, we make the upgrade process smooth, stress-free, and rewarding for your household.",
      },
      {
        name: 'HVAC Maintenance',
        slug: 'hvac-maintenance',
        shortDescription: 'Preventive maintenance to keep your system running.',
        longDescription: "Extend the life of your system with our comprehensive HVAC maintenance. Regular tune-ups prevent costly breakdowns, improve efficiency, and ensure cleaner air for your family. Our multi-point inspection covers cleaning coils, checking refrigerant levels, tightening electrical connections, and lubricating moving parts. This proactive approach identifies potential issues before they become major repairs. Regular maintenance is the requirement for keeping most manufacturer warranties valid, saving you from paying out-of-pocket for covered parts. We provide a detailed report after every visit, so you always know the exact health of your HVAC system. Join our maintenance program today to enjoy priority service, discounted repairs, and the peace of mind that comes with a well-cared-for home.",
      },
      {
        name: 'Duct Cleaning',
        slug: 'duct-cleaning',
        shortDescription: 'Professional air duct cleaning services.',
        longDescription: "Breathe easier with our professional duct cleaning services. We remove dust, allergens, pet dander, and debris from your air ducts, improving indoor air quality and system efficiency. A clean duct system allows your HVAC unit to breathe freely, reducing strain and energy consumption. We use high-powered vacuums and specialized brushes to reach deep into your ventilation network. Over time, ducts can accumulate pounds of dust and hidden mold that circulate every time your system turns on. Cleaning them can significantly reduce allergy symptoms and keep your home cleaner for longer periods. We treat your home with respect, using drop cloths and shoe covers to leave no mess behind, just cleaner, healthier air for everyone to enjoy.",
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
    serviceVerb: 'installation',
    emergencyService: true,
    schemaType: 'Plumber',
    services: [
      {
        name: 'Drain Cleaning',
        slug: 'drain-cleaning',
        shortDescription: 'Professional drain cleaning and unclogging services.',
        longDescription: "Our thorough drain cleaning service removes stubborn clogs and buildup, restoring proper flow to your plumbing. We use advanced tools like hydro-jetting and motorized snakes to clear blockages safely and effectively without damaging your pipes. Whether it’s grease, hair, or tree roots, we tackle the toughest obstructions preventing backups and unpleasant odors. Regular cleaning also helps prevent future emergencies. Recurring clogs can be a symptom of a much larger issue deep within your plumbing system. Our comprehensive service doesn't just clear the immediate blockage but investigates the underlying cause to prevent future headaches. We also offer tips and maintenance advice to help you keep your drains clear, saving you from the stress of unexpected backups.",
        featured: true
      },
      {
        name: 'Water Heater Repair',
        slug: 'water-heater-repair',
        shortDescription: 'Expert water heater repair and maintenance.',
        longDescription: "Experiencing water heater issues? Our technicians repair all makes and models, restoring hot water quickly and safely. We address common problems like leaks, sediment buildup, heating element failures, and faulty thermostats with precision. A malfunctioning water heater can disrupt your daily routine and drive up energy costs; we fix it right the first time to restore your comfort. We understand that hot water is a necessity, not a luxury, especially for large families. Our rapid response team works diligently to minimize your downtime and restore your daily routine. Before we leave, we ensure your water heater is operating safely and efficiently, giving you confidence in your home's most hardworking appliance.",
        featured: true
      },
      {
        name: 'Water Heater Installation',
        slug: 'water-heater-installation',
        shortDescription: 'New water heater installation services.',
        longDescription: "Upgrade to a new, efficient water heater. We install traditional tank and tankless systems, ensuring reliable hot water and energy savings for your home. Our experts help you choose the right capacity and fuel type to meet your family's daily demand. Tankless options offer endless hot water and superior efficiency, while modern tank systems provide robust performance. We handle the removal and responsible disposal of your old unit, making the upgrade process completely hassle-free. Our installation includes all necessary code upgrades, such as expansion tanks and properly sized gas lines. Trust our experienced team to provide a seamless transition to a new, high-performance water heater that meets all your hot water needs.",
        featured: true
      },
      {
        name: 'Leak Detection',
        slug: 'leak-detection',
        shortDescription: 'Advanced leak detection technology.',
        longDescription: "Hidden leaks can cause major damage to your foundation and increase your water bill silently. Our non-invasive leak detection technology pinpoints the exact location of leaks, allowing us to repair them with minimal disruption to your property. We use acoustic sensors and thermal imaging to find even the smallest drips. Catching a leak early saves you thousands in restoration costs. Water damage can spread quickly, compromising the structural integrity of your home and encouraging mold growth. Our precise detection methods allow us to stop the damage at its source before it becomes a catastrophic expense. We provide detailed documentation of our findings, which is often essential for insurance claims and proving the resolution of the issue.",
      },
      {
        name: 'Pipe Repair',
        slug: 'pipe-repair',
        shortDescription: 'Reliable pipe repair and replacement.',
        longDescription: "From burst pipes to corrosion, our pipe repair services address all types of piping issues. We ensure watertight, durable repairs to protect your home from water damage and structural issues. Whether you have copper, PEX, or galvanized pipes, our skilled plumbers have the right solution. We can perform spot repairs or repipe entire sections if necessary to ensure long-term reliability. Old, corroded pipes can leak heavy metals into your water supply or burst unexpectedly, causing massive damage. We upgrade your plumbing infrastructure with modern, long-lasting materials that improve water pressure and quality. Whether it's a single troublesome joint or a whole-house repipe, we deliver craftsmanship that stands the test of time.",
      },
      {
        name: 'Sewer Line Services',
        slug: 'sewer-line-services',
        shortDescription: 'Complete sewer line inspection and repair.',
        longDescription: "We offer complete sewer line inspection, repair, and replacement. Using high-definition camera inspections, we identify issues like root intrusion, cracks, or bellies without guesswork. We provide effective solutions such as trenchless repair to minimize digging and preserve your landscape. A functioning sewer line is vital for home hygiene; we ensure yours operates smoothly. Sewer layout issues can be stressful and messy, but our trenchless technology allows us to fix the problem without destroying your driveway or garden. We explain every step of the process clearly, helping you make informed decisions about repair versus replacement. Rest assured, we restore full function to your sewer system with minimal impact on your property and daily life.",
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
    serviceVerb: 'installation',
    emergencyService: true,
    schemaType: 'Electrician',
    services: [
      {
        name: 'Electrical Repairs',
        slug: 'electrical-repairs',
        shortDescription: 'Safe and reliable electrical repair services.',
        longDescription: "Our licensed electricians handle all electrical repairs safely and efficiently. From flickering lights to faulty wiring, we troubleshoot and fix issues to ensure your home's safety. We use advanced circuit tracing tools to find hidden problems without unnecessary damage to your walls. Whether it's a simple outlet fix or a complex wiring issue, we treat every job with the highest level of care. Don't risk DIY repairs with electricity; trust our certified professionals to get it done right. Electrical issues often present invisible dangers that only a trained professional can safely identify and resolve. Our team stays up-to-date with the latest safety codes and technologies to provide the highest standard of repair. We offer a 100% satisfaction guarantee on our service, ensuring that your electrical system is safe, stable, and ready to power your life.",
        featured: true
      },
      {
        name: 'Panel Upgrades',
        slug: 'panel-upgrades',
        shortDescription: 'Electrical panel upgrade and replacement.',
        longDescription: "Modernize your home's power system with an electrical panel upgrade. We replace outdated panels to handle increased electrical loads, enhancing safety and performance. This is essential for older homes or before adding major appliances like EV chargers or hot tubs. Our upgrades ensure your breakers trip correctly and eliminate fire hazards associated with old equipment. Enjoy a safer, more reliable electrical system that grows with your family's needs. An outdated panel can be a significant bottleneck for modern electrical needs, often causing breakers to trip repeatedly. Upgrading prepares your home for future value-adding renovations like kitchen remodels or home theater installations. We label your new panel clearly and explain exactly how it works, leaving you with a system that is both powerful and user-friendly.",
        featured: true
      },
      {
        name: 'Lighting Installation',
        slug: 'lighting-installation',
        shortDescription: 'Indoor and outdoor lighting installation.',
        longDescription: "Transform your space with professional lighting installation. We install recessed lighting, chandeliers, and outdoor fixtures to enhance the beauty and functionality of your home. Our team can help with layout design to create the perfect ambiance for every room. We also specialize in energy-efficient LED upgrades that save you money on utility bills. Illuminate your home inside and out with our expert installation services. Proper lighting design can completely change the mood and functionality of a room, making small spaces feel larger and more inviting. We work with you to choose fixtures that complement your decor while providing the right amount of light for tasks and relaxation. Let us perform the install safely, handling high ladders and complex wiring so you can simply enjoy the beautiful results.",
        featured: true
      },
      {
        name: 'Outlet & Switch Installation',
        slug: 'outlet-switch-installation',
        shortDescription: 'New outlet and switch installation.',
        longDescription: "Add convenience and safety with new outlets and switches. We install GFCIs, USB outlets, and dimmers, upgrading your home's electrical accessibility. Perfect for home offices, kitchens, and bedrooms, our modern solutions streamline your daily life. We ensure all installations meet current building codes for maximum safety. Update the look and feel of your home with stylish, functional switches and receptacles. Tired of using extension cords or searching for an open outlet? Strategic installation of new power points eliminates clutter and reduces fire risks associated with overloaded strips. We can also install smart switches that allow you to control your lights from your phone, adding a layer of modern convenience and security to your home.",
      },
      {
        name: 'Ceiling Fan Installation',
        slug: 'ceiling-fan-installation',
        shortDescription: 'Professional ceiling fan installation.',
        longDescription: "Stay cool and comfortable with our ceiling fan installation services. We ensure secure mounting and proper wiring for optimal performance and safety, even on high or vaulted ceilings. A properly installed fan improves air circulation and can lower your cooling costs in the summer. We handle all assembly and balancing to ensure quiet, wobble-free operation. Enhance your room's comfort and style with our professional service. Many homeowners underestimate the complexity of installing a heavy fan, especially when no support box exists. We install the necessary bracing to ensure your fan is rock-solid and safe to operate at any speed. Enjoy the gentle breeze and energy savings of a perfectly installed ceiling fan without the wobble or noise of a DIY job.",
      },
      {
        name: 'Electrical Inspections',
        slug: 'electrical-inspections',
        shortDescription: 'Comprehensive electrical safety inspections.',
        longDescription: "Ensure your home's electrical system is up to code with our comprehensive inspections. We identify potential hazards, outdated wiring, and code violations before they become dangerous. This service is crucial for new home purchases or homes over 20 years old. We provide a detailed report with prioritized recommendations for repairs or upgrades. Sleep soundly knowing your electrical system is safe and reliable. Unknown electrical hazards are a leading cause of residential fires, but they are often preventable with a professional inspection. We check your grounding, surge protection, and circuit load to ensure everything is operating within safe limits. Investing in an inspection is investing in the safety of your family and the longevity of your home's most critical system.",
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
    serviceVerb: 'installation',
    emergencyService: true,
    schemaType: 'RoofingContractor',
    services: [
      {
        name: 'Roof Repair',
        slug: 'roof-repair',
        shortDescription: 'Expert roof repair for all roof types.',
        longDescription: "Our roof repair experts fix leaks, missing shingles, and structural damage. We extend the life of your roof and protect your home from the elements with quality repairs. We match materials perfectly to maintain your home's aesthetic appeal while ensuring a watertight seal. Our team acts quickly to prevent water damage from spreading to your insulation and drywall. Trust us to restore your roof's integrity with lasting solutions. We conduct a thorough assessment to ensure we aren't just patching a symptom while missing the larger problem. Our technicians are trained to spot subtle signs of damage that others miss, providing a more comprehensive repair. We leave your property clean and debris-free, ensuring that the only sign we were there is a perfectly repaired, watertight roof.",
        featured: true
      },
      {
        name: 'Roof Replacement',
        slug: 'roof-replacement',
        shortDescription: 'Complete roof replacement services.',
        longDescription: "When it's time for a new roof, trust our professional replacement services. We install durable, high-quality roofing systems that enhance curb appeal and value. Our process includes stripping the old roof, inspecting the decking, and installing premium underlayment for superior protection. We offer a wide range of materials and colors to suit your style and budget. Invest in a roof that stands the test of time and weather. A new roof is a significant investment that boosts your home's energy efficiency and resale value immediately. We provide a dedicated project manager to keep you informed every step of the way, ensuring the project stays on schedule and on budget. With our industry-leading warranties on both materials and labor, your new roof is protected for decades to come.",
        featured: true
      },
      {
        name: 'Roof Inspection',
        slug: 'roof-inspection',
        shortDescription: 'Comprehensive roof inspection and assessment.',
        longDescription: "Get a clear picture of your roof's condition with our detailed inspections. We identify potential issues early, helping you plan for maintenance and avoid costly repairs. Our inspectors check flashings, gutters, shingles, and ventilation systems thoroughly. You'll receive a comprehensive report with photos and honest recommendations. Regular inspections are the key to maximizing your roof's lifespan. Documentation is key when it comes to maintaining your roof's warranty and filing future insurance claims. Our detailed inspection reports serve as a valuable record of your roof's condition and maintenance history. Schedule an inspection after any major storm to catch damage early and keep your manufacturer's warranty fully intact.",
        featured: true
      },
      {
        name: 'Storm Damage Repair',
        slug: 'storm-damage-repair',
        shortDescription: 'Emergency storm damage repair services.',
        longDescription: "We provide rapid response for storm-damaged roofs. From wind to hail damage, our team repairs and restores your roof to protect your home from further weather impact. We provide temporary tarping services to prevent immediate leaks while we plan the permanent repair. Our experts document all damage to assist with your insurance claim process. restoring your home's safety is our top priority after severe weather. Navigating the insurance claims process can be overwhelming, but our experienced team is here to assist you every step of the way. We meet with adjusters on-site to ensure all damage is properly identified and covered. Let us take the stress out of storm recovery by handling the repairs quickly and professionally, restoring your home to its pre-storm condition.",
      },
      {
        name: 'Gutter Services',
        slug: 'gutter-services',
        shortDescription: 'Gutter installation, repair, and cleaning.',
        longDescription: "Keep your home safe from water damage with our gutter services. We install, repair, and clean gutters to ensure proper water drainage away from your foundation. Clogged or damaged gutters can lead to basement flooding and landscape erosion. We offer seamless gutter options and leaf guards to minimize maintenance. Protect your home's structural integrity with our comprehensive gutter solutions. Properly functioning gutters are your home's first line of defense against basement flooding and foundation cracks. We ensure your gutters are pitched correctly to handle heavy downpours without overflowing. Whether you need a simple cleaning or a full system replacement, we provide affordable solutions to keep your home high and dry.",
      },
      {
        name: 'Commercial Roofing',
        slug: 'commercial-roofing',
        shortDescription: 'Commercial roofing solutions.',
        longDescription: "We offer specialized roofing solutions for commercial properties. Our team handles flat roofs, TPO, and other commercial systems with expert care and precision. We understand the unique challenges of commercial buildings, including drainage and equipment mounting. We work efficiently to minimize disruption to your business operations. Partner with us for reliable, long-lasting commercial roofing performance. We know that every hour of disruption affects your bottom line, which is why we offer flexible scheduling to work around your business hours. Our preventative maintenance plans help you budget for roofing costs and extend the lifespan of your commercial roof. comprehensive safety protocols ensure a secure job site for your employees and customers while we work.",
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
        longDescription: "Transform your living space with our full-service home remodeling. We manage every aspect of your project, delivering high-quality craftsmanship and your dream home. Our team coordinates all trades, ensuring smooth communication and efficient scheduling. We handle permits and inspections, so you can focus on the exciting design choices. Whether it's a historic renovation or a modern update, we treat your home with the same care as our own. Let us turn your vision into reality with a remodel that adds lasting value and joy to your daily life.",
        featured: true
      },
      {
        name: 'Kitchen Remodeling',
        slug: 'kitchen-remodeling',
        shortDescription: 'Custom kitchen design and renovation.',
        longDescription: "Create the kitchen of your dreams. Our custom kitchen remodeling services include design, cabinetry, countertops, and appliances for a beautiful, functional space. We optimize layouts to improve workflow, making cooking and entertaining a pleasure. From installing chef-grade appliances to custom lighting plans, every detail is considered. We work with you to select durable, stylish materials that stand up to daily life. Experience the heart of your home reimagined with our expert craftsmanship.",
        featured: true
      },
      {
        name: 'Bathroom Remodeling',
        slug: 'bathroom-remodeling',
        shortDescription: 'Beautiful bathroom transformations.',
        longDescription: "Update your bathroom with our expert remodeling services. From modern fixtures to tile work, we create relaxing, stylish bathrooms tailored to your needs. We can convert standard tubs to luxurious walk-in showers or install soaking tubs for a spa-like retreat. Our team ensures proper waterproofing and ventilation to prevent mold and water damage. We maximize storage and functionality, even in small spaces. Start your day in a space that feels fresh, clean, and uniquely yours.",
        featured: true
      },
      {
        name: 'Room Additions',
        slug: 'room-additions',
        shortDescription: 'Expand your living space with additions.',
        longDescription: "Need more space? Our room addition services expand your home seamlessly. We handle everything from design to construction, giving you the extra room you need. We match your existing architecture and finishes so the new space looks like it was always there. Whether it's a new bedroom, home office, or sunroom, we ensure the structural integrity and energy efficiency of the addition. Increase your home's square footage and functionality without the stress of moving.",
      },
      {
        name: 'Deck & Patio',
        slug: 'deck-patio',
        shortDescription: 'Custom deck and patio construction.',
        longDescription: "Enhance your outdoor living with a custom deck or patio. We design and build durable, attractive outdoor spaces perfect for relaxation and entertaining. utilizing high-quality materials like composite decking or natural stone, we create low-maintenance extensions of your living area. We can integrate features like built-in seating, kitchens, or fire pits to elevate your outdoor experience. Enjoy the fresh air in style with a custom-built solution that complements your landscape.",
      },
      {
        name: 'Commercial Construction',
        slug: 'commercial-construction',
        shortDescription: 'Commercial building and renovation.',
        longDescription: "We provide reliable commercial construction services for businesses. From tenant improvements to new builds, we deliver quality projects on time and on budget. We understand the importance of speed to market and minimal disruption to your operations. Our project managers communicate proactively, keeping you informed of progress and milestones. We build spaces that reflect your brand identity and support your business goals, ensuring a professional environment for your team and clients.",
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
        longDescription: "Our comprehensive mold testing and inspection services identify hidden mold growth and moisture sources. We use advanced detection equipment to ensure your home is safe and mold-free. We conduct comprehensive air and surface sampling to identify the mold type and spore concentration. You'll receive a detailed report outlining our findings and a remediation plan tailored to your property. Early detection is key to preventing health issues and structural damage. We focus on finding the moisture source that is feeding the mold, not just the mold itself. Our unbiased inspections give you the facts you need to make informed decisions about your home's health.",
        featured: true
      },
      {
        name: 'Mold Removal',
        slug: 'mold-removal',
        shortDescription: 'Safe and thorough mold remediation.',
        longDescription: "Safe and thorough mold remediation is our specialty. We contain the area, remove contaminated materials, and treat surfaces to prevent future growth, restoring a healthy environment. We contain the affected area to prevent spore cross-contamination to other parts of your home. Our team uses HEPA filtration and antimicrobial treatments to remove mold at the source. We handle the safe disposal of contaminated materials and thoroughly clean the space. Your health is our priority; we follow strict industry protocols to ensure a safe environment. We don't just cover up the problem; we physically remove the mold and treat the underlying surfaces to prevent regrowth. Rest easy knowing your home is clean, safe, and mold-free.",
        featured: true
      },
      {
        name: 'Water Damage Restoration',
        slug: 'water-damage',
        shortDescription: 'Complete water damage restoration services.',
        longDescription: "Mold often follows water damage. Our restoration services address the root cause, drying out affected areas and repairing damage to prevent mold recurrence. We use industrial-grade dehumidifiers and air movers to restore normal humidity levels. Preventing mold starts with controlling moisture, and we act fast to protect your property. We carefully monitor the drying process with moisture meters to ensure every material reaches its dry standard. Ignoring water damage often leads to costly mold repairs down the road, so let us handle the drying professionally and completely.",
        featured: true
      },
      {
        name: 'Air Quality Testing',
        slug: 'air-quality-testing',
        shortDescription: 'Indoor air quality assessment.',
        longDescription: "Breathe easier with our indoor air quality assessment. We test for mold spores and other allergens, providing detailed reports and recommendations for improvement. Our testing helps identify sources of poor air quality, from humidity issues to ventilation problems. We provide actionable recommendations to create a healthier home for you and your family. Poor indoor air quality can aggravate allergies and asthma, making your home uncomfortable. We explain the lab results in plain English, empowering you to take the right steps toward cleaner, fresher air.",
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
        longDescription: "We offer 24/7 emergency response for water damage. Our team extracts water, dries structures, and restores your property to pre-loss condition quickly and effectively. We monitor moisture levels ensuring structural materials are completely dry. Trust us to handle your emergency with speed and compassion. Water can migrate quickly behind walls and under flooring, causing hidden damage that surface drying won't reach. We use specialized equipment to dry these hard-to-reach areas, preventing warping, rotting, and mold growth.",
        featured: true
      },
      {
        name: 'Fire Damage Restoration',
        slug: 'fire-damage',
        shortDescription: 'Complete fire and smoke damage restoration.',
        longDescription: "Recovering from a fire is difficult. We handle smoke and soot removal, deodorization, and structural repairs to restore your home and peace of mind. Our process includes meticulous cleaning of salvageable items and safe disposal of damaged debris. We work closely with your insurance company to streamline the claims process. Fire damage is traumatic, but our respectful team works hard to return your home to normal as quickly as possible. We use ozone treatments and thermal fogging to eliminate stubborn smoke odors that can linger for years if not treated properly.",
        featured: true
      },
      {
        name: 'Storm Damage Restoration',
        slug: 'storm-damage',
        shortDescription: 'Emergency storm damage repair.',
        longDescription: "When storms strike, we are here to help. From wind damage to flooding, our emergency restoration services secure your property and begin repairs immediately. Our team offers emergency board-up and tarping services to protect your home from the elements. we reconstruct damaged areas, matching your home's original design and quality. Mother Nature can be unpredictable, but our response is reliable and robust. We understand the stress of a storm-damaged home and prioritize getting a roof back over your head and your life back on track.",
        featured: true
      },
      {
        name: 'Contents Restoration',
        slug: 'contents-restoration',
        shortDescription: 'Salvage and restore your belongings.',
        longDescription: "We don't just restore buildings; we save belongings too. Our contents restoration service cleans and deodorizes furniture, electronics, and personal items affected by disaster. Our secure facility provides safe storage while your home is being repaired. We treat your belongings with the utmost care, aiming to salvage sentimental and valuable items. Don't assume everything is lost; modern restoration techniques can save items that appear ruined. We inventory, pack, and transport your items with professional care, giving you one less thing to worry about during the restoration process.",
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
        longDescription: "Revitalize your carpets with our deep cleaning services. We remove tough stains, dirt, and allergens using eco-friendly solutions, leaving your carpets fresh and soft. Our high-temperature steam cleaning method kills germs and bacteria trapped deep in the fibers. We use fast-drying technology so you can walk on your floors again in hours, not days. Regular professional cleaning extends the life of your carpet and improves indoor air quality. We treat high-traffic areas with special care to restore their original texture and color.",
        featured: true
      },
      {
        name: 'Tile & Grout Cleaning',
        slug: 'tile-grout-cleaning',
        shortDescription: 'Restore your tile and grout to like-new condition.',
        longDescription: "Restore the shine to your floors. Our specialized tile and grout cleaning removes embedded dirt and grime that regular mopping can't reach, making surfaces look new again. Porous grout lines absorb stains over time, becoming discolored and unsanitary. We use high-pressure extraction to float away contaminants and restore the original color. We can also seal your grout to protect it from future staining. Say goodbye to scrubbing on your hands and knees and hello to sparkling floors.",
        featured: true
      },
      {
        name: 'Upholstery Cleaning',
        slug: 'upholstery-cleaning',
        shortDescription: 'Professional furniture cleaning.',
        longDescription: "Extend the life of your furniture with professional upholstery cleaning. We safely clean all fabric types, removing stains and odors to refresh your living space. From delicate microfibers to durable cotton blends, we have the right solution for every material. Our cleaning process removes body oils, pet dander, and dust mites that accumulate over time. We help your furniture look and smell like new again. Save money on replacement costs by revitalizing the pieces you already love.",
        featured: true
      },
      {
        name: 'Area Rug Cleaning',
        slug: 'area-rug-cleaning',
        shortDescription: 'Specialty cleaning for all rug types.',
        longDescription: "We provide specialized care for area rugs, from wool to synthetic. our gentle but effective cleaning preserves colors and fibers while removing deep-set dirt. Rugs often trap more dirt than wall-to-wall carpet and require specific attention to prevent dye bleeding. We inspect every rug to determine the safest cleaning method, whether on-site or at our facility. We also offer fringe cleaning and protective treatments. Trust your fine textiles to our experienced hands.",
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
        longDescription: "Enjoy a pristine pool without the work. Our weekly maintenance includes skimming, vacuuming, chemical balancing, and equipment checks for a sparkling clean pool. We maintain precise chemical levels to prevent algae growth and protect your swimmers' skin and eyes. Our consistent care prolongs the life of your pool finish and equipment. You'll receive a digital report after every visit detailing what we did. Spend your weekends swimming, not scrubbing.",
        featured: true
      },
      {
        name: 'Pool Equipment Repair',
        slug: 'equipment-repair',
        shortDescription: 'Pump, filter, and heater repairs.',
        longDescription: "Keep your pool running smoothly with our equipment repair services. We fix pumps, filters, heaters, and automation systems to ensure optimal performance. A noisy pump or cold heater can ruin your pool experience. Our technicians carry common parts to resolve many issues in a single visit. We diagnose energy inefficiencies that could be costing you money. Don't let a breakdown interrupt your summer fun; call us for fast, reliable repairs.",
        featured: true
      },
      {
        name: 'Pool Opening & Closing',
        slug: 'opening-closing',
        shortDescription: 'Seasonal pool preparation.',
        longDescription: "Make seasonal transitions easy. We handle professional pool opening in spring and winterization in fall, protecting your investment year-round. Proper closing is crucial to prevent freeze damage to pipes and equipment. For opening, we remove the cover, reassemble equipment, and shock the water to get it swim-ready fast. We inspect everything for winter wear and tear. Let us handle the heavy lifting of covers and chemicals.",
        featured: true
      },
      {
        name: 'Pool Remodeling',
        slug: 'pool-remodeling',
        shortDescription: 'Pool renovation and resurfacing.',
        longDescription: "Transform your pool with our remodeling services. From resurfacing and tile replacement to adding water features, we upgrade your pool's aesthetics and functionality. Update your dated pool with modern finishes like pebble aggregate or glass tile. We can add LED lighting, waterfalls, or automation for a luxury resort feel. Our energy-efficient upgrades can also lower your monthly utility bills. Turn your backyard into the ultimate personal oasis.",
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
        longDescription: "Our custom landscape design services bring your vision to life. We create beautiful, functional outdoor spaces tailored to your style and local climate. using 3D rendering tools, we help you visualize the final result before a single shovel hits the ground. We select native and drought-tolerant plants to ensure a sustainable, low-maintenance garden. From hardscapes to planting beds, every element is harmoniously integrated. specific attention to drainage and soil health ensures your landscape thrives for years to come.",
        featured: true
      },
      {
        name: 'Lawn Maintenance',
        slug: 'lawn-maintenance',
        shortDescription: 'Weekly lawn care and maintenance.',
        longDescription: "Keep your lawn lush and healthy with our weekly maintenance. Mowing, edging, and fertilization ensure your yard looks its best throughout the season. We adjust our cutting height based on seasonal needs to promote deep root growth and drought resistance. Our team meticulously trims around obstacles and clears clippings for a manicured look. We also monitor for pests and diseases, creating a proactive treatment plan. Enjoy your weekends while we do the heavy lifting to keep your curb appeal high.",
        featured: true
      },
      {
        name: 'Hardscaping',
        slug: 'hardscaping',
        shortDescription: 'Patios, walkways, and retaining walls.',
        longDescription: "Add structure and elegance with hardscaping. We design and install patios, walkways, retaining walls, and fire pits using high-quality stone and pavers. proper base preparation is our priority, ensuring your hardscape remains level and stable through freeze-thaw cycles. We offer a wide variety of textures and colors to match your home's exterior. Whether you want a cozy gathering spot or a grand entrance, our masonry experts deliver durable beauty. Invest in permanent features that define and enhance your outdoor living area.",
        featured: true
      },
      {
        name: 'Irrigation Systems',
        slug: 'irrigation',
        shortDescription: 'Sprinkler installation and repair.',
        longDescription: "Efficient watering is key to a healthy landscape. We design, install, and repair irrigation systems to ensure your plants get the right amount of water. utilizing smart controllers and rain sensors, we minimize water waste and lower your utility bills. We provide seasonal start-ups and shut-downs to protect your pipes from freezing. Our systems deliver precise hydration to lawns and garden beds alike. Protect your landscape investment with automated, worry-free watering solutions.",
      },
      {
        name: 'Tree Service',
        slug: 'tree-service',
        shortDescription: 'Tree trimming, removal, and care.',
        longDescription: "Maintain the health and safety of your trees. Our certified arborists offer trimming, pruning, and removal services to protect your property and enhance curb appeal. We assess tree structural integrity to prevent potential storm damage or falls. utilizing proper pruning techniques promotes healthy growth and better fruit production. We also perform stump grinding and complete clean-up, leaving your yard safe and tidy. Trust us to care for the largest and most valuable plants in your landscape.",
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
        longDescription: "Protect your home from unwanted guests. Our comprehensive pest control eliminates ants, spiders, roaches, and more, creating a bug-free environment. We identify entry points and treat the perimeter of your home to prevent future infestations. Our customized service plans ensure year-round protection tailored to the specific pests in your area. We use safe, family-friendly products that are tough on bugs but gentle on your home. Say goodbye to creepy crawlies and hello to peace of mind.",
        featured: true
      },
      {
        name: 'Termite Treatment',
        slug: 'termite-treatment',
        shortDescription: 'Complete termite inspection and treatment.',
        longDescription: "Termites cause billions in damage. Our termite inspections and treatments detect colonies early and provide long-lasting protection for your home's structure. We use advanced baiting systems and liquid treatments to eliminate the entire colony, including the queen. Our annual inspections ensure that your home remains termite-free for years to come. Don't let these silent destroyers compromise your biggest investment. We provide a transferable warranty on our work, adding value to your property.",
        featured: true
      },
      {
        name: 'Rodent Control',
        slug: 'rodent-control',
        shortDescription: 'Mouse and rat elimination services.',
        longDescription: "Eliminate mice and rats with our effective rodent control. We seal entry points and remove pests to prevent contamination and damage to your home. Rodents can chew through wires and insulation, posing a fire hazard and health risk. Our exclusionary methods keep them out for good, rather than just treating the symptoms. We safely trap and remove existing rodents and sanitize affect areas. reclaiming your home from these pests is our top priority.",
        featured: true
      },
      {
        name: 'Mosquito Control',
        slug: 'mosquito-control',
        shortDescription: 'Yard mosquito treatment programs.',
        longDescription: "Reclaim your yard with our mosquito control services. Barrier sprays and treatment programs reduce mosquito populations, making outdoor time safe and enjoyable. Our treatments target breeding grounds and resting areas to break the mosquito life cycle. We offer flexible scheduling for special events or season-long protection. Protect your family from mosquito-borne illnesses like West Nile and Zika. Enjoy your backyard again without the constant buzzing and biting.",
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
        longDescription: "Come home to a spotless house. Our regular cleaning services cover dusting, vacuuming, mopping, and sanitizing, giving you more time to do what you love. We work around your schedule, offering weekly, bi-weekly, or monthly visits. Our trusted team uses detailed checklists to ensure no corner is overlooked. We use green cleaning products that are safe for pets and children. Experience the joy of a consistently clean home without lifting a finger.",
        featured: true
      },
      {
        name: 'Deep Cleaning',
        slug: 'deep-cleaning',
        shortDescription: 'Thorough top-to-bottom cleaning.',
        longDescription: "Our deep cleaning service targets hidden dirt and grime. We clean baseboards, inside appliances, and hard-to-reach areas for a truly thorough clean. This service is perfect for spring cleaning or preparing for a special event. We scrub tile grout, wipe down ceiling fans, and sanitize light switches. It’s a reset button for your home’s cleanliness. Let us handle the heavy scrubbing so you can enjoy a fresh, rejuvenated living space.",
        featured: true
      },
      {
        name: 'Move In/Out Cleaning',
        slug: 'move-cleaning',
        shortDescription: 'Make your move stress-free.',
        longDescription: "Make your move stress-free. Our move-in/out cleaning ensures your new home is ready or you get your deposit back, scrubbing every corner. We understand the strict standards of landlords and new homeowners. We clean inside cabinets, drawers, and closets to ensure a blank slate. Focus on the logistics of your move while we handle the dirty work. Walk into your new chapter with a sparkling clean start.",
        featured: true
      },
      {
        name: 'Commercial Cleaning',
        slug: 'commercial-cleaning',
        shortDescription: 'Office and business cleaning.',
        longDescription: "Maintain a professional image with our commercial cleaning. We keep offices, retail spaces, and facilities clean and sanitary for employees and customers. A clean workplace boosts morale and productivity. We offer customized cleaning schedules, including after-hours service, to avoid disrupting your business. From restrooms to breakrooms, we maintain high standards of hygiene. Make a great first impression on every client who walks through your door.",
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
        longDescription: "Transform your indoor spaces with professional interior painting. We offer color consultation, meticulous prep, and flawless finish for walls, ceilings, and trim. We protect your floors and furniture before a single can is opened. Our team repairs drywall imperfections, such as nail holes and cracks, ensuring a smooth canvas. We use premium low-VOC paints that are safe for your family and durable against wear and tear. A fresh coat of paint is the most cost-effective way to dramatically change the look and feel of your home.",
        featured: true
      },
      {
        name: 'Exterior Painting',
        slug: 'exterior-painting',
        shortDescription: 'Protect and beautify your home exterior.',
        longDescription: "Boost curb appeal and protection with exterior painting. We use high-quality, weather-resistant paints to revitalize your home's siding and trim. Proper preparation is our secret to a long-lasting finish; we power wash, scrape, and prime surfaces thoroughly. Our paints are specially formulated to resist fading, cracking, and peeling in harsh weather conditions. We paint siding, trim, shutters, and doors with precision and care. Protect your home's exterior envelope while making it the envy of the neighborhood.",
        featured: true
      },
      {
        name: 'Cabinet Painting',
        slug: 'cabinet-painting',
        shortDescription: 'Kitchen cabinet refinishing.',
        longDescription: "Update your kitchen without a full remodel. Our cabinet painting and refinishing give your cabinets a factory-like finish at a fraction of the replacement cost. We remove doors and drawer fronts to spray them in our controlled facility for a smooth, brush-free look. You can choose any color to match your style, from classic white to bold navy. We use durable, furniture-grade finishes that stand up to daily kitchen use. It’s a complete kitchen transformation without the demolition dust and weeks of downtime.",
        featured: true
      },
      {
        name: 'Commercial Painting',
        slug: 'commercial-painting',
        shortDescription: 'Business and commercial painting.',
        longDescription: "We specialize in commercial painting for businesses. Our team works efficiently to minimize downtime while delivering durable, professional results. We handle large-scale projects like warehouses, office buildings, and retail centers. Our safety-trained crews are equipped with lifts and sprayers to tackle high ceilings and difficult access areas. We offer flexible scheduling, including nights and weekends, to keep your business running smoothly. Present a sharp, professional image to your clients with our expert commercial services.",
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
        longDescription: "Add timeless elegance with hardwood flooring. We offer expert installation of solid and engineered wood, as well as refinishing to restore old floors. Wood floors add warmth and significant value to your home. We help you select the perfect species and stain to complement your decor. Our dustless sanding system keeps your home clean during the refinishing process. Whether you prefer the character of hand-scraped planks or the sleek look of smooth oak, we deliver a flawless installation that lasts for generations.",
        featured: true
      },
      {
        name: 'Tile Installation',
        slug: 'tile-installation',
        shortDescription: 'Tile flooring for any room.',
        longDescription: "Upgrade your kitchen or bath with professional tile installation. We install ceramic, porcelain, and stone tile with precision alignment and grouting. From intricate backsplashes to large-format floor tiles, our craftsmanship is second to none. We ensure a waterproof substrate for wet areas like showers and mudrooms. You can choose from a vast array of patterns, including herringbone and subway layouts. Tile is not only beautiful but also incredibly durable and easy to clean, making it a smart investment.",
        featured: true
      },
      {
        name: 'Luxury Vinyl Plank',
        slug: 'lvp-flooring',
        shortDescription: 'Durable LVP flooring installation.',
        longDescription: "Get the look of wood or stone with durable Luxury Vinyl Plank (LVP). Our installation guarantees a waterproof, scratch-resistant floor perfect for high-traffic areas. LVP is the fastest-growing flooring choice for busy families with pets and kids. It’s softer underfoot than tile and warmer than wood, providing comfort and quiet. We can install it over most existing subfloors, often in just one day. Enjoy the realistic texture and high-end look of wood without the maintenance concerns or fear of water damage.",
        featured: true
      },
      {
        name: 'Carpet Installation',
        slug: 'carpet-installation',
        shortDescription: 'Professional carpet installation.',
        longDescription: "Enjoy comfort and warmth with new carpet. We provide professional installation of a wide range of styles and textures to suit any room. From plush frieze to durable berber, we have the perfect carpet for your lifestyle. We use high-quality padding to extend the life of your carpet and improve sound insulation. Our team handles furniture moving and responsible disposal of your old flooring. Wake up to softness underfoot and create a cozy atmosphere in bedrooms and living areas with our expert installation.",
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
        longDescription: "Classic and versatile, wood fencing offers privacy and beauty. We design and install custom cedar and pine fences to define your property boundaries. We use pressure-treated lumber and galvanized fasteners to resist rot and rust. Choose from styles like privacy, shadowbox, or picket to limit visibility or enhance curb appeal. We set every post in concrete for maximum stability against wind. A wood fence provides a natural, sturdy barrier that can be stained or painted to match your home.",
        featured: true
      },
      {
        name: 'Vinyl Fencing',
        slug: 'vinyl-fencing',
        shortDescription: 'Low-maintenance vinyl fencing.',
        longDescription: "Choose low-maintenance vinyl fencing for durability and style. It resists rotting and fading, providing a long-lasting solution with minimal upkeep. Vinyl fencing is impervious to moisture and insects, making it a lifetime investment. It stays clean with just a quick hose-down, never needing paint or stain. We offer a variety of colors and textures, including wood-grain simulations. Enjoy complete privacy and security with a fence that looks brand new year after year.",
        featured: true
      },
      {
        name: 'Chain Link Fencing',
        slug: 'chain-link',
        shortDescription: 'Affordable chain link solutions.',
        longDescription: "Secure your property affordably with chain link fencing. Ideal for pets and security, we offer galvanized and color-coated options. Chain link provides a robust barrier without blocking your view, perfect for large backyards. Our vinyl-coated options in black or green blend seamlessly with the landscape. It’s the most cost-effective way to keep pets in and intruders out. We install durable top rails and tension wire to prevent sagging, ensuring a secure perimeter for decades.",
        featured: true
      },
      {
        name: 'Fence Repair',
        slug: 'fence-repair',
        shortDescription: 'Fence repair and replacement.',
        longDescription: "Extend the life of your fence with our repair services. We fix leaning posts, broken pickets, and sagging gates to keep your fence secure and attractive. Don't let a few broken boards compromise your security or curb appeal. We can match weathered wood to make repairs blend in seamlessly. We also adjust gate hardware for smooth operation. Regular maintenance and timely repairs can save you the cost of a full replacement, keeping your yard safe and enclosed.",
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
  let replacedCount = 0;

  // Pattern 1: {{TOKEN}} - used in most template files (with flexible whitespace)
  const curlBraceRegex = /\{\{\s*([A-Z_]+)\s*\}\}/g;
  content = content.replace(curlBraceRegex, (match, token) => {
    if (tokenMap.hasOwnProperty(token)) {
      replacedCount++;
      return tokenMap[token];
    }
    return match;
  });

  // Pattern 2: __TOKEN__ - used in CSS files where curly braces cause issues
  const underscoreRegex = /__([A-Z_]+)__/g;
  content = content.replace(underscoreRegex, (match, token) => {
    if (tokenMap.hasOwnProperty(token)) {
      replacedCount++;
      return tokenMap[token];
    }
    return match;
  });

  const originalContent = fs.readFileSync(filePath, 'utf-8');
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    // Log details for key files to help debugging
    if (filePath.endsWith('config.ts')) {
      // log(`  - Replaced ${replacedCount} tokens in ${path.basename(filePath)}`, 'dim');
    }
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
  tokenMap['SERVICE_VERB'] = config.industry?.serviceVerb || 'repair';
  tokenMap['SERVICE_NOUN'] = config.industry?.serviceNoun || 'Services';

  // Company tokens
  tokenMap['COMPANY_NAME'] = config.company?.name || 'Company Name';
  tokenMap['YEARS_IN_BUSINESS'] = config.company?.yearsInBusiness || '1';

  // Ensure we have values for everything
  if (!tokenMap['COMPANY_TAGLINE']) tokenMap['COMPANY_TAGLINE'] = 'Professional Services';

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
  const args = process.argv.slice(2);
  const jsonFlagIndex = args.indexOf('--json-config');

  if (jsonFlagIndex === -1 || !args[jsonFlagIndex + 1]) {
    console.error('Error: --json-config argument is required for API mode.');
    rl.close();
    process.exit(1);
  }

  const jsonConfigPath = args[jsonFlagIndex + 1];
  if (!fs.existsSync(jsonConfigPath)) {
    console.error(`Error: Config file not found at ${jsonConfigPath}`);
    rl.close();
    process.exit(1);
  }

  console.clear();
  log('\n═══════════════════════════════════════════════════════════════', 'cyan');
  log('           🏗️  GHL Client Website Generator (API)               ', 'bold');
  log('═══════════════════════════════════════════════════════════════\n', 'cyan');

  log(`Loading configuration from ${jsonConfigPath}...`, 'cyan');
  const loadedConfig = JSON.parse(fs.readFileSync(jsonConfigPath, 'utf8'));

  // Generate unique site ID for multi-tenant scoping
  const siteId = crypto.randomUUID();
  loadedConfig.siteId = siteId; // Assign to loadedConfig first, then merge
  log(`\n✓ Generated Site ID: ${siteId}`, 'green');

  // Build Default Config to ensure no missing tokens
  const indSlug = loadedConfig.industry?.slug;
  let bType = 'trades';
  if (businessTypes.services.industries.includes(indSlug)) {
    bType = 'services';
  }
  const businessTypeInfo = businessTypes[bType];
  const companySlug = loadedConfig.company.slug; // Needed for defaults

  const defaultConfig = {
    company: {
      name: 'My Company',
      slug: companySlug,
      phone: '', email: '', address: '', city: '', state: '', stateFullName: '', zip: '', license: '', yearsInBusiness: '1'
    },
    branding: {
      logoUrl: '', faviconUrl: '', primaryColor: '#2563eb', secondaryColor: '#1e40af', accentColor: '#f59e0b',
      headerFooterBg: '#1e293b', headerFooterText: '#ffffff', fontHeading: 'Poppins', fontBody: 'Inter',
      icon: '🏢', tagline: 'Professional Services'
    },
    industry: { slug: 'general', type: 'General', services: [], faq: [] },
    serviceArea: { areas: [], radius: '30', primaryCity: '' },
    social: { facebook: '', instagram: '', google: '', yelp: '', bbb: '', nextdoor: '' },
    ghl: { calendarEmbed: '', formEmbed: '', chatWidget: '', webhookUrl: '', trackingId: '' },
    seo: { googleAnalyticsId: '', googleTagManagerId: '', facebookPixelId: '', metaDescription: '', metaKeywords: '' },
    reviews: { rating: '5.0', count: '0', googleReviewLink: '' },
    hours: { weekdays: '9-5', saturday: 'Closed', sunday: 'Closed', emergencyNote: '' },
    services: [], testimonials: [], faq: [], gallery: [], team: []
  };

  // Deep Merge loadedConfig into defaultConfig
  function merge(target, source) {
    for (const key in source) {
      if (source[key] instanceof Object && key in target && target[key] instanceof Object && !Array.isArray(source[key])) {
        merge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }

  const config = merge(defaultConfig, loadedConfig);

  // Validate critical fields
  if (!config.company || !config.company.slug) {
    console.error('Error: Invalid config (missing company.slug)');
    rl.close();
    process.exit(1);
  }

  // Check if base template exists
  if (!fs.existsSync(BASE_TEMPLATE)) {
    log(`Error: Base template not found at ${BASE_TEMPLATE}`, 'red');
    rl.close();
    process.exit(1);
  }

  // Determine Business Type
  // indSlug declared above
  // remaining logic handled above

  // Create destination path
  // Ensure generated directory exists
  if (!fs.existsSync(GENERATED_DIR)) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
  }

  const destFolder = path.join(GENERATED_DIR, businessTypeInfo.folder, companySlug);

  // Check if folder exists
  if (fs.existsSync(destFolder)) {
    log(`\n⚠️  Folder already exists: ${destFolder}`, 'yellow');
    // In API mode, we fail to prevent overwrite. User should delete or rename.
    rl.close();
    process.exit(1);
  }

  // Copy Template
  console.log();
  log('📦 CREATING SITE', 'yellow');
  log('─'.repeat(50), 'dim');
  copyDir(BASE_TEMPLATE, destFolder);
  log('✓ Template copied', 'green');

  // Copy Service Images
  console.log();
  log('🖼️  COPYING IMAGES', 'yellow');
  log('─'.repeat(50), 'dim');
  const scriptsImagesDir = path.join(TEMPLATES_DIR, 'scripts', 'images');
  const publicImagesServicesDir = path.join(destFolder, 'public', 'images', 'services');
  if (!fs.existsSync(publicImagesServicesDir)) {
    fs.mkdirSync(publicImagesServicesDir, { recursive: true });
  }

  if (config.services && Array.isArray(config.services)) {
    config.services.forEach(service => {
      const imageSlug = service.slug;
      const industryImageSlug = `${config.industry.slug}-${service.slug}`;

      const srcImagePng = path.join(scriptsImagesDir, `${imageSlug}.png`);
      const srcImageWebp = path.join(scriptsImagesDir, `${imageSlug}.webp`);
      const srcIndustryImagePng = path.join(scriptsImagesDir, `${industryImageSlug}.png`);
      const srcIndustryImageWebp = path.join(scriptsImagesDir, `${industryImageSlug}.webp`);

      let srcImage = null; let ext = '';
      if (fs.existsSync(srcIndustryImagePng)) { srcImage = srcIndustryImagePng; ext = '.png'; }
      else if (fs.existsSync(srcIndustryImageWebp)) { srcImage = srcIndustryImageWebp; ext = '.webp'; }
      else if (fs.existsSync(srcImagePng)) { srcImage = srcImagePng; ext = '.png'; }
      else if (fs.existsSync(srcImageWebp)) { srcImage = srcImageWebp; ext = '.webp'; }

      if (srcImage) {
        const destImage = path.join(publicImagesServicesDir, `${imageSlug}${ext}`);
        try {
          fs.copyFileSync(srcImage, destImage);
          service.image = `/images/services/${imageSlug}${ext}`;
          log(`✓ Copied image for ${service.name}`, 'dim');
        } catch (e) { console.error(e); }
      } else {
        log(`- No image found for ${service.name}`, 'dim');
      }
    });
  }

  // Copy Logo
  if (config.branding && config.branding.logoUrl) {
    const srcLogo = config.branding.logoUrl;
    let copySuccess = false;

    if (srcLogo.startsWith('/') && fs.existsSync(srcLogo)) {
      const ext = path.extname(srcLogo) || '.png';
      const destLogoName = `logo${ext}`;
      const destLogoPath = path.join(destFolder, 'public', 'images', destLogoName);

      if (!fs.existsSync(path.dirname(destLogoPath))) {
        fs.mkdirSync(path.dirname(destLogoPath), { recursive: true });
      }

      try {
        fs.copyFileSync(srcLogo, destLogoPath);
        log(`✓ Copied logo from ${srcLogo}`, 'green');
        config.branding.logoUrl = `/images/${destLogoName}`;
        copySuccess = true;
      } catch (e) {
        log(`Failed to copy logo: ${e.message}`, 'red');
      }
    }

    // If local path failed to copy, reset it to empty to avoid broken image links
    if (!copySuccess && (srcLogo.startsWith('/') || srcLogo.startsWith('\\'))) {
      config.branding.logoUrl = '';
      log('! Invalid local logo path reset to empty', 'yellow');
    }
  }

  // Copy Favicon
  if (config.branding && config.branding.faviconUrl) {
    const srcFav = config.branding.faviconUrl;
    if (srcFav.startsWith('/') && fs.existsSync(srcFav)) {
      const ext = path.extname(srcFav) || '.ico';
      const destFavName = `favicon${ext}`;
      const destFavPath = path.join(destFolder, 'public', destFavName);
      try {
        fs.copyFileSync(srcFav, destFavPath);
        log(`✓ Copied favicon from ${srcFav}`, 'green');
        config.branding.faviconUrl = `/${destFavName}`;
      } catch (e) { log(`Failed copy favicon: ${e.message}`, 'red'); }
    }
  }

  // Save client-config.json
  const configPath = path.join(destFolder, 'client-config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  log('✓ Configuration saved', 'green');

  // Update package.json
  const packagePath = path.join(destFolder, 'package.json');
  if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    pkg.name = `${companySlug}-website`;
    fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
    log('✓ Updated package.json', 'green');
  }

  // Replace tokens
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

  // Inject arrays in config.ts
  const configFilePath = path.join(destFolder, 'data', 'config.ts');
  if (fs.existsSync(configFilePath)) {
    log('Injecting services and data arrays...', 'dim');
    let configContent = fs.readFileSync(configFilePath, 'utf-8');

    const arraysToInject = [
      ['services', config.services],
      ['testimonials', config.testimonials],
      ['faqItems', config.faq],
      ['galleryImages', config.gallery],
      ['teamMembers', config.team]
    ];
    arraysToInject.forEach(([varName, data]) => {
      // Note: using regex match to ensure we catch the ' = []' or similar initialization
      configContent = configContent.replace(
        new RegExp(`export const ${varName}: any\\[\\] = \\[\\];`),
        `export const ${varName}: any[] = ${JSON.stringify(data || [], null, 2)};`
      );
    });
    fs.writeFileSync(configFilePath, configContent);
    log('✓ Injected data arrays into config.ts', 'green');
  }

  // Database Setup
  console.log();
  log('🗄️  DATABASE SETUP', 'yellow');
  log('─'.repeat(50), 'dim');
  const databaseUrl = 'postgresql://postgres:123@localhost:5432/postgres';
  const adminEmail = config.company.email;
  const dbResult = await setupDatabase(databaseUrl, {
    name: config.company.name,
    address: config.company.address,
    city: config.company.city,
    state: config.company.state,
    zip: config.company.zip,
    email: config.company.email,
    phone: config.company.phone,
    industry: indSlug
  }, adminEmail, 'ghl');

  if (dbResult && dbResult.companyId) {
    if (fs.existsSync(configFilePath)) {
      let c = fs.readFileSync(configFilePath, 'utf8');
      c = c.replace(/\{\{COMPANY_ID\}\}/g, String(dbResult.companyId));
      fs.writeFileSync(configFilePath, c);
      log(`✓ Injected company ID ${dbResult.companyId} into config.ts`, 'green');
    }
  }

  console.log();
  log('═══════════════════════════════════════════════════════════════', 'cyan');
  log('                    ✅ SITE CREATED!                            ', 'green');
  log('═══════════════════════════════════════════════════════════════\n', 'cyan');

  rl.close();
}

main().catch((error) => {
  log(`Error: ${error.message}`, 'red');
  process.exit(1);
});
