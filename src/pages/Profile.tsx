import React, { useState, useEffect } from 'react';
import { useConfirmDialog } from '@/components/ConfirmDialog';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserBookings, useCancelBooking } from '@/hooks/useData';
import { sendBookingEmail } from '@/services/emailService';
import Navbar from '@/components/Navbar';
import BookingTicket from '@/components/BookingTicket';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { User, Mail, Phone, Calendar, MapPin, Ticket, Eye, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { Booking, Route } from '@/services/api';

// Map API booking to legacy format for BookingTicket
const mapToLegacyBooking = (booking: Booking) => ({
  id: booking.id,
  userId: booking.user_id,
  routeId: booking.route_id,
  seats: booking.seats,
  passenger: {
    name: booking.passenger_name,
    phone: booking.passenger_phone,
    email: booking.passenger_email,
    notes: booking.passenger_notes || undefined,
  },
  status: booking.status,
  totalPrice: booking.total_price,
  isPaid: booking.is_paid,
  createdAt: booking.created_at,
});

const mapToLegacyRoute = (route: Route) => ({
  id: route.id,
  origin: route.origin,
  destination: route.destination,
  departureTime: route.departure_time,
  arrivalTime: route.arrival_time,
  price: route.price,
  availableSeats: route.available_seats,
  totalSeats: route.total_seats,
  date: route.date,
  driverName: route.driver_name,
  vanNumber: route.van_number,
});

const Profile: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { data: bookings = [], refetch } = useUserBookings(user?.id);
  const cancelBookingMutation = useCancelBooking();
  const [selectedBooking, setSelectedBooking] = useState<{ booking: Booking; route: Route } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  const handleViewTicket = (booking: Booking) => {
    if (booking.route) {
      setSelectedBooking({ booking, route: booking.route });
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    const confirmed = await confirm({
      title: t('profile.cancelBooking'),
      description: 'Are you sure you want to cancel this booking? This action cannot be undone.',
      confirmLabel: 'Cancel Booking',
      variant: 'destructive',
    });
    if (!confirmed) return;
    
    const booking = bookings.find(b => b.id === bookingId);
    
    try {
      await cancelBookingMutation.mutateAsync(bookingId);
      toast.success(t('common.success'));
      refetch();

      // Send cancellation email
      if (booking?.route) {
        sendBookingEmail({
          booking: mapToLegacyBooking(booking),
          route: mapToLegacyRoute(booking.route),
          status: 'cancelled',
          isPaid: booking.is_paid,
        });
      }
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const getStatusBadge = (status: string, isPaid: boolean) => {
    if (status === 'cancelled') {
      return <Badge variant="destructive">{t('status.cancelled')}</Badge>;
    }
    if (isPaid) {
      return <Badge className="bg-green-500 hover:bg-green-600">{t('confirmation.paid')}</Badge>;
    }
    return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700">{t('confirmation.pending')}</Badge>;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      {selectedBooking && (
        <BookingTicket
          booking={mapToLegacyBooking(selectedBooking.booking)}
          route={mapToLegacyRoute(selectedBooking.route)}
          onClose={() => setSelectedBooking(null)}
        />
      )}

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">{t('profile.title')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info Card */}
          <Card className="border-2 shadow-lg lg:col-span-1">
            <CardHeader className="border-b bg-primary text-primary-foreground">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {t('profile.personalInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-primary" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{user.name}</h2>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{user.phone || 'Not provided'}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t('profile.myBookings')}</span>
                  <span className="text-2xl font-bold text-primary">{bookings.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bookings History */}
          <Card className="border-2 shadow-lg lg:col-span-2">
            <CardHeader className="border-b bg-card">
              <CardTitle className="flex items-center gap-2">
                <Ticket className="w-5 h-5" />
                {t('profile.myBookings')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {bookings.length === 0 ? (
                <div className="p-8 text-center">
                  <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t('profile.noBookings')}</p>
                  <p className="text-sm text-muted-foreground mb-4">{t('profile.noBookingsDesc')}</p>
                  <Button onClick={() => navigate('/')} className="mt-4">
                    {t('profile.bookNow')}
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('booking.route')}</TableHead>
                        <TableHead>{t('admin.date')}</TableHead>
                        <TableHead>{t('admin.seats')}</TableHead>
                        <TableHead>{t('booking.total')}</TableHead>
                        <TableHead>{t('confirmation.status')}</TableHead>
                        <TableHead className="text-end">{t('admin.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-muted-foreground" />
                              <span className="font-medium">
                                {booking.route?.origin} → {booking.route?.destination}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              <span>{booking.route?.date}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 flex-wrap">
                              {booking.seats.map((seat) => (
                                <span
                                  key={seat}
                                  className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium"
                                >
                                  {seat}
                                </span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">{booking.total_price} {t('common.currency')}</TableCell>
                          <TableCell>{getStatusBadge(booking.status, booking.is_paid)}</TableCell>
                          <TableCell className="text-end">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewTicket(booking)}
                                className="gap-1"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {booking.status !== 'cancelled' && (
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
                      ))}
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
