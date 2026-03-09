import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/services/schedulesApi';
import type { TripSchedule, TripInstance } from '@/services/schedulesApi';

export const useSchedules = () => {
  return useQuery({
    queryKey: ['trip-schedules'],
    queryFn: api.getSchedules,
  });
};

export const useCreateSchedule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (s: Omit<TripSchedule, 'id' | 'created_at' | 'updated_at' | 'route_template'>) =>
      api.createSchedule(s),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trip-schedules'] }),
  });
};

export const useUpdateSchedule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<TripSchedule> }) =>
      api.updateSchedule(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trip-schedules'] }),
  });
};

export const useDeleteSchedule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteSchedule(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['trip-schedules'] });
      const previousSchedules = qc.getQueryData<TripSchedule[]>(['trip-schedules']);
      qc.setQueryData<TripSchedule[]>(['trip-schedules'], (old) =>
        old?.filter(schedule => schedule.id !== id) ?? []
      );
      return { previousSchedules };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trip-schedules'] }),
    onError: (_err, _id, context) => {
      if (context?.previousSchedules) {
        qc.setQueryData(['trip-schedules'], context.previousSchedules);
      }
    },
  });
};

export const useScheduleStopTimes = (scheduleId: string | undefined) => {
  return useQuery({
    queryKey: ['schedule-stop-times', scheduleId],
    queryFn: () => scheduleId ? api.getScheduleStopTimes(scheduleId) : [],
    enabled: !!scheduleId,
  });
};

export const useSetScheduleStopTimes = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ scheduleId, stopTimes }: {
      scheduleId: string;
      stopTimes: { stop_id: string; arrival_time: string; departure_time: string | null; sequence_order: number }[];
    }) => api.setScheduleStopTimes(scheduleId, stopTimes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['schedule-stop-times'] }),
  });
};

export const useTripInstances = (scheduleId?: string) => {
  return useQuery({
    queryKey: ['trip-instances', scheduleId],
    queryFn: () => api.getTripInstances(scheduleId),
  });
};

export const useGenerateTripInstances = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (scheduleId: string) => api.generateTripInstances(scheduleId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trip-instances'] }),
  });
};

export const useUpdateTripInstance = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<TripInstance> }) =>
      api.updateTripInstance(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trip-instances'] }),
  });
};
