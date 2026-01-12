import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Booking, Route } from '@/services/api';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Copy,
  Share2,
  MessageCircle,
  Home,
  Ticket
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const BookingConfirmation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [route, setRoute] = useState<Route | null>(null);

  useEffect(() => {
    if (location.state?.booking && location.state?.route) {
      setBooking(location.state.booking);
      setRoute(location.state.route);
    } else {
      navigate('/');
    }
  }, [location.state, navigate]);

  const getBookingDetails = () => {
    if (!booking || !route) return '';

    return `🚐 HiaceGo ${t('booking.confirmation')}

📋 ${t('booking.bookingId')}: #${booking.id.slice(0, 8)}

🗺️ ${t('booking.route')}: ${route.origin} → ${route.destination}
📅 ${t('booking.date')}: ${route.date}
🕐 ${t('admin.departureTime')}: ${route.departure_time}

💺 ${t('booking.seats')}: ${booking.seats.join(', ')}
💰 ${t('booking.total')}: ${booking.total_price} ${t('common.currency')}

👤 ${t('booking.passenger')}: ${booking.passenger_name}
📧 ${t('booking.email')}: ${booking.passenger_email}

${t('booking.status')}: ${booking.status === 'pending' ? '⏳ ' + t('booking.pending') : '✅ ' + t('booking.confirmed')}

${t('booking.thankYou')}`;
  };

  const handleCopyDetails = async () => {
    try {
      await navigator.clipboard.writeText(getBookingDetails());
      toast.success(t('booking.copiedToClipboard'));
    } catch (error) {
      toast.error(t('booking.copyFailed'));
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(getBookingDetails());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `HiaceGo ${t('booking.confirmation')}`,
          text: getBookingDetails(),
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          handleCopyDetails();
        }
      }
    } else {
      handleCopyDetails();
    }
  };

  if (!booking || !route) {
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

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t('booking.bookingConfirmed')}</h1>
          <p className="text-muted-foreground">
            {t('booking.checkEmail')}
          </p>
        </div>

        {/* Booking Details Card */}
        <Card className="border-2 shadow-lg mb-6">
          <CardHeader className="border-b bg-primary text-primary-foreground">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Ticket className="w-5 h-5" />
                {t('booking.details')}
              </CardTitle>
              <Badge variant="secondary" className="bg-white/20 text-white">
                #{booking.id.slice(0, 8)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Route Info */}
            <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-lg text-foreground">
                  {route.origin} → {route.destination}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(route.date), 'MMM dd, yyyy')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {route.departure_time}
                  </span>
                </div>
              </div>
            </div>

            {/* Seats & Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">{t('booking.selectedSeats')}</div>
                <div className="flex gap-1 flex-wrap">
                  {booking.seats.map((seat) => (
                    <span
                      key={seat}
                      className="inline-flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded font-semibold"
                    >
                      {seat}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">{t('booking.totalPrice')}</div>
                <div className="text-2xl font-bold text-primary">{booking.total_price} {t('common.currency')}</div>
              </div>
            </div>

            {/* Passenger Info */}
            <div className="border-t pt-4">
              <div className="text-sm font-medium text-muted-foreground mb-3">{t('booking.passengerInfo')}</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-foreground">
                  <User className="w-4 h-4 text-muted-foreground" />
                  {booking.passenger_name}
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  {booking.passenger_phone}
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  {booking.passenger_email}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-500/10 rounded-lg border border-yellow-200 dark:border-yellow-500/20">
              <div>
                <div className="text-sm text-muted-foreground">{t('booking.bookingStatus')}</div>
                <div className="font-semibold text-yellow-700 dark:text-yellow-500">
                  {booking.status === 'pending' ? `⏳ ${t('booking.pendingConfirmation')}` : `✅ ${t('booking.confirmed')}`}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">{t('booking.paymentStatus')}</div>
                <div className="font-semibold text-yellow-700 dark:text-yellow-500">
                  {booking.is_paid ? `✅ ${t('booking.paid')}` : `💳 ${t('booking.payOnArrival')}`}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Share Actions */}
        <Card className="border-2 shadow-lg mb-6">
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground mb-3">{t('booking.shareDetails')}</div>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={handleShareWhatsApp}
                className="flex-col h-auto py-4 gap-2"
              >
                <MessageCircle className="w-5 h-5 text-green-600" />
                <span className="text-xs">WhatsApp</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleCopyDetails}
                className="flex-col h-auto py-4 gap-2"
              >
                <Copy className="w-5 h-5 text-primary" />
                <span className="text-xs">{t('common.copy')}</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex-col h-auto py-4 gap-2"
              >
                <Share2 className="w-5 h-5 text-primary" />
                <span className="text-xs">{t('common.share')}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => navigate('/profile')}
            className="flex-1 gap-2"
          >
            <Ticket className="w-4 h-4" />
            {t('booking.viewMyBookings')}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex-1 gap-2"
          >
            <Home className="w-4 h-4" />
            {t('nav.home')}
          </Button>
        </div>

        {/* Important Notes */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20">
          <h3 className="font-semibold text-blue-900 dark:text-blue-400 mb-2">📌 {t('booking.importantNotes')}</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
            <li>• {t('booking.arriveEarly')}</li>
            <li>• {t('booking.bringId')}</li>
            <li>• {t('booking.paymentNote')}</li>
            <li>• {t('booking.cancelNote')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
