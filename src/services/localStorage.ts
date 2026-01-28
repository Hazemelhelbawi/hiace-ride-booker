import { User, Route, Booking } from '@/types';

const STORAGE_KEYS = {
  USERS: 'hiace_booking_users',
  ROUTES: 'hiace_booking_routes',
  BOOKINGS: 'hiace_booking_bookings',
  CURRENT_USER: 'hiace_booking_current_user',
} as const;

// Initialize with sample data if empty
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.ROUTES)) {
    const sampleRoutes: Route[] = [
      {
        id: '1',
        origin: 'Alexandria',
        destination: 'Dahab',
        departureTime: '08:00',
        arrivalTime: '16:00',
        price: 750,
        availableSeats: 14,
        totalSeats: 14,
        date: new Date().toISOString().split('T')[0],
        driverName: 'Ahmed Hassan',
        vanNumber: 'ABC-1234',
      },
      {
        id: '2',
        origin: 'Cairo',
        destination: 'Sharm El Sheikh',
        departureTime: '09:00',
        arrivalTime: '15:00',
        price: 650,
        availableSeats: 14,
        totalSeats: 14,
        date: new Date().toISOString().split('T')[0],
        driverName: 'Mohamed Ali',
        vanNumber: 'XYZ-5678',
      },
      {
        id: '3',
        origin: 'Alexandria',
        destination: 'Saint Catherine',
        departureTime: '07:00',
        arrivalTime: '15:00',
        price: 850,
        availableSeats: 14,
        totalSeats: 14,
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        driverName: 'Ibrahim Sayed',
        vanNumber: 'DEF-9012',
      },
      {
        id: '4',
        origin: 'Cairo',
        destination: 'El Tor',
        departureTime: '10:00',
        arrivalTime: '16:00',
        price: 600,
        availableSeats: 14,
        totalSeats: 14,
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        driverName: 'Khaled Mahmoud',
        vanNumber: 'GHI-3456',
      },
    ];
    localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(sampleRoutes));
  }

  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const adminUser: User = {
      id: 'admin',
      email: 'admin@bookbus.com',
      name: 'Admin User',
      phone: '+20 100 000 0000',
      isAdmin: true,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([adminUser]));
  }
};

// Users
export const getUsers = (): User[] => {
  initializeStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
};

export const addUser = (user: User): void => {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const getUserByEmail = (email: string): User | undefined => {
  return getUsers().find((u) => u.email === email);
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return userStr ? JSON.parse(userStr) : null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

// Routes
export const getRoutes = (): Route[] => {
  initializeStorage();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.ROUTES) || '[]');
};

export const addRoute = (route: Route): void => {
  const routes = getRoutes();
  routes.push(route);
  localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(routes));
};

export const updateRoute = (id: string, updates: Partial<Route>): void => {
  const routes = getRoutes();
  const index = routes.findIndex((r) => r.id === id);
  if (index !== -1) {
    routes[index] = { ...routes[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(routes));
  }
};

export const deleteRoute = (id: string): void => {
  const routes = getRoutes().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(routes));
};

export const getRouteById = (id: string): Route | undefined => {
  return getRoutes().find((r) => r.id === id);
};

// Bookings
export const getBookings = (): Booking[] => {
  initializeStorage();
  const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
  // Enrich with route data
  return bookings.map((booking: Booking) => ({
    ...booking,
    route: getRouteById(booking.routeId),
  }));
};

export const addBooking = (booking: Booking): void => {
  const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
  bookings.push(booking);
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

  // Update route available seats
  const route = getRouteById(booking.routeId);
  if (route) {
    updateRoute(booking.routeId, {
      availableSeats: route.availableSeats - booking.seats.length,
    });
  }

  // Dispatch custom event for real-time updates
  window.dispatchEvent(new CustomEvent('bookingAdded', { detail: booking }));
};

export const updateBooking = (id: string, updates: Partial<Booking>): void => {
  const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
  const index = bookings.findIndex((b: Booking) => b.id === id);
  if (index !== -1) {
    bookings[index] = { ...bookings[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    window.dispatchEvent(new CustomEvent('bookingUpdated', { detail: bookings[index] }));
  }
};

export const cancelBooking = (id: string): Booking | null => {
  const bookings = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
  const index = bookings.findIndex((b: Booking) => b.id === id);
  
  if (index === -1) return null;
  
  const booking = bookings[index];
  
  // Only allow cancellation if not already cancelled
  if (booking.status === 'cancelled') return null;
  
  // Update booking status
  bookings[index] = { ...booking, status: 'cancelled' };
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  
  // Restore seats to the route
  const route = getRouteById(booking.routeId);
  if (route) {
    updateRoute(booking.routeId, {
      availableSeats: route.availableSeats + booking.seats.length,
    });
  }
  
  window.dispatchEvent(new CustomEvent('bookingCancelled', { detail: bookings[index] }));
  
  return { ...bookings[index], route };
};

export const getUserBookings = (userId: string): Booking[] => {
  return getBookings().filter((b) => b.userId === userId);
};

export const getBookedSeats = (routeId: string): number[] => {
  const bookings = getBookings();
  const confirmedBookings = bookings.filter(
    (b) => b.routeId === routeId && b.status !== 'cancelled'
  );
  return confirmedBookings.flatMap((b) => b.seats);
};
