
-- 1. Input validation trigger for bookings passenger fields
CREATE OR REPLACE FUNCTION public.validate_booking_input()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate passenger_name length
  IF length(NEW.passenger_name) > 100 THEN
    RAISE EXCEPTION 'Passenger name must be 100 characters or less';
  END IF;

  -- Validate passenger_phone format (7-20 chars, digits/spaces/dashes/parens/plus)
  IF NEW.passenger_phone !~ '^\+?[0-9\s\-\(\)]{7,20}$' THEN
    RAISE EXCEPTION 'Invalid phone number format';
  END IF;

  -- Validate passenger_email format
  IF NEW.passenger_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;

  -- Validate passenger_notes length
  IF NEW.passenger_notes IS NOT NULL AND length(NEW.passenger_notes) > 500 THEN
    RAISE EXCEPTION 'Notes must be 500 characters or less';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER validate_booking_input_trigger
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.validate_booking_input();

-- 2. Price validation trigger on INSERT
CREATE OR REPLACE FUNCTION public.validate_booking_price_on_insert()
RETURNS TRIGGER AS $$
DECLARE
  route_price NUMERIC;
  schedule_price NUMERIC;
  seat_count INTEGER;
  expected_base NUMERIC;
  min_allowed NUMERIC;
BEGIN
  seat_count := cardinality(NEW.seats);
  
  -- Check route-based pricing
  IF NEW.route_id IS NOT NULL THEN
    SELECT price INTO route_price FROM public.routes WHERE id = NEW.route_id;
    IF route_price IS NOT NULL THEN
      expected_base := route_price * seat_count;
      -- Allow up to 99% discount (1% minimum)
      min_allowed := expected_base * 0.01;
      IF NEW.total_price < min_allowed THEN
        RAISE EXCEPTION 'Invalid total price for route booking';
      END IF;
    END IF;
  END IF;

  -- Check schedule/trip-instance-based pricing
  IF NEW.trip_instance_id IS NOT NULL THEN
    SELECT ts.price INTO schedule_price
    FROM public.trip_instances ti
    JOIN public.trip_schedules ts ON ts.id = ti.schedule_id
    WHERE ti.id = NEW.trip_instance_id;
    
    IF schedule_price IS NOT NULL THEN
      expected_base := schedule_price * seat_count;
      min_allowed := expected_base * 0.01;
      IF NEW.total_price < min_allowed THEN
        RAISE EXCEPTION 'Invalid total price for trip booking';
      END IF;
    END IF;
  END IF;

  -- Ensure price is not negative
  IF NEW.total_price < 0 THEN
    RAISE EXCEPTION 'Total price cannot be negative';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER validate_booking_price_trigger
  BEFORE INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.validate_booking_price_on_insert();
