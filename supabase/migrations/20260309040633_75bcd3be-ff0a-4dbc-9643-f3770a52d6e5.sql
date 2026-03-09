
-- Bookings -> routes: cascade delete
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_route_id_fkey;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.routes(id) ON DELETE CASCADE;

-- Bookings -> trip_instances: cascade delete
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_trip_instance_id_fkey;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_trip_instance_id_fkey FOREIGN KEY (trip_instance_id) REFERENCES public.trip_instances(id) ON DELETE CASCADE;

-- Bookings -> stops (pickup): set null on delete
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_pickup_stop_id_fkey;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_pickup_stop_id_fkey FOREIGN KEY (pickup_stop_id) REFERENCES public.stops(id) ON DELETE SET NULL;

-- Bookings -> stops (dropoff): set null on delete
ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS bookings_dropoff_stop_id_fkey;
ALTER TABLE public.bookings ADD CONSTRAINT bookings_dropoff_stop_id_fkey FOREIGN KEY (dropoff_stop_id) REFERENCES public.stops(id) ON DELETE SET NULL;

-- Route template stops -> route_templates: cascade delete
ALTER TABLE public.route_template_stops DROP CONSTRAINT IF EXISTS route_template_stops_route_template_id_fkey;
ALTER TABLE public.route_template_stops ADD CONSTRAINT route_template_stops_route_template_id_fkey FOREIGN KEY (route_template_id) REFERENCES public.route_templates(id) ON DELETE CASCADE;

-- Route template stops -> stops: cascade delete
ALTER TABLE public.route_template_stops DROP CONSTRAINT IF EXISTS route_template_stops_stop_id_fkey;
ALTER TABLE public.route_template_stops ADD CONSTRAINT route_template_stops_stop_id_fkey FOREIGN KEY (stop_id) REFERENCES public.stops(id) ON DELETE CASCADE;

-- Trip schedules -> route_templates: cascade delete
ALTER TABLE public.trip_schedules DROP CONSTRAINT IF EXISTS trip_schedules_route_template_id_fkey;
ALTER TABLE public.trip_schedules ADD CONSTRAINT trip_schedules_route_template_id_fkey FOREIGN KEY (route_template_id) REFERENCES public.route_templates(id) ON DELETE CASCADE;

-- Schedule stop times -> trip_schedules: cascade delete
ALTER TABLE public.schedule_stop_times DROP CONSTRAINT IF EXISTS schedule_stop_times_schedule_id_fkey;
ALTER TABLE public.schedule_stop_times ADD CONSTRAINT schedule_stop_times_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.trip_schedules(id) ON DELETE CASCADE;

-- Schedule stop times -> stops: cascade delete
ALTER TABLE public.schedule_stop_times DROP CONSTRAINT IF EXISTS schedule_stop_times_stop_id_fkey;
ALTER TABLE public.schedule_stop_times ADD CONSTRAINT schedule_stop_times_stop_id_fkey FOREIGN KEY (stop_id) REFERENCES public.stops(id) ON DELETE CASCADE;

-- Trip instances -> trip_schedules: cascade delete
ALTER TABLE public.trip_instances DROP CONSTRAINT IF EXISTS trip_instances_schedule_id_fkey;
ALTER TABLE public.trip_instances ADD CONSTRAINT trip_instances_schedule_id_fkey FOREIGN KEY (schedule_id) REFERENCES public.trip_schedules(id) ON DELETE CASCADE;
