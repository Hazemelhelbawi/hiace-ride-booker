import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export interface Route {
  id: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  available_seats: number;
  total_seats: number;
  date: string;
  driver_name: string;
  van_number: string;
  created_at: string;
  updated_at: string;
}

export type BookingStatus = "pending" | "confirmed" | "cancelled";

export interface Booking {
  id: string;
  user_id: string;
  route_id: string;
  seats: number[];
  passenger_name: string;
  passenger_phone: string;
  passenger_email: string;
  passenger_notes: string | null;
  status: BookingStatus;
  total_price: number;
  is_paid: boolean;
  created_at: string;
  updated_at: string;
  route?: Route;
  trip_instance_id?: string | null;
  pickup_stop_id?: string | null;
  dropoff_stop_id?: string | null;
  pickup_stop?: { name_en: string; name_ar: string } | null;
  dropoff_stop?: { name_en: string; name_ar: string } | null;
  payment_screenshot_url?: string | null;
  promo_code?: string | null;
  discount_amount?: number | null;
}

const mapBooking = (booking: Record<string, unknown>): Booking => ({
  id: booking.id as string,
  user_id: booking.user_id as string,
  route_id: booking.route_id as string,
  seats: booking.seats as number[],
  passenger_name: booking.passenger_name as string,
  passenger_phone: booking.passenger_phone as string,
  passenger_email: booking.passenger_email as string,
  passenger_notes: booking.passenger_notes as string | null,
  status: booking.status as BookingStatus,
  total_price: Number(booking.total_price),
  is_paid: booking.is_paid as boolean,
  created_at: booking.created_at as string,
  updated_at: booking.updated_at as string,
  route: booking.route as Route | undefined,
  trip_instance_id: booking.trip_instance_id as string | null | undefined,
  pickup_stop_id: booking.pickup_stop_id as string | null | undefined,
  dropoff_stop_id: booking.dropoff_stop_id as string | null | undefined,
  pickup_stop: booking.pickup_stop as
    | { name_en: string; name_ar: string }
    | null
    | undefined,
  dropoff_stop: booking.dropoff_stop as
    | { name_en: string; name_ar: string }
    | null
    | undefined,
  payment_screenshot_url: booking.payment_screenshot_url as
    | string
    | null
    | undefined,
  promo_code: booking.promo_code as string | null | undefined,
  discount_amount: booking.discount_amount as number | null | undefined,
});

// Routes
export const getRoutes = async (): Promise<Route[]> => {
  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .order("date", { ascending: true });

  if (error) {
    logger.error("Error fetching routes:", error);
    return [];
  }

  return (data || []).map((r) => ({
    ...r,
    price: Number(r.price),
  }));
};

export const getRouteById = async (id: string): Promise<Route | null> => {
  const { data, error } = await supabase
    .from("routes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    logger.error("Error fetching route:", error);
    return null;
  }

  return data ? { ...data, price: Number(data.price) } : null;
};

export const createRoute = async (
  route: Omit<Route, "id" | "created_at" | "updated_at">,
): Promise<Route | null> => {
  const { data, error } = await supabase
    .from("routes")
    .insert([route])
    .select()
    .single();

  if (error) {
    logger.error("Error creating route:", error);
    return null;
  }

  return data ? { ...data, price: Number(data.price) } : null;
};

export const updateRoute = async (
  id: string,
  updates: Partial<Route>,
): Promise<Route | null> => {
  const { data, error } = await supabase
    .from("routes")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    logger.error("Error updating route:", error);
    return null;
  }

  return data ? { ...data, price: Number(data.price) } : null;
};

export const deleteRoute = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from("routes").delete().eq("id", id);

  if (error) {
    logger.error("Error deleting route:", error);
    return false;
  }

  return true;
};

// Bookings
export const getBookings = async (): Promise<Booking[]> => {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      route:routes(*),
      pickup_stop:stops!pickup_stop_id(name_en, name_ar),
      dropoff_stop:stops!dropoff_stop_id(name_en, name_ar)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    logger.error("Error fetching bookings:", error);
    return [];
  }

  return (data || []).map((b) =>
    mapBooking(b as unknown as Record<string, unknown>),
  );
};

