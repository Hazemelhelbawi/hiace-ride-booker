export function formatTime12h(time: string): string {
  if (!time) return "";

  const parts = time.split(":");
  if (parts.length < 2) return time;

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1]; // ignore parts[2] (seconds)
  const period = hours >= 12 ? "PM" : "AM";

  if (hours === 0) hours = 12;
  else if (hours > 12) hours -= 12;

  return minutes === "00"
    ? `${hours} ${period}`
    : `${hours}:${minutes} ${period}`;
}
