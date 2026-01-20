require('dotenv').config();
import { hash } from 'bcrypt';
import { db } from './index';
import { users, companies, companyUsers, emailTemplates } from './schema';
import { LoggerFactory } from '../logger';
import { eq } from 'drizzle-orm';

const logger = LoggerFactory.getLogger('Seeding');

export const seedDatabase = async function initializeAndSeed() {
    try {
        // Check and create default company
        logger.debug('Checking for existing company...');
        const [existingCompany] = await db.select()
            .from(companies)
            .where(eq(companies.name, 'My Company Inc'));

        let companyId: number;
        
        if (!existingCompany) {
            logger.debug('Creating default company...');
            const [savedCompany] = await db.insert(companies)
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
        } else {
            companyId = existingCompany.id;
            logger.debug('Default company already exists:', existingCompany.id);
        }

        // Check and create admin user
        logger.debug('Checking for existing admin user...');
        const [existingAdmin] = await db.select()
            .from(users)
            .where(eq(users.email, 'admin@example.com'));

        if (!existingAdmin) {
            logger.debug('Creating default admin user...');
            const hashedPassword = await hash('admin123', 10);
            const [savedAdmin] = await db.insert(users)
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
            await db.insert(companyUsers)
                .values({
                    companyId,
                    userId: savedAdmin.id
                });

            logger.debug('Default admin user created and associated with company successfully:', savedAdmin.id);
        } else {
            logger.debug('Default admin user already exists:', existingAdmin.id);
            
            // Ensure admin has Site Admin role
            const currentRoles = existingAdmin.roles || [];
            if (!currentRoles.includes('Site Admin')) {
                logger.debug('Updating existing admin roles to include Site Admin...');
                const updatedRoles = [...currentRoles];
                if (!updatedRoles.includes('Site Admin')) {
                    updatedRoles.push('Site Admin');
                }
                
                await db.update(users)
                    .set({ roles: updatedRoles })
                    .where(eq(users.id, existingAdmin.id));
                logger.debug('Admin user roles updated successfully');
            }
            
            // Check if admin is already associated with the company
            const [existingAssociation] = await db.select()
                .from(companyUsers)
                .where(eq(companyUsers.userId, existingAdmin.id));
                
            if (!existingAssociation) {
                // Associate admin with company if not already associated
                await db.insert(companyUsers)
                    .values({
                        companyId,
                        userId: existingAdmin.id
                    });
                logger.debug('Associated existing admin user with company');
            }
        }

        // Check and create regular user
        logger.debug('Checking for existing regular user...');
        const [existingUser] = await db.select()
            .from(users)
            .where(eq(users.email, 'user@example.com'));

        if (!existingUser) {
            logger.debug('Creating default regular user...');
            const hashedPassword = await hash('user123', 10);
            const [savedUser] = await db.insert(users)
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
            await db.insert(companyUsers)
                .values({
                    companyId,
                    userId: savedUser.id
                });

            logger.debug('Default regular user created and associated with company successfully:', savedUser.id);
        } else {
            logger.debug('Default regular user already exists:', existingUser.id);
            
            // Check if regular user is already associated with the company
            const [existingAssociation] = await db.select()
                .from(companyUsers)
                .where(eq(companyUsers.userId, existingUser.id));
                
            if (!existingAssociation) {
                // Associate regular user with company if not already associated
                await db.insert(companyUsers)
                    .values({
                        companyId,
                        userId: existingUser.id
                    });
                logger.debug('Associated existing regular user with company');
            }
        }
        // Check and create welcome template
        logger.debug('Checking for existing welcome template...');
        const [existingWelcome] = await db.select()
            .from(emailTemplates)
            .where(eq(emailTemplates.key, 'welcome'));

        if (!existingWelcome) {
            logger.debug('Creating welcome email template...');
            await db.insert(emailTemplates).values({
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
        } else {
            logger.debug('Welcome template already exists');
        }

        // Check and create forgot password template
        logger.debug('Checking for existing forgot password template...');
        const [existingForgotPassword] = await db.select()
            .from(emailTemplates)
            .where(eq(emailTemplates.key, 'forgot_password'));

        if (!existingForgotPassword) {
            logger.debug('Creating forgot password email template...');
            await db.insert(emailTemplates).values({
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
        } else {
            logger.debug('Forgot password template already exists');
        }

        // Check and create generation complete template
        logger.debug('Checking for existing generation complete template...');
        const [existingGenerationComplete] = await db.select()
            .from(emailTemplates)
            .where(eq(emailTemplates.key, 'generation_complete'));

        if (!existingGenerationComplete) {
            logger.debug('Creating generation complete email template...');
            await db.insert(emailTemplates).values({
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
        } else {
            logger.debug('Generation complete template already exists');
        }

    } catch (error) {
        logger.error('Error during seeding:', error);
        throw error;
    }
}

// Only run the standalone seeding if this file is being executed directly
if (require.main === module) {
    seedDatabase()
        .then(() => {
            logger.debug('Seeding completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            logger.error('Seeding failed:', error);
            process.exit(1);
        });
} 