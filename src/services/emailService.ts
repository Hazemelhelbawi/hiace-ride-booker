import { supabase } from "@/integrations/supabase/client";
import { Booking, Route } from "@/types";

interface SendEmailParams {
  booking: Booking;
  route: Route;
  status: "pending" | "confirmed" | "cancelled";
  isPaid: boolean;
}

export const sendBookingEmail = async ({ booking, route, status, isPaid }: SendEmailParams): Promise<boolean> => {
  try {
    const response = await supabase.functions.invoke("send-booking-email", {
      body: {
        to: booking.passenger.email,
        passengerName: booking.passenger.name,
        bookingId: booking.id,
        status,
        isPaid,
        route: {
          origin: route.origin,
          destination: route.destination,
          date: route.date,
          departureTime: route.departureTime,
        },
        seats: booking.seats,
        totalPrice: booking.totalPrice,
      },
    });

    if (response.error) {
      console.error("Failed to send email:", response.error);
      return false;
    }

    console.log("Email sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
