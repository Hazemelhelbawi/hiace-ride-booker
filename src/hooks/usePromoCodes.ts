import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Stub for promo codes - not part of core Strapi migration
// To implement in Strapi, you would need to:
// 1. Create a promo_codes collection in Strapi
// 2. Add API endpoints for CRUD operations
// 3. Implement validation logic

export interface PromoCode {
  id: string;
  code: string;
  discount_percent: number;
  is_active: boolean;
  expires_at: string | null;
  max_uses: number | null;
  current_uses: number;
  created_at: string;
  updated_at: string;
}

// Fetch all promo codes (admin only) - STUB
export const usePromoCodes = () => {
  return useQuery({
    queryKey: ['promo-codes'],
    queryFn: async (): Promise<PromoCode[]> => {
      // TODO: Implement Strapi promo codes collection
      return [];
    },
  });
};

// Fetch active promo code for banner - STUB
export const useActivePromoCode = () => {
  return useQuery({
    queryKey: ['active-promo-code'],
    queryFn: async (): Promise<PromoCode | null> => {
      // TODO: Implement Strapi promo codes collection
      return null;
    },
  });
};

// Validate a promo code - STUB
export const useValidatePromoCode = () => {
  return useMutation({
    mutationFn: async (code: string): Promise<PromoCode | null> => {
      // TODO: Implement Strapi promo code validation
      console.log('Promo code validation not implemented:', code);
      return null;
    },
  });
};

// Create promo code (admin) - STUB
export const useCreatePromoCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promoCode: Omit<PromoCode, 'id' | 'current_uses' | 'created_at' | 'updated_at'>): Promise<PromoCode> => {
      // TODO: Implement Strapi promo code creation
      throw new Error('Promo codes not implemented in Strapi yet');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      queryClient.invalidateQueries({ queryKey: ['active-promo-code'] });
    },
  });
};

// Update promo code (admin) - STUB
export const useUpdatePromoCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PromoCode> }): Promise<PromoCode> => {
      // TODO: Implement Strapi promo code update
      throw new Error('Promo codes not implemented in Strapi yet');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      queryClient.invalidateQueries({ queryKey: ['active-promo-code'] });
    },
  });
};

export const useDeletePromoCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // TODO: Implement Strapi promo code deletion
      throw new Error('Promo codes not implemented in Strapi yet');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      queryClient.invalidateQueries({ queryKey: ['active-promo-code'] });
    },
  });
};

// Increment promo code usage - STUB
export const useIncrementPromoCodeUsage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string): Promise<void> => {
      // TODO: Implement Strapi promo code usage increment
      console.log('Promo code usage increment not implemented:', code);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
    },
  });
};
