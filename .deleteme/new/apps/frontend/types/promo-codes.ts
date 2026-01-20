// Promo Code Types
export type PromoCodeStatus = 'active' | 'inactive' | 'expired';
export type PromoCodeDiscountType = 'percentage' | 'fixed_amount';

export interface PromoCode {
  id: string;
  companyId: number;

  // Code details
  code: string;
  name: string;
  description?: string;

  // Discount configuration
  discountType: PromoCodeDiscountType;
  discountValue: number; // Percentage (0-100) or cents for fixed amount

  // Usage limits
  maxUses?: number | null;
  usedCount: number;
  maxUsesPerCustomer: number;

  // Minimum requirements
  minimumOrderAmount?: number | null; // in cents

  // Validity period
  startDate: Date | string;
  endDate?: Date | string | null;

  // Status
  status: PromoCodeStatus;

  // Display settings
  isPublic: boolean;
  sortOrder: number;

  // Applicable services
  applicableServices?: string[] | null;

  // Terms and conditions
  terms?: string | null;

  // Timestamps
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CreatePromoCodeDTO {
  code: string;
  name: string;
  description?: string;
  discountType: PromoCodeDiscountType;
  discountValue: number;
  maxUses?: number | null;
  maxUsesPerCustomer?: number;
  minimumOrderAmount?: number | null;
  startDate: string;
  endDate?: string | null;
  status?: PromoCodeStatus;
  isPublic?: boolean;
  sortOrder?: number;
  applicableServices?: string[] | null;
  terms?: string | null;
}

export interface UpdatePromoCodeDTO extends Partial<CreatePromoCodeDTO> {}

export interface PromoCodeFilters {
  search?: string;
  status?: PromoCodeStatus | PromoCodeStatus[];
  isPublic?: boolean;
  activeOnly?: boolean;
}

export interface PromoCodeValidationResult {
  valid: boolean;
  code: string;
  name: string;
  discountType: PromoCodeDiscountType;
  discountValue: number;
  discountAmount: number;
  description?: string;
}

export interface PromoCodeUsage {
  id: string;
  promoCodeId: string;
  contactId?: string;
  jobId?: string;
  discountAmount: number;
  originalAmount?: number;
  customerEmail?: string;
  usedAt: Date | string;
}

// Status Colors and Labels
export const PROMO_CODE_STATUS_COLORS: Record<PromoCodeStatus, { bg: string; text: string; border: string; label: string }> = {
  active: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', label: 'Active' },
  inactive: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30', label: 'Inactive' },
  expired: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', label: 'Expired' },
};

export const DISCOUNT_TYPE_LABELS: Record<PromoCodeDiscountType, string> = {
  percentage: 'Percentage Off',
  fixed_amount: 'Fixed Amount Off',
};

// Helper functions
export function formatDiscount(discountType: PromoCodeDiscountType, discountValue: number): string {
  if (discountType === 'percentage') {
    return `${discountValue}% off`;
  }
  // discountValue is in cents for fixed_amount
  return `$${(discountValue / 100).toFixed(2)} off`;
}

export function formatDiscountValueForDisplay(discountType: PromoCodeDiscountType, discountValue: number): string {
  if (discountType === 'percentage') {
    return `${discountValue}%`;
  }
  return `$${(discountValue / 100).toFixed(2)}`;
}

export function isPromoCodeValid(promoCode: PromoCode): boolean {
  if (promoCode.status !== 'active') return false;

  const now = new Date();
  const startDate = new Date(promoCode.startDate);
  if (now < startDate) return false;

  if (promoCode.endDate) {
    const endDate = new Date(promoCode.endDate);
    if (now > endDate) return false;
  }

  if (promoCode.maxUses != null && promoCode.usedCount >= promoCode.maxUses) {
    return false;
  }

  return true;
}

export function getPromoCodeExpiryText(promoCode: PromoCode): string | null {
  if (!promoCode.endDate) return null;

  const endDate = new Date(promoCode.endDate);
  const now = new Date();
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Expired';
  if (diffDays === 0) return 'Expires today';
  if (diffDays === 1) return 'Expires tomorrow';
  if (diffDays <= 7) return `Expires in ${diffDays} days`;

  return `Expires ${endDate.toLocaleDateString()}`;
}
