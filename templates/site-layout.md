# GHL Client Website Template
## For Construction & Home Services Businesses


React NextJS TailwindCSS Shadcn UI Framer Motion Lucide Icons Radix UI
Vercel configured for easy deployment

A fully customizable, reusable website template designed for GoHighLevel clients in the construction and home services industry. Built for quick deployment with tokenized content that can be swapped per client.

---

## Supported Industries

### Primary Trades
- General Contractors
- HVAC Companies
- Plumbing Companies
- Electrical Contractors
- Roofing Companies

### Secondary Trades
- Mold Remediation
- Water/Fire Restoration
- Carpet & Tile Cleaning
- Pool Service
- Landscaping
- Handyman Services
- Painting Contractors
- Concrete & Masonry
- Garage Door Services
- Pest Control

---

## Token System (Variables)

All content is tokenized for easy per-client customization. Tokens use the format `{{TOKEN_NAME}}`.

### Company Information
```
{{COMPANY_NAME}}           - Business name
{{COMPANY_PHONE}}          - Primary phone number (click-to-call)
{{COMPANY_EMAIL}}          - Primary email address
{{COMPANY_ADDRESS}}        - Full street address
{{COMPANY_CITY}}           - City
{{COMPANY_STATE}}          - State abbreviation
{{COMPANY_ZIP}}            - ZIP code
{{COMPANY_LICENSE}}        - License number (if applicable)
{{YEARS_IN_BUSINESS}}      - Number of years in business
```

### Branding
```
{{LOGO_URL}}               - Company logo image URL
{{FAVICON_URL}}            - Favicon URL
{{PRIMARY_COLOR}}          - Primary brand color (hex)
{{SECONDARY_COLOR}}        - Secondary brand color (hex)
{{ACCENT_COLOR}}           - Accent/CTA color (hex)
{{FONT_HEADING}}           - Heading font family
{{FONT_BODY}}              - Body font family
```

### Industry-Specific
```
{{INDUSTRY_TYPE}}          - e.g., "HVAC", "Plumbing", "Roofing"
{{INDUSTRY_SLUG}}          - e.g., "hvac", "plumbing", "roofing"
{{SERVICE_NOUN}}           - e.g., "heating & cooling", "plumbing", "roofing"
{{SERVICE_VERB}}           - e.g., "install", "repair", "replace"
{{EMERGENCY_SERVICE}}      - true/false - shows 24/7 emergency badge
```

### Service Area
```
{{SERVICE_AREAS}}          - Comma-separated list of cities/areas served
{{SERVICE_RADIUS}}         - e.g., "50 miles"
{{PRIMARY_CITY}}           - Main city for SEO
{{STATE_FULL}}             - Full state name
```

### Social & Links
```
{{FACEBOOK_URL}}           - Facebook page URL
{{INSTAGRAM_URL}}          - Instagram profile URL
{{GOOGLE_BUSINESS_URL}}    - Google Business Profile URL
{{YELP_URL}}               - Yelp page URL
{{BBB_URL}}                - BBB profile URL
{{NEXTDOOR_URL}}           - Nextdoor URL
```

### GHL Integration
```
{{GHL_CALENDAR_EMBED}}     - GHL calendar embed code
{{GHL_FORM_EMBED}}         - GHL form embed code
{{GHL_CHAT_WIDGET}}        - GHL chat widget code
{{GHL_TRACKING_ID}}        - GHL tracking pixel ID
```

### SEO & Analytics
```
{{GOOGLE_ANALYTICS_ID}}    - GA4 measurement ID
{{GOOGLE_TAG_MANAGER_ID}}  - GTM container ID
{{FACEBOOK_PIXEL_ID}}      - Meta Pixel ID
{{META_DESCRIPTION}}       - Default meta description
{{META_KEYWORDS}}          - Default meta keywords
```

---

## Site Structure

### Pages

#### 1. Homepage (Landing Page)
Primary conversion-focused landing page.

**Sections:**
1. **Hero Section**
   - Hero image
   - Headline: Industry-specific value proposition
   - Subheadline: Trust builder (years in business, license, etc.)
   - "Get Free Estimate" form (GHL embedded)
   - Click-to-call button
   - Trust badges (licensed, insured, BBB, 5-star reviews)
   - Background: Industry-relevant hero image

