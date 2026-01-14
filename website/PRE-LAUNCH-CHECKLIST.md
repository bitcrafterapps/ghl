# JobCapture Website Pre-Launch Checklist

> Complete all items before going live. Estimated time: 1-2 hours.

---

## 🔴 Critical (Must Complete)

### Contact Information
- [ ] **Update phone number in footer**
  - File: `src/components/footer.tsx` (line 34-36)
  - Change: `(123) 456-7890` → Your real number
  - Change: `tel:+1234567890` → Your real number with country code

- [ ] **Update phone number in schema**
  - File: `src/app/layout.tsx` (line 184)
  - Change: `"+1-XXX-XXX-XXXX"` → Your real number

- [ ] **Verify email address**
  - File: `src/components/footer.tsx` (line 30-32)
  - Currently: `hello@jobcapture.ai`
  - Update if using different email

### Environment Variables
- [ ] **Create `.env.local` file** in website root:
  ```bash
  NEXT_PUBLIC_SITE_URL=https://yourdomain.com
  ```

- [ ] **For production**, set this in your hosting platform (Vercel, Netlify, etc.)

### Missing Assets
Create these files in `/public/`:

- [ ] **`og-image.png`** (1200 x 630px)
  - Used for: Facebook, LinkedIn, Twitter sharing
  - Include: Logo, headline, construction imagery
  - Colors: Orange (#f97316), dark background (#0a0c10)

- [ ] **`favicon.ico`** (32 x 32px)
  - Used for: Browser tab icon

- [ ] **`apple-touch-icon.png`** (180 x 180px)
  - Used for: iOS home screen bookmark

- [ ] **`icon-192.png`** (192 x 192px)
  - Used for: Android home screen, PWA

- [ ] **`icon-512.png`** (512 x 512px)
  - Used for: PWA splash screen

- [ ] **`logo.png`** (200 x 200px)
  - Used for: Schema.org structured data

### Google Search Console
- [ ] **Add site to Google Search Console**
  1. Go to https://search.google.com/search-console
  2. Add property with your domain
  3. Get verification code

- [ ] **Update verification code**
  - File: `src/app/layout.tsx` (line 132)
  - Change: `"your-google-verification-code"` → Your actual code

---

## 🟡 Recommended (Should Complete)

### Host Images Locally
- [ ] **Download hero background image**
  - Current: External Unsplash URL in `src/components/sections/hero.tsx`
  - Download from: https://images.unsplash.com/photo-1504307651254-35680f356dfd
  - Save to: `/public/images/hero-construction.jpg`
  - Update code to use local path

### Connect Form Submissions
- [ ] **Book Demo form** → Connect to your CRM/webhook
  - File: `src/components/modals/book-demo-modal.tsx`
  - Replace simulated submission with actual API call

- [ ] **Audit Request form** → Connect to your CRM/webhook
  - File: `src/components/modals/audit-modal.tsx`
  - Replace simulated submission with actual API call

### Legal Pages
- [ ] **Create Privacy Policy**
  - Create: `src/app/privacy/page.tsx`
  - Update footer link

- [ ] **Create Terms of Service**
  - Create: `src/app/terms/page.tsx`
  - Update footer link

### Social Media
- [ ] **Update social links in schema** (or remove if not ready)
  - File: `src/app/layout.tsx` (lines 174-178)
  - Update Twitter, LinkedIn, Facebook URLs

- [ ] **Create Twitter account** `@jobcapture` (optional)
- [ ] **Create LinkedIn company page** (optional)

---

## 🟢 Optional (Nice to Have)

### Analytics
- [ ] **Set up Google Analytics 4**
  - Create GA4 property
  - Add tracking code to `src/app/layout.tsx`

- [ ] **Set up conversion tracking**
  - Track: Demo bookings, audit requests

### Performance
- [ ] **Test with Lighthouse**
  - Target scores: 90+ across all categories
  - Run: Chrome DevTools → Lighthouse tab

- [ ] **Test Core Web Vitals**
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1

### Additional SEO
- [ ] **Submit sitemap to Google**
  - URL: `https://yourdomain.com/sitemap.xml`
  - Submit in Google Search Console

- [ ] **Create industry landing pages** (post-launch)
  - `/hvac-automation`
  - `/plumbing-automation`
  - `/roofing-automation`
  - `/electrical-automation`

---

## 🚀 Deployment

### Option 1: Vercel (Recommended)
```bash
# 1. Push code to GitHub
# 2. Connect repo to Vercel
# 3. Add environment variable:
#    NEXT_PUBLIC_SITE_URL=https://yourdomain.com
# 4. Deploy
```

### Option 2: Other Platforms
```bash
# Build for production
npm run build

# Start production server
npm start
# Runs on port 3000
```

### Post-Deployment
- [ ] **Test all pages** on live URL
- [ ] **Test modals** open and close correctly
- [ ] **Test forms** submit properly
- [ ] **Test on mobile** device (not just browser emulator)
- [ ] **Test social sharing** - paste URL into Twitter/LinkedIn/Facebook
- [ ] **Verify sitemap** accessible at `/sitemap.xml`
- [ ] **Verify robots.txt** accessible at `/robots.txt`

---

## 📞 Quick Reference

| Item | Location | Current Value |
|------|----------|---------------|
| Phone (Footer) | `footer.tsx:36` | ✅ (949) 615-4035 |
| Phone (Schema) | `layout.tsx:184` | ✅ +1-949-615-4035 |
| Email | `footer.tsx:32` | hello@jobcapture.ai |
| Site URL | `.env.local` | https://jobcapture.ai |
| Google Verification | `layout.tsx:132` | your-google-verification-code |

---

## ✅ Final Sign-Off

Before launching, confirm:

- [ ] All critical items completed
- [ ] Site tested on desktop Chrome, Safari, Firefox
- [ ] Site tested on mobile iOS and Android
- [ ] Forms submit to correct destination
- [ ] All placeholder text replaced
- [ ] Domain DNS configured
- [ ] SSL certificate active (HTTPS)

**Launch Date:** _______________

**Launched By:** _______________

---

*Last updated: December 2024*

