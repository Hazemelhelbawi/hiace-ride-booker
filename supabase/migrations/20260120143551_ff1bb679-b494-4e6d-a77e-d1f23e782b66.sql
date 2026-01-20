-- Create trigger to enforce payment and status update restrictions
CREATE OR REPLACE TRIGGER enforce_booking_payment_update
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.validate_booking_payment_update();