2. **Trust Bar**
   - Star rating + review count
   - "Licensed & Insured" badge
   - Years in business
   - "Locally Owned" badge
   - Payment options accepted

3. **Services Overview**
   - 3-6 primary services with icons
   - Brief description for each
   - "Learn More" links to services page
   - Industry-specific service icons

4. **Why Choose Us**
   - 3-4 differentiators with icons
   - e.g., "24/7 Emergency Service", "Upfront Pricing", "Licensed Technicians"

5. **Social Proof / Testimonials**
   - 3 rotating customer testimonials
   - Star ratings displayed
   - Customer name and location
   - Optional: Photo or video testimonials

6. **Service Area Map**
   - Interactive map showing coverage area
   - List of cities/neighborhoods served
   - "Not sure if we serve your area? Call us!"

7. **Photo Gallery Preview**
   - 4-6 before/after or project photos
   - "View Full Gallery" link
   - Lightbox functionality

8. **Call-to-Action Section**
   - "Ready to Get Started?"
   - Phone number (large, clickable)
   - Secondary CTA button for form

9. **FAQ Section (Optional)**
   - 4-6 common questions
   - Accordion style
   - Schema markup for SEO

**Floating Elements:**
- Sticky header with phone number and CTA
- Floating "Get Quote" button (mobile)
- AI Chatbot FAB (bottom right)
- Click-to-call FAB (mobile, bottom left)

---

#### 2. Services Page
Overview of all services offered.

**Sections:**
1. **Hero** - "Our Services" headline with brief intro
2. **Services Grid** - All services with:
   - Icon
   - Service name
   - Brief description (2-3 sentences)
   - "Learn More" link to individual service page
3. **CTA Section** - "Need help choosing? Call us!"

---

#### 3. Individual Service Pages (Dynamic)
One page per service for SEO and detailed information.

**Template Tokens:**
```
{{SERVICE_NAME}}           - e.g., "AC Repair"
{{SERVICE_SLUG}}           - e.g., "ac-repair"
{{SERVICE_DESCRIPTION}}    - Detailed service description
{{SERVICE_BENEFITS}}       - List of benefits
{{SERVICE_PROCESS}}        - How it works steps
{{SERVICE_FAQ}}            - Service-specific FAQs
{{SERVICE_IMAGE}}          - Hero image for service
```

**Sections:**
1. **Hero** - Service name, description, CTA
2. **Service Details** - What's included, process
3. **Benefits** - Why choose this service
4. **Before/After Gallery** - Service-specific photos
5. **FAQ** - Service-specific questions
6. **Related Services** - Cross-sell other services
7. **CTA** - Book this service

---

#### 4. Gallery Page
Showcase of completed work.

**Sections:**
1. **Hero** - "Our Work" headline
2. **Filter Bar** - Filter by service type
3. **Photo Grid** - Masonry or grid layout
   - Before/after comparisons
   - Project photos
   - Lightbox on click
4. **CTA** - "Want results like these?"

---

#### 5. Service Area Page
Geographic coverage information.

**Sections:**
1. **Hero** - "Areas We Serve"
2. **Interactive Map** - Google Maps embed with service area overlay
3. **Cities List** - Grid of all cities/neighborhoods served
4. **"Don't see your area?"** - Contact form or phone CTA

---

#### 6. About Us Page
Company story and team.

**Sections:**
1. **Hero** - Company story headline
2. **Our Story** - Company history, mission, values
3. **Meet the Team** - Owner/key staff photos and bios (optional)
4. **Credentials** - Licenses, certifications, affiliations
5. **Community Involvement** - Local sponsorships, charity work
6. **CTA** - "Work with us"

---

#### 7. Reviews/Testimonials Page
Social proof compilation.

**Sections:**
1. **Hero** - "What Our Customers Say"
2. **Overall Rating** - Aggregate score, total reviews
3. **Review Feed** - Pull from Google, Yelp, Facebook
4. **Video Testimonials** - If available
5. **CTA** - "Experience the difference"

---

#### 8. Blog Page (Optional)
SEO content hub.

**Sections:**
1. **Hero** - "Tips & Resources"
2. **Featured Post** - Latest or pinned article
3. **Blog Grid** - All posts with:
   - Featured image
   - Title
   - Excerpt
   - Date
   - Category tag
