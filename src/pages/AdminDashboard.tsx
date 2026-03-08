import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  useBookings,
  useRoutes,
  useCreateRoute,
  useUpdateRoute,
  useDeleteRoute,
  useUpdateBooking,
  useCancelBooking,
} from "@/hooks/useData";
import { useRealtimeBookings } from "@/hooks/useRealtimeBookings";
import type { Route, Booking } from "@/services/api";
import { sendBookingEmail } from "@/services/emailService";
import {
  exportBookingsToPDF,
  exportBookingsToExcel,
} from "@/utils/exportBookings";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BarChart,
  Users,
  MapPin,
  Plus,
  Trash2,
  Edit,
  CreditCard,
  XCircle,
  FileText,
  FileSpreadsheet,
  Calendar,
  Tag,
  Route as RouteIcon,
} from "lucide-react";
import { toast } from "sonner";
import BookingCalendar from "@/components/BookingCalendar";
import PromoCodeManager from "@/components/admin/PromoCodeManager";
import StopsManager from "@/components/admin/StopsManager";
import RouteTemplatesManager from "@/components/admin/RouteTemplatesManager";
import { format } from "date-fns";

interface RouteFormData {
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  date: string;
  driver_name: string;
  van_number: string;
}

const AdminDashboard: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const { data: bookings = [], isLoading: bookingsLoading } = useBookings();
  const { data: routes = [], isLoading: routesLoading } = useRoutes();

  // Enable real-time updates for bookings
  useRealtimeBookings();

  const createRoute = useCreateRoute();
  const updateRoute = useUpdateRoute();
  const deleteRoute = useDeleteRoute();
  const updateBooking = useUpdateBooking();
  const cancelBooking = useCancelBooking();

  const [isRouteDialogOpen, setIsRouteDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [newRoute, setNewRoute] = useState<RouteFormData>({
    origin: "",
    destination: "",
    departure_time: "",
    arrival_time: "",
    price: 0,
    date: "",
    driver_name: "",
    van_number: "",
  });

  // Redirect if not admin
  React.useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    try {
      await updateBooking.mutateAsync({
        id: bookingId,
        updates: { status: newStatus as "pending" | "confirmed" | "cancelled" },
      });
      toast.success(t("admin.statusUpdated"));

      // Send email notification
      const route = routes.find((r) => r.id === booking.route_id);
      if (route) {
        sendBookingEmail({
          booking: {
            id: booking.id,
            seats: booking.seats,
            passenger: {
              name: booking.passenger_name,
              phone: booking.passenger_phone,
              email: booking.passenger_email,
              notes: booking.passenger_notes || "",
            },
            totalPrice: booking.total_price,
            status: newStatus,
            isPaid: booking.is_paid,
            createdAt: booking.created_at,
          },
          route: {
            origin: route.origin,
            destination: route.destination,
            date: route.date,
            departureTime: route.departure_time,
          },
          status: newStatus as "pending" | "confirmed" | "cancelled",
          isPaid: booking.is_paid,
        });
      }
    } catch (error) {
      toast.error(t("common.error"));
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm(t("admin.confirmCancel"))) return;

    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    try {
      await cancelBooking.mutateAsync(bookingId);
      toast.success(t("admin.bookingCancelled"));

      // Send cancellation email
      const route = routes.find((r) => r.id === booking.route_id);
      if (route) {
        sendBookingEmail({
          booking: {
            id: booking.id,
            seats: booking.seats,
            passenger: {
              name: booking.passenger_name,
              phone: booking.passenger_phone,
              email: booking.passenger_email,
              notes: booking.passenger_notes || "",
            },
            totalPrice: booking.total_price,
            status: "cancelled",
            isPaid: booking.is_paid,
            createdAt: booking.created_at,
          },
          route: {
            origin: route.origin,
            destination: route.destination,
            date: route.date,
            departureTime: route.departure_time,
          },
          status: "cancelled",
          isPaid: booking.is_paid,
        });
      }
    } catch (error) {
      toast.error(t("common.error"));
    }
  };

  const handlePaymentToggle = async (bookingId: string, isPaid: boolean) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    try {
      await updateBooking.mutateAsync({
        id: bookingId,
        updates: { is_paid: isPaid },
      });
      toast.success(isPaid ? t("admin.markedPaid") : t("admin.markedUnpaid"));

      // Send email notification
      const route = routes.find((r) => r.id === booking.route_id);
      if (route) {
        sendBookingEmail({
          booking: {
            id: booking.id,
            seats: booking.seats,
            passenger: {
              name: booking.passenger_name,
              phone: booking.passenger_phone,
              email: booking.passenger_email,
              notes: booking.passenger_notes || "",
            },
            totalPrice: booking.total_price,
            status: booking.status,
            isPaid,
            createdAt: booking.created_at,
          },
          route: {
            origin: route.origin,
            destination: route.destination,
            date: route.date,
            departureTime: route.departure_time,
          },
          status: booking.status as "pending" | "confirmed" | "cancelled",
          isPaid,
        });
      }
    } catch (error) {
      toast.error(t("common.error"));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-success text-success-foreground";
      case "pending":
        return "bg-warning text-warning-foreground";
      case "cancelled":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleAddRoute = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createRoute.mutateAsync({
        origin: newRoute.origin,
        destination: newRoute.destination,
        departure_time: newRoute.departure_time,
        arrival_time: newRoute.arrival_time,
        price: Number(newRoute.price),
        date: newRoute.date,
        driver_name: newRoute.driver_name,
        van_number: newRoute.van_number,
        available_seats: 14,
        total_seats: 14,
      });

      setIsRouteDialogOpen(false);
      resetRouteForm();
      toast.success(t("admin.routeAdded"));
    } catch (error) {
      toast.error(t("common.error"));
    }
  };

  const handleEditRoute = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingRoute) return;

    try {
      await updateRoute.mutateAsync({
        id: editingRoute.id,
        updates: {
          origin: newRoute.origin,
          destination: newRoute.destination,
          departure_time: newRoute.departure_time,
          arrival_time: newRoute.arrival_time,
          price: Number(newRoute.price),
          date: newRoute.date,
          driver_name: newRoute.driver_name,
          van_number: newRoute.van_number,
        },
      });

      setEditingRoute(null);
      setIsRouteDialogOpen(false);
      resetRouteForm();
      toast.success(t("admin.routeUpdated"));
    } catch (error) {
      toast.error(t("common.error"));
    }
  };

  const openEditDialog = (route: Route) => {
    setEditingRoute(route);
    setNewRoute({
      origin: route.origin,
      destination: route.destination,
      departure_time: route.departure_time,
      arrival_time: route.arrival_time,
      price: route.price,
      date: route.date,
      driver_name: route.driver_name,
      van_number: route.van_number,
    });
    setIsRouteDialogOpen(true);
  };

  const resetRouteForm = () => {
    setNewRoute({
      origin: "",
      destination: "",
      departure_time: "",
      arrival_time: "",
      price: 0,
      date: "",
      driver_name: "",
      van_number: "",
    });
    setEditingRoute(null);
  };

  const handleDeleteRoute = async (routeId: string) => {
    if (!confirm(t("admin.confirmDeleteRoute"))) return;

    try {
      await deleteRoute.mutateAsync(routeId);
      toast.success(t("admin.routeDeleted"));
    } catch (error) {
      toast.error(t("common.error"));
    }
  };

  const getRouteForBooking = (booking: Booking): Route | undefined => {
    return routes.find((r) => r.id === booking.route_id);
  };

  const stats = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter((b) => b.status === "pending").length,
    confirmedBookings: bookings.filter((b) => b.status === "confirmed").length,
    totalRoutes: routes.length,
    paidBookings: bookings.filter((b) => b.is_paid).length,
  };

  if (authLoading || bookingsLoading || routesLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">
            {t("common.loading")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-2">
            {t("admin.dashboard")}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.manageBookingsRoutes")}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6 mb-8">
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.totalBookings")}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.totalBookings}
                  </p>
                </div>
                <BarChart className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.pending")}
                  </p>
                  <p className="text-3xl font-bold text-warning">
                    {stats.pendingBookings}
                  </p>
                </div>
                <Users className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.confirmed")}
                  </p>
                  <p className="text-3xl font-bold text-success">
                    {stats.confirmedBookings}
                  </p>
                </div>
                <Users className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.paid")}
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {stats.paidBookings}
                  </p>
                </div>
                <CreditCard className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.activeRoutes")}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.totalRoutes}
                  </p>
                </div>
                <MapPin className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="bookings" className="text-xs sm:text-sm">{t("admin.bookings")}</TabsTrigger>
            <TabsTrigger value="calendar" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="routes" className="text-xs sm:text-sm">{t("admin.routes")}</TabsTrigger>
            <TabsTrigger value="promos" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
              {t("admin.promoCodes")}
            </TabsTrigger>
            <TabsTrigger value="stops" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
              Stops
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <RouteIcon className="w-3 h-3 sm:w-4 sm:h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="schedules" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              Schedules
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <Card className="border-2 shadow-lg">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <CardTitle className="text-lg sm:text-xl">{t("admin.allBookings")}</CardTitle>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportBookingsToPDF(bookings, routes)}
                    className="gap-2"
                    disabled={bookings.length === 0}
                  >
                    <FileText className="w-4 h-4" />
                    Export PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportBookingsToExcel(bookings, routes)}
                    className="gap-2"
                    disabled={bookings.length === 0}
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Export Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("admin.bookingId")}</TableHead>
                        <TableHead>{t("admin.passenger")}</TableHead>
                        <TableHead>{t("admin.phone")}</TableHead>
                        <TableHead>{t("admin.route")}</TableHead>
                        <TableHead>{t("admin.date")}</TableHead>
                        <TableHead>{t("admin.seats")}</TableHead>
                        <TableHead>{t("admin.total")}</TableHead>
                        <TableHead>{t("admin.paid")}</TableHead>
                        <TableHead>{t("admin.status")}</TableHead>
                        <TableHead>{t("admin.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={10}
                            className="text-center text-muted-foreground py-8"
                          >
                            {t("admin.noBookings")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        bookings.map((booking) => {
                          const route = getRouteForBooking(booking);
                          return (
                            <TableRow key={booking.id}>
                              <TableCell className="font-mono text-sm">
                                #{booking.id.slice(0, 8)}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {booking.passenger_name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {booking.passenger_email}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">
                                {booking.passenger_phone}
                              </TableCell>
                              <TableCell>
                                {route ? (
                                  <div className="text-sm">
                                    {route.origin} → {route.destination}
                                  </div>
                                ) : (
                                  "N/A"
                                )}
                              </TableCell>
                              <TableCell className="text-sm">
                                {format(
                                  new Date(booking.created_at),
                                  "MMM dd, yyyy",
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1 flex-wrap">
                                  {booking.seats.map((seat) => (
                                    <span
                                      key={seat}
                                      className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium bg-primary/10 text-primary rounded"
                                    >
                                      {seat}
                                    </span>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="font-semibold">
                                {booking.total_price} {t("common.currency")}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={booking.is_paid}
                                    onCheckedChange={(checked) =>
                                      handlePaymentToggle(booking.id, checked)
                                    }
                                  />
                                  <span
                                    className={
                                      booking.is_paid
                                        ? "text-success text-sm"
                                        : "text-warning text-sm"
                                    }
                                  >
                                    {booking.is_paid
                                      ? t("admin.paid")
                                      : t("admin.unpaid")}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={getStatusColor(booking.status)}
                                >
                                  {booking.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  {booking.status === "pending" && (
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        handleStatusChange(
                                          booking.id,
                                          "confirmed",
                                        )
                                      }
                                      className="bg-success hover:bg-success/90"
                                    >
                                      {t("admin.confirm")}
                                    </Button>
                                  )}
                                  {booking.status !== "cancelled" && (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() =>
                                        handleCancelBooking(booking.id)
                                      }
                                      className="gap-1"
                                    >
                                      <XCircle className="w-3 h-3" />
                                      {t("admin.cancel")}
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <BookingCalendar routes={routes} bookings={bookings} />
          </TabsContent>

          <TabsContent value="routes">
            <Card className="border-2 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t("admin.routeManagement")}</CardTitle>
                <Dialog
                  open={isRouteDialogOpen}
                  onOpenChange={(open) => {
                    setIsRouteDialogOpen(open);
                    if (!open) resetRouteForm();
                  }}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary-dark text-white gap-2">
                      <Plus className="w-4 h-4" />
                      {t("admin.addTrip")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingRoute
                          ? t("admin.editRoute")
                          : t("admin.addTrip")}
                      </DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={editingRoute ? handleEditRoute : handleAddRoute}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="origin">{t("admin.origin")}</Label>
                          <Input
                            id="origin"
                            value={newRoute.origin}
                            onChange={(e) =>
                              setNewRoute((prev) => ({
                                ...prev,
                                origin: e.target.value,
                              }))
                            }
                            placeholder="e.g., Cairo"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="destination">
                            {t("admin.destination")}
                          </Label>
                          <Input
                            id="destination"
                            value={newRoute.destination}
                            onChange={(e) =>
                              setNewRoute((prev) => ({
                                ...prev,
                                destination: e.target.value,
                              }))
                            }
                            placeholder="e.g., Dahab"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="departure_time">
                            {t("admin.departureTime")}
                          </Label>
                          <Input
                            id="departure_time"
                            type="time"
                            value={newRoute.departure_time}
                            onChange={(e) =>
                              setNewRoute((prev) => ({
                                ...prev,
                                departure_time: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="arrival_time">
                            {t("admin.arrivalTime")}
                          </Label>
                          <Input
                            id="arrival_time"
                            type="time"
                            value={newRoute.arrival_time}
                            onChange={(e) =>
                              setNewRoute((prev) => ({
                                ...prev,
                                arrival_time: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="date">{t("admin.date")}</Label>
                          <Input
                            id="date"
                            type="date"
                            value={newRoute.date}
                            onChange={(e) =>
                              setNewRoute((prev) => ({
                                ...prev,
                                date: e.target.value,
                              }))
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="price">{t("admin.price")}</Label>
                          <Input
                            id="price"
                            type="number"
                            value={newRoute.price}
                            onChange={(e) =>
                              setNewRoute((prev) => ({
                                ...prev,
                                price: Number(e.target.value),
                              }))
                            }
                            placeholder="e.g., 750"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="driver_name">
                            {t("admin.driverName")}
                          </Label>
                          <Input
                            id="driver_name"
                            value={newRoute.driver_name}
                            onChange={(e) =>
                              setNewRoute((prev) => ({
                                ...prev,
                                driver_name: e.target.value,
                              }))
                            }
                            placeholder="e.g., Ahmed Hassan"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="van_number">
                            {t("admin.vanNumber")}
                          </Label>
                          <Input
                            id="van_number"
                            value={newRoute.van_number}
                            onChange={(e) =>
                              setNewRoute((prev) => ({
                                ...prev,
                                van_number: e.target.value,
                              }))
                            }
                            placeholder="e.g., ABC-1234"
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary-dark text-white"
                      >
                        {editingRoute
                          ? t("admin.updateRoute")
                          : t("admin.addTrip")}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("admin.route")}</TableHead>
                        <TableHead>{t("admin.date")}</TableHead>
                        <TableHead>{t("admin.time")}</TableHead>
                        <TableHead>{t("admin.price")}</TableHead>
                        <TableHead>{t("routes.seatsAvailable")}</TableHead>
                        <TableHead>{t("routes.driver")}</TableHead>
                        <TableHead>{t("routes.van")}</TableHead>
                        <TableHead>{t("admin.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {routes.map((route) => (
                        <TableRow key={route.id}>
                          <TableCell>
                            <div className="font-medium">
                              {route.origin} → {route.destination}
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(route.date), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell className="text-sm">
                            {route.departure_time} - {route.arrival_time}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {route.price} {t("common.currency")}
                          </TableCell>
                          <TableCell>
                            {route.available_seats} / {route.total_seats}
                          </TableCell>
                          <TableCell className="text-sm">
                            {route.driver_name}
                          </TableCell>
                          <TableCell className="text-sm font-mono">
                            {route.van_number}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditDialog(route)}
                                className="gap-1"
                              >
                                <Edit className="w-3 h-3" />
                                {t("admin.edit")}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteRoute(route.id)}
                                className="gap-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                {t("admin.delete")}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="promos">
            <PromoCodeManager />
          </TabsContent>

          <TabsContent value="stops">
            <StopsManager />
          </TabsContent>

          <TabsContent value="templates">
            <RouteTemplatesManager />
          </TabsContent>

          <TabsContent value="schedules">
            <SchedulesManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
