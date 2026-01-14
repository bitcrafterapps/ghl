# SEO Checklist for JobCapture

## ✅ Implemented

### Technical SEO
- [x] **Meta tags** - Title, description, keywords optimized for contractor searches
- [x] **Open Graph tags** - For Facebook/LinkedIn sharing
- [x] **Twitter Card tags** - For Twitter sharing  
- [x] **JSON-LD Structured Data** - Organization, Website, SoftwareApplication, Service, FAQPage schemas
- [x] **Sitemap** - Auto-generated at /sitemap.xml
- [x] **Robots.txt** - Proper crawl directives at /robots.txt
- [x] **Manifest.json** - PWA manifest for mobile
- [x] **Viewport meta** - Mobile-responsive
- [x] **Canonical URL** - Prevents duplicate content issues
- [x] **Language tag** - `lang="en"` on HTML element

### On-Page SEO
- [x] **H1 tag** - One per page, keyword optimized
- [x] **Heading hierarchy** - Proper H1 → H2 → H3 structure
- [x] **Semantic HTML** - section, article, nav, footer tags
- [x] **Internal linking** - Navigation links to sections
- [x] **Mobile-first design** - Responsive on all devices

---

## 🔲 TODO Before Launch

### Assets to Create
- [ ] **OG Image** (1200x630px) - Create `/public/og-image.png`
  - Show: Logo, headline "Book 20-40% More Jobs", construction imagery
  - Use orange (#f97316) and dark background
  
- [ ] **Favicon** - Create these files in `/public/`:
  - [ ] `favicon.ico` (32x32)
  - [ ] `apple-touch-icon.png` (180x180)
  - [ ] `icon-192.png` (192x192)
  - [ ] `icon-512.png` (512x512)
  - [ ] `logo.png` (200x200 for schema)

### Verification
- [ ] **Google Search Console** - Add site and replace verification code in layout.tsx
- [ ] **Bing Webmaster Tools** - Optional but helpful
- [ ] **Google Analytics / GA4** - Add tracking code

### Environment Variables
Add to `.env.local`:
```
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

---

## 📈 Post-Launch SEO Strategy

### Content Strategy (High Priority)
Create these pages for niche-specific SEO:

1. **`/hvac-automation`** - "AI Automation for HVAC Companies"
2. **`/plumbing-automation`** - "AI Booking System for Plumbers"  
3. **`/roofing-automation`** - "Missed Call Recovery for Roofers"
4. **`/electrical-automation`** - "Lead Management for Electricians"
5. **`/restoration-automation`** - "AI for Water & Fire Restoration"

Each page should target:
- "[Industry] + missed call text back"
- "[Industry] + lead automation"
- "[Industry] + booking software"
- "best CRM for [industry]"

### Blog Content Ideas (For Organic Traffic)
1. "How Many Jobs Are You Losing to Missed Calls? (Calculator)"
2. "5 Reasons HVAC Companies Lose 40% of Leads (And How to Fix It)"
3. "The True Cost of Slow Quote Follow-Up for Contractors"
4. "How to Get More Google Reviews for Your Contracting Business"
5. "After-Hours Lead Capture: Why Your Competitors Are Beating You"
6. "AI vs. Answering Services: Which Is Better for Contractors?"

### Link Building
- [ ] Submit to contractor directories (HomeAdvisor, Angi, Thumbtack partner pages)
- [ ] Guest post on contractor/home service blogs
- [ ] Create shareable tools (ROI calculator, missed call cost calculator)
- [ ] Get listed on software review sites (G2, Capterra, Software Advice)

### Local SEO (If Applicable)
- [ ] Google Business Profile (if you have a physical location)
- [ ] Local citations in contractor directories
- [ ] Location-specific landing pages if serving specific areas

---

## 🎯 Target Keywords by Priority

### Primary Keywords (High Volume, High Intent)
| Keyword | Monthly Searches | Difficulty |
|---------|------------------|------------|
| contractor crm | 1,900 | Medium |
| hvac software | 1,600 | Medium |
| contractor lead management | 720 | Low |
| missed call text back | 590 | Low |
| plumber software | 480 | Medium |

### Long-Tail Keywords (Lower Volume, High Conversion)
| Keyword | Intent |
|---------|--------|
| how to stop losing contractor leads | Problem-aware |
| automated follow up for contractors | Solution-aware |
| best crm for small contractor | Comparison |
| ai answering service for contractors | Solution-aware |
| missed call recovery service | Solution-aware |

### Industry-Specific Keywords
- "hvac missed call text back"
- "plumber lead automation software"  
- "roofing contractor crm"
- "electrician booking system"
- "restoration company lead management"

---

## 🔧 Technical Improvements

### Performance (Affects Rankings)
- [ ] Optimize images (WebP format, lazy loading)
- [ ] Enable Next.js Image optimization
- [ ] Minimize JavaScript bundle
- [ ] Use CDN for static assets
- [ ] Target Core Web Vitals:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1

### Security (Trust Signals)
- [ ] HTTPS (required)
- [ ] Security headers (CSP, HSTS)
- [ ] Privacy policy page
- [ ] Terms of service page

---

## 📊 Tracking & Monitoring

### Set Up
- [ ] Google Search Console - Monitor rankings, clicks, impressions
- [ ] Google Analytics 4 - Track user behavior, conversions
- [ ] Rank tracking tool (Ahrefs, SEMrush, or Ubersuggest)

### KPIs to Track
- Organic traffic growth
- Keyword rankings for target terms
- Click-through rate (CTR) from search
- Conversion rate (demo bookings / audit requests)
- Bounce rate by page
- Page load speed

---

## 🚀 Quick Wins

1. **Add your real phone number** to schema markup
2. **Create OG image** - This alone boosts social shares
3. **Submit sitemap** to Google Search Console immediately after launch
4. **Get 3-5 backlinks** from contractor-related sites in first month
5. **Add testimonials** with schema markup when you get them

---

## Notes

- Focus on **long-tail keywords** first - easier to rank, higher intent
- **Content is king** - Industry-specific pages will drive most organic traffic
- **Reviews/testimonials** with schema markup boost trust signals significantly
- Update this checklist as you complete items

