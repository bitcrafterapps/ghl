"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = exports.EmailService = void 0;
const resend_1 = require("resend");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const logger_1 = require("../logger");
const logger = logger_1.LoggerFactory.getLogger('EmailService');
// Initialize Resend with API key
const resend = process.env.RESEND_API_KEY
    ? new resend_1.Resend(process.env.RESEND_API_KEY)
    : null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@threebears.ai';
const APP_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || process.env.APP_URL || 'https://threebears.ai';
class EmailService {
    /**
     * Send an email using a template
     */
    static send(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const { to, templateKey, variables = {}, userId } = options;
            if (!resend) {
                logger.warn('Resend API key not configured, skipping email send');
                return { success: false, error: 'Email service not configured' };
            }
            try {
                // Fetch template
                const [template] = yield db_1.db.select()
                    .from(schema_1.emailTemplates)
                    .where((0, drizzle_orm_1.eq)(schema_1.emailTemplates.key, templateKey));
                if (!template) {
                    logger.error(`Email template not found: ${templateKey}`);
                    return { success: false, error: `Template not found: ${templateKey}` };
                }
                if (!template.enabled) {
                    logger.info(`Email template disabled: ${templateKey}`);
                    return { success: false, error: 'Template is disabled' };
                }
                // Add default variables
                const allVariables = Object.assign({ appUrl: APP_URL, appName: 'ThreeBears.ai' }, variables);
                // Substitute variables in subject and body
                const subject = this.substituteVariables(template.subject, allVariables);
                const body = this.substituteVariables(template.body, allVariables);
                // Send email via Resend
                const { data, error } = yield resend.emails.send({
                    from: `ThreeBears.ai <${FROM_EMAIL}>`,
                    to: [to],
                    subject,
                    html: body,
                });
                if (error) {
                    logger.error(`Failed to send email: ${error.message}`);
                    // Log failed attempt
                    yield this.logEmail({
                        templateKey,
                        recipientEmail: to,
                        recipientUserId: userId,
                        subject,
                        status: 'failed',
                        error: error.message
                    });
                    return { success: false, error: error.message };
                }
                logger.info(`Email sent successfully: ${data === null || data === void 0 ? void 0 : data.id} to ${to}`);
                // Log successful send
                yield this.logEmail({
                    templateKey,
                    recipientEmail: to,
                    recipientUserId: userId,
                    subject,
                    status: 'sent',
                    resendId: data === null || data === void 0 ? void 0 : data.id
                });
                return { success: true, resendId: data === null || data === void 0 ? void 0 : data.id };
            }
            catch (error) {
                const errorMessage = (error === null || error === void 0 ? void 0 : error.message) || 'Unknown error';
                logger.error(`Error sending email: ${errorMessage}`);
                // Log error
                yield this.logEmail({
                    templateKey,
                    recipientEmail: to,
                    recipientUserId: userId,
                    subject: `[ERROR] ${templateKey}`,
                    status: 'failed',
                    error: errorMessage
                });
                return { success: false, error: errorMessage };
            }
        });
    }
    /**
     * Send a test email (for admin testing)
     */
    static sendTest(templateKey, to, variables) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.send({
                to,
                templateKey,
                variables: Object.assign({ firstName: 'Test User', lastName: 'Admin', email: to }, variables)
            });
        });
    }
    /**
     * Substitute {{variable}} placeholders in a string
     */
    static substituteVariables(text, variables) {
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
    static logEmail(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield db_1.db.insert(schema_1.emailLogs).values({
                    templateKey: data.templateKey,
                    recipientEmail: data.recipientEmail,
                    recipientUserId: data.recipientUserId || null,
                    subject: data.subject,
                    status: data.status,
                    resendId: data.resendId || null,
                    error: data.error || null
                });
            }
            catch (error) {
                logger.error('Failed to log email:', error);
            }
        });
    }
    /**
     * Get all templates
     */
    static getTemplates() {
        return __awaiter(this, void 0, void 0, function* () {
            return db_1.db.select().from(schema_1.emailTemplates).orderBy(schema_1.emailTemplates.name);
        });
    }
    /**
     * Get a template by key
     */
    static getTemplate(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const [template] = yield db_1.db.select()
                .from(schema_1.emailTemplates)
                .where((0, drizzle_orm_1.eq)(schema_1.emailTemplates.key, key));
            return template;
        });
    }
    /**
     * Update a template
     */
    static updateTemplate(key, updates) {
        return __awaiter(this, void 0, void 0, function* () {
            const [updated] = yield db_1.db.update(schema_1.emailTemplates)
                .set(Object.assign(Object.assign({}, updates), { updatedAt: new Date() }))
                .where((0, drizzle_orm_1.eq)(schema_1.emailTemplates.key, key))
                .returning();
            return updated;
        });
    }
    /**
     * Create a new template
     */
    static createTemplate(data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const [template] = yield db_1.db.insert(schema_1.emailTemplates)
                .values({
                key: data.key,
                name: data.name,
                subject: data.subject,
                body: data.body,
                enabled: (_a = data.enabled) !== null && _a !== void 0 ? _a : true
            })
                .returning();
            return template;
        });
    }
    /**
     * Get email logs with pagination
     */
    static getLogs() {
        return __awaiter(this, arguments, void 0, function* (options = {}) {
            const { page = 1, limit = 50 } = options;
            const offset = (page - 1) * limit;
            const logs = yield db_1.db.select()
                .from(schema_1.emailLogs)
                .orderBy(schema_1.emailLogs.createdAt)
                .limit(limit)
                .offset(offset);
            return logs;
        });
    }
}
exports.EmailService = EmailService;
exports.emailService = new EmailService();
