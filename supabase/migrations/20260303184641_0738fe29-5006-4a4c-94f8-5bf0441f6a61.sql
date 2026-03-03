
-- Drop the broken user update policy
DROP POLICY "Users can update their own bookings" ON public.bookings;

-- Recreate with correct subquery (compare booking.id to the row being updated)
CREATE POLICY "Users can update their own bookings"
ON public.bookings
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND is_paid = (SELECT b.is_paid FROM public.bookings b WHERE b.id = bookings.id)
);