4. **Category Filter** - Filter by topic
5. **Newsletter Signup** - Email capture (GHL form)

---

#### 9. Contact Us Page
Primary contact page.

**Sections:**
1. **Hero** - "Get In Touch"
2. **Contact Form** - GHL embedded form
   - Name
   - Phone
   - Email
   - Service needed (dropdown)
   - Message
   - Preferred contact method
3. **Contact Information**
   - Phone (click-to-call)
   - Email (mailto link)
   - Address (link to Google Maps)
   - Hours of operation
4. **Map** - Google Maps embed
5. **Emergency Contact** - If 24/7 service offered

---

#### 10. Free Estimate Page
Dedicated landing page for estimates.

**Sections:**
1. **Hero** - "Get Your Free Estimate"
2. **What to Expect** - Process overview
3. **Estimate Form** - Detailed GHL form
   - Contact info
   - Service type
   - Project description
   - Photos upload
   - Preferred date/time
   - Property type
4. **Trust Badges** - No obligation, free, licensed
5. **FAQ** - About the estimate process

---

### Legal Pages

#### Privacy Policy Page
```
{{PRIVACY_POLICY_CONTENT}}
{{LAST_UPDATED_DATE}}
```

#### Terms of Service Page
```
{{TERMS_OF_SERVICE_CONTENT}}
{{LAST_UPDATED_DATE}}
```

#### Cookie Policy Page (if needed)
```
{{COOKIE_POLICY_CONTENT}}
```

---

## Global Components

### Header
- Logo (links to homepage)
- Navigation menu
  - Home
  - Services (dropdown with service list)
  - Gallery
  - Service Areas
  - About
  - Reviews
  - Blog (if enabled)
  - Contact
- Phone number (click-to-call)
- "Get Free Estimate" CTA button
- Mobile hamburger menu

### Footer
**Column 1: Company Info**
- Logo
- Brief company description
- License number
- Phone, email, address

**Column 2: Quick Links**
- Services
- Service Areas
- About Us
- Reviews
- Contact

**Column 3: Services**
- List of main services with links

**Column 4: Connect**
- Social media icons
- Newsletter signup
- Hours of operation

**Bottom Bar:**
- Copyright notice
- Privacy Policy link
- Terms of Service link
- Sitemap link

### Floating Elements
- **AI Chatbot Widget** (GHL chat)
  - Bottom right position
  - Custom greeting based on page
  - Lead capture integration

- **Click-to-Call Button** (Mobile)
  - Bottom left or center
  - Phone icon with number

- **"Get Quote" Sticky Button** (Mobile)
  - Scrolls with page
  - Opens form modal or navigates to estimate page

- **Back to Top Button**
  - Appears on scroll
  - Smooth scroll to top

---

## Technical Files

### Required Files
```
/favicon.ico              - Browser tab icon (32x32)
/apple-touch-icon.png     - iOS home screen icon (180x180)
/manifest.json            - PWA manifest
/robots.txt               - Search engine directives
/sitemap.xml              - XML sitemap for SEO
```

### robots.txt Template
```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: {{SITE_URL}}/sitemap.xml
```

### manifest.json Template
```json
{
  "name": "{{COMPANY_NAME}}",
  "short_name": "{{COMPANY_NAME}}",
  "description": "{{META_DESCRIPTION}}",
  "start_url": "/",
  "display": "standalone",
  "background_color": "{{PRIMARY_COLOR}}",
  "theme_color": "{{PRIMARY_COLOR}}",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## SEO Configuration

### Meta Tags (Per Page)
```html
<title>{{PAGE_TITLE}} | {{COMPANY_NAME}}</title>
<meta name="description" content="{{PAGE_DESCRIPTION}}">
<meta name="keywords" content="{{PAGE_KEYWORDS}}">
<link rel="canonical" href="{{PAGE_URL}}">

