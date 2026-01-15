# GHL Integration — User Stories & Task List

> **Project:** GoHighLevel Contacts, Leads & Calendar Integration  
> **Target:** Private pages of generated client sites (`/templates/new/apps/frontend`)  
> **Created:** January 15, 2026  
> **Status:** Planning

---

## 📋 Overview

This document contains detailed user stories for integrating GoHighLevel (GHL) functionality into the private/authenticated pages of client websites. The integration will enable:

- **Contacts Management** — View, create, edit, sync contacts with GHL
- **Leads Pipeline** — Visual pipeline board with GHL sync
- **Calendar/Appointments** — View and manage appointments from GHL calendars

---

## 🔐 Epic 1: GHL API Connection & Authentication

### US-1.1: GHL API Credentials Setup

**Title:** As an admin, I want to configure my GHL API credentials so that the platform can communicate with my GHL subaccount.

**Description:**  
Site administrators need a secure way to enter and store their GHL API key and Location ID. These credentials will be used for all subsequent API calls to GHL. The credentials should be stored securely and validated upon entry.

**Use Cases:**
1. Admin navigates to Settings → Integrations → GoHighLevel
2. Admin enters their GHL API Key (obtained from GHL Settings → Business Profile → API Key)
3. Admin enters their GHL Location ID
4. System validates the credentials by making a test API call
5. On success, credentials are encrypted and stored
6. Admin sees confirmation with connected account details

**Acceptance Criteria:**
- [ ] Settings page has a dedicated "GoHighLevel" integration section
- [ ] API Key input field with password masking and show/hide toggle
- [ ] Location ID input field
- [ ] "Test Connection" button that validates credentials
- [ ] Success message shows GHL account/location name on valid connection
- [ ] Error message displays specific issue on failed connection
- [ ] Credentials are encrypted before database storage
- [ ] Connection status indicator (connected/disconnected) visible in header or sidebar
- [ ] Ability to disconnect/remove credentials

---

### US-1.2: GHL Webhook Registration

**Title:** As a system, I want to register webhooks with GHL so that I receive real-time updates when contacts or appointments change.

**Description:**  
To keep data synchronized, the system needs to register webhook endpoints with GHL. This enables real-time updates instead of relying solely on polling. Webhooks will notify the system of new contacts, updated contacts, new appointments, and appointment changes.

**Use Cases:**
1. When GHL credentials are successfully saved, system registers webhook endpoints
2. System stores the webhook subscription IDs for later management
3. When a contact is created in GHL, the webhook fires and system receives the data
4. When an appointment is booked, the webhook fires and system receives the data
5. Admin can manually re-register webhooks if needed

**Acceptance Criteria:**
- [ ] Webhook endpoint created at `/api/v1/webhooks/ghl/events`
- [ ] Webhook validates GHL signature/secret for security
- [ ] Webhooks registered for: `contact.create`, `contact.update`, `contact.delete`
- [ ] Webhooks registered for: `appointment.create`, `appointment.update`, `appointment.delete`
- [ ] Webhooks registered for: `opportunity.create`, `opportunity.update`, `opportunity.status_change`
- [ ] Webhook subscription IDs stored in database
- [ ] Failed webhook deliveries logged for debugging
- [ ] "Re-register Webhooks" button in admin settings
- [ ] Webhook activity log visible to admins

---

## 📇 Epic 2: Contacts Management

### US-2.1: View Contacts List

**Title:** As a user, I want to view a list of all my contacts so that I can see everyone in my database.

**Description:**  
Users need a central place to view all contacts synced from GHL. The list should be paginated, searchable, and sortable. It should display key contact information at a glance and provide quick actions.

**Use Cases:**
1. User navigates to Contacts page from sidebar
2. System displays a table of contacts with key fields
3. User can search by name, email, or phone
4. User can sort by name, date added, or status
5. User can filter by tags or pipeline stage
6. User clicks a contact to view full details

