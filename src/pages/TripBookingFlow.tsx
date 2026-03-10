import React, { useState, useEffect, useMemo } from 'react';
import { logger } from '@/lib/logger';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouteTemplates, useStops, useRouteTemplateStops } from '@/hooks/useStopsData';
import { useIncrementPromoCodeUsage, type PromoCode } from '@/hooks/usePromoCodes';
import { sendBookingEmail } from '@/services/emailService';
import Navbar from '@/components/Navbar';
import SeatMap from '@/components/SeatMap';
import PromoCodeInput from '@/components/PromoCodeInput';
import PaymentUpload from '@/components/PaymentUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, ArrowRight, Check, Tag, MapPin, Calendar, Bus, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Seat } from '@/types';

interface TripOption {
  id: string;
  schedule_id: string;
  trip_date: string;
  available_seats: number;
  total_seats: number;
  status: string;
  schedule: {
    id: string;
    title: string;
    price: number;
    van_type: string;
    daily_repeats: number;
    vehicle_count: number;
    seats_per_vehicle: number;
    route_template_id: string;
    route_template: {
      id: string;
      name: string;
      origin_region: string;
      destination_region: string;
    };
  };
}

interface PassengerInfo {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

type Step = 'direction' | 'pickup' | 'dropoff' | 'date' | 'seats' | 'info';

const TripBookingFlow: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { data: templates = [] } = useRouteTemplates(true);
  const { data: allStops = [] } = useStops();
  const incrementPromoUsage = useIncrementPromoCodeUsage();

  const [step, setStep] = useState<Step>('direction');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [pickupStopId, setPickupStopId] = useState<string>('');
  const [dropoffStopId, setDropoffStopId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTrip, setSelectedTrip] = useState<TripOption | null>(null);
  const [trips, setTrips] = useState<TripOption[]>([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [bookedSeats, setBookedSeats] = useState<number[]>([]);
  const [appliedPromoCode, setAppliedPromoCode] = useState<PromoCode | null>(null);
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passengerInfo, setPassengerInfo] = useState<PassengerInfo>({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    notes: '',
  });

  const { data: templateStops = [] } = useRouteTemplateStops(selectedTemplateId);

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  // Filter stops for pickup/dropoff based on template stops
  const pickupStops = useMemo(() => {
    return templateStops
      .filter(ts => ts.stop_role === 'pickup' || ts.stop_role === 'both')
      .sort((a, b) => a.sequence_order - b.sequence_order)
      .map(ts => allStops.find(s => s.id === ts.stop_id))
      .filter(Boolean) as typeof allStops;
  }, [templateStops, allStops]);

  const dropoffStops = useMemo(() => {
    return templateStops
      .filter(ts => ts.stop_role === 'dropoff' || ts.stop_role === 'both')
      .sort((a, b) => a.sequence_order - b.sequence_order)
      .map(ts => allStops.find(s => s.id === ts.stop_id))
      .filter(Boolean) as typeof allStops;
  }, [templateStops, allStops]);

  // Fetch available trips when date is selected
  useEffect(() => {
    if (!selectedDate || !selectedTemplateId) return;
    const fetchTrips = async () => {
      setTripsLoading(true);
      const { data, error } = await supabase
        .from('trip_instances')
        .select('*, schedule:trip_schedules(*, route_template:route_templates(id, name, origin_region, destination_region))')
        .eq('trip_date', selectedDate)
        .in('status', ['scheduled', 'in_progress']);

      if (!error && data) {
        const filtered = (data as any[]).filter(
          (t: any) => t.schedule?.route_template_id === selectedTemplateId && t.available_seats > 0
        );
        setTrips(filtered);
      }
      setTripsLoading(false);
    };
    fetchTrips();
  }, [selectedDate, selectedTemplateId]);

  // Initialize seats when trip is selected
  useEffect(() => {
    if (!selectedTrip) return;
    const vanType = selectedTrip.schedule?.van_type || '13_seats';
    const seatNumbers = vanType === '12_seats'
      ? [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 14]
      : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14];
    const price = selectedTrip.schedule?.price || 0;

    // Fetch booked seats for this trip instance
    const fetchBooked = async () => {
      const { data } = await supabase
        .from('bookings')
        .select('seats')
        .eq('trip_instance_id', selectedTrip.id)
        .neq('status', 'cancelled');
      const booked = (data || []).flatMap(b => b.seats || []);
      setBookedSeats(booked);

      const initialSeats: Seat[] = seatNumbers.map(num => ({
        number: num,
        isAvailable: !booked.includes(num),
        isSelected: false,
        price: num === 1 ? price + 50 : price,
      }));
      setSeats(initialSeats);
    };
    fetchBooked();
  }, [selectedTrip]);

