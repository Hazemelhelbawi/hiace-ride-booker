
CREATE OR REPLACE FUNCTION public.prevent_double_booking_seats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  conflicting_seats integer[];
BEGIN
  -- Check for seat conflicts on the same trip_instance_id
  IF NEW.trip_instance_id IS NOT NULL THEN
    SELECT ARRAY(
      SELECT unnest(b.seats)
      FROM public.bookings b
      WHERE b.trip_instance_id = NEW.trip_instance_id
        AND b.status != 'cancelled'
        AND b.id IS DISTINCT FROM NEW.id
      INTERSECT
      SELECT unnest(NEW.seats)
    ) INTO conflicting_seats;

    IF array_length(conflicting_seats, 1) > 0 THEN
      RAISE EXCEPTION 'Seats % are already booked for this trip', conflicting_seats;
    END IF;
  END IF;

  -- Check for seat conflicts on the same route_id
  IF NEW.route_id IS NOT NULL THEN
    SELECT ARRAY(
      SELECT unnest(b.seats)
      FROM public.bookings b
      WHERE b.route_id = NEW.route_id
        AND b.status != 'cancelled'
        AND b.id IS DISTINCT FROM NEW.id
      INTERSECT
      SELECT unnest(NEW.seats)
    ) INTO conflicting_seats;

    IF array_length(conflicting_seats, 1) > 0 THEN
      RAISE EXCEPTION 'Seats % are already booked for this route', conflicting_seats;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_prevent_double_booking
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_double_booking_seats();
