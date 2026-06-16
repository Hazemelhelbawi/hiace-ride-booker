import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getMyBookings, cancelBooking, STRAPI_URL, type StrapiItem, type Booking } from "@/services/api";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Ticket,
  Eye,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const Profile: React.FC = () => {
  const { user, token, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<StrapiItem<Booking>[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    if (!token) return;

    const fetchBookings = async () => {
      try {
        const bookingsData = await getMyBookings(token);
        setBookings(bookingsData);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to load bookings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [isAuthenticated, token, navigate]);

  const handleCancelBooking = async (bookingId: number) => {
    if (!token) return;

    const confirmed = window.confirm(t('profile.cancelBooking') || 'Are you sure you want to cancel this booking?');
    if (!confirmed) return;

    try {
      await cancelBooking(bookingId, token);
      toast.success(t('common.success') || 'Booking cancelled successfully');
      
      // Refetch bookings
      const updatedBookings = await getMyBookings(token);
      setBookings(updatedBookings);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(t('common.error') || 'Failed to cancel booking');
    }
  };

  const getStatusBadge = (status: string, isPaid: boolean) => {
    if (status === "cancelled") {
      return <Badge variant="destructive">{t("status.cancelled") || "Cancelled"}</Badge>;
    }
    if (status === "confirmed") {
      return <Badge className="bg-success hover:bg-success/90">{t("confirmation.confirmed") || "Confirmed"}</Badge>;
    }
    if (isPaid) {
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          {t("confirmation.paid") || "Paid"}
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700">
        {t("confirmation.pending") || "Pending"}
      </Badge>
    );
  };

  if (!user) return null;

  const WHATSAPP_NUMBER = "01002178764";
  
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          {t("profile.title") || "My Profile"}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info Card */}
          <Card className="border-2 shadow-lg lg:col-span-1">
            <CardHeader className="border-b bg-primary text-primary-foreground">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {t("profile.personalInfo") || "Personal Information"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-primary" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {user.name}
                  </h2>
                  {user.isAdmin && (
                    <Badge className="mt-1">Admin</Badge>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">
                    {user.phone || "Not provided"}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {t("profile.myBookings") || "My Bookings"}
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {bookings.length}
                  </span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {t("profile.contactUs") || "Contact Us"}
                  </span>
                  <span className="flex-col flex">
                    <span className="text-center text-green-700">WhatsApp</span>
                    <span className="text-xl font-bold text-primary">
                      <a
                        href={`https://wa.me/${WHATSAPP_NUMBER}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {WHATSAPP_NUMBER}
                      </a>
                    </span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bookings History */}
          <Card className="border-2 shadow-lg lg:col-span-2">
            <CardHeader className="border-b bg-card">
              <CardTitle className="flex items-center gap-2">
                <Ticket className="w-5 h-5" />
                {t("profile.myBookings") || "My Bookings"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                </div>
              ) : bookings.length === 0 ? (
                <div className="p-8 text-center">
                  <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {t("profile.noBookings") || "No bookings yet"}
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t("profile.noBookingsDesc") || "Start your journey by booking a trip"}
                  </p>
                  <Button onClick={() => navigate("/")} className="mt-4">
                    {t("profile.bookNow") || "Book Now"}
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("admin.bookingNumber") || "Booking #"}</TableHead>
                        <TableHead>{t("booking.trip") || "Trip"}</TableHead>
                        <TableHead>{t("admin.date") || "Date"}</TableHead>
                        <TableHead>{t("admin.seats") || "Seats"}</TableHead>
                        <TableHead>{t("booking.total") || "Total"}</TableHead>
                        <TableHead>{t("confirmation.status") || "Status"}</TableHead>
                        <TableHead className="text-end">
                          {t("admin.actions") || "Actions"}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => {
                        const trip = booking.attributes.trip?.data;
                        const direction = trip?.attributes.direction === 'cairo_sinai' ? 'Cairo → Sinai' : 'Sinai → Cairo';
                        
                        return (
                          <TableRow key={booking.id}>
                            <TableCell className="font-mono text-sm">
                              {booking.attributes.booking_number}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-muted-foreground" />
                                <span className="font-medium">
                                  {direction}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-muted-foreground" />
                                <span>{trip?.attributes.date || 'N/A'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1 flex-wrap">
                                {booking.attributes.seats.map((seat) => (
                                  <span
                                    key={seat}
                                    className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium"
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
                              {getStatusBadge(booking.attributes.status, booking.attributes.is_paid)}
                            </TableCell>
                            <TableCell className="text-end">
                              <div className="flex justify-end gap-2">
                                {booking.attributes.screenshot && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const imageUrl = STRAPI_URL + booking.attributes.screenshot!.data.attributes.url;
                                      window.open(imageUrl, '_blank');
                                    }}
                                    className="gap-1"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                )}
                                {booking.attributes.status !== "cancelled" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCancelBooking(booking.id)}
                                    className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
