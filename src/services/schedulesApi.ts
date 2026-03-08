import { supabase } from '@/integrations/supabase/client';

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

// ─── Trip Schedules ───

export const getSchedules = async (): Promise<TripSchedule[]> => {
  const { data, error } = await supabase
    .from('trip_schedules')
    .select('*, route_template:route_templates(id, name, origin_region, destination_region)')
    .order('created_at', { ascending: false });
  if (error) { console.error('Error fetching schedules:', error); return []; }
  return (data || []).map(item => ({
    ...item,
    recurrence_type: item.recurrence_type as TripSchedule['recurrence_type'],
    route_template: item.route_template as unknown as TripSchedule['route_template'],
  }));
};

export const createSchedule = async (
  schedule: Omit<TripSchedule, 'id' | 'created_at' | 'updated_at' | 'route_template'>
): Promise<TripSchedule | null> => {
  const { data, error } = await supabase
    .from('trip_schedules')
    .insert([schedule])
    .select('*, route_template:route_templates(id, name, origin_region, destination_region)')
    .single();
  if (error) { console.error('Error creating schedule:', error); throw error; }
  return data as unknown as TripSchedule;
};

export const updateSchedule = async (
  id: string, updates: Partial<TripSchedule>
): Promise<TripSchedule | null> => {
  const { route_template, ...cleanUpdates } = updates as any;
  const { data, error } = await supabase
    .from('trip_schedules')
    .update(cleanUpdates)
    .eq('id', id)
    .select()
    .single();
  if (error) { console.error('Error updating schedule:', error); throw error; }
  return data as unknown as TripSchedule;
};

export const deleteSchedule = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('trip_schedules').delete().eq('id', id);
  if (error) { console.error('Error deleting schedule:', error); return false; }
  return true;
};

// ─── Schedule Stop Times ───

export const getScheduleStopTimes = async (scheduleId: string): Promise<ScheduleStopTime[]> => {
  const { data, error } = await supabase
    .from('schedule_stop_times')
    .select('*, stop:stops(id, name_en, name_ar, region)')
    .eq('schedule_id', scheduleId)
    .order('sequence_order');
  if (error) { console.error('Error fetching stop times:', error); return []; }
  return (data || []).map(item => ({
    ...item,
    stop: item.stop as unknown as ScheduleStopTime['stop'],
  }));
};

export const setScheduleStopTimes = async (
  scheduleId: string,
  stopTimes: { stop_id: string; arrival_time: string; departure_time: string | null; sequence_order: number }[]
): Promise<boolean> => {
  const { error: deleteError } = await supabase
    .from('schedule_stop_times')
    .delete()
    .eq('schedule_id', scheduleId);
  if (deleteError) { console.error('Error clearing stop times:', deleteError); return false; }

  if (stopTimes.length === 0) return true;

  const rows = stopTimes.map(s => ({ schedule_id: scheduleId, ...s }));
  const { error: insertError } = await supabase.from('schedule_stop_times').insert(rows);
  if (insertError) { console.error('Error setting stop times:', insertError); return false; }
  return true;
};

// ─── Trip Instances ───

export const getTripInstances = async (scheduleId?: string): Promise<TripInstance[]> => {
  let query = supabase
    .from('trip_instances')
    .select('*, schedule:trip_schedules(*, route_template:route_templates(id, name, origin_region, destination_region))')
    .order('trip_date', { ascending: true });
  if (scheduleId) query = query.eq('schedule_id', scheduleId);
  const { data, error } = await query;
  if (error) { console.error('Error fetching trip instances:', error); return []; }
  return (data || []).map(item => ({
    ...item,
    status: item.status as TripInstance['status'],
    schedule: item.schedule as unknown as TripSchedule,
  }));
};

export const generateTripInstances = async (scheduleId: string): Promise<number> => {
  // Fetch the schedule
  const { data: schedule, error: schedErr } = await supabase
    .from('trip_schedules')
    .select('*')
    .eq('id', scheduleId)
    .single();
  if (schedErr || !schedule) throw new Error('Schedule not found');

  const totalSeats = schedule.vehicle_count * schedule.seats_per_vehicle;
  const start = new Date(schedule.start_date);
  const end = new Date(schedule.end_date);
  const instances: { schedule_id: string; trip_date: string; available_seats: number; total_seats: number }[] = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay(); // 0=Sun ... 6=Sat
    let include = false;

    if (schedule.recurrence_type === 'daily') {
      include = true;
    } else if (schedule.recurrence_type === 'weekly' || schedule.recurrence_type === 'custom') {
      include = (schedule.weekdays || []).includes(dayOfWeek);
    }

    if (include) {
      instances.push({
        schedule_id: scheduleId,
        trip_date: d.toISOString().split('T')[0],
        available_seats: totalSeats,
        total_seats: totalSeats,
      });
    }
  }

  if (instances.length === 0) return 0;

  // Upsert to avoid duplicates
  const { error } = await supabase
    .from('trip_instances')
    .upsert(instances, { onConflict: 'schedule_id,trip_date', ignoreDuplicates: true });
  if (error) { console.error('Error generating trips:', error); throw error; }
  return instances.length;
};

export const updateTripInstance = async (
  id: string, updates: Partial<TripInstance>
): Promise<TripInstance | null> => {
  const { schedule, ...cleanUpdates } = updates as any;
  const { data, error } = await supabase
    .from('trip_instances')
    .update(cleanUpdates)
    .eq('id', id)
    .select()
    .single();
  if (error) { console.error('Error updating trip instance:', error); throw error; }
  return data as unknown as TripInstance;
};