**Acceptance Criteria:**
- [ ] Contacts page accessible at `/contacts`
- [ ] Table displays: Name, Email, Phone, Source, Status, Tags, Date Added
- [ ] Pagination with configurable page size (10, 25, 50, 100)
- [ ] Search bar filters by name, email, phone (debounced, 300ms)
- [ ] Column headers are clickable for sorting (asc/desc)
- [ ] Filter dropdown for: Status, Tags, Source, Pipeline Stage
- [ ] "Sync Now" button triggers manual sync with GHL
- [ ] Last sync timestamp displayed
- [ ] Loading skeleton shown during data fetch
- [ ] Empty state with helpful message when no contacts
- [ ] Row click navigates to contact detail page

---

### US-2.2: View Contact Details

**Title:** As a user, I want to view detailed information about a specific contact so that I can see their full profile and history.

**Description:**  
When viewing a single contact, users need to see all available information including contact details, custom fields, tags, pipeline position, and activity history. This provides context for follow-up actions.

**Use Cases:**
1. User clicks on a contact from the list
2. System displays contact detail page with all information
3. User can see contact's activity timeline (calls, emails, form submissions)
4. User can see which pipeline/stage the contact is in
5. User can view and edit custom fields
6. User can add notes about the contact

**Acceptance Criteria:**
- [ ] Contact detail page at `/contacts/[id]`
- [ ] Header section with name, email, phone, quick action buttons
- [ ] Contact information card: address, company, job title, source
- [ ] Tags displayed as badges with color coding
- [ ] Custom fields section showing all GHL custom fields
- [ ] Activity timeline showing: form submissions, calls, emails, notes, appointments
- [ ] Pipeline/stage indicator with visual progress
- [ ] "Edit Contact" button opens edit modal
- [ ] "Add Note" button for quick note entry
- [ ] "Sync with GHL" button to refresh this contact's data
- [ ] Back to list navigation

---

### US-2.3: Create New Contact

**Title:** As a user, I want to create a new contact so that I can add leads manually to my database.

**Description:**  
Users need the ability to manually add new contacts that didn't come through forms or other automated sources. The contact should be created both locally and synced to GHL.

**Use Cases:**
1. User clicks "Add Contact" button from contacts list
2. Modal or new page opens with contact form
3. User enters contact information (required: name or email or phone)
4. User can add tags, assign pipeline stage, add notes
5. User submits form
6. System creates contact locally and syncs to GHL
7. On success, user is redirected to the new contact's detail page

**Acceptance Criteria:**
- [ ] "Add Contact" button visible on contacts list page
- [ ] Form fields: First Name, Last Name, Email, Phone, Company, Address, City, State, ZIP
- [ ] At least one of (First Name, Email, Phone) is required
- [ ] Tags multi-select (can create new tags)
- [ ] Pipeline/Stage dropdown
- [ ] Source dropdown (Manual Entry, Referral, Walk-in, etc.)
- [ ] Initial notes textarea
- [ ] "Create" button with loading state
- [ ] Validation errors shown inline
- [ ] Contact created in local DB immediately
- [ ] Background job syncs contact to GHL
- [ ] Success toast with "View Contact" link
- [ ] If GHL sync fails, show warning but keep local contact with "pending sync" status

---

### US-2.4: Edit Contact

**Title:** As a user, I want to edit an existing contact so that I can update their information.

**Description:**  
Users need to update contact information as it changes. Edits should sync back to GHL to maintain consistency. The edit interface should pre-populate with current values and clearly indicate pending changes.

**Use Cases:**
1. User clicks "Edit" on contact detail page
2. Edit modal opens with current contact data
3. User modifies fields as needed
4. User can add or remove tags
5. User can change pipeline stage
6. User saves changes
7. System updates local DB and syncs to GHL

**Acceptance Criteria:**
- [ ] Edit button accessible from contact detail page and list (row action)
- [ ] Modal pre-populated with all current contact data
- [ ] All fields editable (same as create form)
- [ ] Changed fields highlighted or indicated
- [ ] "Save Changes" button with loading state
- [ ] Cancel button closes modal without saving
- [ ] Optimistic UI update (show changes immediately)
- [ ] Background sync to GHL
- [ ] Success toast on save
- [ ] Error handling if GHL sync fails (local changes preserved, retry option)
- [ ] Audit log entry created for the edit

---

### US-2.5: Delete Contact

**Title:** As a user, I want to delete a contact so that I can remove outdated or duplicate records.

**Description:**  
Users need the ability to delete contacts they no longer need. This is a destructive action that requires confirmation. Users should choose whether to also delete from GHL or keep local only.

