import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Booking, Route, BookingStatus } from '@/types';
import { getBookings, updateBooking, getRoutes, addRoute, deleteRoute } from '@/services/localStorage';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart, Users, MapPin, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isRouteDialogOpen, setIsRouteDialogOpen] = useState(false);
  const [newRoute, setNewRoute] = useState<Partial<Route>>({
    origin: '',
    destination: '',
    departureTime: '',
    arrivalTime: '',
    price: 0,
    date: '',
    driverName: '',
    vanNumber: '',
  });

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
      return;
    }

    loadData();

    // Listen for new bookings
    const handleBookingAdded = () => {
      loadData();
      toast.success('New booking received!');
    };

    window.addEventListener('bookingAdded', handleBookingAdded);
    return () => window.removeEventListener('bookingAdded', handleBookingAdded);
  }, [user, navigate]);

  const loadData = () => {
    setBookings(getBookings());
    setRoutes(getRoutes());
  };

  const handleStatusChange = (bookingId: string, newStatus: BookingStatus) => {
    updateBooking(bookingId, { status: newStatus });
    loadData();
    toast.success('Booking status updated');
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success text-success-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'cancelled':
        return 'bg-destructive text-destructive-foreground';
    }
  };

  const handleAddRoute = (e: React.FormEvent) => {
    e.preventDefault();
    
    const route: Route = {
      id: Date.now().toString(),
      origin: newRoute.origin!,
      destination: newRoute.destination!,
      departureTime: newRoute.departureTime!,
      arrivalTime: newRoute.arrivalTime!,
      price: Number(newRoute.price),
      date: newRoute.date!,
      driverName: newRoute.driverName!,
      vanNumber: newRoute.vanNumber!,
      availableSeats: 12,
      totalSeats: 12,
    };

    addRoute(route);
    loadData();
    setIsRouteDialogOpen(false);
    setNewRoute({
      origin: '',
      destination: '',
      departureTime: '',
      arrivalTime: '',
      price: 0,
      date: '',
      driverName: '',
      vanNumber: '',
    });
    toast.success('Route added successfully');
  };

  const handleDeleteRoute = (routeId: string) => {
    if (confirm('Are you sure you want to delete this route?')) {
      deleteRoute(routeId);
      loadData();
      toast.success('Route deleted');
    }
  };

  const stats = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter((b) => b.status === 'pending').length,
    confirmedBookings: bookings.filter((b) => b.status === 'confirmed').length,
    totalRoutes: routes.length,
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage bookings and routes</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalBookings}</p>
                </div>
                <BarChart className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold text-warning">{stats.pendingBookings}</p>
                </div>
                <Users className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Confirmed</p>
                  <p className="text-3xl font-bold text-success">{stats.confirmedBookings}</p>
                </div>
                <Users className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Routes</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalRoutes}</p>
                </div>
                <MapPin className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="routes">Routes</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings">
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Booking ID</TableHead>
                        <TableHead>Passenger</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Seats</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                            No bookings yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        bookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-mono text-sm">#{booking.id.slice(0, 8)}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{booking.passenger.name}</div>
                                <div className="text-sm text-muted-foreground">{booking.passenger.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {booking.route ? (
                                <div className="text-sm">
                                  {booking.route.origin} → {booking.route.destination}
                                </div>
                              ) : (
                                'N/A'
                              )}
                            </TableCell>
                            <TableCell className="text-sm">
                              {format(new Date(booking.createdAt), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell>{booking.seats.join(', ')}</TableCell>
                            <TableCell className="font-semibold">${booking.totalPrice}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(booking.status)}>
                                {booking.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {booking.status === 'pending' && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleStatusChange(booking.id, 'confirmed')}
                                      className="bg-success hover:bg-success/90"
                                    >
                                      Confirm
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleStatusChange(booking.id, 'cancelled')}
                                    >
                                      Cancel
                                    </Button>
                                  </>
                                )}
                              </div>
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

          <TabsContent value="routes">
            <Card className="border-2 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Route Management</CardTitle>
                <Dialog open={isRouteDialogOpen} onOpenChange={setIsRouteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary-dark text-white gap-2">
                      <Plus className="w-4 h-4" />
                      Add Route
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Route</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddRoute} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="origin">Origin</Label>
                          <Input
                            id="origin"
                            value={newRoute.origin}
                            onChange={(e) => setNewRoute((prev) => ({ ...prev, origin: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="destination">Destination</Label>
                          <Input
                            id="destination"
                            value={newRoute.destination}
                            onChange={(e) => setNewRoute((prev) => ({ ...prev, destination: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="departureTime">Departure Time</Label>
                          <Input
                            id="departureTime"
                            type="time"
                            value={newRoute.departureTime}
                            onChange={(e) => setNewRoute((prev) => ({ ...prev, departureTime: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="arrivalTime">Arrival Time</Label>
                          <Input
                            id="arrivalTime"
                            type="time"
                            value={newRoute.arrivalTime}
                            onChange={(e) => setNewRoute((prev) => ({ ...prev, arrivalTime: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="date">Date</Label>
                          <Input
                            id="date"
                            type="date"
                            value={newRoute.date}
                            onChange={(e) => setNewRoute((prev) => ({ ...prev, date: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="price">Price (per seat)</Label>
                          <Input
                            id="price"
                            type="number"
                            value={newRoute.price}
                            onChange={(e) => setNewRoute((prev) => ({ ...prev, price: Number(e.target.value) }))}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="driverName">Driver Name</Label>
                          <Input
                            id="driverName"
                            value={newRoute.driverName}
                            onChange={(e) => setNewRoute((prev) => ({ ...prev, driverName: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="vanNumber">Van Number</Label>
                          <Input
                            id="vanNumber"
                            value={newRoute.vanNumber}
                            onChange={(e) => setNewRoute((prev) => ({ ...prev, vanNumber: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white">
                        Add Route
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
                        <TableHead>Route</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Available Seats</TableHead>
                        <TableHead>Driver</TableHead>
                        <TableHead>Van</TableHead>
                        <TableHead>Actions</TableHead>
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
                          <TableCell>{format(new Date(route.date), 'MMM dd, yyyy')}</TableCell>
                          <TableCell className="text-sm">{route.departureTime}</TableCell>
                          <TableCell className="font-semibold">${route.price}</TableCell>
                          <TableCell>
                            {route.availableSeats} / {route.totalSeats}
                          </TableCell>
                          <TableCell className="text-sm">{route.driverName}</TableCell>
                          <TableCell className="text-sm font-mono">{route.vanNumber}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteRoute(route.id)}
                              className="gap-2"
                            >
                              <Trash2 className="w-3 h-3" />
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
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
