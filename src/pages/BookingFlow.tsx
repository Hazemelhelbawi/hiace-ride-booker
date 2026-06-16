import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTrips, getBookedSeats, getStops, createBooking, STRAPI_URL, type StrapiItem, type Trip, type Stop } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import SeatMap from '@/components/SeatMap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Seat } from '@/types';

interface PassengerInfo {
  name: string;
  phone: string;
  notes: string;
  pickupStopId: string;
  dropoffStopId: string;
}

const BookingFlow: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [trip, setTrip] = useState<StrapiItem<Trip> | null>(null);
  const [bookedSeats, setBookedSeats] = useState<number[]>([]);
  const [stops, setStops] = useState<StrapiItem<Stop>[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [passengerInfo, setPassengerInfo] = useState<PassengerInfo>({
    name: user?.name || '',
    phone: user?.phone || '',
    notes: '',
    pickupStopId: '',
    dropoffStopId: '',
  });

  // Fetch trip data on mount
  useEffect(() => {
    if (!tripId) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch stops
        const stopsData = await getStops();
        setStops(stopsData);

        // Fetch trip (we need to get all trips and find the one with matching ID)
        const tripsData = await getTrips();
        const foundTrip = tripsData.find(t => t.id === parseInt(tripId));
        
        if (!foundTrip) {
          toast.error(t('booking.tripNotFound') || 'Trip not found');
          navigate('/');
          return;
        }
        
        setTrip(foundTrip);

        // Fetch booked seats for this trip
        const bookedSeatsData = await getBookedSeats(parseInt(tripId));
        setBookedSeats(bookedSeatsData);

        // Initialize seat map
        const totalSeats = foundTrip.attributes.vehicle_type === '12' ? 12 : 13;
        const seatNumbers = totalSeats === 12
          ? [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 14]
          : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14];
        
        const initialSeats: Seat[] = seatNumbers.map((num) => ({
          number: num,
          isAvailable: !bookedSeatsData.includes(num),
          isSelected: false,
          price: 500, // Default price - should come from Strapi config
        }));
        
        setSeats(initialSeats);
      } catch (error) {
        console.error('Error fetching trip data:', error);
        toast.error('Failed to load trip details');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [tripId, navigate, t]);

  // Update passenger info when user changes
  useEffect(() => {
    if (user) {
      setPassengerInfo(prev => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  const handleSeatSelect = (seatNumber: number) => {
    setSeats((prev) =>
      prev.map((seat) =>
        seat.number === seatNumber ? { ...seat, isSelected: !seat.isSelected } : seat
      )
    );
  };

  const selectedSeats = seats.filter((s) => s.isSelected);
  const totalPrice = selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      toast.error(t('booking.selectSeat') || 'Please select at least one seat');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !trip || !token) {
      toast.error('Please log in to continue');
      navigate('/auth');
      return;
    }

    if (!passengerInfo.name || !passengerInfo.phone) {
      toast.error(t('booking.fillRequired') || 'Please fill in all required fields');
      return;
    }

    if (!passengerInfo.pickupStopId || !passengerInfo.dropoffStopId) {
      toast.error('Please select pickup and dropoff stops');
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData = {
        trip: trip.id,
        passenger_name: passengerInfo.name,
        phone: passengerInfo.phone,
        seats: selectedSeats.map((s) => s.number),
        total_price: totalPrice,
        pickup_stop: parseInt(passengerInfo.pickupStopId),
        dropoff_stop: parseInt(passengerInfo.dropoffStopId),
        notes: passengerInfo.notes || undefined,
      };

      const newBooking = await createBooking(bookingData, token, screenshotFile || undefined);

      toast.success(t('booking.confirmed') || 'Booking confirmed!');

      // Navigate to confirmation page
      navigate('/booking/confirmation', {
        state: {
          booking: newBooking,
          trip: trip,
        },
        replace: true,
      });
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(t('booking.error') || 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
    }
  };

  if (isLoading || !trip) {
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

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => step === 1 ? navigate('/') : setStep(1)}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {step === 1 ? (
              <Card className="border-2 shadow-lg">
                <CardHeader className="border-b bg-primary text-white">
                  <CardTitle className="text-2xl">{t('booking.selectSeats')}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <SeatMap
                    seats={seats}
                    onSeatSelect={handleSeatSelect}
                    maxSeats={trip.attributes.vehicle_type === '12' ? 12 : 13}
                    seatPrice={500}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 shadow-lg">
                <CardHeader className="border-b bg-primary text-white">
                  <CardTitle className="text-2xl">{t('booking.passengerInfo')}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t('booking.pickupPoint') || 'Pickup Stop'} *</Label>
                        <Select
                          value={passengerInfo.pickupStopId}
                          onValueChange={(v) => setPassengerInfo((prev) => ({ ...prev, pickupStopId: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('booking.selectPickup') || 'Select pickup stop'} />
                          </SelectTrigger>
                          <SelectContent>
                            {stops.map(stop => (
                              <SelectItem key={stop.id} value={String(stop.id)}>
                                {stop.attributes.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t('booking.dropoffPoint') || 'Dropoff Stop'} *</Label>
                        <Select
                          value={passengerInfo.dropoffStopId}
                          onValueChange={(v) => setPassengerInfo((prev) => ({ ...prev, dropoffStopId: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('booking.selectDropoff') || 'Select dropoff stop'} />
                          </SelectTrigger>
                          <SelectContent>
                            {stops.map(stop => (
                              <SelectItem key={stop.id} value={String(stop.id)}>
                                {stop.attributes.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="name">{t('booking.fullName')} *</Label>
                      <Input
                        id="name"
                        value={passengerInfo.name}
                        onChange={(e) =>
                          setPassengerInfo((prev) => ({ ...prev, name: e.target.value }))
                        }
                        placeholder={t('booking.enterName')}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('booking.phone')} *</Label>
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
                      <Label htmlFor="notes">{t('booking.notes')}</Label>
                      <Textarea
                        id="notes"
                        value={passengerInfo.notes}
                        onChange={(e) =>
                          setPassengerInfo((prev) => ({ ...prev, notes: e.target.value }))
                        }
                        placeholder={t('booking.notesPlaceholder')}
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="screenshot">{t('booking.paymentScreenshot') || 'Payment Screenshot (Optional)'}</Label>
                      <Input
                        id="screenshot"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      {screenshotFile && (
                        <p className="text-sm text-muted-foreground">
                          Selected: {screenshotFile.name}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary-dark text-white transition-opacity gap-2"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Check className="w-5 h-5" />
                      )}
                      {isSubmitting ? t('common.processing') : t('booking.confirmBooking')}
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
                <CardTitle>{t('booking.summary')}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">{t('booking.trip')}</div>
                    <div className="font-semibold text-foreground">
                      {trip.attributes.direction === 'cairo_sinai' ? 'Cairo → Sinai' : 'Sinai → Cairo'}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">{t('booking.dateTime')}</div>
                    <div className="font-semibold text-foreground">
                      {trip.attributes.date} {t('common.at')} {trip.attributes.time}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">{t('booking.selectedSeats')}</div>
                    <div className="font-semibold text-foreground">
                      {selectedSeats.length === 0
                        ? t('booking.noneSelected')
                        : selectedSeats.map((s) => s.number).join(', ')}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('booking.numberOfSeats')}</span>
                    <span className="font-medium text-foreground">{selectedSeats.length}</span>
                  </div>
                  
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span className="text-foreground">{t('booking.total')}</span>
                    <span className="text-primary">{totalPrice} {t('common.currency')}</span>
                  </div>
                </div>

                {step === 1 && (
                  <Button
                    onClick={handleContinue}
                    disabled={selectedSeats.length === 0}
                    className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary-dark text-white transition-all"
                  >
                    {t('booking.continueToInfo')}
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
