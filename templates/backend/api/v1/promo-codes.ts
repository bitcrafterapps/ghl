import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../db';
import { promoCodes, promoCodeUsages } from '../../db/schema';
import { eq, and, or, gte, lte, ilike, sql, desc, asc } from 'drizzle-orm';
import { authenticate } from '../../middleware/v1/auth.middleware';
import { getUserCompanyId, resolveCompanyId, userHasCompanyAccess } from '../../utils/company';

const router = Router();

// Validation Schemas
const createPromoCodeSchema = z.object({
  code: z.string().min(1).max(50).transform(v => v.toUpperCase().replace(/\s/g, '')),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  discountType: z.enum(['percentage', 'fixed_amount']),
  discountValue: z.number().min(0),
  maxUses: z.number().int().min(0).optional().nullable(),
  maxUsesPerCustomer: z.number().int().min(1).optional().default(1),
  minimumOrderAmount: z.number().min(0).optional().nullable(),
  startDate: z.string(),
  endDate: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive', 'expired']).optional().default('active'),
  isPublic: z.boolean().optional().default(false),
  sortOrder: z.number().int().optional().default(0),
  applicableServices: z.array(z.string()).optional().nullable(),
  terms: z.string().optional().nullable(),
}).transform(data => {
  // Validate percentage max 100
  if (data.discountType === 'percentage' && data.discountValue > 100) {
    throw new Error('Percentage discount cannot exceed 100%');
  }
  // Convert fixed_amount to cents
  const discountValue = data.discountType === 'fixed_amount'
    ? Math.round(data.discountValue * 100)
    : data.discountValue;
  // Convert minimumOrderAmount to cents
  const minimumOrderAmount = data.minimumOrderAmount
    ? Math.round(data.minimumOrderAmount * 100)
    : null;
  return {
    ...data,
    discountValue,
    minimumOrderAmount,
    startDate: new Date(data.startDate),
    endDate: data.endDate ? new Date(data.endDate) : null,
  };
});

