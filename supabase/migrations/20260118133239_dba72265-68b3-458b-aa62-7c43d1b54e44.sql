-- Enable realtime for bookings table so admins see new bookings instantly
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;