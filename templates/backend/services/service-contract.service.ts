import { db } from '../db';
import { serviceContracts, contacts, ContractStatus, ContractFrequency } from '../db/schema';
import { LoggerFactory } from '../logger';
import { eq, and, desc, asc, ilike, or, sql, count, gte, lte, isNull } from 'drizzle-orm';

const logger = LoggerFactory.getLogger('ServiceContractService');

interface ServiceContractFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string | string[];
  contactId?: string;
  serviceType?: string;
  expiringWithinDays?: number;
}

interface CreateContractData {
  contactId?: string;
  title: string;
  description?: string;
  serviceType: string;
  serviceFrequency: string;
  servicesIncluded?: string[];
  status?: string;
  startDate: string;
  endDate?: string;
  billingFrequency: string;
  amount: number;
  autoRenew?: boolean;
  renewalReminderDays?: number;
  terms?: string;
  notes?: string;
}

export class ServiceContractService {
  /**
   * Generate next contract number for company
   */
  private async generateContractNumber(companyId: number): Promise<string> {
    const [result] = await db
      .select({ count: count() })
      .from(serviceContracts)
      .where(eq(serviceContracts.companyId, companyId));

    const nextNum = (Number(result?.count) || 0) + 1;
    return `SC-${String(nextNum).padStart(5, '0')}`;
  }

  /**
   * Get all contracts with filtering and pagination
   */
  async findAll(companyId: number, filters: ServiceContractFilters = {}) {
    try {
      logger.debug('Fetching contracts for company:', companyId, filters);

      const conditions = [eq(serviceContracts.companyId, companyId)];

      // Search filter
      if (filters.search) {
        const searchTerm = `%${filters.search}%`;
        conditions.push(
          or(
            ilike(serviceContracts.title, searchTerm),
            ilike(serviceContracts.contractNumber, searchTerm),
            ilike(serviceContracts.description, searchTerm)
          )!
        );
      }

      // Status filter
      if (filters.status) {
        if (Array.isArray(filters.status)) {
          conditions.push(sql`${serviceContracts.status} = ANY(${filters.status})`);
        } else {
          conditions.push(eq(serviceContracts.status, filters.status as ContractStatus));
        }
      }

      // Contact filter
      if (filters.contactId) {
        conditions.push(eq(serviceContracts.contactId, filters.contactId));
      }

      // Service type filter
      if (filters.serviceType) {
        conditions.push(eq(serviceContracts.serviceType, filters.serviceType));
      }

      // Expiring within days filter
      if (filters.expiringWithinDays) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + filters.expiringWithinDays);
        conditions.push(
          and(
            sql`${serviceContracts.endDate} IS NOT NULL`,
            lte(serviceContracts.endDate, futureDate),
            gte(serviceContracts.endDate, new Date())
          )!
        );
      }

      // Get total count
      const [countResult] = await db
        .select({ count: count() })
        .from(serviceContracts)
        .where(and(...conditions));

      const total = Number(countResult?.count) || 0;
      const page = filters.page || 1;
      const limit = filters.limit || 20;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;

      // Get paginated results
      const contractList = await db
        .select()
        .from(serviceContracts)
        .where(and(...conditions))
        .orderBy(desc(serviceContracts.createdAt))
        .limit(limit)
        .offset(offset);

      // Fetch contact info for each contract
      const contractsWithContacts = await Promise.all(
        contractList.map(async (contract) => {
          let contact = null;
          if (contract.contactId) {
            const [c] = await db
              .select({
                id: contacts.id,
                firstName: contacts.firstName,
                lastName: contacts.lastName,
                email: contacts.email,
                phone: contacts.phone
              })
              .from(contacts)
              .where(eq(contacts.id, contract.contactId));
            contact = c || null;
          }
          return this.formatResponse(contract, contact);
        })
      );

      logger.debug(`Retrieved ${contractList.length} contracts`);

