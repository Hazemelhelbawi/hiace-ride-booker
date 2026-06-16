import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getAllBookings,
  updateBookingStatus,
  toggleBookingPaid,
  getAllPrivateTrips,
  getAllTripsAdmin,
  createTrip,
  toggleTripActive,
  STRAPI_URL,
  type StrapiItem,
  type Booking,
  type PrivateTrip,
  type Trip,
} from "@/services/api";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Users,
  Plus,
  CreditCard,
  XCircle,
  Calendar,
  Car,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";

interface TripFormData {
  date: string;
  time: string;
  direction: 'cairo_sinai' | 'sinai_cairo';
  vehicle_type: '12' | '13';
  is_extra: boolean;
}

const AdminDashboard: React.FC = () => {
  const { user, token, isLoading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [bookings, setBookings] = useState<StrapiItem<Booking>[]>([]);
  const [trips, setTrips] = useState<StrapiItem<Trip>[]>([]);
  const [privateTrips, setPrivateTrips] = useState<StrapiItem<PrivateTrip>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTripDialogOpen, setIsTripDialogOpen] = useState(false);
  const [newTrip, setNewTrip] = useState<TripFormData>({
    date: '',
    time: '',
    direction: 'cairo_sinai',
    vehicle_type: '13',
    is_extra: false,
  });

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, authLoading, isAdmin, navigate]);

  // Fetch data on mount
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [bookingsData, tripsData, privateTripsData] = await Promise.all([
          getAllBookings(token),
          getAllTripsAdmin(token),
          getAllPrivateTrips(token),
        ]);
        
        setBookings(bookingsData);
        setTrips(tripsData);
        setPrivateTrips(privateTripsData);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast.error('Failed to load admin data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleStatusChange = async (bookingId: number, newStatus: 'pending' | 'confirmed' | 'cancelled') => {
    if (!token) return;

    try {
      await updateBookingStatus(bookingId, newStatus, token);
      toast.success(t("admin.statusUpdated") || "Status updated");

      // Refetch bookings
      const updatedBookings = await getAllBookings(token);
      setBookings(updatedBookings);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(t("common.error") || "Failed to update status");
    }
  };

  const handlePaymentToggle = async (bookingId: number, isPaid: boolean) => {
    if (!token) return;

    try {
      await toggleBookingPaid(bookingId, isPaid, token);
      toast.success(isPaid ? t("admin.markedPaid") : t("admin.markedUnpaid"));

      // Refetch bookings
      const updatedBookings = await getAllBookings(token);
      setBookings(updatedBookings);
    } catch (error) {
      console.error('Error toggling paid status:', error);
      toast.error(t("common.error"));
    }
  };

  const handleAddTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      await createTrip(newTrip, token);
      setIsTripDialogOpen(false);
      resetTripForm();
      toast.success(t("admin.tripAdded") || "Trip added successfully");

      // Refetch trips
      const updatedTrips = await getAllTripsAdmin(token);
      setTrips(updatedTrips);
    } catch (error) {
      console.error('Error creating trip:', error);
      toast.error(t("common.error"));
    }
  };

  const handleToggleTripActive = async (tripId: number, isActive: boolean) => {
    if (!token) return;

    try {
      await toggleTripActive(tripId, isActive, token);
      toast.success(isActive ? "Trip activated" : "Trip deactivated");

      // Refetch trips
      const updatedTrips = await getAllTripsAdmin(token);
      setTrips(updatedTrips);
    } catch (error) {
      console.error('Error toggling trip:', error);
      toast.error(t("common.error"));
    }
  };

  const resetTripForm = () => {
    setNewTrip({
      date: '',
      time: '',
      direction: 'cairo_sinai',
      vehicle_type: '13',
      is_extra: false,
    });
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

  const stats = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter((b) => b.attributes.status === "pending").length,
    confirmedBookings: bookings.filter((b) => b.attributes.status === "confirmed").length,
    paidBookings: bookings.filter((b) => b.attributes.is_paid).length,
    activeTrips: trips.filter((t) => t.attributes.is_active).length,
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
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
            {t("admin.dashboard") || "Admin Dashboard"}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.manageBookingsRoutes") || "Manage bookings and trips"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6 mb-8">
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("admin.totalBookings") || "Total Bookings"}
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
                    {t("admin.pending") || "Pending"}
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
                    {t("admin.confirmed") || "Confirmed"}
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
                    {t("admin.paid") || "Paid"}
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
                    {t("admin.activeTrips") || "Active Trips"}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.activeTrips}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="bookings" className="text-xs sm:text-sm">
              {t("admin.bookings") || "Bookings"}
            </TabsTrigger>
            <TabsTrigger value="trips" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              {t("admin.trips") || "Trips"}
            </TabsTrigger>
            <TabsTrigger value="private-requests" className="gap-1 sm:gap-2 text-xs sm:text-sm">
              <Car className="w-3 h-3 sm:w-4 sm:h-4" />
              {t("admin.PrivateTrips") || "Private Trips"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  {t("admin.allBookings") || "All Bookings"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">
                          {t("admin.bookingNumber") || "Booking #"}
                        </TableHead>
                        <TableHead className="text-center">
                          {t("admin.passenger") || "Passenger"}
                        </TableHead>
                        <TableHead className="text-center">
                          {t("admin.phone") || "Phone"}
                        </TableHead>
                        <TableHead className="text-center">
                          {t("admin.trip") || "Trip"}
                        </TableHead>
                        <TableHead className="text-center">
                          {t("admin.seats") || "Seats"}
                        </TableHead>
                        <TableHead className="text-center">
                          {t("admin.total") || "Total"}
                        </TableHead>
                        <TableHead className="text-center">
                          {t("admin.Screenshot") || "Screenshot"}
                        </TableHead>
                        <TableHead className="text-center">
                          {t("admin.paid") || "Paid"}
                        </TableHead>
                        <TableHead className="text-center">
                          {t("admin.status") || "Status"}
                        </TableHead>
                        <TableHead className="text-center">
                          {t("admin.actions") || "Actions"}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-center">
                      {bookings.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={10}
                            className="text-center text-muted-foreground py-8"
                          >
                            {t("admin.noBookings") || "No bookings yet"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        bookings.map((booking) => {
                          const trip = booking.attributes.trip?.data;
                          const direction = trip?.attributes.direction === 'cairo_sinai' ? 'Cairo → Sinai' : 'Sinai → Cairo';
                          
                          return (
                            <TableRow key={booking.id}>
                              <TableCell className="font-mono text-sm">
                                {booking.attributes.booking_number}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {booking.attributes.passenger_name}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">
                                {booking.attributes.phone}
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {direction}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {trip?.attributes.date} {trip?.attributes.time}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1 flex-wrap justify-center">
                                  {booking.attributes.seats.map((seat) => (
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
                                {booking.attributes.total_price} {t("common.currency") || "EGP"}
                              </TableCell>
                              <TableCell>
                                {booking.attributes.screenshot ? (
                                  <a
                                    href={STRAPI_URL + booking.attributes.screenshot.data.attributes.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <img
                                      src={STRAPI_URL + booking.attributes.screenshot.data.attributes.url}
                                      alt="Payment"
                                      className="w-10 h-10 rounded object-cover border hover:scale-150 transition-transform mx-auto"
                                    />
                                  </a>
                                ) : (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 justify-center">
                                  <Switch
                                    checked={booking.attributes.is_paid}
                                    onCheckedChange={(checked) =>
                                      handlePaymentToggle(booking.id, checked)
                                    }
                                  />
                                  <span
                                    className={
                                      booking.attributes.is_paid
                                        ? "text-success text-sm"
                                        : "text-warning text-sm"
                                    }
                                  >
                                    {booking.attributes.is_paid
                                      ? t("admin.paid")
                                      : t("admin.unpaid")}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={getStatusColor(booking.attributes.status)}
                                >
                                  {booking.attributes.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2 justify-center">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 w-8 p-0 text-success hover:text-success"
                                    onClick={() => {
                                      let phone = booking.attributes.phone.replace(/[^0-9]/g, "");
                                      if (phone.startsWith("0")) phone = "20" + phone.slice(1);
                                      window.open(`https://wa.me/${phone}`, "_blank");
                                    }}
                                    title="WhatsApp"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                  </Button>
                                  {booking.attributes.status === "pending" && (
                                    <Button
                                      size="sm"
                                      onClick={() => handleStatusChange(booking.id, "confirmed")}
                                      className="bg-success hover:bg-success/90"
                                    >
                                      {t("admin.confirm")}
                                    </Button>
                                  )}
                                  {booking.attributes.status !== "cancelled" && (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleStatusChange(booking.id, "cancelled")}
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

          <TabsContent value="trips">
            <Card className="border-2 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t("admin.tripManagement") || "Trip Management"}</CardTitle>
                <Dialog open={isTripDialogOpen} onOpenChange={(open) => {
                  setIsTripDialogOpen(open);
                  if (!open) resetTripForm();
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary-dark text-white gap-2">
                      <Plus className="w-4 h-4" />
                      {t("admin.addTrip") || "Add Trip"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>{t("admin.addTrip") || "Add New Trip"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddTrip} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">{t("admin.date") || "Date"}</Label>
                        <Input
                          id="date"
                          type="date"
                          value={newTrip.date}
                          onChange={(e) => setNewTrip((prev) => ({ ...prev, date: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="time">{t("admin.time") || "Time"}</Label>
                        <Input
                          id="time"
                          type="time"
                          value={newTrip.time}
                          onChange={(e) => setNewTrip((prev) => ({ ...prev, time: e.target.value }))}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>{t("admin.direction") || "Direction"}</Label>
                        <Select
                          value={newTrip.direction}
                          onValueChange={(v: 'cairo_sinai' | 'sinai_cairo') =>
                            setNewTrip((prev) => ({ ...prev, direction: v }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cairo_sinai">Cairo → Sinai</SelectItem>
                            <SelectItem value="sinai_cairo">Sinai → Cairo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>{t("admin.vehicleType") || "Vehicle Type"}</Label>
                        <Select
                          value={newTrip.vehicle_type}
                          onValueChange={(v: '12' | '13') =>
                            setNewTrip((prev) => ({ ...prev, vehicle_type: v }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="13">13 Seats</SelectItem>
                            <SelectItem value="12">12 Seats</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="extra"
                          checked={newTrip.is_extra}
                          onCheckedChange={(checked) =>
                            setNewTrip((prev) => ({ ...prev, is_extra: checked }))
                          }
                        />
                        <Label htmlFor="extra">{t("admin.extraTrip") || "Extra Trip"}</Label>
                      </div>

                      <Button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white">
                        {t("admin.addTrip") || "Add Trip"}
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
                        <TableHead>{t("admin.date") || "Date"}</TableHead>
                        <TableHead>{t("admin.time") || "Time"}</TableHead>
                        <TableHead>{t("admin.direction") || "Direction"}</TableHead>
                        <TableHead>{t("admin.vehicle") || "Vehicle"}</TableHead>
                        <TableHead>{t("admin.status") || "Status"}</TableHead>
                        <TableHead>{t("admin.actions") || "Actions"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trips.map((trip) => (
                        <TableRow key={trip.id}>
                          <TableCell>{trip.attributes.date}</TableCell>
                          <TableCell>{trip.attributes.time}</TableCell>
                          <TableCell>
                            {trip.attributes.direction === 'cairo_sinai' ? 'Cairo → Sinai' : 'Sinai → Cairo'}
                          </TableCell>
                          <TableCell>
                            {trip.attributes.vehicle_type} seats
                            {trip.attributes.is_extra && (
                              <Badge variant="outline" className="ml-2">Extra</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={trip.attributes.is_active ? "bg-success" : "bg-muted"}>
                              {trip.attributes.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={trip.attributes.is_active}
                              onCheckedChange={(checked) => handleToggleTripActive(trip.id, checked)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="private-requests">
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle>{t("admin.privateTrips") || "Private Trip Requests"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("admin.name") || "Name"}</TableHead>
                        <TableHead>{t("admin.phone") || "Phone"}</TableHead>
                        <TableHead>{t("admin.from") || "From"}</TableHead>
                        <TableHead>{t("admin.to") || "To"}</TableHead>
                        <TableHead>{t("admin.date") || "Date"}</TableHead>
                        <TableHead>{t("admin.notes") || "Notes"}</TableHead>
                        <TableHead>{t("admin.status") || "Status"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {privateTrips.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            {t("admin.noPrivateTrips") || "No private trip requests"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        privateTrips.map((trip) => (
                          <TableRow key={trip.id}>
                            <TableCell className="font-medium">{trip.attributes.name}</TableCell>
                            <TableCell>{trip.attributes.phone}</TableCell>
                            <TableCell>{trip.attributes.from_location}</TableCell>
                            <TableCell>{trip.attributes.to_location}</TableCell>
                            <TableCell>{trip.attributes.requested_date}</TableCell>
                            <TableCell className="max-w-xs truncate">{trip.attributes.notes || '—'}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  trip.attributes.status === 'completed'
                                    ? 'bg-success'
                                    : trip.attributes.status === 'in_progress'
                                    ? 'bg-warning'
                                    : 'bg-primary'
                                }
                              >
                                {trip.attributes.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
