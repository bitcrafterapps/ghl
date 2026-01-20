import { Resend } from 'resend';
import { db } from '../db';
import { emailTemplates, emailLogs } from '../db/schema';
import { eq } from 'drizzle-orm';
import { LoggerFactory } from '../logger';

const logger = LoggerFactory.getLogger('EmailService');

// Initialize Resend with API key
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@threebears.ai';
const APP_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.APP_URL || 'https://threebears.ai';

export interface SendEmailOptions {
  to: string;
  templateKey: string;
  variables?: Record<string, string>;
  userId?: number;
}

export interface EmailResult {
  success: boolean;
  resendId?: string;
  error?: string;
}

export class EmailService {
  /**
   * Send an email using a template
   */
  static async send(options: SendEmailOptions): Promise<EmailResult> {
    const { to, templateKey, variables = {}, userId } = options;
    
    if (!resend) {
      logger.warn('Resend API key not configured, skipping email send');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      // Fetch template
      const [template] = await db.select()
        .from(emailTemplates)
        .where(eq(emailTemplates.key, templateKey));

      if (!template) {
        logger.error(`Email template not found: ${templateKey}`);
        return { success: false, error: `Template not found: ${templateKey}` };
      }

      if (!template.enabled) {
        logger.info(`Email template disabled: ${templateKey}`);
        return { success: false, error: 'Template is disabled' };
      }

      // Add default variables
      const allVariables: Record<string, string> = {
        appUrl: APP_URL,
        appName: 'ThreeBears.ai',
        ...variables
      };

      // Substitute variables in subject and body
      const subject = this.substituteVariables(template.subject, allVariables);
      const body = this.substituteVariables(template.body, allVariables);

      // Send email via Resend
      const { data, error } = await resend.emails.send({
        from: `ThreeBears.ai <${FROM_EMAIL}>`,
        to: [to],
        subject,
        html: body,
      });

      if (error) {
        logger.error(`Failed to send email: ${error.message}`);
        
        // Log failed attempt
        await this.logEmail({
          templateKey,
          recipientEmail: to,
          recipientUserId: userId,
          subject,
          status: 'failed',
          error: error.message
        });

        return { success: false, error: error.message };
      }

      logger.info(`Email sent successfully: ${data?.id} to ${to}`);

      // Log successful send
      await this.logEmail({
        templateKey,
        recipientEmail: to,
        recipientUserId: userId,
        subject,
        status: 'sent',
        resendId: data?.id
      });

      return { success: true, resendId: data?.id };
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      logger.error(`Error sending email: ${errorMessage}`);

      // Log error
      await this.logEmail({
        templateKey,
        recipientEmail: to,
        recipientUserId: userId,
        subject: `[ERROR] ${templateKey}`,
        status: 'failed',
        error: errorMessage
      });

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Send a test email (for admin testing)
   */
  static async sendTest(templateKey: string, to: string, variables?: Record<string, string>): Promise<EmailResult> {
    return this.send({
      to,
      templateKey,
      variables: {
        firstName: 'Test User',
        lastName: 'Admin',
        email: to,
        ...variables
      }
    });
  }

  /**
   * Substitute {{variable}} placeholders in a string
   */
  private static substituteVariables(text: string, variables: Record<string, string>): string {
    let result = text;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
      result = result.replace(regex, value);
    }
    return result;
  }

  /**
   * Log an email to the database
   */
  private static async logEmail(data: {
    templateKey: string;
    recipientEmail: string;
    recipientUserId?: number;
    subject: string;
    status: 'pending' | 'sent' | 'failed';
    resendId?: string;
    error?: string;
  }): Promise<void> {
    try {
      await db.insert(emailLogs).values({
        templateKey: data.templateKey,
        recipientEmail: data.recipientEmail,
        recipientUserId: data.recipientUserId || null,
        subject: data.subject,
        status: data.status,
        resendId: data.resendId || null,
        error: data.error || null
      });
    } catch (error) {
      logger.error('Failed to log email:', error);
    }
  }

  /**
   * Get all templates
   */
  static async getTemplates() {
    return db.select().from(emailTemplates).orderBy(emailTemplates.name);
  }

  /**
   * Get a template by key
   */
  static async getTemplate(key: string) {
    const [template] = await db.select()
      .from(emailTemplates)
      .where(eq(emailTemplates.key, key));
    return template;
  }

  /**
   * Update a template
   */
  static async updateTemplate(key: string, updates: {
    name?: string;
    subject?: string;
    body?: string;
    enabled?: boolean;
  }) {
    const [updated] = await db.update(emailTemplates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(emailTemplates.key, key))
      .returning();
    return updated;
  }

  /**
   * Create a new template
   */
  static async createTemplate(data: {
    key: string;
    name: string;
    subject: string;
    body: string;
    enabled?: boolean;
  }) {
    const [template] = await db.insert(emailTemplates)
      .values({
        key: data.key,
        name: data.name,
        subject: data.subject,
        body: data.body,
        enabled: data.enabled ?? true
      })
      .returning();
    return template;
  }

  /**
   * Get email logs with pagination
   */
  static async getLogs(options: { page?: number; limit?: number; status?: string } = {}) {
    const { page = 1, limit = 50 } = options;
    const offset = (page - 1) * limit;

    const logs = await db.select()
      .from(emailLogs)
      .orderBy(emailLogs.createdAt)
      .limit(limit)
      .offset(offset);

    return logs;
  }
}

export const emailService = new EmailService();
