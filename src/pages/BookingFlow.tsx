import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Route, Seat, Booking, Passenger } from '@/types';
import { getRouteById, addBooking, getBookedSeats } from '@/services/localStorage';
import { sendBookingEmail } from '@/services/emailService';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import SeatMap from '@/components/SeatMap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Check } from 'lucide-react';
import { toast } from 'sonner';

const BookingFlow: React.FC = () => {
  const { routeId } = useParams<{ routeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [route, setRoute] = useState<Route | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passengerInfo, setPassengerInfo] = useState<Passenger>({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    notes: '',
  });

  useEffect(() => {
    if (!routeId) return;

    const foundRoute = getRouteById(routeId);
    if (!foundRoute) {
      toast.error('Route not found');
      navigate('/');
      return;
    }

    setRoute(foundRoute);

    // Initialize 14 seats for Toyota layout
    const bookedSeats = getBookedSeats(routeId);
    // Seat numbers as per the layout: 1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 14 (no 4, 13)
    const seatNumbers = [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 14];
    const initialSeats: Seat[] = seatNumbers.map((num) => ({
      number: num,
      isAvailable: !bookedSeats.includes(num),
      isSelected: false,
      price: num === 1 ? (foundRoute.price + 100) : foundRoute.price, // Seat 1 is premium
    }));
    setSeats(initialSeats);
  }, [routeId, navigate]);

  const handleSeatSelect = (seatNumber: number) => {
    setSeats((prev) =>
      prev.map((seat) =>
        seat.number === seatNumber ? { ...seat, isSelected: !seat.isSelected } : seat
      )
    );
  };

  const selectedSeats = seats.filter((s) => s.isSelected);
  const totalPrice = selectedSeats.reduce((sum, seat) => sum + (seat.price || route?.price || 0), 0);

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !route) return;

    if (!passengerInfo.name || !passengerInfo.phone || !passengerInfo.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    const booking: Booking = {
      id: Date.now().toString(),
      userId: user.id,
      routeId: route.id,
      seats: selectedSeats.map((s) => s.number),
      passenger: passengerInfo,
      status: 'pending',
      totalPrice,
      isPaid: false,
      createdAt: new Date().toISOString(),
    };

    addBooking(booking);
    
    // Send confirmation email
    sendBookingEmail({
      booking,
      route,
      status: 'pending',
      isPaid: false,
    });

    toast.success('Booking confirmed!');
    
    // Navigate to confirmation page
    navigate('/booking/confirmation', { 
      state: { booking, route },
      replace: true 
    });
  };

  if (!route) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => step === 1 ? navigate('/') : setStep(1)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
            {step === 1 ? (
              <Card className="border-2 shadow-lg">
                <CardHeader className="border-b bg-primary text-white">
                  <CardTitle className="text-2xl">Select Your Seats</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <SeatMap
                    seats={seats}
                    onSeatSelect={handleSeatSelect}
                    maxSeats={14}
                    seatPrice={route.price}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 shadow-lg">
                <CardHeader className="border-b bg-primary text-white">
                  <CardTitle className="text-2xl">Passenger Information</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={passengerInfo.name}
                        onChange={(e) =>
                          setPassengerInfo((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={passengerInfo.phone}
                        onChange={(e) =>
                          setPassengerInfo((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        placeholder="+20 100 000 0000"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={passengerInfo.email}
                        onChange={(e) =>
                          setPassengerInfo((prev) => ({ ...prev, email: e.target.value }))
                        }
                        placeholder="your.email@example.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={passengerInfo.notes}
                        onChange={(e) =>
                          setPassengerInfo((prev) => ({ ...prev, notes: e.target.value }))
                        }
                        placeholder="Any special requests or notes..."
                        rows={4}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary-dark text-white transition-opacity gap-2"
                    >
                      <Check className="w-5 h-5" />
                      {isSubmitting ? 'Processing...' : 'Confirm Booking'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-2 shadow-lg sticky top-24">
              <CardHeader className="border-b bg-card">
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Route</div>
                    <div className="font-semibold text-foreground">
                      {route.origin} → {route.destination}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Date & Time</div>
                    <div className="font-semibold text-foreground">
                      {route.date} at {route.departureTime}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Selected Seats</div>
                    <div className="font-semibold text-foreground">
                      {selectedSeats.length === 0
                        ? 'None selected'
                        : selectedSeats.map((s) => s.number).join(', ')}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price per seat</span>
                    <span className="font-medium text-foreground">{route.price} LE</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Number of seats</span>
                    <span className="font-medium text-foreground">{selectedSeats.length}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary">{totalPrice} LE</span>
                  </div>
                </div>

                {step === 1 && (
                  <Button
                    onClick={handleContinue}
                    disabled={selectedSeats.length === 0}
                    className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary-dark text-white transition-all"
                  >
                    Continue to Passenger Info
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingFlow;
