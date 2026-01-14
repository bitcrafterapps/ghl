# GoHighLevel Integration Guide

Step-by-step instructions for connecting your website to GoHighLevel (GHL) subaccount.

---

## Step 1: Access Your GHL Subaccount

1. Log in to GoHighLevel at **app.gohighlevel.com**
2. Select your subaccount (or create one if needed)

---

## Step 2: Create a Calendar for Free Estimates

1. Go to **Settings** > **Calendars**
2. Click **+ Create Calendar**
3. Configure:
   - Name: "Free Pool Estimate"
   - Duration: 30 minutes (or your preference)
   - Set your availability hours
4. Click **Save**
5. Go to **Calendar Settings** > **Embed Code**
6. Copy the **iframe embed code**

---

## Step 3: Create a Contact Form (Optional)

1. Go to **Sites** > **Forms**
2. Click **+ Create Form**
3. Add fields:
   - Name
   - Phone
   - Email
   - Service Needed (dropdown)
   - Message
4. **Save** the form
5. Click **Get Form Code** > Copy the embed code

---

## Step 4: Set Up Chat Widget

1. Go to **Settings** > **Chat Widget**
2. Customize colors to match your brand (Primary: `#0891b2`)
3. Set up automated greeting message
4. Copy the **widget embed code**

---

## Step 5: Get Your Webhook URL (for form submissions)

1. Go to **Automation** > **Workflows**
2. Create a new workflow
3. Set trigger: **Inbound Webhook**
4. Copy the **Webhook URL**
5. Add actions:
   - Create/Update Contact
   - Send notification
   - Add to pipeline

---

## Step 6: Update Your Website Config

Edit `src/data/config.ts` with your GHL codes:

```typescript
// GHL Integration
ghl: {
  calendarEmbed: '<iframe src="https://api.leadconnectorhq.com/widget/booking/YOUR_CALENDAR_ID" ...></iframe>',
  formEmbed: '<iframe src="https://api.leadconnectorhq.com/widget/form/YOUR_FORM_ID" ...></iframe>',
  chatWidget: '<script src="https://widgets.leadconnectorhq.com/loader.js" data-resources-url="..." data-widget-id="YOUR_WIDGET_ID"></script>',
  trackingId: "YOUR_TRACKING_ID",
  webhookUrl: "https://services.leadconnectorhq.com/hooks/YOUR_WEBHOOK_ID",
},
```

---

## Step 7: Where Each Integration Appears

| Integration | Where It Shows |
|-------------|----------------|
| **Calendar Embed** | `/free-estimate` page |
| **Form Embed** | `/contact` page (replaces default form) |
| **Chat Widget** | Bottom-right corner on all pages |
| **Webhook URL** | Receives form submissions from default forms |

---

## Step 8: Test Your Integrations

1. **Calendar**: Visit `/free-estimate` and book a test appointment
2. **Chat Widget**: Look for chat bubble in bottom-right
3. **Forms**: Submit a test form on `/contact`
4. **Check GHL**: Verify leads appear in your GHL subaccount under **Contacts**

---

## Quick Reference: Config File Location

```
templates/services/eternity-pool/src/data/config.ts
```

Or update via `client-config.json`:

```
templates/services/eternity-pool/client-config.json
```

Then run the token replacement script:

```bash
cd templates/services/eternity-pool
node scripts/replace-tokens.js --config client-config.json
```
