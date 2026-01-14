/**
 * GoHighLevel Integration Configuration
 * 
 * HOW TO SET UP:
 * 
 * 1. In GoHighLevel, go to Automation → Workflows
 * 2. Create a new workflow
 * 3. Add trigger: "Inbound Webhook"
 * 4. Copy the webhook URL from the trigger settings
 * 5. Paste the URL below for the appropriate form
 * 
 * The webhook will receive all form fields as JSON and can:
 * - Create/update contacts
 * - Add tags
 * - Trigger automations (email sequences, SMS, etc.)
 * - Move contacts through pipelines
 */

export const GHL_CONFIG = {
  // Webhook URL for "Book a Demo" form submissions
  // Creates contact + triggers demo booking workflow
  bookDemoWebhook: process.env.NEXT_PUBLIC_GHL_BOOK_DEMO_WEBHOOK || '',
  
  // Webhook URL for "Free Missed Jobs Audit" form submissions
  // Creates contact + triggers audit workflow
  auditWebhook: process.env.NEXT_PUBLIC_GHL_AUDIT_WEBHOOK || '',
  
  // Optional: Location ID for API calls (if using direct API integration)
  locationId: process.env.NEXT_PUBLIC_GHL_LOCATION_ID || '',
};

/**
 * Submits form data to a GHL webhook
 */
export async function submitToGHL(
  webhookUrl: string,
  data: Record<string, string>
): Promise<{ success: boolean; error?: string }> {
  // If no webhook URL configured, log warning and simulate success for development
  if (!webhookUrl) {
    console.warn('GHL webhook URL not configured. Form data:', data);
    // In development, simulate a delay and success
    if (process.env.NODE_ENV === 'development') {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { success: true };
    }
    return { success: false, error: 'Webhook not configured' };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        // Add metadata
        source: 'jobcapture.ai',
        submittedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error submitting to GHL:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

