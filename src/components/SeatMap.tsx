import React from 'react';
import { Seat } from '@/types';
import { cn } from '@/lib/utils';

interface SeatMapProps {
  seats: Seat[];
  onSeatSelect: (seatNumber: number) => void;
  maxSeats?: number;
  seatPrice?: number;
}

const SeatMap: React.FC<SeatMapProps> = ({ seats, onSeatSelect, maxSeats = 14, seatPrice = 750 }) => {
  const selectedCount = seats.filter((s) => s.isSelected).length;

  const handleSeatClick = (seat: Seat) => {
    if (!seat.isAvailable) return;
    
    if (!seat.isSelected && maxSeats && selectedCount >= maxSeats) {
      return;
    }
    
    onSeatSelect(seat.number);
  };

  // Get seat by number
  const getSeat = (num: number): Seat | undefined => seats.find(s => s.number === num);

  // Toyota 14-seat layout based on reference image
  // Row 0: Driver, empty, empty, Seat 1 (premium)
  // Row 1: Seat 2, Seat 3, aisle, empty
  // Row 2: Seat 5, Seat 6, empty, Seat 7
  // Row 3: Seat 8, Seat 9, empty, Seat 10
  // Row 4: Seat 11, Seat 12, aisle, Seat 14

  const renderSeat = (seatNumber: number | null, isPremium: boolean = false) => {
    if (seatNumber === null) {
      return <div className="w-16 h-20" />;
    }

    const seat = getSeat(seatNumber);
    if (!seat) return <div className="w-16 h-20" />;

    const price = isPremium ? seatPrice + 100 : seatPrice;

    return (
      <button
        onClick={() => handleSeatClick(seat)}
        disabled={!seat.isAvailable}
        className={cn(
          'w-16 h-20 rounded-lg relative transition-all duration-200 border-2',
          'flex flex-col items-center justify-end pb-1',
          'hover:scale-105 active:scale-95',
          {
            'bg-white border-muted-foreground/30 hover:border-primary cursor-pointer':
              seat.isAvailable && !seat.isSelected,
            'bg-primary/10 border-primary':
              seat.isSelected,
            'bg-muted-foreground/20 border-muted-foreground/30 cursor-not-allowed opacity-60':
              !seat.isAvailable,
          }
        )}
      >
        {/* Price badge */}
        <div className={cn(
          'absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-xs font-bold text-white',
          seat.isSelected ? 'bg-primary' : seat.isAvailable ? 'bg-primary' : 'bg-muted-foreground'
        )}>
          {price}
        </div>
        
        {/* Seat icon */}
        <div className="flex-1 flex items-center justify-center">
          <svg viewBox="0 0 40 40" className="w-10 h-10">
            {/* Seat back */}
            <rect 
              x="5" y="2" width="30" height="20" rx="4" 
              className={cn(
                'stroke-current stroke-2 fill-transparent',
                seat.isSelected ? 'text-primary' : seat.isAvailable ? 'text-muted-foreground' : 'text-muted-foreground/50'
              )}
            />
            {/* Seat bottom */}
            <rect 
              x="3" y="22" width="34" height="12" rx="3" 
              className={cn(
                'stroke-current stroke-2 fill-transparent',
                seat.isSelected ? 'text-primary' : seat.isAvailable ? 'text-muted-foreground' : 'text-muted-foreground/50'
              )}
            />
          </svg>
        </div>
        
        {/* Seat number */}
        <span className={cn(
          'text-sm font-semibold',
          seat.isSelected ? 'text-primary' : seat.isAvailable ? 'text-foreground' : 'text-muted-foreground'
        )}>
          {seatNumber}
        </span>
      </button>
    );
  };

  const renderAisle = () => (
    <div className="w-16 h-20 flex items-center justify-center">
      <div className="w-10 h-14 rounded bg-muted-foreground/20" />
    </div>
  );

  const renderDriver = () => (
    <div className="w-16 h-20 rounded-lg border-2 border-muted-foreground/30 bg-muted flex items-center justify-center">
      <span className="text-2xl">👨‍✈️</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white border-2 border-muted-foreground/30" />
            <span className="text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border-2 border-primary" />
            <span className="text-muted-foreground">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-muted-foreground/20 border-2 border-muted-foreground/30" />
            <span className="text-muted-foreground">Booked</span>
          </div>
        </div>
        <div className="font-medium text-foreground">
          {selectedCount} / {maxSeats} selected
        </div>
      </div>

      <div className="bg-card p-6 rounded-2xl border-2 border-primary/20 shadow-lg">
        {/* Red top bar like reference */}
        <div className="h-2 bg-primary rounded-full mb-6" />

        {/* Seats layout - Toyota 14 seats */}
        <div className="space-y-3">
          {/* Row 1: Driver, empty, empty, Seat 1 (premium) */}
          <div className="flex justify-center gap-3">
            {renderDriver()}
            <div className="w-16 h-20" />
            <div className="w-16 h-20" />
            {renderSeat(1, true)}
          </div>

          {/* Row 2: Seat 2, Seat 3, aisle, empty */}
          <div className="flex justify-center gap-3">
            {renderSeat(2)}
            {renderSeat(3)}
            {renderAisle()}
            <div className="w-16 h-20" />
          </div>

          {/* Row 3: Seat 5, Seat 6, empty, Seat 7 */}
          <div className="flex justify-center gap-3">
            {renderSeat(5)}
            {renderSeat(6)}
            <div className="w-16 h-20" />
            {renderSeat(7)}
          </div>

          {/* Row 4: Seat 8, Seat 9, empty, Seat 10 */}
          <div className="flex justify-center gap-3">
            {renderSeat(8)}
            {renderSeat(9)}
            <div className="w-16 h-20" />
            {renderSeat(10)}
          </div>

          {/* Row 5: Seat 11, Seat 12, aisle, Seat 14 */}
          <div className="flex justify-center gap-3">
            {renderSeat(11)}
            {renderSeat(12)}
            {renderAisle()}
            {renderSeat(14)}
          </div>
        </div>

        {/* Van rear indicator */}
        <div className="mt-6 flex justify-center">
          <div className="px-6 py-2 bg-muted rounded-full text-xs text-muted-foreground font-medium">
            Rear of Van
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