<!-- Open Graph -->
<meta property="og:title" content="{{PAGE_TITLE}}">
<meta property="og:description" content="{{PAGE_DESCRIPTION}}">
<meta property="og:image" content="{{OG_IMAGE_URL}}">
<meta property="og:url" content="{{PAGE_URL}}">
<meta property="og:type" content="website">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{{PAGE_TITLE}}">
<meta name="twitter:description" content="{{PAGE_DESCRIPTION}}">
<meta name="twitter:image" content="{{OG_IMAGE_URL}}">
```

### Schema Markup (JSON-LD)

**Local Business Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "{{SCHEMA_BUSINESS_TYPE}}",
  "name": "{{COMPANY_NAME}}",
  "image": "{{LOGO_URL}}",
  "telephone": "{{COMPANY_PHONE}}",
  "email": "{{COMPANY_EMAIL}}",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "{{COMPANY_ADDRESS}}",
    "addressLocality": "{{COMPANY_CITY}}",
    "addressRegion": "{{COMPANY_STATE}}",
    "postalCode": "{{COMPANY_ZIP}}",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "{{LATITUDE}}",
    "longitude": "{{LONGITUDE}}"
  },
  "url": "{{SITE_URL}}",
  "priceRange": "$$",
  "openingHoursSpecification": {{HOURS_JSON}},
  "sameAs": [
    "{{FACEBOOK_URL}}",
    "{{INSTAGRAM_URL}}",
    "{{GOOGLE_BUSINESS_URL}}"
  ],
  "areaServed": {{SERVICE_AREAS_JSON}},
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "{{RATING_VALUE}}",
    "reviewCount": "{{REVIEW_COUNT}}"
  }
}
```

**Service Schema (per service page):**
```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "{{SERVICE_NAME}}",
  "description": "{{SERVICE_DESCRIPTION}}",
  "provider": {
    "@type": "LocalBusiness",
    "name": "{{COMPANY_NAME}}"
  },
  "areaServed": {{SERVICE_AREAS_JSON}},
  "serviceType": "{{SERVICE_TYPE}}"
}
```

---

## Industry-Specific Configurations

### HVAC
```
SCHEMA_BUSINESS_TYPE: "HVACBusiness"
EMERGENCY_SERVICE: true
SERVICES: [
  "AC Repair",
  "AC Installation",
  "Heating Repair",
  "Furnace Installation",
  "Heat Pump Services",
  "Ductwork",
  "Indoor Air Quality",
  "Maintenance Plans"
]
```

### Plumbing
```
SCHEMA_BUSINESS_TYPE: "Plumber"
EMERGENCY_SERVICE: true
SERVICES: [
  "Drain Cleaning",
  "Leak Repair",
  "Water Heater Services",
  "Sewer Line Services",
  "Fixture Installation",
  "Pipe Repair",
  "Emergency Plumbing",
  "Repiping"
]
```

### Electrical
```
SCHEMA_BUSINESS_TYPE: "Electrician"
EMERGENCY_SERVICE: true
SERVICES: [
  "Electrical Repair",
  "Panel Upgrades",
  "Outlet Installation",
  "Lighting Installation",
  "EV Charger Installation",
  "Generator Installation",
  "Ceiling Fan Installation",
  "Electrical Inspections"
]
```

### Roofing
```
SCHEMA_BUSINESS_TYPE: "RoofingContractor"
EMERGENCY_SERVICE: true
SERVICES: [
  "Roof Repair",
  "Roof Replacement",
  "Roof Inspection",
  "Storm Damage Repair",
  "Shingle Roofing",
  "Metal Roofing",
  "Flat Roofing",
  "Gutter Services"
]
```

### General Contractor
```
SCHEMA_BUSINESS_TYPE: "GeneralContractor"
EMERGENCY_SERVICE: false
SERVICES: [
  "Kitchen Remodeling",
  "Bathroom Remodeling",
  "Home Additions",
  "Basement Finishing",
  "Deck Building",
  "Custom Homes",
  "Commercial Construction",
  "Renovations"
]
```

---

## Deployment Checklist

### Pre-Launch
- [ ] All tokens replaced with client data
- [ ] Logo and favicon uploaded
- [ ] Colors match brand guidelines
- [ ] All phone numbers correct and click-to-call working
- [ ] GHL forms embedded and tested
- [ ] GHL chat widget configured
- [ ] Google Analytics connected
- [ ] Schema markup validated
- [ ] Mobile responsive tested
- [ ] Page speed optimized (target: 90+ Lighthouse)
- [ ] SSL certificate active
- [ ] All images optimized and alt tags added
- [ ] Meta descriptions unique per page
- [ ] 404 page configured
- [ ] Contact form submissions tested

