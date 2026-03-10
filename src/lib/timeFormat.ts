/**
 * Convert 24h time string (e.g. "14:30") to 12h format (e.g. "2:30 PM")
 */
export function formatTime12h(time: string): string {
  if (!time) return '';
  
  const parts = time.split(':');
  if (parts.length < 2) return time;
  
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const period = hours >= 12 ? 'PM' : 'AM';
  
  if (hours === 0) hours = 12;
  else if (hours > 12) hours -= 12;
  
  return `${hours}:${minutes} ${period}`;
}
