import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, MapPin, Users, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Route, Booking } from '@/services/api';

interface BookingCalendarProps {
  routes: Route[];
  bookings: Booking[];
}

interface DayData {
  date: Date;
  routes: Route[];
  bookings: Booking[];
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ routes, bookings }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the day of week for the first day (0 = Sunday, 6 = Saturday)
  const startDayOfWeek = monthStart.getDay();
  
  // Create padding days for the calendar grid
  const paddingDays = Array(startDayOfWeek).fill(null);

  const dayData = useMemo((): Map<string, DayData> => {
    const data = new Map<string, DayData>();
    
    daysInMonth.forEach(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayRoutes = routes.filter(route => route.date === dateStr);
      const routeIds = dayRoutes.map(r => r.id);
      const dayBookings = bookings.filter(booking => routeIds.includes(booking.route_id));
      
      data.set(dateStr, {
        date,
        routes: dayRoutes,
        bookings: dayBookings,
      });
    });
    
    return data;
  }, [daysInMonth, routes, bookings]);

  const selectedDayData = useMemo(() => {
    if (!selectedDate) return null;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return dayData.get(dateStr) || { date: selectedDate, routes: [], bookings: [] };
  }, [selectedDate, dayData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success text-success-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'cancelled':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getRouteForBooking = (booking: Booking): Route | undefined => {
    return routes.find((r) => r.id === booking.route_id);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Grid */}
      <Card className="lg:col-span-2 border-2 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentMonth(new Date());
                setSelectedDate(new Date());
              }}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for padding */}
            {paddingDays.map((_, index) => (
              <div key={`padding-${index}`} className="h-24 bg-muted/20 rounded-lg" />
            ))}

            {/* Day cells */}
            {daysInMonth.map(date => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const data = dayData.get(dateStr);
              const routeCount = data?.routes.length || 0;
              const bookingCount = data?.bookings.length || 0;
              const isSelected = selectedDate && isSameDay(date, selectedDate);
              const isCurrentDay = isToday(date);

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "h-24 p-2 rounded-lg border-2 transition-all duration-200 flex flex-col",
                    "hover:border-primary/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50",
                    isSelected 
                      ? "border-primary bg-primary/5 shadow-md" 
                      : "border-transparent bg-card",
                    isCurrentDay && !isSelected && "bg-accent/50",
                    routeCount > 0 && "bg-primary/5"
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-medium self-start",
                      isCurrentDay && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center",
                      !isSameMonth(date, currentMonth) && "text-muted-foreground"
                    )}
                  >
                    {format(date, 'd')}
                  </span>
                  
                  {routeCount > 0 && (
                    <div className="mt-auto space-y-1">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-primary" />
                        <span className="text-xs font-medium text-primary">
                          {routeCount} {routeCount === 1 ? 'route' : 'routes'}
                        </span>
                      </div>
                      {bookingCount > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-success" />
                          <span className="text-xs text-success">
                            {bookingCount} {bookingCount === 1 ? 'booking' : 'bookings'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Day Details Panel */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">
            {selectedDate 
              ? format(selectedDate, 'EEEE, MMMM d, yyyy')
              : 'Select a date'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedDate ? (
            <p className="text-muted-foreground text-sm">
              Click on a date to see routes and bookings
            </p>
          ) : selectedDayData ? (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {/* Routes Section */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Routes ({selectedDayData.routes.length})
                  </h4>
                  {selectedDayData.routes.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No routes scheduled</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedDayData.routes.map(route => (
                        <div
                          key={route.id}
                          className="p-3 bg-muted/50 rounded-lg border"
                        >
                          <div className="font-medium text-sm">
                            {route.origin} → {route.destination}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {route.departure_time} - {route.arrival_time}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs">
                              {route.available_seats}/{route.total_seats} seats available
                            </span>
                            <span className="text-xs font-medium text-primary">
                              {route.price} EGP
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bookings Section */}
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Bookings ({selectedDayData.bookings.length})
                  </h4>
                  {selectedDayData.bookings.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No bookings for this date</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedDayData.bookings.map(booking => {
                        const route = getRouteForBooking(booking);
                        return (
                          <div
                            key={booking.id}
                            className="p-3 bg-muted/50 rounded-lg border"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">
                                {booking.passenger_name}
                              </span>
                              <Badge className={cn("text-xs", getStatusColor(booking.status))}>
                                {booking.status}
                              </Badge>
                            </div>
                            {route && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {route.origin} → {route.destination}
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">
                                Seats: {booking.seats.join(', ')}
                              </span>
                              <span className="text-xs font-medium">
                                {booking.total_price} EGP
                                {booking.is_paid && (
                                  <span className="ml-1 text-success">(Paid)</span>
                                )}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingCalendar;
