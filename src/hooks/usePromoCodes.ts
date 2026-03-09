import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

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

// Fetch all promo codes (admin only)
export const usePromoCodes = () => {
  return useQuery({
    queryKey: ['promo-codes'],
    queryFn: async (): Promise<PromoCode[]> => {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching promo codes:', error);
        throw error;
      }

      return data || [];
    },
  });
};

// Fetch active promo code for banner
export const useActivePromoCode = () => {
  return useQuery({
    queryKey: ['active-promo-code'],
    queryFn: async (): Promise<PromoCode | null> => {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('is_active', true)
        .or('expires_at.is.null,expires_at.gt.now()')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        logger.error('Error fetching active promo code:', error);
        return null;
      }

      return data;
    },
  });
};

// Validate a promo code
export const useValidatePromoCode = () => {
  return useMutation({
    mutationFn: async (code: string): Promise<PromoCode | null> => {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        logger.error('Error validating promo code:', error);
        return null;
      }

      if (!data) return null;

      // Check expiration
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return null;
      }

      // Check max uses
      if (data.max_uses && data.current_uses >= data.max_uses) {
        return null;
      }

      return data;
    },
  });
};

// Create promo code (admin)
export const useCreatePromoCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promoCode: Omit<PromoCode, 'id' | 'current_uses' | 'created_at' | 'updated_at'>): Promise<PromoCode> => {
      const { data, error } = await supabase
        .from('promo_codes')
        .insert([{ ...promoCode, code: promoCode.code.toUpperCase() }])
        .select()
        .single();

      if (error) {
        logger.error('Error creating promo code:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      queryClient.invalidateQueries({ queryKey: ['active-promo-code'] });
    },
  });
};

// Update promo code (admin)
export const useUpdatePromoCode = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PromoCode> }): Promise<PromoCode> => {
      const { data, error } = await supabase
        .from('promo_codes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Error updating promo code:', error);
        throw error;
      }

      return data;
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
      const { error } = await supabase
        .from('promo_codes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting promo code:', error);
        throw error;
      }
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['promo-codes'] });
      const previousPromoCodes = queryClient.getQueryData<PromoCode[]>(['promo-codes']);
      queryClient.setQueryData<PromoCode[]>(['promo-codes'], (old) =>
        old?.filter(promo => promo.id !== id) ?? []
      );
      return { previousPromoCodes };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
      queryClient.invalidateQueries({ queryKey: ['active-promo-code'] });
    },
    onError: (_err, _id, context) => {
      if (context?.previousPromoCodes) {
        queryClient.setQueryData(['promo-codes'], context.previousPromoCodes);
      }
    },
  });
};

// Increment promo code usage
export const useIncrementPromoCodeUsage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string): Promise<void> => {
      const { data: promoCode } = await supabase
        .from('promo_codes')
        .select('current_uses')
        .eq('code', code.toUpperCase())
        .single();

      if (promoCode) {
        await supabase
          .from('promo_codes')
          .update({ current_uses: promoCode.current_uses + 1 })
          .eq('code', code.toUpperCase());
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-codes'] });
    },
  });
};