export const getUserBookings = async (userId: string): Promise<Booking[]> => {
  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      route:routes(*),
      pickup_stop:stops!pickup_stop_id(name_en, name_ar),
      dropoff_stop:stops!dropoff_stop_id(name_en, name_ar)
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    logger.error("Error fetching user bookings:", error);
    return [];
  }

  return (data || []).map((b) =>
    mapBooking(b as unknown as Record<string, unknown>),
  );
};

export const createBooking = async (booking: {
  user_id: string;
  route_id: string;
  seats: number[];
  passenger_name: string;
  passenger_phone: string;
  passenger_email: string;
  passenger_notes?: string;
  total_price: number;
  pickup_stop_id?: string;
  dropoff_stop_id?: string;
}): Promise<Booking | null> => {
  const { data, error } = await supabase
    .from("bookings")
    .insert([
      {
        ...booking,
        status: "pending",
        is_paid: false,
      },
    ])
    .select(
      `
      *,
      route:routes(*),
      pickup_stop:stops!pickup_stop_id(name_en, name_ar),
      dropoff_stop:stops!dropoff_stop_id(name_en, name_ar)
    `,
    )
    .single();

  if (error) {
    logger.error("Error creating booking:", error);
    return null;
  }

  // Update available seats on the route
  if (data) {
    const route = await getRouteById(booking.route_id);
    if (route) {
      await updateRoute(booking.route_id, {
        available_seats: route.available_seats - booking.seats.length,
      });
    }
  }

  return data ? mapBooking(data as unknown as Record<string, unknown>) : null;
};

export const updateBooking = async (
  id: string,
  updates: Partial<Booking>,
): Promise<Booking | null> => {
  const { data, error } = await supabase
    .from("bookings")
    .update(updates)
    .eq("id", id)
    .select(
      `
      *,
      route:routes(*),
      pickup_stop:stops!pickup_stop_id(name_en, name_ar),
      dropoff_stop:stops!dropoff_stop_id(name_en, name_ar)
    `,
    )
    .single();

  if (error) {
    logger.error("Error updating booking:", error);
    return null;
  }

  return data ? mapBooking(data as unknown as Record<string, unknown>) : null;
};

export const cancelBooking = async (id: string): Promise<Booking | null> => {
  // First get the booking to restore seats
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("*, route:routes(*)")
    .eq("id", id)
    .single();

  if (fetchError || !booking) {
    logger.error("Error fetching booking:", fetchError);
    return null;
  }

  if (booking.status === "cancelled") {
    return null;
  }

  // Update booking status
  const { data: updatedBooking, error: updateError } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", id)
    .select(
      `
      *,
      route:routes(*),
      pickup_stop:stops!pickup_stop_id(name_en, name_ar),
      dropoff_stop:stops!dropoff_stop_id(name_en, name_ar)
    `,
    )
    .single();

  if (updateError) {
    logger.error("Error cancelling booking:", updateError);
    return null;
  }

  // Restore seats to route
  if (booking.route_id && booking.seats) {
    const route = await getRouteById(booking.route_id);
    if (route) {
      await updateRoute(booking.route_id, {
        available_seats: route.available_seats + booking.seats.length,
      });
    }
  }

  return updatedBooking
    ? mapBooking(updatedBooking as unknown as Record<string, unknown>)
    : null;
};

export const getBookedSeats = async (routeId: string): Promise<number[]> => {
  const { data, error } = await supabase
    .from("bookings")
    .select("seats")
    .eq("route_id", routeId)
    .neq("status", "cancelled");

  if (error) {
    logger.error("Error fetching booked seats:", error);
    return [];
  }

  return (data || []).flatMap((b) => b.seats || []);
};

export const getBookedSeatsByTripInstance = async (tripInstanceId: string): Promise<number[]> => {
  const { data, error } = await supabase
    .from("bookings")
    .select("seats")
    .eq("trip_instance_id", tripInstanceId)
    .neq("status", "cancelled");

  if (error) {
    logger.error("Error fetching booked seats by trip instance:", error);
    return [];
  }

  return (data || []).flatMap((b) => b.seats || []);
};
