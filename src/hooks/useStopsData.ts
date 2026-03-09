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
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['stops'] });
      const previousStops = qc.getQueryData<Stop[]>(['stops']);
      qc.setQueryData<Stop[]>(['stops'], (old) =>
        old?.filter(stop => stop.id !== id) ?? []
      );
      return { previousStops };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stops'] }),
    onError: (_err, _id, context) => {
      if (context?.previousStops) {
        qc.setQueryData(['stops'], context.previousStops);
      }
    },
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
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['route-templates'] });
      const previousTemplates = qc.getQueryData<RouteTemplate[]>(['route-templates']);
      qc.setQueryData<RouteTemplate[]>(['route-templates'], (old) =>
        old?.filter(tmpl => tmpl.id !== id) ?? []
      );
      return { previousTemplates };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['route-templates'] }),
    onError: (_err, _id, context) => {
      if (context?.previousTemplates) {
        qc.setQueryData(['route-templates'], context.previousTemplates);
      }
    },
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