**Use Cases:**
1. User clicks "Delete" on contact detail page or list row
2. Confirmation modal appears with options
3. User chooses: "Delete locally only" or "Delete from GHL too"
4. User confirms deletion
5. System deletes contact based on selection

**Acceptance Criteria:**
- [ ] Delete button accessible from contact detail page and list (row action)
- [ ] Confirmation modal with clear warning message
- [ ] Checkbox: "Also delete from GoHighLevel" (default unchecked)
- [ ] Contact name displayed in modal for verification
- [ ] "Delete" button is red/destructive styled
- [ ] Cancel button to abort
- [ ] Loading state during deletion
- [ ] Contact removed from list immediately (optimistic)
- [ ] Background job handles GHL deletion if selected
- [ ] Success toast confirmation
- [ ] Cannot delete contacts with active opportunities (warning shown)

---

### US-2.6: Sync Contacts with GHL

**Title:** As a user, I want to sync contacts from GHL so that I have up-to-date data in my dashboard.

**Description:**  
Users need the ability to pull the latest contacts from GHL into the local database. This handles initial setup, periodic syncs, and manual refresh scenarios. The sync should handle new contacts, updates, and optionally deletions.

**Use Cases:**
1. User clicks "Sync Contacts" button on contacts page
2. Modal shows sync options and status
3. User can choose: Full sync, Sync new only, or Sync since last update
4. Sync runs with progress indicator
5. Results shown: X new, Y updated, Z unchanged
6. Contacts list refreshes with new data

**Acceptance Criteria:**
- [ ] "Sync" button on contacts page header
- [ ] Sync modal with options:
  - [ ] Full Sync — Pull all contacts from GHL
  - [ ] Incremental — Only contacts modified since last sync
  - [ ] New Only — Only contacts not already in local DB
- [ ] Progress bar during sync
- [ ] Real-time count updates (processing X of Y)
- [ ] Sync can be cancelled mid-process
- [ ] Results summary modal:
  - [ ] New contacts added
  - [ ] Existing contacts updated
  - [ ] Duplicates skipped (with duplicate detection logic)
- [ ] "Last synced: X minutes ago" timestamp displayed
- [ ] Automatic daily sync option in settings
- [ ] Sync history log accessible to admins

---

### US-2.7: Bulk Contact Actions

**Title:** As a user, I want to perform actions on multiple contacts at once so that I can manage my database efficiently.

**Description:**  
Users managing many contacts need bulk operations to save time. This includes adding tags, changing pipeline stages, exporting, and deleting multiple contacts at once.

**Use Cases:**
1. User selects multiple contacts using checkboxes
2. Bulk action toolbar appears
3. User chooses action: Add Tags, Remove Tags, Change Stage, Export, Delete
4. Confirmation shown for destructive actions
5. Action applied to all selected contacts

**Acceptance Criteria:**
- [ ] Checkbox column on contacts table
- [ ] "Select All" checkbox in header (current page only)
- [ ] "Select All X contacts" link to select all matching current filter
- [ ] Selected count displayed in toolbar
- [ ] Bulk action dropdown with options:
  - [ ] Add Tags (opens tag selector)
  - [ ] Remove Tags (opens tag selector)
  - [ ] Change Pipeline Stage (opens stage selector)
  - [ ] Export to CSV
  - [ ] Export to GHL (for locally-only contacts)
  - [ ] Delete Selected
- [ ] Progress indicator for bulk operations
- [ ] Confirmation modal for destructive actions
- [ ] Results summary after completion
- [ ] Undo option for tag/stage changes (within 30 seconds)

---

## 🔄 Epic 3: Leads Pipeline

### US-3.1: View Lead Pipeline Board

**Title:** As a user, I want to view my leads on a Kanban-style pipeline board so that I can visualize my sales process.

**Description:**  
A visual pipeline board shows leads organized by their current stage. Users can see at a glance how many leads are in each stage and their total value. This is essential for sales management and forecasting.

**Use Cases:**
1. User navigates to Leads/Pipeline page
2. Board displays columns for each pipeline stage
3. Each card shows lead name, value, and days in stage
4. User can drag cards between stages
5. User can click a card to view lead details
6. User can filter board by date range, assigned user, or tags

