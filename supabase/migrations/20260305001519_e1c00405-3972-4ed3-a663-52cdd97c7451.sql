
-- Recreate missing triggers (drop first to avoid conflicts)
DROP TRIGGER IF EXISTS validate_booking_user_id_trigger ON public.bookings;
DROP TRIGGER IF EXISTS validate_booking_update_trigger ON public.bookings;
DROP TRIGGER IF EXISTS enforce_booking_payment_update ON public.bookings;

CREATE TRIGGER validate_booking_user_id_trigger
BEFORE INSERT ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.validate_booking_user_id();

CREATE TRIGGER validate_booking_update_trigger
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.validate_booking_update();

CREATE TRIGGER enforce_booking_payment_update
BEFORE UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.validate_booking_payment_update();
