
-- 1. Create stops table
CREATE TABLE public.stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar text NOT NULL,
  name_en text NOT NULL,
  region text NOT NULL,
  city text NOT NULL,
  address text,
  latitude double precision,
  longitude double precision,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2. Create route_templates table
CREATE TABLE public.route_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  origin_region text NOT NULL,
  destination_region text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 3. Create route_template_stops (junction table with ordering)
CREATE TYPE public.stop_role AS ENUM ('pickup', 'dropoff', 'both');

CREATE TABLE public.route_template_stops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_template_id uuid NOT NULL REFERENCES public.route_templates(id) ON DELETE CASCADE,
  stop_id uuid NOT NULL REFERENCES public.stops(id) ON DELETE CASCADE,
  sequence_order integer NOT NULL,
  stop_role stop_role NOT NULL DEFAULT 'both',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (route_template_id, stop_id),
  UNIQUE (route_template_id, sequence_order)
);

-- 4. Enable RLS
ALTER TABLE public.stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_template_stops ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies - stops (public read, admin write)
CREATE POLICY "Anyone can view active stops"
  ON public.stops FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage stops"
  ON public.stops FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- 6. RLS Policies - route_templates (public read, admin write)
CREATE POLICY "Anyone can view active route templates"
  ON public.route_templates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage route templates"
  ON public.route_templates FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- 7. RLS Policies - route_template_stops (public read via template, admin write)
CREATE POLICY "Anyone can view route template stops"
  ON public.route_template_stops FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage route template stops"
  ON public.route_template_stops FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- 8. Updated_at triggers
CREATE TRIGGER update_stops_updated_at
  BEFORE UPDATE ON public.stops
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_route_templates_updated_at
  BEFORE UPDATE ON public.route_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
