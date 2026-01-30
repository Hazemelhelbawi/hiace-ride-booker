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

    // Trigger animation
    setAnimatingSeat(seat.number);
    setTimeout(() => setAnimatingSeat(null), 300);

    onSeatSelect(seat.number);
  };

  // Get seat by number
  const getSeat = (num: number): Seat | undefined =>
    seats.find((s) => s.number === num);

  // Toyota 14-seat layout based on reference image
  // Row 0: Driver, empty, empty, Seat 1 (premium)
  // Row 1: Seat 2, Seat 3, aisle, empty
  // Row 2: Seat 5, Seat 6, empty, Seat 7
  // Row 3: Seat 8, Seat 9, empty, Seat 10
  // Row 4: Seat 11, Seat 12, aisle, Seat 14

  const renderSeat = (
    seatNumber: number | null,
    // isPremium: boolean = false,
  ) => {
    if (seatNumber === null) {
      return <div className="w-16 h-20" />;
    }

    const seat = getSeat(seatNumber);
    if (!seat) return <div className="w-16 h-20" />;

    const price = seatPrice;
    // const price = isPremium ? seatPrice + 100 : seatPrice;
    const isAnimating = animatingSeat === seatNumber;

    return (
      <button
        onClick={() => handleSeatClick(seat)}
        disabled={!seat.isAvailable}
        className={cn(
          "w-16 h-20 rounded-lg relative border-2",
          "flex flex-col items-center justify-end pb-1",
          "transition-all duration-300 ease-out",
          "hover:scale-105 active:scale-95",
          // Animation classes
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
        {/* Price badge with animation */}
        <div
          className={cn(
            "absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-xs font-bold text-white",
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

        {/* Seat icon with smooth color transition */}
        <div
          className={cn(
            "flex-1 flex items-center justify-center transition-transform duration-300",
            seat.isSelected && "scale-105",
          )}
        >
          <svg viewBox="0 0 40 40" className="w-10 h-10">
            {/* Seat back */}
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
            {/* Seat bottom */}
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

        {/* Seat number with transition */}
        <span
          className={cn(
            "text-sm font-semibold transition-all duration-300",
            seat.isSelected
              ? "text-primary scale-110"
              : seat.isAvailable
                ? "text-foreground"
                : "text-muted-foreground",
          )}
        >
          {seatNumber}
        </span>

        {/* Selection checkmark animation */}
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
            {renderSeat(1)}
            {/* {renderSeat(1, true)} */}
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