### Post-Launch
- [ ] Submit sitemap to Google Search Console
- [ ] Verify Google Business Profile linked
- [ ] Test all tracking pixels firing
- [ ] Monitor form submissions in GHL
- [ ] Set up uptime monitoring
- [ ] Schedule first content update/blog post

---

## GHL Features Integration (Value-Add for Clients)

### AI Chatbot / Conversation AI
**What It Does:** 24/7 automated lead capture and customer support via website chat.

**Implementation:**
```
{{GHL_CHAT_WIDGET}}        - Embed code for chat widget
{{GHL_CHAT_GREETING}}      - Custom greeting message
{{GHL_CHAT_AVATAR}}        - Bot avatar image URL
```

**Configuration:**
- Custom greeting per page type:
  - Homepage: "Hi! Looking for a free estimate? I can help!"
  - Service page: "Have questions about {{SERVICE_NAME}}? Ask me anything!"
  - Contact page: "Need to reach us? I can connect you with our team."
- Lead capture fields: Name, Phone, Email, Service Needed
- Auto-qualification questions based on industry
- Appointment booking integration
- After-hours auto-response with callback scheduling
- Handoff to human when requested

**Industry-Specific Bot Flows:**
- HVAC: "Is this an emergency? AC not cooling or heating issue?"
- Plumbing: "Is there active water damage? Emergency or scheduled service?"
- Roofing: "Is this storm damage or routine maintenance?"
- Electrical: "Are you experiencing a power outage or safety concern?"

---

### Free Quote / Estimate System
**What It Does:** Automated quote request capture with smart qualification.

**Implementation:**
```
{{GHL_QUOTE_FORM}}         - Quote form embed code
{{GHL_QUOTE_CALENDAR}}     - Calendar for estimate scheduling
```

**Quote Form Fields:**
1. **Contact Information**
   - Full Name (required)
   - Phone Number (required)
   - Email Address (required)
   - Property Address

2. **Service Details**
   - Service Type (dropdown - industry-specific)
   - Urgency Level (Emergency / This Week / Flexible)
   - Property Type (Residential / Commercial)
   - Brief Description (textarea)

3. **Photo Upload** (Optional but encouraged)
   - "Upload photos of the issue for faster, more accurate quotes"
   - Multiple file upload support
   - Accepted formats: JPG, PNG, HEIC

4. **Scheduling Preference**
   - Preferred Date/Time for estimate
   - Best time to call
   - Preferred contact method (Call / Text / Email)

**Automation Triggers:**
- Instant SMS confirmation to customer
- Notification to business owner/dispatcher
- Auto-add to GHL pipeline: "New Quote Request"
- If emergency: Priority notification + immediate callback trigger
- Follow-up sequence if no response in 24 hours

---

### Missed Call Text-Back
**What It Does:** Automatically texts customers who call but don't get through.

**Implementation:**
```
{{GHL_MISSED_CALL_WORKFLOW}}   - Workflow ID
{{MISSED_CALL_MESSAGE}}        - Custom text message
```

**Default Message Template:**
```
Hi! This is {{COMPANY_NAME}}. Sorry we missed your call!

Are you looking for:
1️⃣ A free estimate
2️⃣ To schedule service
3️⃣ Emergency help

Reply with a number or tell us how we can help!
```

**Follow-up Sequence:**
- Immediate: Missed call text
- +2 hours: "Still need help? Reply or call us back at {{COMPANY_PHONE}}"
- +24 hours: "We want to earn your business! Get 10% off your first service. Reply YES for details."

---

### Appointment Booking / Calendar
**What It Does:** Online scheduling for estimates and service appointments.

**Implementation:**
```
{{GHL_CALENDAR_EMBED}}         - Calendar embed code
{{GHL_CALENDAR_LINK}}          - Direct booking link
```

**Calendar Configuration:**
- **Estimate Calendar**
  - Duration: 30-60 minutes
  - Buffer: 15 minutes between appointments
  - Availability: Business hours + some evenings/weekends
  - Booking notice: Minimum 2 hours ahead

