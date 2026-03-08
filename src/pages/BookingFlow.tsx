import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoute, useBookedSeats, useCreateBooking } from '@/hooks/useData';
import { useIncrementPromoCodeUsage, type PromoCode } from '@/hooks/usePromoCodes';
import { sendBookingEmail } from '@/services/emailService';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import SeatMap from '@/components/SeatMap';
import PromoCodeInput from '@/components/PromoCodeInput';
import PaymentUpload from '@/components/PaymentUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Check, Tag } from 'lucide-react';
import { toast } from 'sonner';
import type { Seat } from '@/types';

interface PassengerInfo {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

const BookingFlow: React.FC = () => {
  const { routeId } = useParams<{ routeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { data: route, isLoading: routeLoading } = useRoute(routeId);
  const { data: bookedSeats = [] } = useBookedSeats(routeId);
  const createBooking = useCreateBooking();
  const incrementPromoUsage = useIncrementPromoCodeUsage();

  const [seats, setSeats] = useState<Seat[]>([]);
  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appliedPromoCode, setAppliedPromoCode] = useState<PromoCode | null>(null);
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState<string>('');
  const [passengerInfo, setPassengerInfo] = useState<PassengerInfo>({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    notes: '',
  });

  useEffect(() => {
    if (!routeLoading && !route && routeId) {
      toast.error(t('booking.routeNotFound') || 'Route not found');
      navigate('/');
      return;
    }

    if (route) {
      // Initialize 14 seats for Toyota layout
      const seatNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14];
      const initialSeats: Seat[] = seatNumbers.map((num) => ({
        number: num,
        isAvailable: !bookedSeats.includes(num),
        isSelected: false,
        price: num === 1 ? (route.price + 100) : route.price,
      }));
      setSeats(initialSeats);
    }
  }, [route, routeLoading, routeId, bookedSeats, navigate, t]);

  // Update passenger info when user changes
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
    setSeats((prev) =>
      prev.map((seat) =>
        seat.number === seatNumber ? { ...seat, isSelected: !seat.isSelected } : seat
      )
    );
  };

  const selectedSeats = seats.filter((s) => s.isSelected);
  const subtotalPrice = selectedSeats.reduce((sum, seat) => sum + (seat.price || route?.price || 0), 0);
  
  // Calculate discount
  const discountAmount = appliedPromoCode 
    ? Math.round((subtotalPrice * appliedPromoCode.discount_percent) / 100)
    : 0;
  const totalPrice = subtotalPrice - discountAmount;

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      toast.error(t('booking.selectSeat') || 'Please select at least one seat');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !route) return;

    if (!passengerInfo.name || !passengerInfo.phone || !passengerInfo.email) {
      toast.error(t('booking.fillRequired') || 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData = {
        user_id: user.id,
        route_id: route.id,
        seats: selectedSeats.map((s) => s.number),
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
      };

      const newBooking = await createBooking.mutateAsync(bookingData);

      // Increment promo code usage if one was applied
      if (appliedPromoCode) {
        await incrementPromoUsage.mutateAsync(appliedPromoCode.code);
      }

      // Send confirmation email
      sendBookingEmail({
        booking: {
          id: newBooking.id,
          seats: newBooking.seats,
          passenger: {
            name: newBooking.passenger_name,
            phone: newBooking.passenger_phone,
            email: newBooking.passenger_email,
            notes: newBooking.passenger_notes || '',
          },
          totalPrice: newBooking.total_price,
          status: newBooking.status,
          isPaid: newBooking.is_paid,
          createdAt: newBooking.created_at,
        },
        route: {
          origin: route.origin,
          destination: route.destination,
          date: route.date,
          departureTime: route.departure_time,
        },
        status: 'pending',
        isPaid: false,
      });

      toast.success(t('booking.confirmed') || 'Booking confirmed!');

      // Navigate to confirmation page
      navigate('/booking/confirmation', {
        state: {
          booking: newBooking,
          route: route,
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

  if (routeLoading || !route) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">{t('common.loading')}</p>
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
                    maxSeats={14}
                    seatPrice={route.price}
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
                      <Label htmlFor="email">{t('booking.email')} *</Label>
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

                    {/* Payment Upload */}
                    <PaymentUpload
                      onUploadComplete={setPaymentScreenshotUrl}
                      uploadedUrl={paymentScreenshotUrl}
                    />

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary-dark text-white transition-opacity gap-2"
                    >
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
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">{t('booking.route')}</div>
                    <div className="font-semibold text-foreground">
                      {route.origin} → {route.destination}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">{t('booking.dateTime')}</div>
                    <div className="font-semibold text-foreground">
                      {route.date} {t('common.at')} {route.departure_time}
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

                {/* Promo Code Input */}
                <div className="border-t pt-4">
                  <PromoCodeInput
                    onApply={setAppliedPromoCode}
                    appliedCode={appliedPromoCode}
                  />
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('booking.pricePerSeat')}</span>
                    <span className="font-medium text-foreground">{route.price} {t('common.currency')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('booking.numberOfSeats')}</span>
                    <span className="font-medium text-foreground">{selectedSeats.length}</span>
                  </div>
                  
                  {appliedPromoCode && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('promo.originalPrice')}</span>
                        <span className="font-medium text-foreground line-through">{subtotalPrice} {t('common.currency')}</span>
                      </div>
                      <div className="flex justify-between text-sm text-success">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {t('promo.discountApplied')} ({appliedPromoCode.discount_percent}%)
                        </span>
                        <span className="font-medium">-{discountAmount} {t('common.currency')}</span>
                      </div>
                    </>
                  )}
                  
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
