# Hiace Booking System

A complete React-based passenger booking system for Hiace vans with clean, reusable components.

## 🚀 Features

### User Side (Client)
- **Routes Page**: Browse available routes with filtering by origin, destination, and date
- **Seat Selection**: Interactive 12-seat Hiace van layout with real-time availability
- **Booking Flow**: Two-step booking process (seat selection → passenger information)
- **User Authentication**: Sign up and login system with LocalStorage persistence
- **Responsive Design**: Mobile and desktop optimized layouts

### Admin Dashboard
- **Booking Management**: View all bookings with status updates (Pending, Confirmed, Cancelled)
- **Route Management**: CRUD operations for routes (Create, Read, Delete)
- **Live Updates**: Real-time dashboard updates when new bookings arrive
- **Statistics**: Overview cards showing booking metrics

**Admin Login Credentials:**
- Email: `admin@bookbus.com`
- Password: `Admin#2025`

## 🧩 Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router DOM** for routing
- **Context API** for state management
- **LocalStorage** for data persistence
- **Sonner** for toast notifications
- **date-fns** for date formatting
- **shadcn/ui** component library

## 📦 Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components (Button, Input, Card, etc.)
│   ├── Navbar.tsx       # Navigation component
│   ├── RouteCard.tsx    # Route display card
│   └── SeatMap.tsx      # Interactive seat selection
├── contexts/
│   └── AuthContext.tsx  # Authentication state management
├── pages/
│   ├── Routes.tsx       # Browse and filter routes
│   ├── BookingFlow.tsx  # Seat selection and booking
│   ├── Auth.tsx         # Login and signup
│   └── AdminDashboard.tsx # Admin panel
├── services/
│   └── localStorage.ts  # LocalStorage management
├── types/
│   └── index.ts         # TypeScript interfaces
└── App.tsx              # Main app with routing
```

## 🎨 Design System

The project uses a professional travel-focused design:
- **Primary**: Deep blue/teal (`hsl(195 85% 35%)`)
- **Accent**: Warm orange (`hsl(25 95% 55%)`)
- **Gradients**: Smooth primary and accent gradients
- **Semantic Tokens**: All colors defined in design system (no hardcoded colors)

## 💾 LocalStorage Keys

- `hiace_booking_users` - User accounts
- `hiace_booking_routes` - Available routes
- `hiace_booking_bookings` - All bookings
- `hiace_booking_current_user` - Current session

## 🚦 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   ```
   http://localhost:8080
   ```

## 📝 Sample Data

The system initializes with sample routes:
- Alexandria → Dahab
- Cairo → Sharm El Sheikh
- Alexandria → Saint Catherine
- Cairo → El Tor

Each route includes:
- Departure/arrival times
- Pricing ($280-$400)
- Driver information
- Van details
- 12 available seats

## 🔐 Authentication

The system supports two types of users:

1. **Regular Users**: Can browse routes and make bookings
2. **Admin Users**: Full dashboard access with booking/route management

## 🎯 Key Features Explained

### Seat Map Component
- 3 rows × 4 seats layout (Hiace van configuration)
- Visual indicators for available, selected, and booked seats
- Real-time selection feedback
- Max seat limit enforcement

### Booking Flow
1. Select route from list
2. Choose seats on interactive map
3. Enter passenger details
4. Confirm booking
5. Instant toast notification

### Admin Dashboard
- Real-time booking notifications via custom events
- Status management (Pending → Confirmed/Cancelled)
- Route CRUD with form validation
- Statistics overview cards

## 🔄 Real-Time Updates

The system uses browser custom events for real-time updates:
- `bookingAdded` - Fired when new booking created
- `bookingUpdated` - Fired when booking status changes

## 🎨 Component Variants

All UI components use semantic design tokens:
- Buttons: `default`, `outline`, `ghost`
- Cards: Consistent border and shadow system
- Badges: Status-based colors (success, warning, destructive)

## 📱 Responsive Design

- Mobile-first approach
- Grid layouts with responsive breakpoints
- Touch-friendly interactive elements
- Collapsible navigation on mobile

## 🛠️ Future Backend Integration

The codebase is structured for easy backend integration:
1. Replace `localStorage.ts` service with API calls
2. Add JWT token management to AuthContext
3. Implement WebSocket for real-time updates
4. Add server-side validation

## 📄 License

This project was created as a demo booking system.

---

Built with ❤️ using React, TypeScript, and Tailwind CSS
