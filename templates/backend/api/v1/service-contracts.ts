import { Router } from 'express';
import { z } from 'zod';
import { ServiceContractService } from '../../services/service-contract.service';
import { authenticate } from '../../middleware/v1/auth.middleware';
import { getUserCompanyId } from '../../utils/company';

const router = Router();
const service = new ServiceContractService();

// Validation Schemas
const createContractSchema = z.object({
  contactId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  serviceType: z.string().min(1),
  serviceFrequency: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly', 'semi_annual', 'annual', 'on_demand']),
  servicesIncluded: z.array(z.string()).optional(),
  status: z.enum(['draft', 'active', 'paused', 'expired', 'cancelled']).optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  billingFrequency: z.enum(['monthly', 'quarterly', 'semi_annual', 'annual']),
  amount: z.number().min(0),
  autoRenew: z.boolean().optional(),
  renewalReminderDays: z.number().optional(),
  terms: z.string().optional(),
  notes: z.string().optional(),
});

const updateContractSchema = createContractSchema.partial();

// Get all contracts
router.get('/', authenticate, async (req, res) => {
  try {
    const companyId = await getUserCompanyId(req.user!.userId);
    if (!companyId) return res.status(400).json({ error: 'User not associated with a company' });

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    
    // Handle status filter which can be a string or array
    let status = req.query.status as any;
    if (status && !Array.isArray(status)) {
        status = [status];
    }
    
    const filters = {
      page,
      limit,
      search: req.query.search as string,
      status: status,
      contactId: req.query.contactId as string,
      serviceType: req.query.serviceType as string,
      expiringWithinDays: req.query.expiringWithinDays ? Number(req.query.expiringWithinDays) : undefined,
    };

    const result = await service.findAll(companyId, filters);
    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching contracts:', error);
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
});

// Get single contract
router.get('/:id', authenticate, async (req, res) => {
  try {
    const companyId = await getUserCompanyId(req.user!.userId);
    if (!companyId) return res.status(400).json({ error: 'User not associated with a company' });

    const contract = await service.findOne(req.params.id, companyId);
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    res.json({ data: contract });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contract' });
  }
});

// Create contract
router.post('/', authenticate, async (req, res) => {
  try {
    const companyId = await getUserCompanyId(req.user!.userId);
    if (!companyId) return res.status(400).json({ error: 'User not associated with a company' });

    const validatedData = createContractSchema.parse(req.body);
    const contract = await service.create(companyId, validatedData);
    
    res.status(201).json({ data: contract });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: (error as any).errors });
    }
    res.status(500).json({ error: 'Failed to create contract' });
  }
});

// Update contract
router.put('/:id', authenticate, async (req, res) => {
  try {
    const companyId = await getUserCompanyId(req.user!.userId);
    if (!companyId) return res.status(400).json({ error: 'User not associated with a company' });

    const validatedData = updateContractSchema.parse(req.body);
    const contract = await service.update(req.params.id, companyId, validatedData);
    
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    
    res.json({ data: contract });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: (error as any).errors });
    }
    res.status(500).json({ error: 'Failed to update contract' });
  }
});

// Delete contract
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const companyId = await getUserCompanyId(req.user!.userId);
    if (!companyId) return res.status(400).json({ error: 'User not associated with a company' });

    const success = await service.delete(req.params.id, companyId);
    if (!success) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contract' });
  }
});

// Renew contract
router.post('/:id/renew', authenticate, async (req, res) => {
  try {
    const companyId = await getUserCompanyId(req.user!.userId);
    if (!companyId) return res.status(400).json({ error: 'User not associated with a company' });

    const { newEndDate } = req.body;
    if (!newEndDate) {
        return res.status(400).json({ error: 'New end date is required' });
    }

    const contract = await service.renew(req.params.id, companyId, newEndDate);
    res.json({ data: contract });
  } catch (error) {
    res.status(500).json({ error: 'Failed to renew contract' });
  }
});

export default router;
