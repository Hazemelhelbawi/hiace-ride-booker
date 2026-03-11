import React, { useRef } from "react";
import { Booking, Route } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Clock,
  Calendar,
  User,
  Phone,
  Mail,
  Armchair,
  Ticket,
  Printer,
  Download,
  X,
} from "lucide-react";
import { format } from "date-fns";

interface BookingTicketProps {
  booking: Booking;
  route: Route;
  onClose: () => void;
  pickupStopName?: string;
  dropoffStopName?: string;
}

const BookingTicket: React.FC<BookingTicketProps> = ({
  booking,
  route,
  onClose,
  pickupStopName,
  dropoffStopName,
}) => {
  const ticketRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = ticketRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Booking Ticket - #${booking.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
            .ticket { max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
            .ticket-header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 24px; text-align: center; }
            .ticket-header h2 { font-size: 24px; margin-bottom: 8px; }
            .ticket-header p { opacity: 0.9; }
            .ticket-body { padding: 24px; }
            .booking-id { text-align: center; padding-bottom: 16px; border-bottom: 2px dashed #e5e5e5; margin-bottom: 16px; }
            .booking-id span { color: #666; font-size: 14px; }
            .booking-id strong { display: block; font-size: 18px; color: #2563eb; font-family: monospace; }
            .route-info { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
            .route-point { flex: 1; }
            .route-point.right { text-align: right; }
            .route-point span { font-size: 12px; color: #666; display: block; margin-bottom: 4px; }
            .route-point strong { font-size: 18px; }
            .route-arrow { font-size: 24px; color: #2563eb; padding: 0 16px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
            .info-item span { font-size: 12px; color: #666; display: block; }
            .info-item strong { font-size: 14px; }
            .passenger-box { background: #f5f5f5; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
            .passenger-box h3 { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
            .passenger-box p { font-size: 14px; margin-bottom: 8px; }
            .seats-row { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; border-top: 2px dashed #e5e5e5; border-bottom: 2px dashed #e5e5e5; margin-bottom: 16px; }
            .seats-row span { font-weight: 600; }
            .seat-numbers { display: flex; gap: 8px; }
            .seat-number { width: 32px; height: 32px; background: #2563eb; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; }
            .total-row { display: flex; align-items: center; justify-content: space-between; font-size: 18px; margin-bottom: 16px; }
            .total-row strong { color: #2563eb; font-size: 24px; }
            .payment-status { text-align: center; padding: 12px; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; color: #92400e; font-size: 14px; }
            .payment-status.paid { background: #d1fae5; border-color: #34d399; color: #065f46; }
            @media print { body { background: white; padding: 0; } .ticket { box-shadow: none; } }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="ticket-header">
              <h2>🎫 Booking Confirmed!</h2>
              <p>Your ticket has been booked successfully</p>
            </div>
            <div class="ticket-body">
              <div class="booking-id">
                <span>Booking ID</span>
                <strong>#${booking.id}</strong>
              </div>
              <div class="route-info">
                <div class="route-point">
                  <span>From</span>
                  <strong>${route.origin}</strong>
                </div>
                <div class="route-arrow">→</div>
                <div class="route-point right">
                  <span>To</span>
                  <strong>${route.destination}</strong>
                </div>
               </div>
              ${pickupStopName ? `
              <div class="info-grid">
                <div class="info-item">
                  <span>Pickup Point</span>
                  <strong>${pickupStopName}</strong>
                </div>
                ${dropoffStopName ? `<div class="info-item"><span>Dropoff Point</span><strong>${dropoffStopName}</strong></div>` : ''}
              </div>
              ` : ''}
              <div class="info-grid">
                <div class="info-item">
                  <span>Date</span>
                  <strong>${format(new Date(route.date), "MMM dd, yyyy")}</strong>
                </div>
                <div class="info-item">
                  <span>Departure</span>
                  <strong>${route.departureTime}</strong>
                </div>
              </div>
              <div class="passenger-box">
                <h3>Passenger Details</h3>
                <p>👤 ${booking.passenger.name}</p>
                <p>📱 ${booking.passenger.phone}</p>
                <p>✉️ ${booking.passenger.email}</p>
              </div>
              <div class="seats-row">
                <span>Seats</span>
                <div class="seat-numbers">
                  ${booking.seats.map((seat) => `<div class="seat-number">${seat}</div>`).join("")}
                </div>
              </div>
              <div class="total-row">
                <span>Total Amount</span>
                <strong>${booking.totalPrice} LE</strong>
              </div>
              <div class="payment-status ${booking.isPaid ? "paid" : ""}">
                ${booking.isPaid ? "✅ Payment Confirmed" : "⏳ Payment pending - Pay at pickup point"}
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownload = () => {
    const ticketData = `
╔══════════════════════════════════════════════════╗
║            🎫 BOOKING CONFIRMATION               ║
╠══════════════════════════════════════════════════╣
║  Booking ID: #${booking.id.padEnd(34)}║
╠══════════════════════════════════════════════════╣
║  ROUTE DETAILS                                   ║
║  From: ${route.origin.padEnd(42)}║
║  To: ${route.destination.padEnd(44)}║
║  Date: ${format(new Date(route.date), "MMM dd, yyyy").padEnd(42)}║
║  Departure: ${route.departureTime.padEnd(37)}║
╠══════════════════════════════════════════════════╣
║  PASSENGER DETAILS                               ║
║  Name: ${booking.passenger.name.padEnd(42)}║
║  Phone: ${booking.passenger.phone.padEnd(41)}║
║  Email: ${booking.passenger.email.padEnd(41)}║
╠══════════════════════════════════════════════════╣
║  SEATS: ${booking.seats.join(", ").padEnd(41)}║
║  TOTAL: ${(booking.totalPrice + " LE").padEnd(41)}║
╠══════════════════════════════════════════════════╣
║  STATUS: ${(booking.isPaid ? "PAID ✓" : "PENDING PAYMENT").padEnd(40)}║
╚══════════════════════════════════════════════════╝
    `.trim();

    const blob = new Blob([ticketData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ticket-${booking.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card
        className="w-full max-w-lg border-2 shadow-2xl overflow-hidden"
        ref={ticketRef}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ticket Header */}
        <div className="bg-primary text-primary-foreground p-6 text-center relative">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Ticket className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
          </div>
          <p className="text-primary-foreground/80">
            Your ticket has been booked successfully
          </p>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Booking ID */}
          <div className="text-center pb-4 border-b border-dashed">
            <p className="text-sm text-muted-foreground">Booking ID</p>
            <p className="text-lg font-mono font-bold text-primary">
              #{booking.id}
            </p>
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

            {/* Pickup / Dropoff Stops */}
            {(pickupStopName || dropoffStopName) && (
              <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg border border-dashed">
                {pickupStopName && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Pickup Point</p>
                      <p className="font-medium text-sm">{pickupStopName}</p>
                    </div>
                  </div>
                )}
                {dropoffStopName && (
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Dropoff Point</p>
                      <p className="font-medium text-sm">{dropoffStopName}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {format(new Date(route.date), "MMM dd, yyyy")}
                  </p>
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
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Passenger Details
            </h3>
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
            <span className="text-2xl font-bold text-primary">
              {booking.totalPrice} LE
            </span>
          </div>

          {/* Payment Status */}
          <div
            className={`text-center py-2 px-4 rounded-lg ${booking.isPaid ? "bg-green-500/10 border border-green-500/20" : "bg-yellow-500/10 border border-yellow-500/20"}`}
          >
            <p
              className={`text-sm font-medium ${booking.isPaid ? "text-green-600" : "text-yellow-600"}`}
            >
              {booking.isPaid
                ? "✅ Payment Confirmed"
                : "Payment pending - Pay at pickup point"}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={handlePrint} variant="outline" className="gap-2">
              <Printer className="w-4 h-4" />
              Print
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
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
