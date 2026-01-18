
import 'dotenv/config';
import { db } from '../db';
import { users, companies, jobs, contacts, serviceContracts } from '../db/schema';
import { eq } from 'drizzle-orm';

async function seedMikes() {
  console.log('Seeding data for Mikes Plumbing...');

  // 1. Find Company and User
  const [mike] = await db.select().from(users).where(eq(users.email, 'mike@gmail.com'));
  const [company] = await db.select().from(companies).where(eq(companies.name, 'Mikes Plumbing'));

  if (!mike || !company) {
    console.error('Could not find Mike or Mikes Plumbing');
    process.exit(1);
  }

  console.log(`Found Mike (ID: ${mike.id}) and Company (ID: ${company.id})`);

  // 2. Create Contacts
  console.log('Creating Contacts...');
  const [contact1] = await db.insert(contacts).values({
    companyId: company.id,
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'alice@example.com',
    status: 'new',
    addressLine1: '123 Maple Dr',
    city: 'Springfield',
    state: 'IL'
  }).returning();

  const [contact2] = await db.insert(contacts).values({
    companyId: company.id,
    firstName: 'Bob',
    lastName: 'Jones',
    email: 'bob@example.com',
    status: 'converted',
    addressLine1: '456 Oak Ln',
    city: 'Springfield',
    state: 'IL'
  }).returning();

  // 3. Create Jobs
  console.log('Creating Jobs...');
  // Active Job
  await db.insert(jobs).values({
    companyId: company.id,
    jobNumber: 'JOB-001',
    title: 'Leaky Faucet Repair',
    description: 'Fixing leaking kitchen faucet',
    status: 'scheduled',
    priority: 'normal',
    contactId: contact1.id,
    assignedUserId: mike.id,
    scheduledDate: new Date(Date.now() + 86400000), // Tomorrow
    estimatedAmount: 15000 // $150.00
  });

  // Completed Job (Paid - Revenue)
  await db.insert(jobs).values({
    companyId: company.id,
    jobNumber: 'JOB-002',
    title: 'Water Heater Install',
    description: 'Installed new tankless water heater',
    status: 'paid', // Counts as revenue AND completed
    priority: 'high',
    contactId: contact2.id,
    assignedUserId: mike.id,
    finalAmount: 120000, // $1,200.00
    createdAt: new Date(Date.now() - 7 * 86400000)
  });

  // Pending Job
  await db.insert(jobs).values({
    companyId: company.id,
    jobNumber: 'JOB-003',
    title: 'Bathroom Remodel Quote',
    description: 'Estimate for master bath remodel',
    status: 'quoted', // Pending
    contactId: contact1.id,
    assignedUserId: mike.id,
    quotedAmount: 500000 // $5,000.00
  });

  // 4. Create Contract
  console.log('Creating Service Contracts...');
  await db.insert(serviceContracts).values({
    companyId: company.id,
    contactId: contact2.id,
    contractNumber: 'CTR-001',
    title: 'Annual Maintenance Plan',
    status: 'active',
    amount: 19900, // $199.00
    startDate: new Date(),
    billingFrequency: 'annual'
  });

  console.log('Seeding Complete! Please refresh the dashboard.');
  process.exit(0);
}

seedMikes().catch(console.error);