      return {
        data: contractsWithContacts,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      logger.error('Error fetching contracts:', error);
      throw error;
    }
  }

  /**
   * Get a single contract by ID
   */
  async findOne(contractId: string, companyId: number) {
    try {
      const [contract] = await db
        .select()
        .from(serviceContracts)
        .where(
          and(
            eq(serviceContracts.id, contractId),
            eq(serviceContracts.companyId, companyId)
          )
        );

      if (!contract) {
        return null;
      }

      let contact = null;
      if (contract.contactId) {
        const [c] = await db
          .select({
            id: contacts.id,
            firstName: contacts.firstName,
            lastName: contacts.lastName,
            email: contacts.email,
            phone: contacts.phone
          })
          .from(contacts)
          .where(eq(contacts.id, contract.contactId));
        contact = c || null;
      }

      return this.formatResponse(contract, contact);
    } catch (error) {
      logger.error('Error fetching contract by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new contract
   */
  async create(companyId: number, data: CreateContractData) {
    try {
      logger.debug('Creating contract:', data.title);

      const contractNumber = await this.generateContractNumber(companyId);

      const [contract] = await db.insert(serviceContracts).values({
        companyId,
        contractNumber,
        title: data.title,
        description: data.description || null,
        contactId: data.contactId || null,
        serviceType: data.serviceType,
        serviceDescription: data.servicesIncluded?.join(', ') || null,
        status: (data.status as ContractStatus) || 'draft',
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        billingFrequency: (data.billingFrequency as ContractFrequency) || 'monthly',
        serviceFrequency: (data.serviceFrequency as ContractFrequency) || 'monthly',
        amount: data.amount,
        autoRenew: data.autoRenew ?? false,
        terms: data.terms || null,
        customFields: data.notes ? { notes: data.notes, renewalReminderDays: data.renewalReminderDays } : null
      }).returning();

      logger.debug('Contract created:', contract.id);

      return this.formatResponse(contract, null);
    } catch (error) {
      logger.error('Error creating contract:', error);
      throw error;
    }
  }

  /**
   * Update a contract
   */
  async update(contractId: string, companyId: number, data: Partial<CreateContractData>) {
    try {
      logger.debug('Updating contract:', contractId);

      const updateData: Record<string, any> = {
        updatedAt: new Date()
      };

      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.contactId !== undefined) updateData.contactId = data.contactId;
      if (data.serviceType !== undefined) updateData.serviceType = data.serviceType;
      if (data.serviceFrequency !== undefined) updateData.serviceFrequency = data.serviceFrequency;
      if (data.servicesIncluded !== undefined) updateData.serviceDescription = data.servicesIncluded.join(', ');
      if (data.status !== undefined) updateData.status = data.status;
      if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
      if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
      if (data.billingFrequency !== undefined) updateData.billingFrequency = data.billingFrequency;
      if (data.amount !== undefined) updateData.amount = data.amount;
      if (data.autoRenew !== undefined) updateData.autoRenew = data.autoRenew;
      if (data.terms !== undefined) updateData.terms = data.terms;

      const [updated] = await db
        .update(serviceContracts)
        .set(updateData)
        .where(
          and(
            eq(serviceContracts.id, contractId),
            eq(serviceContracts.companyId, companyId)
          )
        )
        .returning();

      if (!updated) {
        return null;
      }

      logger.debug('Contract updated:', contractId);

      return this.formatResponse(updated, null);
    } catch (error) {
      logger.error('Error updating contract:', error);
      throw error;
    }
  }

  /**
   * Delete a contract
   */
  async delete(contractId: string, companyId: number): Promise<boolean> {
    try {
      logger.debug('Deleting contract:', contractId);

      const [deleted] = await db
        .delete(serviceContracts)
        .where(
          and(
            eq(serviceContracts.id, contractId),
            eq(serviceContracts.companyId, companyId)
          )
        )
        .returning();

      logger.debug('Contract deleted:', contractId);

      return !!deleted;
    } catch (error) {
      logger.error('Error deleting contract:', error);
      throw error;
    }
  }

  /**
   * Renew a contract
   */
  async renew(contractId: string, companyId: number, newEndDate: string) {
    try {
      logger.debug('Renewing contract:', contractId);

      const [updated] = await db
        .update(serviceContracts)
        .set({
          endDate: new Date(newEndDate),
          status: 'active',
          updatedAt: new Date()
        })
        .where(
          and(
            eq(serviceContracts.id, contractId),
            eq(serviceContracts.companyId, companyId)
          )
        )
        .returning();

      if (!updated) {
        throw new Error('Contract not found');
      }

      logger.debug('Contract renewed:', contractId);

      return this.formatResponse(updated, null);
    } catch (error) {
      logger.error('Error renewing contract:', error);
      throw error;
    }
  }

  /**
   * Format database record to response
   */
  private formatResponse(contract: typeof serviceContracts.$inferSelect, contact: any) {
    return {
      id: contract.id,
      companyId: contract.companyId,
      contactId: contract.contactId,
      contractNumber: contract.contractNumber,
      title: contract.title,
      description: contract.description,
      serviceType: contract.serviceType,
      serviceDescription: contract.serviceDescription,
      status: contract.status,
      startDate: contract.startDate,
      endDate: contract.endDate,
      billingFrequency: contract.billingFrequency,
      serviceFrequency: contract.serviceFrequency,
      amount: contract.amount,
      currency: contract.currency || 'USD',
      autoRenew: contract.autoRenew,
      terms: contract.terms,
      nextServiceDate: contract.nextServiceDate,
      preferredDayOfWeek: contract.preferredDayOfWeek,
      preferredTimeSlot: contract.preferredTimeSlot,
      customFields: contract.customFields,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
      contact: contact
    };
  }
}
