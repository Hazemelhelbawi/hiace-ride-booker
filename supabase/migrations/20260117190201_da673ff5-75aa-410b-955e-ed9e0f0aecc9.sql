-- Fix security issue: Prevent users from modifying is_paid field
-- Drop the existing policy that allows users to update all fields
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;

-- Create a more restrictive update policy for users
-- Users can only update specific fields, not is_paid or status
CREATE POLICY "Users can update their own bookings" 
ON public.bookings 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND is_paid = (SELECT is_paid FROM public.bookings WHERE id = bookings.id)
);

-- Create a function to validate booking updates (prevent is_paid modification by non-admins)
CREATE OR REPLACE FUNCTION public.validate_booking_payment_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    -- If is_paid is being changed, only admins can do this
    IF NEW.is_paid != OLD.is_paid THEN
        IF NOT has_role(auth.uid(), 'admin') THEN
            RAISE EXCEPTION 'Only admins can modify payment status';
        END IF;
    END IF;
    
    -- If status is being changed to anything other than 'cancelled', only admins can do this
    IF NEW.status != OLD.status AND NEW.status != 'cancelled' THEN
        IF NOT has_role(auth.uid(), 'admin') THEN
            RAISE EXCEPTION 'Only admins can modify booking status';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for payment validation
DROP TRIGGER IF EXISTS validate_booking_payment ON public.bookings;
CREATE TRIGGER validate_booking_payment
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.validate_booking_payment_update();