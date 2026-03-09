import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export interface Stop {
  id: string;
  name_ar: string;
  name_en: string;
  region: string;
  city: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RouteTemplate {
  id: string;
  name: string;
  origin_region: string;
  destination_region: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type StopRole = 'pickup' | 'dropoff' | 'both';

export interface RouteTemplateStop {
  id: string;
  route_template_id: string;
  stop_id: string;
  sequence_order: number;
  stop_role: StopRole;
  created_at: string;
  stop?: Stop;
}

// ─── Stops ───

export const getStops = async (includeInactive = false): Promise<Stop[]> => {
  let query = supabase.from('stops').select('*').order('region').order('name_en');
  if (!includeInactive) {
    query = query.eq('is_active', true);
  }
  const { data, error } = await query;
  if (error) { logger.error('Error fetching stops:', error); return []; }
  return data || [];
};

export const createStop = async (stop: Omit<Stop, 'id' | 'created_at' | 'updated_at'>): Promise<Stop | null> => {
  const { data, error } = await supabase.from('stops').insert([stop]).select().single();
  if (error) { logger.error('Error creating stop:', error); throw error; }
  return data;
};

export const updateStop = async (id: string, updates: Partial<Stop>): Promise<Stop | null> => {
  const { data, error } = await supabase.from('stops').update(updates).eq('id', id).select().single();
  if (error) { logger.error('Error updating stop:', error); throw error; }
  return data;
};

export const deleteStop = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('stops').delete().eq('id', id);
  if (error) { logger.error('Error deleting stop:', error); return false; }
  return true;
};

// ─── Route Templates ───

export const getRouteTemplates = async (includeInactive = false): Promise<RouteTemplate[]> => {
  let query = supabase.from('route_templates').select('*').order('name');
  if (!includeInactive) {
    query = query.eq('is_active', true);
  }
  const { data, error } = await query;
  if (error) { logger.error('Error fetching route templates:', error); return []; }
  return data || [];
};

export const createRouteTemplate = async (
  template: Omit<RouteTemplate, 'id' | 'created_at' | 'updated_at'>
): Promise<RouteTemplate | null> => {
  const { data, error } = await supabase.from('route_templates').insert([template]).select().single();
  if (error) { logger.error('Error creating route template:', error); throw error; }
  return data;
};

export const updateRouteTemplate = async (
  id: string, updates: Partial<RouteTemplate>
): Promise<RouteTemplate | null> => {
  const { data, error } = await supabase.from('route_templates').update(updates).eq('id', id).select().single();
  if (error) { logger.error('Error updating route template:', error); throw error; }
  return data;
};

export const deleteRouteTemplate = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('route_templates').delete().eq('id', id);
  if (error) { logger.error('Error deleting route template:', error); return false; }
  return true;
};

// ─── Route Template Stops ───

export const getRouteTemplateStops = async (templateId: string): Promise<RouteTemplateStop[]> => {
  const { data, error } = await supabase
    .from('route_template_stops')
    .select('*, stop:stops(*)')
    .eq('route_template_id', templateId)
    .order('sequence_order');
  if (error) { logger.error('Error fetching route template stops:', error); return []; }
  return (data || []).map(item => ({
    ...item,
    stop_role: item.stop_role as StopRole,
    stop: item.stop as unknown as Stop | undefined,
  }));
};

export const setRouteTemplateStops = async (
  templateId: string,
  stops: { stop_id: string; sequence_order: number; stop_role: StopRole }[]
): Promise<boolean> => {
  const { error: deleteError } = await supabase
    .from('route_template_stops')
    .delete()
    .eq('route_template_id', templateId);
  if (deleteError) { logger.error('Error clearing template stops:', deleteError); return false; }

  if (stops.length === 0) return true;

  const rows = stops.map(s => ({ route_template_id: templateId, ...s }));
  const { error: insertError } = await supabase.from('route_template_stops').insert(rows);
  if (insertError) { logger.error('Error setting template stops:', insertError); return false; }
  return true;
};