  useEffect(() => {
    if (user) {
      setPassengerInfo(prev => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  const handleSeatSelect = (seatNumber: number) => {
    setSeats(prev =>
      prev.map(seat =>
        seat.number === seatNumber ? { ...seat, isSelected: !seat.isSelected } : seat
      )
    );
  };

  const selectedSeats = seats.filter(s => s.isSelected);
  const price = selectedTrip?.schedule?.price || 0;
  const subtotalPrice = selectedSeats.reduce((sum, seat) => sum + (seat.price || price), 0);
  const discountAmount = appliedPromoCode
    ? Math.round((subtotalPrice * appliedPromoCode.discount_percent) / 100)
    : 0;
  const totalPrice = subtotalPrice - discountAmount;

  const pickupStop = allStops.find(s => s.id === pickupStopId);
  const dropoffStop = allStops.find(s => s.id === dropoffStopId);

  // Get stop time for pickup stop
  const [pickupTime, setPickupTime] = useState<string>('');
  useEffect(() => {
    if (!selectedTrip || !pickupStopId) return;
    const fetchTime = async () => {
      const { data } = await supabase
        .from('schedule_stop_times')
        .select('arrival_time')
        .eq('schedule_id', selectedTrip.schedule_id)
        .eq('stop_id', pickupStopId)
        .maybeSingle();
      setPickupTime(data?.arrival_time || '');
    };
    fetchTime();
  }, [selectedTrip, pickupStopId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedTrip) return;
    if (!passengerInfo.name || !passengerInfo.phone || !passengerInfo.email) {
      toast.error(t('booking.fillRequired') || 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // We still need a route_id for backward compat. Use a placeholder approach:
      // Create a temporary entry or use the first available route.
      // For now, we'll insert directly with the new fields.
      const { data: newBooking, error } = await supabase
        .from('bookings')
        .insert([{
          user_id: user.id,
          route_id: null as any,
          trip_instance_id: selectedTrip.id,
          pickup_stop_id: pickupStopId,
          dropoff_stop_id: dropoffStopId,
          seats: selectedSeats.map(s => s.number),
          passenger_name: passengerInfo.name,
          passenger_phone: passengerInfo.phone,
          passenger_email: passengerInfo.email,
          passenger_notes: passengerInfo.notes || null,
          total_price: totalPrice,
          promo_code: appliedPromoCode?.code || null,
          discount_amount: discountAmount,
          payment_screenshot_url: paymentScreenshotUrl || null,
          status: 'pending',
          is_paid: false,
        }])
        .select()
        .single();

      if (error) throw error;

      // Update available seats on trip instance
      await supabase
        .from('trip_instances')
        .update({ available_seats: selectedTrip.available_seats - selectedSeats.length })
        .eq('id', selectedTrip.id);

      if (appliedPromoCode) {
        await incrementPromoUsage.mutateAsync(appliedPromoCode.code);
      }

      toast.success(t('booking.confirmed') || 'Booking confirmed!');
      navigate('/booking/confirmation', {
        state: {
          booking: newBooking,
          tripInfo: {
            direction: selectedTemplate?.name,
            pickupStop: pickupStop?.name_en,
            dropoffStop: dropoffStop?.name_en,
            pickupTime,
            date: selectedDate,
          },
        },
        replace: true,
      });
    } catch (error) {
      logger.error('Booking error:', error);
      toast.error(t('booking.error') || 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    const steps: Step[] = ['direction', 'pickup', 'dropoff', 'date', 'seats', 'info'];
    const idx = steps.indexOf(step);
    if (idx > 0) setStep(steps[idx - 1]);
    else navigate('/');
  };

  const vanType = selectedTrip?.schedule?.van_type || '13_seats';
  const maxSeats = vanType === '12_seats' ? 12 : 13;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" onClick={goBack} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </Button>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {(['direction', 'pickup', 'dropoff', 'date', 'seats', 'info'] as Step[]).map((s, i) => (
            <React.Fragment key={s}>
              {i > 0 && <div className="w-6 h-0.5 bg-border flex-shrink-0" />}
              <Badge
                variant={step === s ? 'default' : 'outline'}
                className={`flex-shrink-0 ${step === s ? 'bg-primary text-primary-foreground' : ''}`}
              >
                {i + 1}. {s.charAt(0).toUpperCase() + s.slice(1)}
              </Badge>
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Direction */}
            {step === 'direction' && (
              <Card className="border-2 shadow-lg">
                <CardHeader className="border-b bg-primary text-primary-foreground">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Bus className="w-5 h-5" /> Select Direction
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {templates.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No routes available yet.</p>
                  ) : (
                    <div className="grid gap-3">
                      {templates.map(tmpl => (
                        <button
                          key={tmpl.id}
                          onClick={() => { setSelectedTemplateId(tmpl.id); setStep('pickup'); }}
                          className={`p-4 rounded-xl border-2 text-left transition-all hover:border-primary hover:shadow-md ${
                            selectedTemplateId === tmpl.id ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <ArrowRight className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{tmpl.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {tmpl.origin_region} → {tmpl.destination_region}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 2: Pickup Stop */}
            {step === 'pickup' && (
              <Card className="border-2 shadow-lg">
                <CardHeader className="border-b bg-primary text-primary-foreground">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <MapPin className="w-5 h-5" /> Select Pickup Stop
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  {pickupStops.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No pickup stops assigned to this route.</p>
                  ) : (
                    pickupStops.map(stop => (
                      <button
                        key={stop.id}
                        onClick={() => { setPickupStopId(stop.id); setStep('dropoff'); }}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:border-primary hover:shadow-md ${
                          pickupStopId === stop.id ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                      >
                        <p className="font-semibold text-foreground">{stop.name_en}</p>
                        <p className="text-sm text-muted-foreground">{stop.name_ar} • {stop.region}</p>
                      </button>
                    ))
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 3: Dropoff Stop */}
            {step === 'dropoff' && (
              <Card className="border-2 shadow-lg">
                <CardHeader className="border-b bg-primary text-primary-foreground">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <MapPin className="w-5 h-5" /> Select Dropoff Stop
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  {dropoffStops.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No dropoff stops assigned to this route.</p>
                  ) : (
                    dropoffStops.map(stop => (
                      <button
                        key={stop.id}
                        onClick={() => { setDropoffStopId(stop.id); setStep('date'); }}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:border-primary hover:shadow-md ${
                          dropoffStopId === stop.id ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                      >
                        <p className="font-semibold text-foreground">{stop.name_en}</p>
                        <p className="text-sm text-muted-foreground">{stop.name_ar} • {stop.region}</p>
                      </button>
                    ))
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 4: Date & Trip Selection */}
            {step === 'date' && (
              <Card className="border-2 shadow-lg">
                <CardHeader className="border-b bg-primary text-primary-foreground">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Calendar className="w-5 h-5" /> Select Date & Trip
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label>Travel Date</Label>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={e => { setSelectedDate(e.target.value); setSelectedTrip(null); }}
                      min={new Date().toISOString().split('T')[0]}
                      className="max-w-xs"
                    />
                  </div>

                  {selectedDate && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground">Available Trips</h4>
                      {tripsLoading ? (
                        <p className="text-muted-foreground">Loading trips...</p>
                      ) : trips.length === 0 ? (
                        <p className="text-muted-foreground">No trips available for this date.</p>
                      ) : (
                        trips.map(trip => (
                          <button
                            key={trip.id}
                            onClick={() => { setSelectedTrip(trip); setStep('seats'); }}
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all hover:border-primary hover:shadow-md ${
                              selectedTrip?.id === trip.id ? 'border-primary bg-primary/5' : 'border-border'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-foreground">{trip.schedule?.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {trip.available_seats} / {trip.total_seats} seats available •{' '}
                                  {trip.schedule?.van_type === '12_seats' ? '12-seat van' : '13-seat van'}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-primary">{trip.schedule?.price} LE</p>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 5: Seat Selection */}
            {step === 'seats' && (
              <Card className="border-2 shadow-lg">
                <CardHeader className="border-b bg-primary text-primary-foreground">
                  <CardTitle className="text-xl">{t('booking.selectSeats')}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <SeatMap
                    seats={seats}
                    onSeatSelect={handleSeatSelect}
                    maxSeats={maxSeats}
                    seatPrice={price}
                  />
                  <Button
                    onClick={() => { if (selectedSeats.length === 0) { toast.error('Select at least one seat'); return; } setStep('info'); }}
                    disabled={selectedSeats.length === 0}
                    className="w-full mt-4 h-12 text-base font-semibold"
                  >
                    Continue to Passenger Info
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 6: Passenger Info & Payment */}
            {step === 'info' && (
              <Card className="border-2 shadow-lg">
                <CardHeader className="border-b bg-primary text-primary-foreground">
                  <CardTitle className="text-xl">{t('booking.passengerInfo')}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('booking.fullName')} *</Label>
                      <Input id="name" value={passengerInfo.name} onChange={e => setPassengerInfo(p => ({ ...p, name: e.target.value }))} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t('booking.phone')} *</Label>
                      <Input id="phone" type="tel" value={passengerInfo.phone} onChange={e => setPassengerInfo(p => ({ ...p, phone: e.target.value }))} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">{t('booking.email')} *</Label>
                      <Input id="email" type="email" value={passengerInfo.email} onChange={e => setPassengerInfo(p => ({ ...p, email: e.target.value }))} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">{t('booking.notes')}</Label>
                      <Textarea id="notes" value={passengerInfo.notes} onChange={e => setPassengerInfo(p => ({ ...p, notes: e.target.value }))} rows={3} />
                    </div>

                    {/* Payment Section */}
                    <PaymentUpload onUpload={setPaymentScreenshotUrl} uploadedUrl={paymentScreenshotUrl} />

                    <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-base font-semibold gap-2">
                      <Check className="w-5 h-5" />
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
              <CardContent className="p-6 space-y-4">
                {selectedTemplate && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Direction</div>
                    <div className="font-semibold text-foreground">{selectedTemplate.name}</div>
                  </div>
                )}
                {pickupStop && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Pickup</div>
                    <div className="font-semibold text-foreground">{pickupStop.name_en}</div>
                    {pickupTime && <div className="text-sm text-primary flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime12h(pickupTime)}</div>}
                  </div>
                )}
                {dropoffStop && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Dropoff</div>
                    <div className="font-semibold text-foreground">{dropoffStop.name_en}</div>
                  </div>
                )}
                {selectedDate && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Date</div>
                    <div className="font-semibold text-foreground">{selectedDate}</div>
                  </div>
                )}
                {selectedSeats.length > 0 && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Seats</div>
                    <div className="font-semibold text-foreground">{selectedSeats.map(s => s.number).join(', ')}</div>
                  </div>
                )}

                {/* Promo Code */}
                {step === 'info' && (
                  <div className="border-t pt-4">
                    <PromoCodeInput onApply={setAppliedPromoCode} appliedCode={appliedPromoCode} />
                  </div>
                )}

                {selectedSeats.length > 0 && (
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium text-foreground">{subtotalPrice} LE</span>
                    </div>
                    {appliedPromoCode && (
                      <div className="flex justify-between text-sm text-success">
                        <span className="flex items-center gap-1"><Tag className="w-3 h-3" />-{appliedPromoCode.discount_percent}%</span>
                        <span>-{discountAmount} LE</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span className="text-foreground">Total</span>
                      <span className="text-primary">{totalPrice} LE</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripBookingFlow;
