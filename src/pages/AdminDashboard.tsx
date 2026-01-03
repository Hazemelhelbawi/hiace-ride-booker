import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Booking, Route, BookingStatus } from '@/types';
import { getBookings, updateBooking, getRoutes, addRoute, updateRoute, deleteRoute } from '@/services/localStorage';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
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
import { BarChart, Users, MapPin, Plus, Trash2, Edit, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isRouteDialogOpen, setIsRouteDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
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

  const handlePaymentToggle = (bookingId: string, isPaid: boolean) => {
    updateBooking(bookingId, { isPaid });
    loadData();
    toast.success(isPaid ? 'Marked as paid' : 'Marked as unpaid');
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
      availableSeats: 14,
      totalSeats: 14,
    };

    addRoute(route);
    loadData();
    setIsRouteDialogOpen(false);
    resetRouteForm();
    toast.success('Route added successfully');
  };

  const handleEditRoute = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingRoute) return;

    updateRoute(editingRoute.id, {
      origin: newRoute.origin,
      destination: newRoute.destination,
      departureTime: newRoute.departureTime,
      arrivalTime: newRoute.arrivalTime,
      price: Number(newRoute.price),
      date: newRoute.date,
      driverName: newRoute.driverName,
      vanNumber: newRoute.vanNumber,
    });

    loadData();
    setEditingRoute(null);
    setIsRouteDialogOpen(false);
    resetRouteForm();
    toast.success('Route updated successfully');
  };

  const openEditDialog = (route: Route) => {
    setEditingRoute(route);
    setNewRoute({
      origin: route.origin,
      destination: route.destination,
      departureTime: route.departureTime,
      arrivalTime: route.arrivalTime,
      price: route.price,
      date: route.date,
      driverName: route.driverName,
      vanNumber: route.vanNumber,
    });
    setIsRouteDialogOpen(true);
  };

  const resetRouteForm = () => {
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
    setEditingRoute(null);
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
    paidBookings: bookings.filter((b) => b.isPaid).length,
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Manage bookings and routes</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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
                  <p className="text-sm text-muted-foreground">Paid</p>
                  <p className="text-3xl font-bold text-primary">{stats.paidBookings}</p>
                </div>
                <CreditCard className="w-8 h-8 text-primary" />
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
                        <TableHead>Phone</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Seats</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
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
                            <TableCell className="text-sm">{booking.passenger.phone}</TableCell>
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
                            <TableCell>
                              <div className="flex gap-1 flex-wrap">
                                {booking.seats.map((seat) => (
                                  <span key={seat} className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium bg-primary/10 text-primary rounded">
                                    {seat}
                                  </span>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold">{booking.totalPrice} LE</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={booking.isPaid || false}
                                  onCheckedChange={(checked) => handlePaymentToggle(booking.id, checked)}
                                />
                                <span className={booking.isPaid ? 'text-success text-sm' : 'text-warning text-sm'}>
                                  {booking.isPaid ? 'Paid' : 'Unpaid'}
                                </span>
                              </div>
                            </TableCell>
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
                <Dialog open={isRouteDialogOpen} onOpenChange={(open) => {
                  setIsRouteDialogOpen(open);
                  if (!open) resetRouteForm();
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary-dark text-white gap-2">
                      <Plus className="w-4 h-4" />
                      Add New Trip
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingRoute ? 'Edit Route' : 'Add New Trip'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={editingRoute ? handleEditRoute : handleAddRoute} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="origin">Origin</Label>
                          <Input
                            id="origin"
                            value={newRoute.origin}
                            onChange={(e) => setNewRoute((prev) => ({ ...prev, origin: e.target.value }))}
                            placeholder="e.g., Cairo"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="destination">Destination</Label>
                          <Input
                            id="destination"
                            value={newRoute.destination}
                            onChange={(e) => setNewRoute((prev) => ({ ...prev, destination: e.target.value }))}
                            placeholder="e.g., Dahab"
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
                          <Label htmlFor="price">Price (LE per seat)</Label>
                          <Input
                            id="price"
                            type="number"
                            value={newRoute.price}
                            onChange={(e) => setNewRoute((prev) => ({ ...prev, price: Number(e.target.value) }))}
                            placeholder="e.g., 750"
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
                            placeholder="e.g., Ahmed Hassan"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="vanNumber">Van Number</Label>
                          <Input
                            id="vanNumber"
                            value={newRoute.vanNumber}
                            onChange={(e) => setNewRoute((prev) => ({ ...prev, vanNumber: e.target.value }))}
                            placeholder="e.g., ABC-1234"
                            required
                          />
                        </div>
                      </div>

                      <Button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white">
                        {editingRoute ? 'Update Route' : 'Add Trip'}
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
                          <TableCell className="text-sm">{route.departureTime} - {route.arrivalTime}</TableCell>
                          <TableCell className="font-semibold">{route.price} LE</TableCell>
                          <TableCell>
                            {route.availableSeats} / {route.totalSeats}
                          </TableCell>
                          <TableCell className="text-sm">{route.driverName}</TableCell>
                          <TableCell className="text-sm font-mono">{route.vanNumber}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openEditDialog(route)}
                                className="gap-1"
                              >
                                <Edit className="w-3 h-3" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteRoute(route.id)}
                                className="gap-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                Delete
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
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