- **Service Calendar** (if applicable)
  - Duration: Varies by service type
  - Technician assignment integration
  - Job-specific time slots

**Booking Confirmation Flow:**
1. Customer selects date/time
2. Fills in contact info + service details
3. Receives instant SMS + email confirmation
4. Reminder: 24 hours before
5. Reminder: 2 hours before
6. Post-appointment: Review request

---

### Review Request Automation
**What It Does:** Automatically requests Google reviews after completed jobs.

**Implementation:**
```
{{GHL_REVIEW_WORKFLOW}}        - Review request workflow ID
{{GOOGLE_REVIEW_LINK}}         - Direct Google review link
```

**Review Request Sequence:**
1. **Job Completed Trigger** (manual or automated)
2. **+2 hours:** SMS Request
   ```
   Hi {{CUSTOMER_NAME}}! Thank you for choosing {{COMPANY_NAME}}!

   We'd love to hear about your experience. Would you take 30 seconds to leave us a review?

   {{GOOGLE_REVIEW_LINK}}

   Thank you! 🙏
   ```
3. **+24 hours (if no review):** Follow-up
   ```
   Quick reminder - your review helps local families find trusted {{INDUSTRY_TYPE}} services!

   {{GOOGLE_REVIEW_LINK}}
   ```
4. **+7 days (if no review):** Final ask with incentive (optional)

**Negative Review Prevention:**
- First ask: "How was your experience? Reply 1-5"
- If 4-5: Send review link
- If 1-3: "We're sorry to hear that. A manager will call you shortly to make it right."

---

### Quote Follow-Up Automation
**What It Does:** Nurtures estimate requests until they convert or decline.

**Implementation:**
```
{{GHL_QUOTE_FOLLOWUP_WORKFLOW}} - Quote follow-up workflow ID
```

**Follow-Up Sequence:**
1. **Estimate Sent** (Trigger)
2. **+2 hours:** SMS
   ```
   Hi {{CUSTOMER_NAME}}, {{OWNER_NAME}} from {{COMPANY_NAME}} here.

   Just sent over your estimate for {{SERVICE_TYPE}}. Any questions? Reply to this text or call me directly.
   ```
3. **+24 hours:** Email with estimate PDF attached + FAQ
4. **+3 days:** SMS
   ```
   Hey {{CUSTOMER_NAME}}, just checking in on that {{SERVICE_TYPE}} estimate.

   Ready to move forward? We can get you scheduled this week!

   Reply YES to book or QUESTION if you need more info.
   ```
5. **+7 days:** Value-add email (tips related to their service need)
6. **+14 days:** Final SMS
   ```
   Hi {{CUSTOMER_NAME}}, closing out your estimate for {{SERVICE_TYPE}}.

   Still interested? We'd love to earn your business.

   Reply YES to reactivate or NO if you went another direction.
   ```
7. **If "NO":** Move to "Lost" pipeline + ask for feedback
8. **If no response:** Move to "Stale" + add to monthly nurture list

---

### Lead Pipeline / CRM Setup
**What It Does:** Organizes all leads by status for easy tracking.

**Pipeline Stages:**
```
1. New Lead           → Just came in, needs first contact
2. Contacted          → Reached out, awaiting response
3. Estimate Scheduled → Appointment booked
4. Estimate Sent      → Quote delivered, awaiting decision
5. Follow-Up          → In nurture sequence
6. Won                → Job booked! 🎉
7. Lost               → Didn't convert (track reason)
8. Stale              → No response after full sequence
```

**Automation by Stage:**
- **New Lead:** Instant notification + auto-text if after hours
- **Contacted → No response 48hrs:** Move to Follow-Up
- **Estimate Sent → 7 days:** Auto follow-up sequence
- **Won:** Trigger job scheduling workflow
- **Lost:** Trigger feedback request + add to re-engagement list

---

### Two-Way SMS / Unified Inbox
**What It Does:** Manage all customer communication in one place.

**Features to Enable:**
- SMS conversations synced to contact record
- Facebook Messenger integration
- Google Business Messages integration
- Email conversations
- Call recordings linked to contact
- Internal notes and tags

