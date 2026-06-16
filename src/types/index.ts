// Strapi v5 Response Types
export interface StrapiItem<T> {
  id: number;
  attributes: T;
}

export interface StrapiResponse<T> {
  data: StrapiItem<T> | StrapiItem<T>[];
  meta?: Record<string, unknown>;
}

// Strapi User Type
export interface StrapiUser {
  username: string;
  email: string;
  provider?: string;
  confirmed?: boolean;
  blocked?: boolean;
  createdAt: string;
  updatedAt: string;
  role?: {
    id: number;
    name: string;
    description: string;
    type: string;
  };
}

// Trip Type (Strapi collection)
export interface Trip {
  date: string;
  time: string;
  direction: 'cairo_sinai' | 'sinai_cairo';
  vehicle_type: '12' | '13';
  is_extra: boolean;
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Stop Type (Strapi collection)
export interface Stop {
  name: string;
  region: 'cairo' | 'south_sinai';
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

// Booking Type (Strapi collection)
export interface Booking {
  booking_number: string;
  passenger_name: string;
  phone: string;
  seats: number[];
  total_price: number;
  screenshot?: {
    data: {
      id: number;
      attributes: {
        url: string;
        name: string;
        alternativeText?: string;
        caption?: string;
        width?: number;
        height?: number;
        formats?: Record<string, unknown>;
        hash: string;
        ext: string;
        mime: string;
        size: number;
        previewUrl?: string;
        provider: string;
        createdAt: string;
        updatedAt: string;
      };
    };
  };
  is_paid: boolean;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
  trip?: {
    data: StrapiItem<Trip>;
  };
  pickup_stop?: {
    data: StrapiItem<Stop>;
  };
  dropoff_stop?: {
    data: StrapiItem<Stop>;
  };
  user?: {
    data: {
      id: number;
      attributes: StrapiUser;
    };
  };
  createdAt?: string;
  updatedAt?: string;
}

// Private Trip Type (Strapi collection)
export interface PrivateTrip {
  name: string;
  phone: string;
  from_location: string;
  to_location: string;
  requested_date: string;
  notes?: string;
  status: 'new' | 'in_progress' | 'completed';
  createdAt?: string;
  updatedAt?: string;
}

// Gallery Item Type (Strapi collection)
export interface GalleryItem {
  image: {
    data: {
      id: number;
      attributes: {
        url: string;
        name: string;
        alternativeText?: string;
        caption?: string;
        width?: number;
        height?: number;
        formats?: Record<string, unknown>;
        hash: string;
        ext: string;
        mime: string;
        size: number;
        createdAt: string;
        updatedAt: string;
      };
    };
  };
  caption?: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

// Seat Type (UI component)
export interface Seat {
  number: number;
  isAvailable: boolean;
  isSelected?: boolean;
  price?: number;
}

// Passenger Type (form data)
export interface Passenger {
  name: string;
  phone: string;
  email: string;
  notes?: string;
}

// Booking Status Type
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

// Legacy types for backward compatibility with existing components
// These will be removed once all components are migrated
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

export interface FilterOptions {
  origin?: string;
  destination?: string;
  date?: string;
  minPrice?: number;
  maxPrice?: number;
}
