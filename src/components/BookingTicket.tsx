import React from 'react';
import { Booking, Route } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Calendar, User, Phone, Mail, Armchair, Ticket } from 'lucide-react';
import { format } from 'date-fns';

interface BookingTicketProps {
  booking: Booking;
  route: Route;
  onClose: () => void;
}

const BookingTicket: React.FC<BookingTicketProps> = ({ booking, route, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg border-2 shadow-2xl overflow-hidden">
        {/* Ticket Header */}
        <div className="bg-primary text-primary-foreground p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Ticket className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
          </div>
          <p className="text-primary-foreground/80">Your ticket has been booked successfully</p>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Booking ID */}
          <div className="text-center pb-4 border-b border-dashed">
            <p className="text-sm text-muted-foreground">Booking ID</p>
            <p className="text-lg font-mono font-bold text-primary">#{booking.id}</p>
          </div>

          {/* Route Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>From</span>
                </div>
                <p className="font-semibold text-lg">{route.origin}</p>
              </div>
              <div className="text-2xl text-primary">→</div>
              <div className="flex-1 text-right">
                <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>To</span>
                </div>
                <p className="font-semibold text-lg">{route.destination}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium">{format(new Date(route.date), 'MMM dd, yyyy')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Departure</p>
                  <p className="font-medium">{route.departureTime}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Passenger Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Passenger Details</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>{booking.passenger.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{booking.passenger.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{booking.passenger.email}</span>
              </div>
            </div>
          </div>

          {/* Seats */}
          <div className="flex items-center justify-between py-4 border-y border-dashed">
            <div className="flex items-center gap-2">
              <Armchair className="w-5 h-5 text-primary" />
              <span className="font-medium">Seats</span>
            </div>
            <div className="flex gap-2">
              {booking.seats.map((seat) => (
                <span 
                  key={seat} 
                  className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm"
                >
                  {seat}
                </span>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between text-lg">
            <span className="font-medium">Total Amount</span>
            <span className="text-2xl font-bold text-primary">{booking.totalPrice} LE</span>
          </div>

          {/* Payment Status */}
          <div className="text-center py-2 px-4 rounded-lg bg-warning/10 border border-warning/20">
            <p className="text-sm text-warning font-medium">Payment pending - Pay at pickup point</p>
          </div>

          {/* Close Button */}
          <Button 
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Done
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingTicket;