**Acceptance Criteria:**
- [ ] Pipeline page accessible at `/leads` or `/pipeline`
- [ ] Kanban board layout with scrollable columns
- [ ] Columns match GHL pipeline stages (configurable)
- [ ] Default stages: New Lead, Contacted, Quote Sent, Negotiating, Won, Lost
- [ ] Each card displays:
  - [ ] Contact name
  - [ ] Lead value (if set)
  - [ ] Days in current stage
  - [ ] Tags (first 2-3, "+X more" if more)
  - [ ] Source icon/indicator
- [ ] Column headers show: stage name, lead count, total value
- [ ] Drag and drop to move leads between stages
- [ ] Mobile-responsive (horizontal scroll or stacked view)
- [ ] Filter bar: date range picker, tag filter, search
- [ ] "Add Lead" button to create new lead

---

### US-3.2: Move Lead Between Stages

**Title:** As a user, I want to move a lead to a different pipeline stage so that I can update their status as they progress.

**Description:**  
When a lead progresses (or regresses), users need to update their stage. This can be done via drag-and-drop on the board or through a dropdown selector. Stage changes should sync to GHL.

**Use Cases:**
1. User drags lead card from "Contacted" to "Quote Sent"
2. Card animates to new column
3. Stage change syncs to GHL in background
4. Updated timestamps reflect the change
5. Alternative: User opens lead, clicks stage dropdown, selects new stage

**Acceptance Criteria:**
- [ ] Drag and drop works smoothly with visual feedback
- [ ] Drop targets highlight when dragging over
- [ ] Card snaps to new column on drop
- [ ] Optimistic update (immediate UI change)
- [ ] Background sync to GHL
- [ ] Stage change logged in activity timeline
- [ ] "Days in stage" counter resets on stage change
- [ ] Stage dropdown on lead detail page as alternative
- [ ] Success toast confirmation
- [ ] Sync failure shows retry option (changes preserved locally)

---

### US-3.3: Create New Lead/Opportunity

**Title:** As a user, I want to create a new lead/opportunity so that I can track a potential sale.

**Description:**  
Users need to create leads (opportunities) for contacts they're actively pursuing. A lead links to a contact and adds pipeline/stage, value, and other sales-specific information.

**Use Cases:**
1. User clicks "Add Lead" from pipeline board
2. Form opens with lead creation fields
3. User selects existing contact or creates new contact inline
4. User enters opportunity value, stage, and notes
5. Lead is created and appears on board
6. Lead syncs to GHL as opportunity

**Acceptance Criteria:**
- [ ] "Add Lead" button on pipeline page
- [ ] Modal/drawer with lead form
- [ ] Contact selector: search existing or "Create new contact"
- [ ] If new contact, inline contact creation fields appear
- [ ] Lead fields:
  - [ ] Opportunity Name (auto-generated from contact name if blank)
  - [ ] Value ($) — optional
  - [ ] Pipeline Stage (dropdown)
  - [ ] Expected Close Date (date picker)
  - [ ] Lead Source (dropdown)
  - [ ] Notes (textarea)
- [ ] "Create Lead" button with loading state
- [ ] Lead created locally and synced to GHL as Opportunity
- [ ] New lead card appears in appropriate column
- [ ] Success toast with "View Lead" link

---

### US-3.4: View Lead Details

**Title:** As a user, I want to view detailed information about a lead so that I can see the full opportunity context.

**Description:**  
Clicking on a lead opens a detail view with comprehensive information including the linked contact, opportunity value, stage history, timeline of activities, and notes.

**Use Cases:**
1. User clicks on lead card in pipeline
2. Lead detail drawer slides in from right (or modal/page)
3. User sees contact info, opportunity details, and activity
4. User can update fields, add notes, or change stage
5. User can navigate to full contact detail from here

**Acceptance Criteria:**
- [ ] Click on lead card opens detail drawer/modal
- [ ] Header: Opportunity name, stage badge, value
- [ ] Contact section: name, phone, email with click-to-call/email
- [ ] "View Full Contact" link to contact detail page
- [ ] Opportunity fields:
  - [ ] Value (editable)
  - [ ] Stage (dropdown, editable)
  - [ ] Expected Close Date (editable)
  - [ ] Lead Source
  - [ ] Created Date
  - [ ] Days in Pipeline
