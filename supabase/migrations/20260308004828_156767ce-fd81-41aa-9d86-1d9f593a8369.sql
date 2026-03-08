
-- Make route_id nullable since new bookings use trip_instance_id instead
ALTER TABLE public.bookings ALTER COLUMN route_id DROP NOT NULL;
