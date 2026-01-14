## GoHighLevel – Same‑Day Getting Started Guide

This doc is a **practical checklist** to get you live in GoHighLevel (GHL) **today**, with a clear view of **costs** and what to set up first for your construction/trades offer.

---

### 1. Choose the Right GHL Plan & Core Costs

> Pricing changes over time; these are typical ranges. Check the GHL pricing page for exact current numbers.

- **Agency Starter (approx. \$97/month)**  
  - 1 agency account + 1 main “location” (sub‑account).  
  - Enough to get your first few clients and test the offer.  

- **Agency Unlimited / SaaS (approx. \$297/month+)**  
  - Multiple client sub‑accounts, SaaS mode, rebilling, etc.  
  - Best once you have a few paying clients and want to scale.

**Recommendation to start today:**  
- Begin with **Agency Starter** (~\$97/month).  
- Use **one sub‑account for yourself** as the “prototype” for your snapshots and workflows.  

Other expected costs (ballpark, monthly):

- Phone/SMS usage (through Twilio inside GHL): **\$10–\$50+** depending on volume.  
- Email sending (Mailgun or SMTP): often **included/low** for early usage.  
- Stripe fees for payments: **~2.9% + \$0.30 per charge** (no GHL markup).  

---

### 2. Create Your GHL Account & Agency Settings (30–60 Min)

1. **Sign up** for GoHighLevel (Agency Starter).  
2. In the **Agency View**, fill out:
   - Business name, logo, contact info.  
   - Time zone and default currency (USD).  
3. Set up **Stripe integration** (optional but recommended):
   - Connect Stripe under **Integrations** so you can accept payments, charge setup fees, or sell plans later.  
4. Connect **email sending**:
   - Use GHL’s Mailgun setup or your own SMTP provider.  
   - Verify sending domains so cold/warm emails hit inboxes more reliably.

You do **not** need all SaaS features on day 1 — focus on getting one clean sub‑account working for yourself.

---

### 3. Create Your First Sub‑Account (Your “Agency Sandbox”)

You’ll use this as:

- A **demo environment** for contractors.  
- A **template/snapshot** you can later clone into client accounts.

Steps:

1. In **Agency View → Accounts**, click **“Add Account”**.  
2. Choose your city and a generic business to start (you can name it after your own brand).  
3. Set:
   - Time zone.  
   - Default currency.  
4. Log into that sub‑account; from here on you’re in **Location View**.

---

### 4. Connect Phone & SMS (15–30 Min)

Your offer heavily depends on **missed call → SMS** and SMS‑based automations.

1. Inside the sub‑account, go to **Phone Numbers**.  
2. Purchase a **local number** via GHL (Twilio under the hood):  
   - Cost is usually **\$1–\$2/month per number** plus usage.  
3. Decide how you’ll use it to start:
   - **Option A:** Forward your existing business line to the GHL number.  
   - **Option B:** Use the GHL number just for outbound and specific campaigns at first.

For a real contractor, you’ll:

- Either port their number into GHL/Twilio.  
- Or forward their existing number into GHL.

For today, you just need **one working number** to test automation and demos.

---

### 5. Basic Pipelines & Calendars (60–90 Min)

You don’t need perfection. You need a **clean, simple flow**:

#### 5.1 Create a Simple Sales Pipeline

In **Opportunities / Pipelines**:

- Create pipeline: **“Leads & Jobs”** with stages:
  - New Lead  
  - Estimate Scheduled  
  - Estimate Sent  
  - Job Won  
  - Job Lost  

This is enough to **visually track** what your automation is doing.

#### 5.2 Create a Calendar for Estimates / Site Visits

In **Calendars**:

- Create calendar: **“Estimate Visits”**.  
- Set:
  - Your available days and time windows.  
  - Minimum notice and buffer times.  
- Turn on **email/SMS reminders** (basic is fine).

This is the calendar you’ll show in demos and plug into your booking automations.

---

### 6. Core Workflows to Build First (2–3 Hours)

Today’s goal: ship a **v1 automation stack** you can demo to a pool company, HVAC company, or any trade.

#### Workflow 1 – Missed Call → SMS

- **Trigger:** Inbound phone call **missed** on your GHL number.  
- **Action:** Send SMS:
  - “Hey, sorry we missed your call — are you looking for help with \[service\]? Reply here and we’ll get you taken care of.”  
- **Optional:**  
  - Create/Update Contact.  
  - Add to pipeline stage: **New Lead**.

#### Workflow 2 – New Web Lead → AI Intake / Qualification

- **Trigger:** Form submission or funnel/website form.  
- **Actions:**  
  - Send SMS asking key questions (you’ll customize per niche).  
  - Wait for replies and tag/score based on answers.  
  - Move qualified leads to **Estimate Scheduled** once they book a time.

#### Workflow 3 – Quote Follow‑Up

- **Trigger:** Opportunity moved to **Estimate Sent**.  
- **Actions:**  
  - Day 1: “Just checking in — any questions on the estimate we sent?”  
  - Day 3: Nudge with a benefit.  
  - Day 7: Light break‑up text.  
  - If they reply/close, remove from workflow and update pipeline stage.

#### Workflow 4 – Review Request After Job Won

- **Trigger:** Opportunity moved to **Job Won**.  
- **Actions:**  
  - Send SMS: “Thanks again for working with us — would you mind leaving a quick Google review? It helps a ton. [link]”

These 3–4 workflows are enough to **demo real value** and get a first client excited.

---

### 7. Snapshots & Reuse (Optional for Today, Important Later)

Once you have:

- Pipeline  
- Calendar  
- 3–4 core workflows  
- Templates for SMS/emails

You can create a **Snapshot**:

1. Go to **Agency View → Accounts**.  
2. Click on your sub‑account → **Create Snapshot**.  
3. Select the assets (pipelines, workflows, forms, etc.).  
4. Save as `Construction & Trades AI Booking Snapshot` (or similar).

Later, for each new client:

- Create a new sub‑account.  
- Apply your snapshot.  
- Tweak copy, branding, and details per niche (HVAC, pool, plumbing, etc.).

For **today**, it’s okay to wait on snapshots until you’re happy with v1.

---

### 8. Same‑Day Action Plan (What to Do in the Next 4–6 Hours)

If you want to be “up and running” by tonight:

1. **Sign up** for GHL Agency Starter (~\$97).  
2. Set **agency basics** (branding, Stripe, email sending).  
3. Create **one sub‑account** as your sandbox.  
4. Buy **one phone number** and send yourself a few test calls/SMS.  
5. Build:
   - 1 simple **pipeline**  
   - 1 **estimate calendar**  
   - 3 key **workflows**:
     - Missed call → SMS  
     - New lead → SMS intake + calendar link  
     - Job won → review request  
6. Record a **Loom demo** of this flow:
   - You calling the number → missed call → SMS  
   - Filling out a quick “estimate request” form → SMS → booking  
   - Marking an opportunity “Job Won” → review text.

Now you have:

- A working GHL account.  
- Core automations live.  
- A real demo to show prospects (like Mark, your pool guy).  

From here, you can plug in the **niche‑specific messaging** from the `niches/` docs and start selling the system to your first 1–3 clients.


