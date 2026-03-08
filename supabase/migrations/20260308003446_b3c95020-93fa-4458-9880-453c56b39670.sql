
-- Trip Schedules: recurring schedule definitions
CREATE TABLE public.trip_schedules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    route_template_id uuid NOT NULL REFERENCES public.route_templates(id) ON DELETE CASCADE,
    title text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    recurrence_type text NOT NULL DEFAULT 'daily' CHECK (recurrence_type IN ('daily', 'weekly', 'custom')),
    weekdays integer[] DEFAULT '{}',
    vehicle_count integer NOT NULL DEFAULT 1,
    seats_per_vehicle integer NOT NULL DEFAULT 12,
    price numeric NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.trip_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage trip schedules" ON public.trip_schedules FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view active schedules" ON public.trip_schedules FOR SELECT USING (is_active = true);

-- Schedule Stop Times
CREATE TABLE public.schedule_stop_times (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id uuid NOT NULL REFERENCES public.trip_schedules(id) ON DELETE CASCADE,
    stop_id uuid NOT NULL REFERENCES public.stops(id) ON DELETE CASCADE,
    arrival_time time NOT NULL,
    departure_time time,
    sequence_order integer NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.schedule_stop_times ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage schedule stop times" ON public.schedule_stop_times FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view schedule stop times" ON public.schedule_stop_times FOR SELECT USING (true);

-- Trip Instances: generated per date
CREATE TABLE public.trip_instances (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_id uuid NOT NULL REFERENCES public.trip_schedules(id) ON DELETE CASCADE,
    trip_date date NOT NULL,
    available_seats integer NOT NULL,
    total_seats integer NOT NULL,
    status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(schedule_id, trip_date)
);

ALTER TABLE public.trip_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage trip instances" ON public.trip_instances FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can view scheduled trip instances" ON public.trip_instances FOR SELECT USING (status IN ('scheduled', 'in_progress'));

-- Updated_at triggers
CREATE TRIGGER update_trip_schedules_updated_at BEFORE UPDATE ON public.trip_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trip_instances_updated_at BEFORE UPDATE ON public.trip_instances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for trip_instances
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_instances;
