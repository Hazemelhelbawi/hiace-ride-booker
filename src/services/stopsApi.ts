// Stub for stops and route templates - partially implemented in Strapi
// Core stops functionality is available via the main api.ts file
// Route templates and advanced scheduling features are not part of the initial migration

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

// Stops - Use main api.ts getStops() function instead
export const getStops = async (includeInactive = false): Promise<Stop[]> => {
  console.warn('Use getStops from @/services/api instead');
  return [];
};

export const createStop = async (stop: Omit<Stop, 'id' | 'created_at' | 'updated_at'>): Promise<Stop | null> => {
  console.warn('Stop management not implemented in Strapi migration');
  return null;
};

export const updateStop = async (id: string, updates: Partial<Stop>): Promise<Stop | null> => {
  console.warn('Stop management not implemented in Strapi migration');
  return null;
};

export const deleteStop = async (id: string): Promise<boolean> => {
  console.warn('Stop management not implemented in Strapi migration');
  return false;
};

// Route Templates - Not implemented in initial Strapi migration
export const getRouteTemplates = async (includeInactive = false): Promise<RouteTemplate[]> => {
  console.warn('Route templates not implemented in Strapi migration');
  return [];
};

export const createRouteTemplate = async (
  template: Omit<RouteTemplate, 'id' | 'created_at' | 'updated_at'>
): Promise<RouteTemplate | null> => {
  console.warn('Route templates not implemented in Strapi migration');
  return null;
};

export const updateRouteTemplate = async (
  id: string, updates: Partial<RouteTemplate>
): Promise<RouteTemplate | null> => {
  console.warn('Route templates not implemented in Strapi migration');
  return null;
};

export const deleteRouteTemplate = async (id: string): Promise<boolean> => {
  console.warn('Route templates not implemented in Strapi migration');
  return false;
};

export const getRouteTemplateStops = async (templateId: string): Promise<RouteTemplateStop[]> => {
  console.warn('Route template stops not implemented in Strapi migration');
  return [];
};

export const setRouteTemplateStops = async (
  templateId: string,
  stops: { stop_id: string; sequence_order: number; stop_role: StopRole }[]
): Promise<boolean> => {
  console.warn('Route template stops not implemented in Strapi migration');
  return false;
};