- [ ] Stage history timeline (when stage changed and by whom)
- [ ] Activity timeline (notes, calls, emails)
- [ ] Add note inline
- [ ] Quick actions: Call, Email, Add Task, Delete Lead
- [ ] Close (X) button to dismiss drawer

---

### US-3.5: View Pipeline Analytics

**Title:** As a user, I want to see analytics about my pipeline so that I can understand my sales performance.

**Description:**  
Users need insights into their pipeline performance including conversion rates, average deal size, time in stage, and win/loss ratios. This helps with forecasting and identifying bottlenecks.

**Use Cases:**
1. User navigates to pipeline analytics section
2. Dashboard displays key metrics and charts
3. User can filter by date range
4. User can see trends over time
5. User can identify which stages have the longest duration

**Acceptance Criteria:**
- [ ] Analytics section/tab on pipeline page
- [ ] Key metrics cards:
  - [ ] Total Pipeline Value
  - [ ] Leads Created (period)
  - [ ] Leads Won (period)
  - [ ] Leads Lost (period)
  - [ ] Conversion Rate (%)
  - [ ] Average Deal Size
  - [ ] Average Days to Close
- [ ] Stage funnel chart showing conversion between stages
- [ ] Time in stage bar chart (average days per stage)
- [ ] Win/Loss trend line chart over time
- [ ] Lead source breakdown pie chart
- [ ] Date range filter: Last 7 days, 30 days, 90 days, Custom
- [ ] Export analytics data option

---

## 📅 Epic 4: Calendar & Appointments

### US-4.1: View Appointments Calendar

**Title:** As a user, I want to view my appointments on a calendar so that I can see my schedule at a glance.

**Description:**  
Users need a calendar view showing all appointments synced from GHL. The calendar should support month, week, and day views with the ability to click on appointments for details.

**Use Cases:**
1. User navigates to Calendar page
2. Calendar displays current month by default
3. User can switch between month, week, and day views
4. Appointments show as colored blocks on the calendar
5. User clicks an appointment to see details
6. User can navigate to previous/next periods

**Acceptance Criteria:**
- [ ] Calendar page accessible at `/calendar`
- [ ] Default view: Month (configurable to Week or Day in settings)
- [ ] View toggle buttons: Month, Week, Day
- [ ] Navigation: Previous, Today, Next buttons
- [ ] Current date highlighted
- [ ] Appointments displayed as blocks:
  - [ ] Color-coded by type (estimate, follow-up, service call)
  - [ ] Show time and contact name
  - [ ] Truncated if too long for cell
- [ ] Click on appointment opens detail modal
- [ ] "Add Appointment" button visible
- [ ] Responsive design for mobile
- [ ] Loading state while fetching appointments
- [ ] "Sync Calendar" button to refresh from GHL

---

### US-4.2: View Appointment Details

**Title:** As a user, I want to view details of an appointment so that I can see all relevant information.

**Description:**  
When clicking on an appointment, users see full details including the contact, time, duration, location, notes, and appointment type. Quick actions allow for common operations.

**Use Cases:**
1. User clicks on appointment in calendar
2. Modal displays appointment details
3. User can see linked contact information
4. User can see appointment notes and special instructions
5. User can take actions: reschedule, cancel, add notes

**Acceptance Criteria:**
- [ ] Click on appointment opens detail modal
- [ ] Header: Appointment title/type, status badge
- [ ] Date and time prominently displayed
- [ ] Duration shown
- [ ] Contact section: name, phone, email, address
- [ ] "View Contact" link
- [ ] Appointment type/calendar name
- [ ] Notes/description textarea (readonly, unless editing)
- [ ] Quick actions:
  - [ ] Edit/Reschedule (opens edit modal)
  - [ ] Cancel Appointment (with confirmation)
  - [ ] Add Note
  - [ ] Call Contact
  - [ ] Email Contact
  - [ ] Get Directions (if address present)
- [ ] Close (X) button

---

### US-4.3: Create New Appointment

**Title:** As a user, I want to create a new appointment so that I can schedule time with a contact.

