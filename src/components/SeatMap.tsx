import React from 'react';
import { Seat } from '@/types';
import { cn } from '@/lib/utils';

interface SeatMapProps {
  seats: Seat[];
  onSeatSelect: (seatNumber: number) => void;
  maxSeats?: number;
}

const SeatMap: React.FC<SeatMapProps> = ({ seats, onSeatSelect, maxSeats = 12 }) => {
  const selectedCount = seats.filter((s) => s.isSelected).length;

  const handleSeatClick = (seat: Seat) => {
    if (!seat.isAvailable) return;
    
    // Check if trying to select more than max
    if (!seat.isSelected && maxSeats && selectedCount >= maxSeats) {
      return;
    }
    
    onSeatSelect(seat.number);
  };

  // Organize seats in 3 rows of 4 (Hiace van layout)
  const rows = [];
  for (let i = 0; i < 3; i++) {
    rows.push(seats.slice(i * 4, (i + 1) * 4));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-muted border-2 border-border" />
            <span className="text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary border-2 border-primary" />
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

      <div className="bg-card p-8 rounded-2xl border-2 border-border shadow-lg">
        {/* Driver section */}
        <div className="mb-8 flex justify-start">
          <div className="w-16 h-16 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold shadow-md">
            Driver
          </div>
        </div>

        {/* Seats layout */}
        <div className="space-y-4">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-4">
              {row.map((seat) => (
                <button
                  key={seat.number}
                  onClick={() => handleSeatClick(seat)}
                  disabled={!seat.isAvailable}
                  className={cn(
                    'w-16 h-16 rounded-xl font-semibold text-sm transition-all duration-200',
                    'border-2 flex items-center justify-center',
                    'hover:scale-105 active:scale-95',
                    {
                      'bg-muted border-border hover:border-primary cursor-pointer':
                        seat.isAvailable && !seat.isSelected,
                      'bg-primary border-primary text-primary-foreground shadow-lg scale-105':
                        seat.isSelected,
                      'bg-muted-foreground/20 border-muted-foreground/30 cursor-not-allowed opacity-60':
                        !seat.isAvailable,
                    }
                  )}
                >
                  {seat.number}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Van rear indicator */}
        <div className="mt-8 flex justify-center">
          <div className="px-6 py-2 bg-muted rounded-full text-xs text-muted-foreground font-medium">
            Rear of Van
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
