import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "resend";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface BookingEmailRequest {
  to: string;
  passengerName: string;
  bookingId: string;
  status: "pending" | "confirmed" | "cancelled";
  isPaid: boolean;
  route: {
    origin: string;
    destination: string;
    date: string;
    departureTime: string;
  };
  seats: number[];
  totalPrice: number;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const getStatusSubject = (status: string, isPaid: boolean): string => {
  switch (status) {
    case "confirmed":
      return "Your Booking is Confirmed! 🎉";
    case "cancelled":
      return "Booking Cancelled";
    case "pending":
      return isPaid ? "Payment Received - Booking Pending" : "New Booking Created";
    default:
      return "Booking Update";
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case "confirmed":
      return "#22c55e";
    case "cancelled":
      return "#ef4444";
    default:
      return "#f59e0b";
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const userId = claimsData.claims.sub;

    const data: BookingEmailRequest = await req.json();
    const { to, passengerName, bookingId, status, isPaid, route, seats, totalPrice } = data;

    // Validate that the booking belongs to the authenticated user or they are admin
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .select("user_id")
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check ownership - RLS will already filter, but double-check
    if (booking.user_id !== userId) {
      // Check if admin
      const { data: roleData } = await supabaseClient
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    }

    // Input validation
    if (!to || !passengerName || !bookingId || !status || !route) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Sanitize all user inputs for HTML
    const safeName = escapeHtml(passengerName.slice(0, 100));
    const safeOrigin = escapeHtml(route.origin.slice(0, 100));
    const safeDestination = escapeHtml(route.destination.slice(0, 100));
    const safeDate = escapeHtml(route.date.slice(0, 20));
    const safeDepartureTime = escapeHtml(route.departureTime.slice(0, 20));
    const safeBookingId = escapeHtml(bookingId.slice(0, 36));

    const statusColor = getStatusColor(status);
    const subject = getStatusSubject(status, isPaid);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Update</title>
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center; border-radius: 16px 16px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🚐 HiaceGo</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your Journey, Our Priority</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <span style="display: inline-block; background-color: ${statusColor}20; color: ${statusColor}; padding: 8px 24px; border-radius: 20px; font-weight: 600; text-transform: uppercase; font-size: 14px;">
                ${escapeHtml(status)}
              </span>
            </div>

            <h2 style="color: #1f2937; margin: 0 0 20px 0;">Hello, ${safeName}!</h2>
            
            ${status === "confirmed" ? `
              <p style="color: #4b5563; line-height: 1.6;">Great news! Your booking has been confirmed. Get ready for your trip!</p>
            ` : status === "cancelled" ? `
              <p style="color: #4b5563; line-height: 1.6;">We're sorry to inform you that your booking has been cancelled. If you have any questions, please contact us.</p>
            ` : `
              <p style="color: #4b5563; line-height: 1.6;">Thank you for your booking! ${isPaid ? "We've received your payment." : "Your booking is pending confirmation."}</p>
            `}

            <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #374151; margin: 0 0 15px 0; font-size: 16px;">📋 Booking Details</h3>
              
              <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 12px;">
                <span style="color: #6b7280; font-size: 13px;">Booking ID</span>
                <p style="color: #1f2937; margin: 4px 0 0 0; font-weight: 600; font-family: monospace;">#${safeBookingId.slice(0, 8)}</p>
              </div>

              <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 12px;">
                <span style="color: #6b7280; font-size: 13px;">Route</span>
                <p style="color: #1f2937; margin: 4px 0 0 0; font-weight: 600;">${safeOrigin} → ${safeDestination}</p>
              </div>

              <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 12px;">
                <span style="color: #6b7280; font-size: 13px;">Date & Time</span>
                <p style="color: #1f2937; margin: 4px 0 0 0; font-weight: 600;">${safeDate} at ${safeDepartureTime}</p>
              </div>

              <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 12px;">
                <span style="color: #6b7280; font-size: 13px;">Seats</span>
                <p style="color: #1f2937; margin: 4px 0 0 0; font-weight: 600;">${seats.map(s => String(Number(s))).join(", ")}</p>
              </div>

              <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 12px;">
                <span style="color: #6b7280; font-size: 13px;">Total Price</span>
                <p style="color: #1f2937; margin: 4px 0 0 0; font-weight: 600; font-size: 20px;">${Number(totalPrice)} LE</p>
              </div>

              <div>
                <span style="color: #6b7280; font-size: 13px;">Payment Status</span>
                <p style="color: ${isPaid ? "#22c55e" : "#f59e0b"}; margin: 4px 0 0 0; font-weight: 600;">${isPaid ? "✓ Paid" : "⏳ Pending"}</p>
              </div>
            </div>

            ${status !== "cancelled" ? `
              <div style="background: #eff6ff; border-radius: 12px; padding: 15px; margin-top: 20px;">
                <p style="color: #1d4ed8; margin: 0; font-size: 14px;">
                  💡 <strong>Tip:</strong> Please arrive 15 minutes before departure time and bring a valid ID.
                </p>
              </div>
            ` : ""}

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 13px; margin: 0;">Need help? Contact us anytime</p>
              <p style="color: #1f2937; font-size: 14px; margin: 5px 0 0 0; font-weight: 600;">support@hiacego.com</p>
            </div>
          </div>

          <div style="text-align: center; padding: 20px;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2025 HiaceGo. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "HiaceGo <onboarding@resend.dev>",
      to: [to],
      subject: subject,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-booking-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