**Description:**  
Users need to create appointments directly from the dashboard. The appointment should be linked to a contact and synced to the appropriate GHL calendar. The form should check availability.

**Use Cases:**
1. User clicks "Add Appointment" from calendar
2. Form opens with date pre-selected (if clicked on specific day)
3. User selects or searches for a contact
4. User chooses appointment type/calendar
5. User selects date and time
6. System checks availability and shows open slots
7. User adds notes and creates appointment
8. Appointment syncs to GHL

**Acceptance Criteria:**
- [ ] "Add Appointment" button on calendar page
- [ ] Modal with appointment creation form
- [ ] Contact selector: search existing contacts
- [ ] "Create Contact" option if needed
- [ ] Calendar/Type dropdown (fetches available calendars from GHL)
- [ ] Date picker (pre-filled if clicked on a date)
- [ ] Time slot selector (shows available slots based on calendar)
- [ ] Duration dropdown (15, 30, 45, 60, 90, 120 min)
- [ ] Location field (optional)
- [ ] Notes textarea
- [ ] Appointment status: Confirmed, Pending
- [ ] "Create Appointment" button with loading state
- [ ] Appointment created locally and synced to GHL
- [ ] New appointment appears on calendar
- [ ] Success toast with details
- [ ] Email/SMS confirmation to contact (toggle option)

---

### US-4.4: Edit/Reschedule Appointment

**Title:** As a user, I want to reschedule an appointment so that I can adjust the timing as needed.

**Description:**  
Plans change, and users need to move appointments to different times. The edit form allows changing date, time, and other details. Changes sync back to GHL and optionally notify the contact.

**Use Cases:**
1. User clicks edit on appointment detail modal
2. Edit form opens with current values
3. User changes date and/or time
4. System checks new time is available
5. User saves changes
6. Changes sync to GHL
7. Notification sent to contact (if enabled)

**Acceptance Criteria:**
- [ ] Edit button on appointment detail modal
- [ ] Form pre-populated with current appointment data
- [ ] All fields editable: contact, date, time, duration, notes
- [ ] Time slot selector shows availability (excluding current appointment)
- [ ] "Notify Contact of Change" checkbox (default checked)
- [ ] "Save Changes" button with loading state
- [ ] Cancel button to close without saving
- [ ] Optimistic UI update
- [ ] Sync to GHL in background
- [ ] Success toast confirmation
- [ ] Contact notification sent if enabled
- [ ] Change logged in activity timeline

---

### US-4.5: Cancel Appointment

**Title:** As a user, I want to cancel an appointment so that I can remove it from the schedule.

**Description:**  
When an appointment needs to be cancelled, users should be able to do so with a clear confirmation process. Optionally, a cancellation reason can be recorded and the contact notified.

**Use Cases:**
1. User clicks "Cancel Appointment" on detail modal
2. Confirmation modal appears
3. User can optionally enter cancellation reason
4. User can choose to notify the contact
5. User confirms cancellation
6. Appointment marked as cancelled and synced to GHL

**Acceptance Criteria:**
- [ ] "Cancel Appointment" button (red/destructive styled)
- [ ] Confirmation modal with warning
- [ ] Cancellation reason textarea (optional)
- [ ] "Notify Contact" checkbox (default checked)
- [ ] "Confirm Cancellation" button
- [ ] Appointment removed from calendar view (or shown as cancelled)
- [ ] Status changed to "Cancelled" in database
- [ ] Sync to GHL (cancel/delete appointment)
- [ ] Cancellation logged in activity timeline
- [ ] Contact notification sent if enabled
- [ ] Success toast confirmation

---

### US-4.6: View Today's Appointments Widget

**Title:** As a user, I want to see today's appointments on my dashboard so that I can quickly see my schedule.

**Description:**  
The main dashboard should include a widget showing today's appointments at a glance. This provides quick access to the most relevant schedule information without navigating to the full calendar.

**Use Cases:**
1. User logs in and views dashboard
2. "Today's Appointments" widget shows upcoming appointments
3. Widget displays time, contact name, and type
4. User can click to view appointment details
5. "See All" link navigates to full calendar

