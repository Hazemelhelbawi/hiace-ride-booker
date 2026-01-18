import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useRealtimeBookings = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('Setting up realtime subscription for bookings...');
    
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        (payload) => {
          console.log('Realtime booking update received:', payload);
          
          // Invalidate bookings queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['bookings'] });
          queryClient.invalidateQueries({ queryKey: ['routes'] });
          
          // Show toast notification for new bookings
          if (payload.eventType === 'INSERT') {
            const newBooking = payload.new as { passenger_name?: string; seats?: number[] };
            toast.info(`New booking from ${newBooking.passenger_name || 'Unknown'}`, {
              description: `Seats: ${newBooking.seats?.join(', ') || 'N/A'}`,
            });
          } else if (payload.eventType === 'UPDATE') {
            toast.info('Booking updated', {
              description: 'A booking has been modified',
            });
          } else if (payload.eventType === 'DELETE') {
            toast.info('Booking cancelled', {
              description: 'A booking has been removed',
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up realtime subscription...');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
