import React from 'react';
import { Route } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { MapPin, Clock, Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface RouteCardProps {
  route: Route;
  onBook: (route: Route) => void;
}

const RouteCard: React.FC<RouteCardProps> = ({ route, onBook }) => {
  const formattedDate = format(new Date(route.date), 'MMM dd, yyyy');

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-primary group">
      <div className="h-2 bg-primary group-hover:h-3 transition-all duration-300" />
      <CardContent className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">{formattedDate}</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-primary flex-shrink-0" />
                <span className="font-bold text-xl text-foreground">{route.origin}</span>
              </div>
              <div className="h-8 w-0.5 bg-border ml-1.5" />
              <div className="flex items-center gap-3">
                <MapPin className="w-3 h-3 text-primary flex-shrink-0" />
                <span className="font-bold text-xl text-foreground">{route.destination}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">
              ${route.price}
            </div>
            <div className="text-xs text-muted-foreground">per seat</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="font-semibold text-foreground">{route.departureTime}</div>
              <div className="text-xs text-muted-foreground">Departure</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <div>
              <div className="font-semibold text-foreground">
                {route.availableSeats} / {route.totalSeats}
              </div>
              <div className="text-xs text-muted-foreground">Available</div>
            </div>
          </div>
        </div>

        <div className="pt-2 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Driver:</span>
            <span className="font-medium text-foreground">{route.driverName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Van:</span>
            <span className="font-medium text-foreground">{route.vanNumber}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button
          onClick={() => onBook(route)}
          disabled={route.availableSeats === 0}
          className="w-full h-12 text-base font-bold bg-primary hover:bg-primary-dark text-white transition-all"
        >
          {route.availableSeats === 0 ? 'Fully Booked' : 'Book Now'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RouteCard;
