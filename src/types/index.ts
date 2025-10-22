export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface Route {
  id: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  totalSeats: number;
  date: string;
  driverName: string;
  vanNumber: string;
}

export interface Seat {
  number: number;
  isAvailable: boolean;
  isSelected?: boolean;
}

export interface Passenger {
  name: string;
  phone: string;
  email: string;
  notes?: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Booking {
  id: string;
  userId: string;
  routeId: string;
  seats: number[];
  passenger: Passenger;
  status: BookingStatus;
  totalPrice: number;
  createdAt: string;
  route?: Route;
}

export interface FilterOptions {
  origin?: string;
  destination?: string;
  date?: string;
  minPrice?: number;
  maxPrice?: number;
}
