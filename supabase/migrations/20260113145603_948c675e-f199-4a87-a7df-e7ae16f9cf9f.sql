-- Add a trigger to validate that bookings can only be created with the authenticated user's ID
-- This prevents any bypass attempts where user_id could be manipulated

CREATE OR REPLACE FUNCTION public.validate_booking_user_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Ensure the user_id matches the authenticated user
    IF NEW.user_id != auth.uid() THEN
        RAISE EXCEPTION 'Cannot create booking for another user';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to enforce user_id validation on insert
CREATE TRIGGER enforce_booking_user_id
    BEFORE INSERT ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_booking_user_id();

-- Also add a trigger for updates to prevent user_id tampering
CREATE OR REPLACE FUNCTION public.validate_booking_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Prevent changing the user_id
    IF NEW.user_id != OLD.user_id THEN
        RAISE EXCEPTION 'Cannot change booking owner';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER enforce_booking_update
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.validate_booking_update();