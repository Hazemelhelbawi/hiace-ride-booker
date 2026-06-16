// Stub for trip schedules - not part of initial Strapi migration
// The core Strapi collections (trips, stops, bookings) handle basic functionality
// Advanced scheduling features would require custom Strapi collections

export interface TripSchedule {
  id: string;
  route_template_id: string;
  title: string;
  start_date: string;
  end_date: string;
  recurrence_type: 'daily' | 'weekly' | 'custom';
  weekdays: number[];
  vehicle_count: number;
  seats_per_vehicle: number;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  route_template?: {
    id: string;
    name: string;
    origin_region: string;
    destination_region: string;
  };
}

export interface ScheduleStopTime {
  id: string;
  schedule_id: string;
  stop_id: string;
  arrival_time: string;
  departure_time: string | null;
  sequence_order: number;
  created_at: string;
  stop?: {
    id: string;
    name_en: string;
    name_ar: string;
    region: string;
  };
}

export interface TripInstance {
  id: string;
  schedule_id: string;
  trip_date: string;
  available_seats: number;
  total_seats: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  schedule?: TripSchedule;
}

// All functions are stubs - not implemented in Strapi migration
export const getSchedules = async (): Promise<TripSchedule[]> => {
  console.warn('Schedules not implemented in Strapi migration');
  return [];
};

export const createSchedule = async (
  schedule: Omit<TripSchedule, 'id' | 'created_at' | 'updated_at' | 'route_template'>
): Promise<TripSchedule | null> => {
  console.warn('Schedules not implemented in Strapi migration');
  return null;
};

export const updateSchedule = async (
  id: string, updates: Partial<TripSchedule>
): Promise<TripSchedule | null> => {
  console.warn('Schedules not implemented in Strapi migration');
  return null;
};

export const deleteSchedule = async (id: string): Promise<boolean> => {
  console.warn('Schedules not implemented in Strapi migration');
  return false;
};

export const getScheduleStopTimes = async (scheduleId: string): Promise<ScheduleStopTime[]> => {
  console.warn('Schedule stop times not implemented in Strapi migration');
  return [];
};

export const setScheduleStopTimes = async (
  scheduleId: string,
  stopTimes: { stop_id: string; arrival_time: string; departure_time: string | null; sequence_order: number }[]
): Promise<boolean> => {
  console.warn('Schedule stop times not implemented in Strapi migration');
  return false;
};

export const getTripInstances = async (scheduleId?: string): Promise<TripInstance[]> => {
  console.warn('Trip instances not implemented in Strapi migration');
  return [];
};

export const generateTripInstances = async (scheduleId: string): Promise<number> => {
  console.warn('Trip instance generation not implemented in Strapi migration');
  return 0;
};

export const updateTripInstance = async (
  id: string, updates: Partial<TripInstance>
): Promise<TripInstance | null> => {
  console.warn('Trip instances not implemented in Strapi migration');
  return null;
};
