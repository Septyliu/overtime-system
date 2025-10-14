export function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

export function calculateDuration(startTime: string, endTime: string): number {
  let start = timeToMinutes(startTime);
  let end = timeToMinutes(endTime);
  
  // Handle overnight shifts
  if (end < start) {
    end += 24 * 60;
  }
  
  return (end - start) / 60;
}

export function formatDuration(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  return `${wholeHours} jam ${minutes} menit (${hours.toFixed(2)} jam)`;
}

export function generateTimeOptions(startTime: string, endTime: string): string[] {
  const options: string[] = [];
  const start = timeToMinutes(startTime);
  let end = timeToMinutes(endTime);
  
  // Handle overnight shifts
  if (end < start) {
    end += 24 * 60;
  }
  
  for (let minutes = start; minutes <= end; minutes += 15) {
    options.push(minutesToTime(minutes));
  }
  
  return options;
}