**Quick Responses (Templates):**
```
{{QUICK_RESPONSE_ESTIMATE}}    - "We can have someone out for a free estimate..."
{{QUICK_RESPONSE_SCHEDULE}}    - "Great! Let me get you scheduled..."
{{QUICK_RESPONSE_HOURS}}       - "Our hours are..."
{{QUICK_RESPONSE_EMERGENCY}}   - "For emergencies, call us at..."
```

---

### Email Marketing / Nurture Campaigns
**What It Does:** Keeps past customers engaged for repeat business.

**Campaign Types:**

1. **Seasonal Maintenance Reminders**
   - HVAC: Spring AC tune-up, Fall furnace check
   - Plumbing: Winter pipe prep, Water heater flush
   - Roofing: Spring inspection, Pre-storm check
   - Landscaping: Spring cleanup, Fall leaf removal

2. **Re-engagement Campaigns**
   - "It's been a while! Time for your annual {{SERVICE_TYPE}} checkup?"
   - Special offer for returning customers

3. **Referral Requests**
   - "Know someone who needs {{SERVICE_TYPE}}? Refer a friend and get $XX off your next service!"

4. **Educational Content**
   - Tips for maintaining their home systems
   - Seasonal checklists
   - "Signs you need to call a {{INDUSTRY_TYPE}} professional"

---

### Reputation Management Dashboard
**What It Does:** Monitor and respond to online reviews.

**Integration Points:**
- Google Business Profile
- Yelp
- Facebook
- BBB
- Angi/HomeAdvisor
- Nextdoor

**Alerts:**
- New review notification (SMS + email to owner)
- Negative review alert (immediate notification)
- Weekly review summary report

**Response Templates:**
```
{{REVIEW_RESPONSE_POSITIVE}}   - Thank you template
{{REVIEW_RESPONSE_NEGATIVE}}   - Apology + resolution template
{{REVIEW_RESPONSE_NEUTRAL}}    - Engagement template
```

---

### Payment Processing (Pro Plan)
**What It Does:** Accept payments directly through the platform.

**Implementation:**
```
{{GHL_PAYMENT_LINK}}           - Payment link for invoices
{{GHL_INVOICE_TEMPLATE}}       - Invoice template ID
```

**Features:**
- Send invoices via SMS/email
- Accept credit card payments
- Payment reminders automation
- Partial payment / payment plans
- Receipt generation

---

### Reporting & Analytics
**What It Does:** Track ROI and performance metrics.

**Key Dashboards:**
1. **Lead Source Report**
   - Where leads are coming from
   - Conversion rate by source
   - Cost per lead / Cost per acquisition

2. **Pipeline Report**
   - Leads by stage
   - Average time in each stage
   - Win/loss rate

3. **Revenue Report**
   - Jobs won this month
   - Revenue by service type
   - Average job value

4. **Communication Report**
   - Response times
   - Messages sent/received
   - Call volume

**Automated Reports:**
- Weekly summary email to owner
- Monthly performance review
- Quarterly business insights

---

## GHL Setup Checklist (Per Client)

### Initial Setup
- [ ] Sub-account created with client branding
- [ ] Custom domain connected
- [ ] Phone number provisioned
- [ ] Email domain verified
- [ ] User accounts created (owner, office staff)

### Automation Setup
- [ ] Missed call text-back workflow active
- [ ] Quote form created and tested
- [ ] Quote follow-up workflow configured
- [ ] Review request workflow configured
- [ ] Appointment reminders set up
- [ ] After-hours auto-response configured

### AI Chatbot Setup
- [ ] Chat widget installed on website
- [ ] Custom greeting messages configured
- [ ] Lead capture fields set up
- [ ] Qualification flow built
- [ ] Handoff triggers configured

### Pipeline Setup
- [ ] Pipeline stages created
- [ ] Stage automation rules set
- [ ] Tags and custom fields configured
- [ ] Team notifications configured

### Communication Setup
- [ ] SMS templates created
- [ ] Email templates created
- [ ] Quick response shortcuts saved
- [ ] Unified inbox tested

### Integrations
- [ ] Google Business Profile connected
- [ ] Facebook connected (if applicable)
- [ ] Calendar synced
- [ ] Payment processing configured (Pro plan)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-XX-XX | Initial template |
| 1.1 | 2024-XX-XX | Added GHL features integration section |

