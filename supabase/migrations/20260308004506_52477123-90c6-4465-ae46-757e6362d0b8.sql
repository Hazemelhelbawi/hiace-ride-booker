
-- Add van_type and daily_repeats to trip_schedules
ALTER TABLE public.trip_schedules 
  ADD COLUMN IF NOT EXISTS van_type text NOT NULL DEFAULT '13_seats',
  ADD COLUMN IF NOT EXISTS daily_repeats integer NOT NULL DEFAULT 1;

-- Add trip_instance_id, pickup/dropoff stop, payment screenshot to bookings
ALTER TABLE public.bookings 
  ADD COLUMN IF NOT EXISTS trip_instance_id uuid REFERENCES public.trip_instances(id),
  ADD COLUMN IF NOT EXISTS pickup_stop_id uuid REFERENCES public.stops(id),
  ADD COLUMN IF NOT EXISTS dropoff_stop_id uuid REFERENCES public.stops(id),
  ADD COLUMN IF NOT EXISTS payment_screenshot_url text;

-- Create storage bucket for payment screenshots
INSERT INTO storage.buckets (id, name, public) 
VALUES ('payment-screenshots', 'payment-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: authenticated users can upload
CREATE POLICY "Authenticated users can upload payment screenshots"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'payment-screenshots');

-- Storage RLS: anyone can view
CREATE POLICY "Anyone can view payment screenshots"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-screenshots');

-- Storage RLS: admins can delete
CREATE POLICY "Admins can delete payment screenshots"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'payment-screenshots' AND public.has_role(auth.uid(), 'admin'));
