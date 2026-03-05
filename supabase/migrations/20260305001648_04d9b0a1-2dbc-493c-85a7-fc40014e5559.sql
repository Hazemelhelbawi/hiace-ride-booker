
-- Update the payment validation trigger to also protect promo_code, discount_amount, and total_price
CREATE OR REPLACE FUNCTION public.validate_booking_payment_update()
RETURNS trigger
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
    
    -- Protect total_price from modification by non-admins
    IF NEW.total_price != OLD.total_price THEN
        IF NOT has_role(auth.uid(), 'admin') THEN
            RAISE EXCEPTION 'Only admins can modify total price';
        END IF;
    END IF;
    
    -- Protect promo_code from modification by non-admins
    IF COALESCE(NEW.promo_code, '') != COALESCE(OLD.promo_code, '') THEN
        IF NOT has_role(auth.uid(), 'admin') THEN
            RAISE EXCEPTION 'Only admins can modify promo code';
        END IF;
    END IF;
    
    -- Protect discount_amount from modification by non-admins
    IF COALESCE(NEW.discount_amount, 0) != COALESCE(OLD.discount_amount, 0) THEN
        IF NOT has_role(auth.uid(), 'admin') THEN
            RAISE EXCEPTION 'Only admins can modify discount amount';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;
