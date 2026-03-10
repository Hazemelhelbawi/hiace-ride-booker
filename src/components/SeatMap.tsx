import React, { useState } from "react";
import { Seat } from "@/types";
import { cn } from "@/lib/utils";

interface SeatMapProps {
  seats: Seat[];
  onSeatSelect: (seatNumber: number) => void;
  maxSeats?: number;
  seatPrice?: number;
}

const SeatMap: React.FC<SeatMapProps> = ({
  seats,
  onSeatSelect,
  maxSeats = 14,
  seatPrice = 750,
}) => {
  const selectedCount = seats.filter((s) => s.isSelected).length;
  const [animatingSeat, setAnimatingSeat] = useState<number | null>(null);

  const handleSeatClick = (seat: Seat) => {
    if (!seat.isAvailable) return;

    if (!seat.isSelected && maxSeats && selectedCount >= maxSeats) {
      return;
    }

    setAnimatingSeat(seat.number);
    setTimeout(() => setAnimatingSeat(null), 300);

    onSeatSelect(seat.number);
  };

  const getSeat = (num: number): Seat | undefined =>
    seats.find((s) => s.number === num);

  const renderSeat = (seatNumber: number | null) => {
    if (seatNumber === null) {
      return <div className="w-14 h-18 sm:w-16 sm:h-20" />;
    }

    const seat = getSeat(seatNumber);
    if (!seat) return <div className="w-14 h-18 sm:w-16 sm:h-20" />;

    // Use seat.price if available (supports premium pricing), fallback to seatPrice
    const price = seat.price ?? seatPrice;
    const isAnimating = animatingSeat === seatNumber;

    return (
      <button
        onClick={() => handleSeatClick(seat)}
        disabled={!seat.isAvailable}
        className={cn(
          "w-14 h-18 sm:w-16 sm:h-20 rounded-lg relative border-2",
          "flex flex-col items-center justify-end pb-1",
          "transition-all duration-300 ease-out",
          "hover:scale-105 active:scale-95",
          isAnimating &&
            seat.isSelected &&
            "animate-[pulse_0.3s_ease-in-out] ring-4 ring-primary/50",
          isAnimating &&
            !seat.isSelected &&
            "animate-[bounce_0.3s_ease-in-out]",
          {
            "bg-white border-muted-foreground/30 hover:border-primary hover:shadow-lg cursor-pointer":
              seat.isAvailable && !seat.isSelected,
            "bg-primary/10 border-primary shadow-md shadow-primary/20":
              seat.isSelected,
            "bg-muted-foreground/20 border-muted-foreground/30 cursor-not-allowed opacity-60":
              !seat.isAvailable,
          },
        )}
        style={{
          transform: seat.isSelected ? "scale(1.02)" : undefined,
        }}
      >
        {/* Price badge */}
        <div
          className={cn(
            "absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold text-white",
            "transition-all duration-300",
            seat.isSelected
              ? "bg-primary scale-110"
              : seat.isAvailable
                ? "bg-primary"
                : "bg-muted-foreground",
          )}
        >
          {price}
        </div>

        {/* Seat icon */}
        <div
          className={cn(
            "flex-1 flex items-center justify-center transition-transform duration-300",
            seat.isSelected && "scale-105",
          )}
        >
          <svg viewBox="0 0 40 40" className="w-8 h-8 sm:w-10 sm:h-10">
            <rect
              x="5"
              y="2"
              width="30"
              height="20"
              rx="4"
              className={cn(
                "stroke-current stroke-2 transition-all duration-300",
                seat.isSelected
                  ? "text-primary fill-primary/20"
                  : seat.isAvailable
                    ? "text-muted-foreground fill-transparent"
                    : "text-muted-foreground/50 fill-transparent",
              )}
            />
            <rect
              x="3"
              y="22"
              width="34"
              height="12"
              rx="3"
              className={cn(
                "stroke-current stroke-2 transition-all duration-300",
                seat.isSelected
                  ? "text-primary fill-primary/20"
                  : seat.isAvailable
                    ? "text-muted-foreground fill-transparent"
                    : "text-muted-foreground/50 fill-transparent",
              )}
            />
          </svg>
        </div>

        {/* Seat number */}
        <span
          className={cn(
            "text-xs sm:text-sm font-semibold transition-all duration-300",
            seat.isSelected
              ? "text-primary scale-110"
              : seat.isAvailable
                ? "text-foreground"
                : "text-muted-foreground",
          )}
        >
          {seatNumber}
        </span>

        {/* Selection checkmark */}
        {seat.isSelected && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center animate-scale-in">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
      </button>
    );
  };

  const renderAisle = () => (
    <div className="w-14 h-18 sm:w-16 sm:h-20 flex items-center justify-center">
      <div className="w-8 h-12 sm:w-10 sm:h-14 rounded bg-muted-foreground/20" />
    </div>
  );

  const renderDriver = () => (
    <div className="w-14 h-18 sm:w-16 sm:h-20 rounded-lg border-2 border-muted-foreground/30 bg-muted flex items-center justify-center">
      <span className="text-xl sm:text-2xl">👨‍✈️</span>
    </div>
  );

  return (
    <div className="space-y-6" dir="ltr">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-white border-2 border-muted-foreground/30" />
            <span className="text-muted-foreground">Available</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-primary/10 border-2 border-primary" />
            <span className="text-muted-foreground">Selected</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-muted-foreground/20 border-2 border-muted-foreground/30" />
            <span className="text-muted-foreground">Booked</span>
          </div>
        </div>
        <div className="font-medium text-foreground">
          {selectedCount} / {maxSeats} selected
        </div>
      </div>

      <div className="bg-card p-3 sm:p-6 rounded-2xl border-2 border-primary/20 shadow-lg">
        <div className="h-2 bg-primary rounded-full mb-4 sm:mb-6" />

        {/* Seats layout - Toyota 14 seats (including seat 4) */}
        <div className="space-y-2 sm:space-y-3">
          {/* Row 1: Driver, empty, empty, Seat 1 (premium) */}
          <div className="flex justify-center gap-1.5 sm:gap-3">
            {renderDriver()}
            <div className="w-14 h-18 sm:w-16 sm:h-20" />
            <div className="w-14 h-18 sm:w-16 sm:h-20" />
            {renderSeat(1)}
          </div>

          {/* Row 2: Seat 2, Seat 3, aisle, Seat 4 */}
          <div className="flex justify-center gap-1.5 sm:gap-3">
            {renderSeat(2)}
            {renderSeat(3)}
            {renderSeat(4)}
            {renderAisle()}
          </div>

          {/* Row 3: Seat 5, Seat 6, empty, Seat 7 */}
          <div className="flex justify-center gap-1.5 sm:gap-3">
            {renderSeat(5)}
            {renderSeat(6)}
            <div className="w-14 h-18 sm:w-16 sm:h-20" />
            {renderSeat(7)}
          </div>

          {/* Row 4: Seat 8, Seat 9, empty, Seat 10 */}
          <div className="flex justify-center gap-1.5 sm:gap-3">
            {renderSeat(8)}
            {renderSeat(9)}
            <div className="w-14 h-18 sm:w-16 sm:h-20" />
            {renderSeat(10)}
          </div>

          {/* Row 5: Seat 11, Seat 12, aisle, Seat 14 */}
          <div className="flex justify-center gap-1.5 sm:gap-3">
            {renderSeat(11)}
            {renderSeat(12)}
            {renderAisle()}
            {renderSeat(14)}
          </div>
        </div>

        <div className="mt-4 sm:mt-6 flex justify-center">
          <div className="px-4 sm:px-6 py-2 bg-muted rounded-full text-xs text-muted-foreground font-medium">
            Rear of Van
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
