import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/lib/logger';

/**
 * Send a booking email by providing only the bookingId.
 * The edge function fetches all data from the database server-side.
 */
export const sendBookingEmail = async (bookingId: string): Promise<boolean> => {
  try {
    const response = await supabase.functions.invoke("send-booking-email", {
      body: { bookingId },
    });

    if (response.error) {
      logger.error("Failed to send email:", response.error);
      return false;
    }

    logger.log("Email sent successfully");
    return true;
  } catch (error) {
    logger.error("Error sending email:", error);
    return false;
  }
};
