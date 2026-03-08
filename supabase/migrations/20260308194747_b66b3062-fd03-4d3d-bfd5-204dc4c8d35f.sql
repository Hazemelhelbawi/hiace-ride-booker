
CREATE TABLE public.private_trip_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  number_of_passengers integer NOT NULL DEFAULT 1,
  pickup_location text NOT NULL,
  dropoff_location text NOT NULL,
  preferred_date date,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.private_trip_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a request (public form)
CREATE POLICY "Anyone can submit private trip requests"
  ON public.private_trip_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admins can view and manage all requests
CREATE POLICY "Admins can manage private trip requests"
  ON public.private_trip_requests
  FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Updated at trigger
CREATE TRIGGER update_private_trip_requests_updated_at
  BEFORE UPDATE ON public.private_trip_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
