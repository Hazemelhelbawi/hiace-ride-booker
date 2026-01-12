import en from './translations/en.json';
import ar from './translations/ar.json';

export type Language = 'en' | 'ar';

export const translations = {
  en,
  ar,
} as const;

export type TranslationKeys = typeof en;

// Helper function to get nested translation value
export function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let result: unknown = obj;
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return path; // Return the key if translation not found
    }
  }
  
  return typeof result === 'string' ? result : path;
}

export const isRTL = (lang: Language): boolean => lang === 'ar';
