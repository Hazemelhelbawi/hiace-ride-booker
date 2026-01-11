import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import BookingTicket from '@/components/BookingTicket';
import { Booking, Route } from '@/types';
import { getUserBookings, getRouteById } from '@/services/localStorage';
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
import { User, Mail, Phone, Calendar, MapPin, Ticket, Eye } from 'lucide-react';
import { format } from 'date-fns';

const Profile: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<{ booking: Booking; route: Route } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (user) {
      const userBookings = getUserBookings(user.id);
      setBookings(userBookings);
    }
  }, [user, isAuthenticated, navigate]);

  const handleViewTicket = (booking: Booking) => {
    const route = getRouteById(booking.routeId);
    if (route) {
      setSelectedBooking({ booking, route });
    }
  };

  const getStatusBadge = (status: string, isPaid: boolean) => {
    if (status === 'cancelled') {
      return <Badge variant="destructive">Cancelled</Badge>;
    }
    if (isPaid) {
      return <Badge className="bg-green-500 hover:bg-green-600">Paid</Badge>;
    }
    return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700">Pending Payment</Badge>;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      {selectedBooking && (
        <BookingTicket
          booking={selectedBooking.booking}
          route={selectedBooking.route}
          onClose={() => setSelectedBooking(null)}
        />
      )}

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info Card */}
          <Card className="border-2 shadow-lg lg:col-span-1">
            <CardHeader className="border-b bg-primary text-primary-foreground">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{user.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    Member since {format(new Date(user.createdAt), 'MMM yyyy')}
                  </p>
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
                  <span className="text-muted-foreground">Total Bookings</span>
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
                My Bookings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {bookings.length === 0 ? (
                <div className="p-8 text-center">
                  <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">You haven't made any bookings yet.</p>
                  <Button onClick={() => navigate('/')} className="mt-4">
                    Browse Routes
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Route</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Seats</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => {
                        const route = booking.route || getRouteById(booking.routeId);
                        return (
                          <TableRow key={booking.id}>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-muted-foreground" />
                                <span className="font-medium">
                                  {route?.origin} → {route?.destination}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-muted-foreground" />
                                <span>{route?.date}</span>
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
                            <TableCell className="font-semibold">{booking.totalPrice} LE</TableCell>
                            <TableCell>{getStatusBadge(booking.status, booking.isPaid)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewTicket(booking)}
                                className="gap-1"
                              >
                                <Eye className="w-4 h-4" />
                                View Ticket
                              </Button>
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
