import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Loader2,
  Calendar,
  Bus,
  Users,
  Eye,
  Lock,
  CalendarIcon,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

interface TripRow {
  id: string;
  trip_date: string;
  total_seats: number;
  available_seats: number;
  status: string;
  schedule_id: string;
  schedule: {
    title: string;
    van_type: string;
    seats_per_vehicle: number;
    vehicle_count: number;
    route_template?: {
      name: string;
      origin_region: string;
      destination_region: string;
    } | null;
  } | null;
}

interface BookingRow {
  id: string;
  seats: number[];
  passenger_name: string;
  status: string;
  created_at: string;
}

interface SeatBookingInfo {
  seat_number: number;
  passenger_name: string;
  booking_id: string;
}

const seatNumbersFor = (vanType: string | undefined, seatsPerVehicle: number) => {
  // 12-seat HiAce skips seat 4
  if (vanType === "12_seats" || seatsPerVehicle === 12) {
    return [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 14];
  }
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14];
};

const toLocalDate = (d: Date) => format(d, "yyyy-MM-dd");

const TripSeatsManager: React.FC = () => {
  const { t } = useLanguage();
  const [trips, setTrips] = useState<TripRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<TripRow | null>(null);
  const [tripBookings, setTripBookings] = useState<BookingRow[]>([]);
  const [seatsLoading, setSeatsLoading] = useState(false);
  const [activeVehicle, setActiveVehicle] = useState<number>(0);

  // Date filter: "today" (default) | "all" | "YYYY-MM-DD"
  const [dateFilter, setDateFilter] = useState<string>("today");

  const fetchTrips = async () => {
    const { data, error } = await supabase
      .from("trip_instances")
      .select(
        `id, trip_date, total_seats, available_seats, status, schedule_id,
         schedule:trip_schedules(
           title, van_type, seats_per_vehicle, vehicle_count,
           route_template:route_templates(name, origin_region, destination_region)
         )`
      )
      .order("trip_date", { ascending: true });
    if (error) {
      logger.error("Error loading trips", error);
    } else {
      setTrips((data as unknown as TripRow[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTrips();

    const tripsChannel = supabase
      .channel("admin-trip-instances")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trip_instances" },
        () => fetchTrips()
      )
      .subscribe();

    const bookingsChannel = supabase
      .channel("admin-bookings-for-seats")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => {
          fetchTrips();
          if (selectedTrip) loadTripBookings(selectedTrip.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tripsChannel);
      supabase.removeChannel(bookingsChannel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTrip?.id]);

  const loadTripBookings = async (tripId: string) => {
    setSeatsLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("id, seats, passenger_name, status, created_at")
      .eq("trip_instance_id", tripId)
      .neq("status", "cancelled")
      .order("created_at", { ascending: true });
    if (!error && data) {
      setTripBookings(data as BookingRow[]);
    }
    setSeatsLoading(false);
  };

  useEffect(() => {
    if (selectedTrip) {
      setActiveVehicle(0);
      loadTripBookings(selectedTrip.id);
    }
  }, [selectedTrip]);

  // Filter trips by selected date
  const filteredTrips = useMemo(() => {
    if (dateFilter === "all") return trips;
    const target =
      dateFilter === "today" ? toLocalDate(new Date()) : dateFilter;
    return trips.filter((t) => t.trip_date === target);
  }, [trips, dateFilter]);

  const groupedTrips = useMemo(() => {
    const groups: Record<string, TripRow[]> = {};
    filteredTrips.forEach((trip) => {
      const key = trip.trip_date;
      groups[key] = groups[key] || [];
      groups[key].push(trip);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredTrips]);

  // Distribute bookings across vehicles greedily by created_at order.
  // Each vehicle has a fixed seats-per-vehicle capacity. A booking is placed
  // into the first vehicle that has enough remaining capacity to hold all of
  // its seats. This mirrors the booking flow's "fill vehicle 1, then 2".
  const vehicleAssignments = useMemo(() => {
    if (!selectedTrip?.schedule) return [] as SeatBookingInfo[][];
    const vehicleCount = Math.max(1, selectedTrip.schedule.vehicle_count || 1);
    const seatsPerVehicle = selectedTrip.schedule.seats_per_vehicle || 13;

    const buckets: SeatBookingInfo[][] = Array.from(
      { length: vehicleCount },
      () => []
    );
    const remaining = Array.from(
      { length: vehicleCount },
      () => seatsPerVehicle
    );

    tripBookings.forEach((b) => {
      const size = (b.seats || []).length;
      let placed = false;
      for (let v = 0; v < vehicleCount; v++) {
        if (remaining[v] >= size) {
          (b.seats || []).forEach((seat) => {
            buckets[v].push({
              seat_number: seat,
              passenger_name: b.passenger_name,
              booking_id: b.id,
            });
          });
          remaining[v] -= size;
          placed = true;
          break;
        }
      }
      // Fallback: if nothing fits (shouldn't happen), drop into vehicle 1
      if (!placed) {
        (b.seats || []).forEach((seat) => {
          buckets[0].push({
            seat_number: seat,
            passenger_name: b.passenger_name,
            booking_id: b.id,
          });
        });
      }
    });

    return buckets;
  }, [tripBookings, selectedTrip]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isCustomDate =
    dateFilter !== "today" && dateFilter !== "all";

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bus className="w-5 h-5 text-primary" />
          {t("tripSeats.title") || "Trip Seat Management"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("tripSeats.subtitle") ||
            "Live overview of seat occupancy across all trips."}
        </p>

        {/* Date filter */}
        <div className="flex flex-wrap items-center gap-2 pt-3">
          <span className="text-xs text-muted-foreground me-1">
            {t("tripSeats.filterByDate") || "Filter by date"}:
          </span>
          <Button
            size="sm"
            variant={dateFilter === "today" ? "default" : "outline"}
            onClick={() => setDateFilter("today")}
          >
            {t("tripSeats.today") || "Today"}
          </Button>
          <Button
            size="sm"
            variant={dateFilter === "all" ? "default" : "outline"}
            onClick={() => setDateFilter("all")}
          >
            {t("tripSeats.allDates") || "All dates"}
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                variant={isCustomDate ? "default" : "outline"}
                className="gap-2"
              >
                <CalendarIcon className="w-4 h-4" />
                {isCustomDate
                  ? format(new Date(dateFilter), "MMM dd, yyyy")
                  : t("tripSeats.pickDate") || "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarPicker
                mode="single"
                selected={isCustomDate ? new Date(dateFilter) : undefined}
                onSelect={(d) => d && setDateFilter(toLocalDate(d))}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          {isCustomDate && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDateFilter("today")}
              className="gap-1"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {groupedTrips.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {t("tripSeats.noTrips") || "No trips found for the selected date."}
          </p>
        ) : (
          groupedTrips.map(([date, dateTrips]) => (
            <div key={date} className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Calendar className="w-4 h-4 text-primary" />
                {format(new Date(date), "EEE, MMM dd, yyyy")}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dateTrips.map((trip) => {
                  const booked = trip.total_seats - trip.available_seats;
                  const occupancy = trip.total_seats
                    ? Math.round((booked / trip.total_seats) * 100)
                    : 0;
                  const direction = trip.schedule?.route_template
                    ? `${trip.schedule.route_template.origin_region} → ${trip.schedule.route_template.destination_region}`
                    : trip.schedule?.title || "—";
                  const vehicleCount = trip.schedule?.vehicle_count || 1;
                  const seatsPer = trip.schedule?.seats_per_vehicle || 13;
                  return (
                    <div
                      key={trip.id}
                      className="p-4 rounded-xl border-2 border-border hover:border-primary transition-all bg-card space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-foreground">
                            {direction}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {trip.schedule?.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {vehicleCount} × {seatsPer}{" "}
                            {(t("tripSeats.vehicle") || "Vehicle").toLowerCase()}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "shrink-0",
                            trip.status === "scheduled" &&
                              "border-primary text-primary",
                            trip.status === "completed" &&
                              "border-success text-success",
                            trip.status === "cancelled" &&
                              "border-destructive text-destructive"
                          )}
                        >
                          {trip.status}
                        </Badge>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {booked} / {trip.total_seats}{" "}
                            {t("tripSeats.booked") || "booked"}
                          </span>
                          <span className="font-semibold text-primary">
                            {occupancy}%
                          </span>
                        </div>
                        <Progress value={occupancy} className="h-2" />
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full gap-2"
                        onClick={() => setSelectedTrip(trip)}
                      >
                        <Eye className="w-4 h-4" />
                        {t("tripSeats.viewSeatMap") || "View seat map"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </CardContent>

      <Dialog
        open={!!selectedTrip}
        onOpenChange={(o) => !o && setSelectedTrip(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTrip?.schedule?.route_template
                ? `${selectedTrip.schedule.route_template.origin_region} → ${selectedTrip.schedule.route_template.destination_region}`
                : selectedTrip?.schedule?.title}
              <span className="block text-sm font-normal text-muted-foreground mt-1">
                {selectedTrip &&
                  format(new Date(selectedTrip.trip_date), "EEE, MMM dd, yyyy")}
              </span>
            </DialogTitle>
          </DialogHeader>

          {seatsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : selectedTrip ? (
            (() => {
              const vehicleCount = Math.max(
                1,
                selectedTrip.schedule?.vehicle_count || 1
              );
              const seatsPer = selectedTrip.schedule?.seats_per_vehicle || 13;
              const vanType = selectedTrip.schedule?.van_type;
              const seatNums = seatNumbersFor(vanType, seatsPer);

              const renderSeatMap = (vehicleIdx: number) => {
                const bookingsForVehicle =
                  vehicleAssignments[vehicleIdx] || [];
                const bookedCount = bookingsForVehicle.length;
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {bookedCount} / {seatsPer}{" "}
                        {t("tripSeats.booked") || "booked"}
                      </span>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded bg-success/20 border border-success" />
                          {t("tripSeats.available") || "Available"}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded bg-destructive/20 border border-destructive" />
                          {t("tripSeats.bookedLegend") || "Booked"}
                        </span>
                      </div>
                    </div>

                    <div
                      className="grid grid-cols-4 gap-2 p-4 rounded-xl bg-muted/30 border-2 border-dashed"
                      dir="ltr"
                    >
                      {seatNums.map((seatNum) => {
                        const info = bookingsForVehicle.find(
                          (b) => b.seat_number === seatNum
                        );
                        const isBooked = !!info;
                        return (
                          <div
                            key={seatNum}
                            className={cn(
                              "rounded-lg border-2 p-2 text-center text-xs flex flex-col items-center justify-center min-h-[68px]",
                              isBooked
                                ? "bg-destructive/10 border-destructive"
                                : "bg-success/10 border-success"
                            )}
                            title={
                              info
                                ? `${info.passenger_name} • #${info.booking_id
                                    .slice(0, 8)
                                    .toUpperCase()}`
                                : t("tripSeats.empty") || "Empty"
                            }
                          >
                            <div className="flex items-center gap-1 font-semibold">
                              {isBooked && <Lock className="w-3 h-3" />}
                              {seatNum}
                            </div>
                            {info ? (
                              <>
                                <div className="truncate w-full text-foreground font-medium">
                                  {info.passenger_name}
                                </div>
                                <div className="text-[10px] text-muted-foreground font-mono">
                                  #
                                  {info.booking_id
                                    .slice(0, 8)
                                    .toUpperCase()}
                                </div>
                              </>
                            ) : (
                              <div className="text-[10px] text-muted-foreground">
                                {t("tripSeats.empty") || "Empty"}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              };

              if (vehicleCount === 1) {
                return renderSeatMap(0);
              }

              return (
                <Tabs
                  value={String(activeVehicle)}
                  onValueChange={(v) => setActiveVehicle(Number(v))}
                >
                  <TabsList className="w-full" style={{ display: "grid", gridTemplateColumns: `repeat(${vehicleCount}, minmax(0, 1fr))` }}>
                    {Array.from({ length: vehicleCount }).map((_, i) => {
                      const count = (vehicleAssignments[i] || []).length;
                      return (
                        <TabsTrigger key={i} value={String(i)} className="gap-1">
                          <Bus className="w-3.5 h-3.5" />
                          {t("tripSeats.vehicle") || "Vehicle"} {i + 1}
                          <span className="text-[10px] text-muted-foreground">
                            ({count}/{seatsPer})
                          </span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                  {Array.from({ length: vehicleCount }).map((_, i) => (
                    <TabsContent key={i} value={String(i)} className="mt-4">
                      {renderSeatMap(i)}
                    </TabsContent>
                  ))}
                </Tabs>
              );
            })()
          ) : null}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default TripSeatsManager;