// Update schema - same fields but all optional
const updatePromoCodeSchema = z.object({
  code: z.string().min(1).max(50).transform(v => v.toUpperCase().replace(/\s/g, '')).optional(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  discountType: z.enum(['percentage', 'fixed_amount']).optional(),
  discountValue: z.number().min(0).optional(),
  maxUses: z.number().int().min(0).optional().nullable(),
  maxUsesPerCustomer: z.number().int().min(1).optional(),
  minimumOrderAmount: z.number().min(0).optional().nullable(),
  startDate: z.string().optional(),
  endDate: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive', 'expired']).optional(),
  isPublic: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  applicableServices: z.array(z.string()).optional().nullable(),
  terms: z.string().optional().nullable(),
}).transform(data => {
  const result: any = { ...data };
  // Validate percentage max 100
  if (data.discountType === 'percentage' && data.discountValue !== undefined && data.discountValue > 100) {
    throw new Error('Percentage discount cannot exceed 100%');
  }
  // Convert fixed_amount to cents
  if (data.discountValue !== undefined && data.discountType === 'fixed_amount') {
    result.discountValue = Math.round(data.discountValue * 100);
  }
  // Convert minimumOrderAmount to cents
  if (data.minimumOrderAmount !== undefined && data.minimumOrderAmount !== null) {
    result.minimumOrderAmount = Math.round(data.minimumOrderAmount * 100);
  }
  if (data.startDate) {
    result.startDate = new Date(data.startDate);
  }
  if (data.endDate) {
    result.endDate = new Date(data.endDate);
  }
  return result;
});

// Get all promo codes for company
router.get('/', authenticate, async (req, res) => {
  try {
    // Allow specifying companyId via query param (for multi-site management)
    const targetCompanyId = req.query.companyId ? Number(req.query.companyId) : undefined;
    const companyId = await resolveCompanyId(req.user!.userId, targetCompanyId);
    if (!companyId) return res.status(400).json({ error: 'User not associated with a company or no access to requested company' });

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Build filters
    const filters: any[] = [eq(promoCodes.companyId, companyId)];

    // Status filter
    if (req.query.status) {
      const statusArray = Array.isArray(req.query.status) ? req.query.status : [req.query.status];
      filters.push(or(...statusArray.map(s => eq(promoCodes.status, s as 'active' | 'inactive' | 'expired'))));
    }

    // Search filter
    if (req.query.search) {
      const search = `%${req.query.search}%`;
      filters.push(or(
        ilike(promoCodes.code, search),
        ilike(promoCodes.name, search),
        ilike(promoCodes.description, search)
      ));
    }

    // Public filter
    if (req.query.isPublic !== undefined) {
      filters.push(eq(promoCodes.isPublic, req.query.isPublic === 'true'));
    }

    // Active only filter (valid date range)
    if (req.query.activeOnly === 'true') {
      const now = new Date();
      filters.push(lte(promoCodes.startDate, now));
      filters.push(or(
        eq(promoCodes.endDate, sql`NULL`),
        gte(promoCodes.endDate, now)
      ));
      filters.push(eq(promoCodes.status, 'active'));
    }

    const whereClause = and(...filters);

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(promoCodes)
      .where(whereClause);

    // Get promo codes
    const codes = await db
      .select()
      .from(promoCodes)
      .where(whereClause)
      .orderBy(desc(promoCodes.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({
      data: codes,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    res.status(500).json({ error: 'Failed to fetch promo codes' });
  }
});

// Get public promo codes (no auth required)
router.get('/public', async (req, res) => {
  try {
    const companyId = req.query.companyId ? Number(req.query.companyId) : null;

    if (!companyId) {
      return res.status(400).json({ error: 'companyId is required' });
    }

    const now = new Date();

    const codes = await db
      .select({
        id: promoCodes.id,
        code: promoCodes.code,
        name: promoCodes.name,
        description: promoCodes.description,
        discountType: promoCodes.discountType,
        discountValue: promoCodes.discountValue,
        minimumOrderAmount: promoCodes.minimumOrderAmount,
        startDate: promoCodes.startDate,
        endDate: promoCodes.endDate,
        applicableServices: promoCodes.applicableServices,
        terms: promoCodes.terms,
      })
      .from(promoCodes)
      .where(and(
        eq(promoCodes.companyId, companyId),
        eq(promoCodes.isPublic, true),
        eq(promoCodes.status, 'active'),
        lte(promoCodes.startDate, now),
        or(
          sql`${promoCodes.endDate} IS NULL`,
          gte(promoCodes.endDate, now)
        )
      ))
      .orderBy(asc(promoCodes.sortOrder), desc(promoCodes.createdAt));

    res.json({ data: codes });
  } catch (error) {
    console.error('Error fetching public promo codes:', error);
    res.status(500).json({ error: 'Failed to fetch promo codes' });
  }
});

// Get single promo code
router.get('/:id', authenticate, async (req, res) => {
  try {
    const companyId = await getUserCompanyId(req.user!.userId);
    if (!companyId) return res.status(400).json({ error: 'User not associated with a company' });

    const [code] = await db
      .select()
      .from(promoCodes)
      .where(and(
        eq(promoCodes.id, req.params.id),
        eq(promoCodes.companyId, companyId)
      ));

    if (!code) {
      return res.status(404).json({ error: 'Promo code not found' });
    }

    res.json({ data: code });
  } catch (error) {
    console.error('Error fetching promo code:', error);
    res.status(500).json({ error: 'Failed to fetch promo code' });
  }
});

// Validate promo code (for use during checkout)
router.post('/validate', async (req, res) => {
  try {
    const { code, orderAmount, service, companyId } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Promo code is required' });
    }

    if (!companyId) {
      return res.status(400).json({ error: 'companyId is required' });
    }

    const now = new Date();

    const [promoCode] = await db
      .select()
      .from(promoCodes)
      .where(and(
        eq(promoCodes.companyId, Number(companyId)),
        eq(promoCodes.code, code.toUpperCase()),
        eq(promoCodes.status, 'active'),
        lte(promoCodes.startDate, now),
        or(
          sql`${promoCodes.endDate} IS NULL`,
          gte(promoCodes.endDate, now)
        )
      ));

    if (!promoCode) {
      return res.status(404).json({ error: 'Invalid or expired promo code' });
    }

    // Check max uses
    if (promoCode.maxUses !== null && promoCode.usedCount !== null && promoCode.usedCount >= promoCode.maxUses) {
      return res.status(400).json({ error: 'This promo code has reached its usage limit' });
    }

    // Check minimum order amount
    if (promoCode.minimumOrderAmount && orderAmount) {
      const orderAmountCents = Math.round(orderAmount * 100);
      if (orderAmountCents < promoCode.minimumOrderAmount) {
        return res.status(400).json({
          error: `Minimum order amount of $${(promoCode.minimumOrderAmount / 100).toFixed(2)} required`
        });
      }
    }

    // Check applicable services
    if (promoCode.applicableServices && promoCode.applicableServices.length > 0 && service) {
      if (!promoCode.applicableServices.includes(service)) {
        return res.status(400).json({ error: 'This promo code is not valid for the selected service' });
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (orderAmount) {
      const orderAmountCents = Math.round(orderAmount * 100);
      if (promoCode.discountType === 'percentage') {
        discountAmount = Math.round(orderAmountCents * (promoCode.discountValue / 100));
      } else {
        discountAmount = Math.min(promoCode.discountValue, orderAmountCents);
      }
    }

    res.json({
      data: {
        valid: true,
        code: promoCode.code,
        name: promoCode.name,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
        discountAmount: discountAmount / 100, // Return in dollars
        description: promoCode.description,
      }
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    res.status(500).json({ error: 'Failed to validate promo code' });
  }
});

// Create promo code
router.post('/', authenticate, async (req, res) => {
  try {
    // Allow specifying companyId in request body (for multi-site management)
    const targetCompanyId = req.body.companyId ? Number(req.body.companyId) : undefined;
    const companyId = await resolveCompanyId(req.user!.userId, targetCompanyId);
    if (!companyId) return res.status(400).json({ error: 'User not associated with a company or no access to requested company' });

    const validatedData = createPromoCodeSchema.parse(req.body);

    // Check for duplicate code
    const [existing] = await db
      .select()
      .from(promoCodes)
      .where(and(
        eq(promoCodes.companyId, companyId),
        eq(promoCodes.code, validatedData.code)
      ));

    if (existing) {
      return res.status(400).json({ error: 'A promo code with this code already exists' });
    }

    const [code] = await db
      .insert(promoCodes)
      .values({
        ...validatedData,
        companyId,
      })
      .returning();

    res.status(201).json({ data: code });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error creating promo code:', error);
    res.status(500).json({ error: 'Failed to create promo code' });
  }
});

// Update promo code
router.put('/:id', authenticate, async (req, res) => {
  try {
    const companyId = await getUserCompanyId(req.user!.userId);
    if (!companyId) return res.status(400).json({ error: 'User not associated with a company' });

    const validatedData = updatePromoCodeSchema.parse(req.body);

    // If code is being changed, check for duplicates
    if (validatedData.code) {
      const [existing] = await db
        .select()
        .from(promoCodes)
        .where(and(
          eq(promoCodes.companyId, companyId),
          eq(promoCodes.code, validatedData.code),
          sql`${promoCodes.id} != ${req.params.id}`
        ));

      if (existing) {
        return res.status(400).json({ error: 'A promo code with this code already exists' });
      }
    }

    const [code] = await db
      .update(promoCodes)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(and(
        eq(promoCodes.id, req.params.id),
        eq(promoCodes.companyId, companyId)
      ))
      .returning();

    if (!code) {
      return res.status(404).json({ error: 'Promo code not found' });
    }

    res.json({ data: code });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error('Error updating promo code:', error);
    res.status(500).json({ error: 'Failed to update promo code' });
  }
});

// Delete promo code
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const companyId = await getUserCompanyId(req.user!.userId);
    if (!companyId) return res.status(400).json({ error: 'User not associated with a company' });

    const [deleted] = await db
      .delete(promoCodes)
      .where(and(
        eq(promoCodes.id, req.params.id),
        eq(promoCodes.companyId, companyId)
      ))
      .returning();

    if (!deleted) {
      return res.status(404).json({ error: 'Promo code not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting promo code:', error);
    res.status(500).json({ error: 'Failed to delete promo code' });
  }
});

// Toggle promo code status
router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const companyId = await getUserCompanyId(req.user!.userId);
    if (!companyId) return res.status(400).json({ error: 'User not associated with a company' });

    const { status } = req.body;
    if (!['active', 'inactive', 'expired'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const [code] = await db
      .update(promoCodes)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(and(
        eq(promoCodes.id, req.params.id),
        eq(promoCodes.companyId, companyId)
      ))
      .returning();

    if (!code) {
      return res.status(404).json({ error: 'Promo code not found' });
    }

    res.json({ data: code });
  } catch (error) {
    console.error('Error updating promo code status:', error);
    res.status(500).json({ error: 'Failed to update promo code status' });
  }
});

// Toggle public visibility
router.patch('/:id/visibility', authenticate, async (req, res) => {
  try {
    const companyId = await getUserCompanyId(req.user!.userId);
    if (!companyId) return res.status(400).json({ error: 'User not associated with a company' });

    const { isPublic } = req.body;

    const [code] = await db
      .update(promoCodes)
      .set({
        isPublic: !!isPublic,
        updatedAt: new Date(),
      })
      .where(and(
        eq(promoCodes.id, req.params.id),
        eq(promoCodes.companyId, companyId)
      ))
      .returning();

    if (!code) {
      return res.status(404).json({ error: 'Promo code not found' });
    }

    res.json({ data: code });
  } catch (error) {
    console.error('Error updating promo code visibility:', error);
    res.status(500).json({ error: 'Failed to update promo code visibility' });
  }
});

// Record promo code usage
router.post('/:id/use', authenticate, async (req, res) => {
  try {
    const { contactId, jobId, discountAmount, originalAmount, customerEmail } = req.body;

    // Get the promo code
    const [promoCode] = await db
      .select()
      .from(promoCodes)
      .where(eq(promoCodes.id, req.params.id));

    if (!promoCode) {
      return res.status(404).json({ error: 'Promo code not found' });
    }

    // Record usage
    const [usage] = await db
      .insert(promoCodeUsages)
      .values({
        promoCodeId: req.params.id,
        contactId,
        jobId,
        discountAmount: Math.round(discountAmount * 100),
        originalAmount: originalAmount ? Math.round(originalAmount * 100) : null,
        customerEmail,
      })
      .returning();

    // Increment used count
    await db
      .update(promoCodes)
      .set({
        usedCount: sql`${promoCodes.usedCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(promoCodes.id, req.params.id));

    res.json({ data: usage });
  } catch (error) {
    console.error('Error recording promo code usage:', error);
    res.status(500).json({ error: 'Failed to record promo code usage' });
  }
});

// Get promo code usage history
router.get('/:id/usage', authenticate, async (req, res) => {
  try {
    const companyId = await getUserCompanyId(req.user!.userId);
    if (!companyId) return res.status(400).json({ error: 'User not associated with a company' });

    // Verify promo code belongs to company
    const [promoCode] = await db
      .select()
      .from(promoCodes)
      .where(and(
        eq(promoCodes.id, req.params.id),
        eq(promoCodes.companyId, companyId)
      ));

    if (!promoCode) {
      return res.status(404).json({ error: 'Promo code not found' });
    }

    const usages = await db
      .select()
      .from(promoCodeUsages)
      .where(eq(promoCodeUsages.promoCodeId, req.params.id))
      .orderBy(desc(promoCodeUsages.usedAt));

    res.json({ data: usages });
  } catch (error) {
    console.error('Error fetching promo code usage:', error);
    res.status(500).json({ error: 'Failed to fetch promo code usage' });
  }
});

export default router;
