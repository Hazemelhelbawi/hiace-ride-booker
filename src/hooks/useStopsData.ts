import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '@/services/stopsApi';
import type { Stop, RouteTemplate, StopRole } from '@/services/stopsApi';

// ─── Stops ───

export const useStops = (includeInactive = false) => {
  return useQuery({
    queryKey: ['stops', { includeInactive }],
    queryFn: () => api.getStops(includeInactive),
  });
};

export const useCreateStop = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (stop: Omit<Stop, 'id' | 'created_at' | 'updated_at'>) => api.createStop(stop),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stops'] }),
  });
};

export const useUpdateStop = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Stop> }) => api.updateStop(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stops'] }),
  });
};

export const useDeleteStop = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteStop(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stops'] }),
  });
};

// ─── Route Templates ───

export const useRouteTemplates = (includeInactive = false) => {
  return useQuery({
    queryKey: ['route-templates', { includeInactive }],
    queryFn: () => api.getRouteTemplates(includeInactive),
  });
};

export const useCreateRouteTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (t: Omit<RouteTemplate, 'id' | 'created_at' | 'updated_at'>) => api.createRouteTemplate(t),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['route-templates'] }),
  });
};

export const useUpdateRouteTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<RouteTemplate> }) => api.updateRouteTemplate(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['route-templates'] }),
  });
};

export const useDeleteRouteTemplate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteRouteTemplate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['route-templates'] }),
  });
};

// ─── Route Template Stops ───

export const useRouteTemplateStops = (templateId: string | undefined) => {
  return useQuery({
    queryKey: ['route-template-stops', templateId],
    queryFn: () => templateId ? api.getRouteTemplateStops(templateId) : [],
    enabled: !!templateId,
  });
};

export const useSetRouteTemplateStops = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ templateId, stops }: {
      templateId: string;
      stops: { stop_id: string; sequence_order: number; stop_role: StopRole }[];
    }) => api.setRouteTemplateStops(templateId, stops),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['route-template-stops'] }),
  });
};
