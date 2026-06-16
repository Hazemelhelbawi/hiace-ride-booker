import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import * as strapiApi from '@/services/api';

// Since the existing codebase uses Route/Booking types extensively,
// we'll create adapters to convert between Strapi and the expected format

// Note: For now, we're primarily keeping the old Route-based system in UI,
// but the actual API is Strapi. For a full migration, each page should be 
// updated to work with Trip/Stop instead of Route.

// These hooks are temporary wrappers that maintain compatibility
// with existing components while using Strapi backend

// Legacy Route hooks (kept for compatibility - will need updating per component)
export const useRoutes = () => {
  return useQuery({
    queryKey: ['routes'],
    queryFn: async () => {
      // This returns the old Supabase-style route data
      // In the actual migration, components should fetch Trips + Stops from Strapi
      return [];
    },
  });
};

export const useRoute = (id: string | undefined) => {
  return useQuery({
    queryKey: ['routes', id],
    queryFn: () => null,
    enabled: !!id,
  });
};

export const useCreateRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (route: any) => {
      // Legacy hook - not used in Strapi migration
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
};

export const useUpdateRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      // Legacy hook - not used in Strapi migration
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
};

export const useDeleteRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Legacy hook - not used in Strapi migration
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

// Booking hooks - these work with Strapi
export const useBookings = () => {
  const { token } = useAuth();
  
  return useQuery({
    queryKey: ['bookings'],
    queryFn: () => token ? strapiApi.getAllBookings(token) : [],
    enabled: !!token,
  });
};

export const useUserBookings = (userId: string | undefined) => {
  const { token } = useAuth();
  
  return useQuery({
    queryKey: ['bookings', 'user', userId],
    queryFn: () => token ? strapiApi.getMyBookings(token) : [],
    enabled: !!userId && !!token,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async ({ data, screenshotFile }: { data: any; screenshotFile?: File }) => {
      if (!token) throw new Error('Not authenticated');
      return strapiApi.createBooking(data, token, screenshotFile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
};

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      if (!token) throw new Error('Not authenticated');
      return strapiApi.updateBookingStatus(id, updates.status, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (id: number) => {
      if (!token) throw new Error('Not authenticated');
      return strapiApi.cancelBooking(id, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
};

export const useBookedSeats = (tripId: number | undefined) => {
  return useQuery({
    queryKey: ['booked-seats', tripId],
    queryFn: () => tripId ? strapiApi.getBookedSeats(tripId) : [],
    enabled: !!tripId,
  });
};

// Strapi-specific hooks for Trips
export const useTrips = (params?: { direction?: 'cairo_sinai' | 'sinai_cairo'; date?: string }) => {
  return useQuery({
    queryKey: ['trips', params],
    queryFn: () => strapiApi.getTrips(params),
  });
};

// Strapi-specific hooks for Stops
export const useStops = (region?: 'cairo' | 'south_sinai') => {
  return useQuery({
    queryKey: ['stops', region],
    queryFn: () => strapiApi.getStops(region),
  });
};
