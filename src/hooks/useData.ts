import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/services/api';
import type { Route, Booking } from '@/services/api';

// Route hooks
export const useRoutes = () => {
  return useQuery({
    queryKey: ['routes'],
    queryFn: api.getRoutes,
  });
};

export const useRoute = (id: string | undefined) => {
  return useQuery({
    queryKey: ['routes', id],
    queryFn: () => id ? api.getRouteById(id) : null,
    enabled: !!id,
  });
};

export const useCreateRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (route: Omit<Route, 'id' | 'created_at' | 'updated_at'>) => api.createRoute(route),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
};

export const useUpdateRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Route> }) => api.updateRoute(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
};

export const useDeleteRoute = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteRoute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
};

// Booking hooks
export const useBookings = () => {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: api.getBookings,
  });
};

export const useUserBookings = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['bookings', 'user', userId],
    queryFn: () => userId ? api.getUserBookings(userId) : [],
    enabled: !!userId,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (booking: Parameters<typeof api.createBooking>[0]) => api.createBooking(booking),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
};

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Booking> }) => api.updateBooking(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.cancelBooking(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
  });
};

export const useBookedSeats = (routeId: string | undefined) => {
  return useQuery({
    queryKey: ['booked-seats', routeId],
    queryFn: () => routeId ? api.getBookedSeats(routeId) : [],
    enabled: !!routeId,
  });
};
