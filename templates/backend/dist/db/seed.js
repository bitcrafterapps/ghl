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
exports.seedDatabase = void 0;
require('dotenv').config();
const bcrypt_1 = require("bcrypt");
const index_1 = require("./index");
const schema_1 = require("./schema");
const logger_1 = require("../logger");
const drizzle_orm_1 = require("drizzle-orm");
const logger = logger_1.LoggerFactory.getLogger('Seeding');
const seedDatabase = function initializeAndSeed() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Check and create default company
            logger.debug('Checking for existing company...');
            const [existingCompany] = yield index_1.db.select()
                .from(schema_1.companies)
                .where((0, drizzle_orm_1.eq)(schema_1.companies.name, 'My Company Inc'));
            let companyId;
            if (!existingCompany) {
                logger.debug('Creating default company...');
                const [savedCompany] = yield index_1.db.insert(schema_1.companies)
                    .values({
                    name: 'My Company Inc',
                    addressLine1: '123 Main Street',
                    city: 'Anytown',
                    state: 'CA',
                    zip: '92691',
                    phone: '949-555-1234',
                    email: 'info@site.com'
                })
                    .returning();
                companyId = savedCompany.id;
                logger.debug('Default company created successfully:', savedCompany.id);
            }
            else {
                companyId = existingCompany.id;
                logger.debug('Default company already exists:', existingCompany.id);
            }
            // Check and create admin user
            logger.debug('Checking for existing admin user...');
            const [existingAdmin] = yield index_1.db.select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.email, 'admin@example.com'));
            if (!existingAdmin) {
                logger.debug('Creating default admin user...');
                const hashedPassword = yield (0, bcrypt_1.hash)('admin123', 10);
                const [savedAdmin] = yield index_1.db.insert(schema_1.users)
                    .values({
                    email: 'admin@example.com',
                    firstName: 'Admin',
                    lastName: 'User',
                    password: hashedPassword,
                    roles: ['Site Admin'],
                    emailNotify: true,
                    smsNotify: true,
                    phoneNumber: '+1234567890',
                    theme: 'dark',
                    companyName: 'My Company Inc'
                })
                    .returning();
                // Associate admin with company
                yield index_1.db.insert(schema_1.companyUsers)
                    .values({
                    companyId,
                    userId: savedAdmin.id
                });
                logger.debug('Default admin user created and associated with company successfully:', savedAdmin.id);
            }
            else {
                logger.debug('Default admin user already exists:', existingAdmin.id);
                // Ensure admin has Site Admin role
                const currentRoles = existingAdmin.roles || [];
                if (!currentRoles.includes('Site Admin')) {
                    logger.debug('Updating existing admin roles to include Site Admin...');
                    const updatedRoles = [...currentRoles];
                    if (!updatedRoles.includes('Site Admin')) {
                        updatedRoles.push('Site Admin');
                    }
                    yield index_1.db.update(schema_1.users)
                        .set({ roles: updatedRoles })
                        .where((0, drizzle_orm_1.eq)(schema_1.users.id, existingAdmin.id));
                    logger.debug('Admin user roles updated successfully');
                }
                // Check if admin is already associated with the company
                const [existingAssociation] = yield index_1.db.select()
                    .from(schema_1.companyUsers)
                    .where((0, drizzle_orm_1.eq)(schema_1.companyUsers.userId, existingAdmin.id));
                if (!existingAssociation) {
                    // Associate admin with company if not already associated
                    yield index_1.db.insert(schema_1.companyUsers)
                        .values({
                        companyId,
                        userId: existingAdmin.id
                    });
                    logger.debug('Associated existing admin user with company');
                }
            }
            // Check and create regular user
            logger.debug('Checking for existing regular user...');
            const [existingUser] = yield index_1.db.select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.email, 'user@example.com'));
            if (!existingUser) {
                logger.debug('Creating default regular user...');
                const hashedPassword = yield (0, bcrypt_1.hash)('user123', 10);
                const [savedUser] = yield index_1.db.insert(schema_1.users)
                    .values({
                    email: 'user@example.com',
                    firstName: 'Regular',
                    lastName: 'User',
                    password: hashedPassword,
                    roles: ['User'],
                    emailNotify: true,
                    smsNotify: false,
                    theme: 'dark',
                    companyName: 'My Company Inc'
                })
                    .returning();
                // Associate regular user with company
                yield index_1.db.insert(schema_1.companyUsers)
                    .values({
                    companyId,
                    userId: savedUser.id
                });
                logger.debug('Default regular user created and associated with company successfully:', savedUser.id);
            }
            else {
                logger.debug('Default regular user already exists:', existingUser.id);
                // Check if regular user is already associated with the company
                const [existingAssociation] = yield index_1.db.select()
                    .from(schema_1.companyUsers)
                    .where((0, drizzle_orm_1.eq)(schema_1.companyUsers.userId, existingUser.id));
                if (!existingAssociation) {
                    // Associate regular user with company if not already associated
                    yield index_1.db.insert(schema_1.companyUsers)
                        .values({
                        companyId,
                        userId: existingUser.id
                    });
                    logger.debug('Associated existing regular user with company');
                }
            }
            // Check and create welcome template
            logger.debug('Checking for existing welcome template...');
            const [existingWelcome] = yield index_1.db.select()
                .from(schema_1.emailTemplates)
                .where((0, drizzle_orm_1.eq)(schema_1.emailTemplates.key, 'welcome'));
            if (!existingWelcome) {
                logger.debug('Creating welcome email template...');
                yield index_1.db.insert(schema_1.emailTemplates).values({
                    key: 'welcome',
                    name: 'Welcome Email',
                    subject: 'Welcome to ThreeBears.ai!',
                    body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #000; color: #fff; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ThreeBears.ai</h1>
    </div>
    <div class="content">
      <h2>Welcome, {{firstName}}!</h2>
      <p>Thank you for signing up for ThreeBears.ai. We're thrilled to have you on board with the {{planName}} plan.</p>
      <p>ThreeBears.ai helps you go from idea to implementation with AI-powered Agents.</p>
      <p>Get started by creating your first project!</p>
      <a href="{{appUrl}}/projects/new" style="display: inline-block; background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Create Project</a>
    </div>
    <div class="footer">
      <p>&copy; 2025 ThreeBears.ai. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
                `,
                    enabled: true
                });
                logger.debug('Welcome email template created successfully');
            }
            else {
                logger.debug('Welcome template already exists');
            }
            // Check and create forgot password template
            logger.debug('Checking for existing forgot password template...');
            const [existingForgotPassword] = yield index_1.db.select()
                .from(schema_1.emailTemplates)
                .where((0, drizzle_orm_1.eq)(schema_1.emailTemplates.key, 'forgot_password'));
            if (!existingForgotPassword) {
                logger.debug('Creating forgot password email template...');
                yield index_1.db.insert(schema_1.emailTemplates).values({
                    key: 'forgot_password',
                    name: 'Forgot Password',
                    subject: 'Reset Your Password - ThreeBears.ai',
                    body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #000; color: #fff; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
    .button { display: inline-block; background-color: #6366f1; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 15px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🐻 ThreeBears.ai</h1>
    </div>
    <div class="content">
      <h2>Password Reset Request</h2>
      <p>Hi {{firstName}},</p>
      <p>We received a request to reset the password for your ThreeBears.ai account. If you made this request, click the button below to reset your password:</p>
      <p style="text-align: center;">
        <a href="{{resetLink}}" class="button">Reset My Password</a>
      </p>
      <p style="margin-top: 20px;">This link will expire in 24 hours for security reasons.</p>
      <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 ThreeBears.ai. All rights reserved.</p>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #999;">{{resetLink}}</p>
    </div>
  </div>
</body>
</html>
                `,
                    enabled: true
                });
                logger.debug('Forgot password email template created successfully');
            }
            else {
                logger.debug('Forgot password template already exists');
            }
            // Check and create generation complete template
            logger.debug('Checking for existing generation complete template...');
            const [existingGenerationComplete] = yield index_1.db.select()
                .from(schema_1.emailTemplates)
                .where((0, drizzle_orm_1.eq)(schema_1.emailTemplates.key, 'generation_complete'));
            if (!existingGenerationComplete) {
                logger.debug('Creating generation complete email template...');
                yield index_1.db.insert(schema_1.emailTemplates).values({
                    key: 'generation_complete',
                    name: 'Generation Complete',
                    subject: 'Your app "{{projectName}}" is ready! 🎉',
                    body: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #000; color: #fff; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .footer { text-align: center; font-size: 12px; color: #666; margin-top: 20px; }
    .button { display: inline-block; background-color: #6366f1; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 15px; font-weight: bold; }
    .highlight { background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🐻 ThreeBears.ai</h1>
    </div>
    <div class="content">
      <h2>Generation Complete!</h2>
      <p>Great news! Your application <strong>{{projectName}}</strong> has been generated successfully.</p>
      <div class="highlight">
        <p><strong>📦 {{filesCount}} files</strong> were created for your project.</p>
      </div>
      <p>Your app is ready to preview and download. Click below to view your project:</p>
      <p style="text-align: center;">
        <a href="{{projectUrl}}" class="button">View Your Project →</a>
      </p>
    </div>
    <div class="footer">
      <p>&copy; 2025 ThreeBears.ai. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
                `,
                    enabled: true
                });
                logger.debug('Generation complete email template created successfully');
            }
            else {
                logger.debug('Generation complete template already exists');
            }
        }
        catch (error) {
            logger.error('Error during seeding:', error);
            throw error;
        }
    });
};
exports.seedDatabase = seedDatabase;
// Only run the standalone seeding if this file is being executed directly
if (require.main === module) {
    (0, exports.seedDatabase)()
        .then(() => {
        logger.debug('Seeding completed successfully');
        process.exit(0);
    })
        .catch((error) => {
        logger.error('Seeding failed:', error);
        process.exit(1);
    });
}