**Acceptance Criteria:**
- [ ] Widget on dashboard page titled "Today's Appointments"
- [ ] List of appointments for current day
- [ ] Each item shows: time, contact name, appointment type
- [ ] Sorted by time (earliest first)
- [ ] "Now" indicator for current/in-progress appointments
- [ ] Click on item opens appointment detail
- [ ] "See All" link to calendar page
- [ ] Empty state: "No appointments today"
- [ ] Shows next appointment if none today: "Next: Tomorrow at..."
- [ ] Widget refreshes automatically every 5 minutes

---

### US-4.7: Sync Calendars with GHL

**Title:** As a user, I want to sync my calendar with GHL so that I have up-to-date appointment data.

**Description:**  
Users need to pull the latest calendar data from GHL and push any local changes. This ensures bidirectional sync and data consistency between systems.

**Use Cases:**
1. User clicks "Sync" on calendar page
2. System fetches available calendars from GHL
3. System pulls appointments from selected date range
4. New appointments are added, existing ones updated
5. Results shown: X new, Y updated, Z cancelled

**Acceptance Criteria:**
- [ ] "Sync" button on calendar page
- [ ] Sync modal with options:
  - [ ] Select date range to sync (default: past 30 days to future 90 days)
  - [ ] Select which calendars to sync (if multiple)
- [ ] Progress indicator during sync
- [ ] Results summary:
  - [ ] New appointments imported
  - [ ] Existing appointments updated
  - [ ] Cancelled appointments processed
- [ ] "Last synced" timestamp displayed
- [ ] Automatic sync option: every 15 min, 30 min, 1 hour
- [ ] Sync failures logged and shown to admin

---

## 🔧 Epic 5: Shared Components & Infrastructure

### US-5.1: Activity Timeline Component

**Title:** As a system, I need a reusable activity timeline component so that activity history can be displayed consistently.

**Description:**  
A shared component for displaying activity timelines used on contact details, lead details, and potentially other areas. Shows chronological list of activities with icons, timestamps, and details.

**Acceptance Criteria:**
- [ ] `ActivityTimeline` React component created
- [ ] Accepts array of activity items
- [ ] Each item has: type, title, description, timestamp, user (optional)
- [ ] Activity types with icons:
  - [ ] Note (📝)
  - [ ] Call (📞)
  - [ ] Email (✉️)
  - [ ] Meeting/Appointment (📅)
  - [ ] Stage Change (🔄)
  - [ ] Form Submission (📋)
  - [ ] SMS (💬)
- [ ] Timestamps show relative time ("2 hours ago") with full date on hover
- [ ] Expandable descriptions for long content
- [ ] "Load more" pagination for many items
- [ ] Empty state message when no activities

---

### US-5.2: GHL Sync Status Indicator

**Title:** As a user, I want to see the sync status of records so that I know if data is current.

**Description:**  
A visual indicator showing whether a record is synced with GHL, pending sync, or has sync errors. Displayed on contacts, leads, and appointments.

**Acceptance Criteria:**
- [ ] `GHLSyncStatus` component created
- [ ] States:
  - [ ] ✅ Synced — Green check, "Synced with GHL"
  - [ ] 🔄 Pending — Yellow/Orange spinner, "Sync pending"
  - [ ] ❌ Error — Red X, "Sync failed" with error details on hover
  - [ ] ➖ Local Only — Gray, "Not synced to GHL"
- [ ] Click on error state shows retry option
- [ ] Compact mode for use in tables (icon only)
- [ ] Full mode for use in detail pages (icon + text)

---

### US-5.3: Global Search with GHL Data

**Title:** As a user, I want to search across contacts, leads, and appointments from anywhere so that I can quickly find what I need.

**Description:**  
A global search feature accessible from the header that searches across all GHL-synced data. Results are categorized and clickable.

**Acceptance Criteria:**
- [ ] Search icon in header opens search modal (CMD+K shortcut)
- [ ] Search input with debounced query
- [ ] Results grouped by type: Contacts, Leads, Appointments
- [ ] Each result shows: name/title, type badge, preview info
- [ ] Keyboard navigation (arrow keys, enter to select)
- [ ] Click on result navigates to detail page
- [ ] "No results" state with suggestions
- [ ] Recent searches shown when empty
- [ ] Search limited to 5 results per type, "See all X" link

---

### US-5.4: GHL Connection Status in Header

