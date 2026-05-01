// Format duration in minutes to human readable
export function formatDuration(minutes) {
  if (!minutes) return '0 min';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

// Format date to readable string
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

// Format reps for display
export function formatReps(reps, isTimeBased = false) {
  if (!reps) return '—';
  if (isTimeBased) return `${reps} sec`;
  return `${reps} reps`;
}

// Format sets x reps
export function formatSetsReps(sets, reps, isTimeBased = false) {
  if (!sets || !reps) return '—';
  if (isTimeBased) return `${sets} x ${reps}s`;
  return `${sets} x ${reps}`;
}

// Format weight
export function formatWeight(weight, units = 'metric') {
  if (!weight) return 'Bodyweight';
  if (units === 'imperial') return `${Math.round(weight * 2.205)} lbs`;
  return `${weight} kg`;
}

// Format percentage
export function formatPercentage(value) {
  if (!value) return '0%';
  return `${Math.round(value)}%`;
}

// Get day of week name
export function getDayName(dayIndex) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[dayIndex] || '';
}

// Get relative time
export function getRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}