// Strapi v5 REST API Service
const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';

// Strapi v5 Response Types
interface StrapiItem<T> {
  id: number;
  attributes: T;
}

interface StrapiResponse<T> {
  data: StrapiItem<T> | StrapiItem<T>[];
  meta?: Record<string, unknown>;
}

// API Interfaces
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

export interface Stop {
  name: string;
  region: 'cairo' | 'south_sinai';
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

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

// Helper to handle Strapi errors
const handleError = (error: unknown): never => {
  console.error('Strapi API Error:', error);
  throw error;
};

// Authentication
export const registerUser = async (data: {
  username: string;
  email: string;
  password: string;
}): Promise<{ jwt: string; user: StrapiUser }> => {
  try {
    const response = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return await response.json();
  } catch (error) {
    return handleError(error);
  }
};

export const loginUser = async (
  identifier: string,
  password: string
): Promise<{ jwt: string; user: StrapiUser }> => {
  try {
    const response = await fetch(`${STRAPI_URL}/api/auth/local`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifier, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return await response.json();
  } catch (error) {
    return handleError(error);
  }
};

export const getMe = async (token: string): Promise<StrapiUser> => {
  try {
    const response = await fetch(`${STRAPI_URL}/api/users/me?populate=role`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    return await response.json();
  } catch (error) {
    return handleError(error);
  }
};

// Stops
export const getStops = async (region?: 'cairo' | 'south_sinai'): Promise<StrapiItem<Stop>[]> => {
  try {
    let url = `${STRAPI_URL}/api/stops?sort=order:asc`;
    if (region) {
      url += `&filters[region][$eq]=${region}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch stops');
    }

    const result: StrapiResponse<Stop> = await response.json();
    return Array.isArray(result.data) ? result.data : [result.data];
  } catch (error) {
    return handleError(error);
  }
};

// Trips
export const getTrips = async (params?: {
  direction?: 'cairo_sinai' | 'sinai_cairo';
  date?: string;
}): Promise<StrapiItem<Trip>[]> => {
  try {
    let url = `${STRAPI_URL}/api/trips?populate=*&filters[is_active][$eq]=true`;
    
    if (params?.direction) {
      url += `&filters[direction][$eq]=${params.direction}`;
    }
    if (params?.date) {
      url += `&filters[date][$eq]=${params.date}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch trips');
    }

    const result: StrapiResponse<Trip> = await response.json();
    return Array.isArray(result.data) ? result.data : [result.data];
  } catch (error) {
    return handleError(error);
  }
};

// Bookings
export const getBookedSeats = async (tripId: number): Promise<number[]> => {
  try {
    const response = await fetch(
      `${STRAPI_URL}/api/bookings?filters[trip][id][$eq]=${tripId}&filters[status][$ne]=cancelled&populate=*`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch booked seats');
    }

    const result: StrapiResponse<Booking> = await response.json();
    const bookings = Array.isArray(result.data) ? result.data : [result.data];
    
    // Flatten all seat arrays from all non-cancelled bookings
    return bookings.flatMap(booking => booking.attributes.seats || []);
  } catch (error) {
    console.error('Error fetching booked seats:', error);
    return [];
  }
};

// Upload file helper
const uploadFile = async (file: File, token: string): Promise<number> => {
  try {
    const formData = new FormData();
    formData.append('files', file);

    const response = await fetch(`${STRAPI_URL}/api/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('File upload failed');
    }

    const result = await response.json();
    return result[0].id;
  } catch (error) {
    return handleError(error);
  }
};

export const createBooking = async (
  data: {
    trip: number;
    passenger_name: string;
    phone: string;
    seats: number[];
    total_price: number;
    pickup_stop?: number;
    dropoff_stop?: number;
    notes?: string;
  },
  token: string,
  screenshotFile?: File
): Promise<StrapiItem<Booking>> => {
  try {
    let screenshotId: number | undefined;
    
    // Upload screenshot if provided
    if (screenshotFile) {
      screenshotId = await uploadFile(screenshotFile, token);
    }

    // Generate booking number
    const bookingNumber = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const bookingData: Record<string, unknown> = {
      booking_number: bookingNumber,
      passenger_name: data.passenger_name,
      phone: data.phone,
      seats: data.seats,
      total_price: data.total_price,
      trip: data.trip,
      is_paid: false,
      status: 'pending',
    };

    if (data.pickup_stop) bookingData.pickup_stop = data.pickup_stop;
    if (data.dropoff_stop) bookingData.dropoff_stop = data.dropoff_stop;
    if (data.notes) bookingData.notes = data.notes;
    if (screenshotId) bookingData.screenshot = screenshotId;

    const response = await fetch(`${STRAPI_URL}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data: bookingData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create booking');
    }

    const result: StrapiResponse<Booking> = await response.json();
    return Array.isArray(result.data) ? result.data[0] : result.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getMyBookings = async (token: string): Promise<StrapiItem<Booking>[]> => {
  try {
    const response = await fetch(
      `${STRAPI_URL}/api/bookings?populate=*&filters[user][id][$eq]=me&sort=createdAt:desc`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch bookings');
    }

    const result: StrapiResponse<Booking> = await response.json();
    return Array.isArray(result.data) ? result.data : [result.data];
  } catch (error) {
    return handleError(error);
  }
};

export const cancelBooking = async (id: number, token: string): Promise<StrapiItem<Booking>> => {
  try {
    const response = await fetch(`${STRAPI_URL}/api/bookings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: {
          status: 'cancelled',
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to cancel booking');
    }

    const result: StrapiResponse<Booking> = await response.json();
    return Array.isArray(result.data) ? result.data[0] : result.data;
  } catch (error) {
    return handleError(error);
  }
};

// Admin endpoints
export const getAllBookings = async (token: string): Promise<StrapiItem<Booking>[]> => {
  try {
    const response = await fetch(
      `${STRAPI_URL}/api/bookings?populate=*&sort=createdAt:desc`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch all bookings');
    }

    const result: StrapiResponse<Booking> = await response.json();
    return Array.isArray(result.data) ? result.data : [result.data];
  } catch (error) {
    return handleError(error);
  }
};

export const updateBookingStatus = async (
  id: number,
  status: 'pending' | 'confirmed' | 'cancelled',
  token: string
): Promise<StrapiItem<Booking>> => {
  try {
    const response = await fetch(`${STRAPI_URL}/api/bookings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: { status },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update booking status');
    }

    const result: StrapiResponse<Booking> = await response.json();
    return Array.isArray(result.data) ? result.data[0] : result.data;
  } catch (error) {
    return handleError(error);
  }
};

export const toggleBookingPaid = async (
  id: number,
  is_paid: boolean,
  token: string
): Promise<StrapiItem<Booking>> => {
  try {
    const response = await fetch(`${STRAPI_URL}/api/bookings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: { is_paid },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to toggle paid status');
    }

    const result: StrapiResponse<Booking> = await response.json();
    return Array.isArray(result.data) ? result.data[0] : result.data;
  } catch (error) {
    return handleError(error);
  }
};

// Private Trips
export const getAllPrivateTrips = async (token: string): Promise<StrapiItem<PrivateTrip>[]> => {
  try {
    const response = await fetch(
      `${STRAPI_URL}/api/private-trips?sort=createdAt:desc`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch private trips');
    }

    const result: StrapiResponse<PrivateTrip> = await response.json();
    return Array.isArray(result.data) ? result.data : [result.data];
  } catch (error) {
    return handleError(error);
  }
};

export const createPrivateTrip = async (data: {
  name: string;
  phone: string;
  from_location: string;
  to_location: string;
  requested_date: string;
  notes?: string;
}): Promise<StrapiItem<PrivateTrip>> => {
  try {
    const response = await fetch(`${STRAPI_URL}/api/private-trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          ...data,
          status: 'new',
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create private trip');
    }

    const result: StrapiResponse<PrivateTrip> = await response.json();
    return Array.isArray(result.data) ? result.data[0] : result.data;
  } catch (error) {
    return handleError(error);
  }
};

// Gallery
export const getGallery = async (): Promise<StrapiItem<GalleryItem>[]> => {
  try {
    const response = await fetch(
      `${STRAPI_URL}/api/galleries?populate=image&sort=order:asc`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch gallery');
    }

    const result: StrapiResponse<GalleryItem> = await response.json();
    return Array.isArray(result.data) ? result.data : [result.data];
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return [];
  }
};

// Admin Trips Management
export const getAllTripsAdmin = async (token: string): Promise<StrapiItem<Trip>[]> => {
  try {
    const response = await fetch(`${STRAPI_URL}/api/trips?populate=*&sort=date:desc`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch trips');
    }

    const result: StrapiResponse<Trip> = await response.json();
    return Array.isArray(result.data) ? result.data : [result.data];
  } catch (error) {
    return handleError(error);
  }
};

export const createTrip = async (
  data: {
    date: string;
    time: string;
    direction: 'cairo_sinai' | 'sinai_cairo';
    vehicle_type: '12' | '13';
    is_extra?: boolean;
  },
  token: string
): Promise<StrapiItem<Trip>> => {
  try {
    const response = await fetch(`${STRAPI_URL}/api/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: {
          ...data,
          is_extra: data.is_extra || false,
          is_active: true,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create trip');
    }

    const result: StrapiResponse<Trip> = await response.json();
    return Array.isArray(result.data) ? result.data[0] : result.data;
  } catch (error) {
    return handleError(error);
  }
};

export const toggleTripActive = async (
  id: number,
  is_active: boolean,
  token: string
): Promise<StrapiItem<Trip>> => {
  try {
    const response = await fetch(`${STRAPI_URL}/api/trips/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        data: { is_active },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to toggle trip active status');
    }

    const result: StrapiResponse<Trip> = await response.json();
    return Array.isArray(result.data) ? result.data[0] : result.data;
  } catch (error) {
    return handleError(error);
  }
};

// Export STRAPI_URL for use in components
export { STRAPI_URL };
