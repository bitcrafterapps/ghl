import { db } from '../db';
import { serviceContracts } from '../db/schema';
import { eq, and, desc, sql, like, gte, lte, inArray } from 'drizzle-orm';
import { 
  CreateServiceContractDTO, 
  UpdateServiceContractDTO, 
  ServiceContractFilters 
} from '../types/private-pages.types';

export class ServiceContractService {
  async create(companyId: number, contract: CreateServiceContractDTO) {
    const formattedContract = {
      ...contract,
      companyId,
      startDate: new Date(contract.startDate),
      endDate: contract.endDate ? new Date(contract.endDate) : undefined,
      nextServiceDate: contract.nextServiceDate ? new Date(contract.nextServiceDate) : undefined,
      contractNumber: `SC-${Date.now().toString().slice(-6)}`, // Simple generation
    };

    const [newContract] = await db.insert(serviceContracts)
      .values(formattedContract)
      .returning();
      
    return newContract;
  }

  async update(id: string, companyId: number, data: UpdateServiceContractDTO) {
    const [updatedContract] = await db.update(serviceContracts)
      .set({
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        nextServiceDate: data.nextServiceDate ? new Date(data.nextServiceDate) : undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(serviceContracts.id, id), eq(serviceContracts.companyId, companyId)))
      .returning();
      
    return updatedContract;
  }

  async findAll(companyId: number, filters?: ServiceContractFilters) {
    const offset = (filters?.page || 1) - 1;
    const limit = filters?.limit || 20;

    const whereConditions = [eq(serviceContracts.companyId, companyId)];

    if (filters?.search) {
      whereConditions.push(like(serviceContracts.title, `%${filters.search}%`));
    }
    
    if (filters?.status) {
      if (Array.isArray(filters.status)) {
        whereConditions.push(inArray(serviceContracts.status, filters.status));
      } else {
        whereConditions.push(eq(serviceContracts.status, filters.status));
      }
    }

    if (filters?.contactId) {
      whereConditions.push(eq(serviceContracts.contactId, filters.contactId));
    }
    
    if (filters?.serviceType) {
      whereConditions.push(eq(serviceContracts.serviceType, filters.serviceType));
    }
    
    if (filters?.expiringWithinDays) {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + filters.expiringWithinDays);
      whereConditions.push(gte(serviceContracts.endDate, today));
      whereConditions.push(lte(serviceContracts.endDate, futureDate));
    }

    const data = await db.query.serviceContracts.findMany({
      where: and(...whereConditions),
      limit,
      offset: offset * limit,
      orderBy: desc(serviceContracts.createdAt),
      with: {
        contact: true,
      }
    });

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(serviceContracts)
      .where(and(...whereConditions));

    return {
      data,
      pagination: {
        page: filters?.page || 1,
        limit,
        total: Number(countResult.count),
        totalPages: Math.ceil(Number(countResult.count) / limit),
      },
    };
  }

  async findOne(id: string, companyId: number) {
    return await db.query.serviceContracts.findFirst({
      where: and(eq(serviceContracts.id, id), eq(serviceContracts.companyId, companyId)),
      with: {
        contact: true,
      }
    });
  }

  async delete(id: string, companyId: number) {
    const [deleted] = await db.delete(serviceContracts)
      .where(and(eq(serviceContracts.id, id), eq(serviceContracts.companyId, companyId)))
      .returning();
    return !!deleted;
  }
  
  async renew(id: string, companyId: number, newEndDate: string) {
    // Determine existing contract status to see if it can be renewed
    const contract = await this.findOne(id, companyId);
    if (!contract) throw new Error('Contract not found');

    const [renewed] = await db.update(serviceContracts)
      .set({
        endDate: new Date(newEndDate),
        status: 'active',
        updatedAt: new Date(),
      })
      .where(and(eq(serviceContracts.id, id), eq(serviceContracts.companyId, companyId)))
      .returning();
      
    return renewed;
  }
}