**Title:** As a user, I want to see my GHL connection status in the header so that I know if the integration is working.

**Description:**  
A persistent indicator in the app header showing whether GHL is connected and functioning. Critical for users to know if their data is syncing properly.

**Acceptance Criteria:**
- [ ] Small status indicator in header next to logo or user menu
- [ ] States:
  - [ ] 🟢 Connected — "GHL Connected"
  - [ ] 🟡 Warning — "GHL: Sync Issues" (click for details)
  - [ ] 🔴 Disconnected — "GHL Disconnected" (click to reconnect)
- [ ] Click opens dropdown with:
  - [ ] Connection status details
  - [ ] Last successful sync timestamp
  - [ ] Quick link to GHL settings
  - [ ] "Reconnect" button if disconnected
- [ ] Tooltip on hover shows quick status

---

## 📊 Progress Tracking

### Implementation Status

| ID | Story | Status | Assignee | Sprint |
|----|-------|--------|----------|--------|
| US-1.1 | GHL API Credentials Setup | ⬜ Not Started | - | - |
| US-1.2 | GHL Webhook Registration | ⬜ Not Started | - | - |
| US-2.1 | View Contacts List | ⬜ Not Started | - | - |
| US-2.2 | View Contact Details | ⬜ Not Started | - | - |
| US-2.3 | Create New Contact | ⬜ Not Started | - | - |
| US-2.4 | Edit Contact | ⬜ Not Started | - | - |
| US-2.5 | Delete Contact | ⬜ Not Started | - | - |
| US-2.6 | Sync Contacts with GHL | ⬜ Not Started | - | - |
| US-2.7 | Bulk Contact Actions | ⬜ Not Started | - | - |
| US-3.1 | View Lead Pipeline Board | ⬜ Not Started | - | - |
| US-3.2 | Move Lead Between Stages | ⬜ Not Started | - | - |
| US-3.3 | Create New Lead/Opportunity | ⬜ Not Started | - | - |
| US-3.4 | View Lead Details | ⬜ Not Started | - | - |
| US-3.5 | View Pipeline Analytics | ⬜ Not Started | - | - |
| US-4.1 | View Appointments Calendar | ⬜ Not Started | - | - |
| US-4.2 | View Appointment Details | ⬜ Not Started | - | - |
| US-4.3 | Create New Appointment | ⬜ Not Started | - | - |
| US-4.4 | Edit/Reschedule Appointment | ⬜ Not Started | - | - |
| US-4.5 | Cancel Appointment | ⬜ Not Started | - | - |
| US-4.6 | Today's Appointments Widget | ⬜ Not Started | - | - |
| US-4.7 | Sync Calendars with GHL | ⬜ Not Started | - | - |
| US-5.1 | Activity Timeline Component | ⬜ Not Started | - | - |
| US-5.2 | GHL Sync Status Indicator | ⬜ Not Started | - | - |
| US-5.3 | Global Search with GHL Data | ⬜ Not Started | - | - |
| US-5.4 | GHL Connection Status | ⬜ Not Started | - | - |

### Legend
- ⬜ Not Started
- 🔵 In Progress
- ✅ Complete
- ⏸️ On Hold
- ❌ Blocked

---

## 📝 Notes

### GHL API Reference
- **Base URL:** `https://services.leadconnectorhq.com`
- **Auth:** Bearer token (API Key)
- **Rate Limits:** 100 requests/minute
- **Docs:** https://highlevel.stoplight.io/docs/integrations

### Key GHL Endpoints
```
GET    /contacts                  - List contacts
POST   /contacts                  - Create contact
GET    /contacts/{id}             - Get contact
PUT    /contacts/{id}             - Update contact
DELETE /contacts/{id}             - Delete contact
GET    /calendars                 - List calendars
GET    /calendars/{id}/events     - Get calendar events
POST   /calendars/{id}/events     - Create event
GET    /opportunities             - List opportunities
POST   /opportunities             - Create opportunity
PUT    /opportunities/{id}/status - Update opportunity stage
```

### Dependencies
- GHL API Key (Location-level or Agency-level)
- GHL Location ID
- Webhook endpoint with HTTPS
- PostgreSQL database for local storage
- Background job processor (Bull/BullMQ recommended)

---

*Last Updated: January 15, 2026*
