// US State to Timezone mapping
export const US_STATE_TIMEZONES: Record<string, string> = {
  // Eastern Time Zone
  'AL': 'America/New_York', 'CT': 'America/New_York', 'DE': 'America/New_York',
  'FL': 'America/New_York', 'GA': 'America/New_York', 'IN': 'America/New_York',
  'KY': 'America/New_York', 'ME': 'America/New_York', 'MD': 'America/New_York',
  'MA': 'America/New_York', 'MI': 'America/New_York', 'NH': 'America/New_York',
  'NJ': 'America/New_York', 'NY': 'America/New_York', 'NC': 'America/New_York',
  'OH': 'America/New_York', 'PA': 'America/New_York', 'RI': 'America/New_York',
  'SC': 'America/New_York', 'TN': 'America/New_York', 'VT': 'America/New_York',
  'VA': 'America/New_York', 'WV': 'America/New_York', 'DC': 'America/New_York',

  // Central Time Zone
  'AR': 'America/Chicago', 'IL': 'America/Chicago', 'IA': 'America/Chicago',
  'KS': 'America/Chicago', 'LA': 'America/Chicago', 'MN': 'America/Chicago',
  'MS': 'America/Chicago', 'MO': 'America/Chicago', 'NE': 'America/Chicago',
  'OK': 'America/Chicago', 'SD': 'America/Chicago', 'TX': 'America/Chicago',
  'WI': 'America/Chicago', 'AL': 'America/Chicago', 'ND': 'America/Chicago',

  // Mountain Time Zone
  'AZ': 'America/Phoenix', 'CO': 'America/Denver', 'ID': 'America/Denver',
  'MT': 'America/Denver', 'NV': 'America/Denver', 'NM': 'America/Denver',
  'UT': 'America/Denver', 'WY': 'America/Denver',

  // Pacific Time Zone
  'CA': 'America/Los_Angeles', 'OR': 'America/Los_Angeles', 'WA': 'America/Los_Angeles',

  // Alaska Time Zone
  'AK': 'America/Anchorage',

  // Hawaii Time Zone
  'HI': 'Pacific/Honolulu'
};

export const TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'Eastern Time (ET)', offset: 'UTC-5/-4' },
  { value: 'America/Chicago', label: 'Central Time (CT)', offset: 'UTC-6/-5' },
  { value: 'America/Denver', label: 'Mountain Time (MT)', offset: 'UTC-7/-6' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)', offset: 'UTC-8/-7' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)', offset: 'UTC-9/-8' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HST)', offset: 'UTC-10' }
];

export function getTimezoneFromState(state: string): string {
  const normalizedState = state.toUpperCase().trim();
  return US_STATE_TIMEZONES[normalizedState] || 'America/New_York'; // Default to Eastern
}

export function getTimezoneDisplayName(timezone: string): string {
  const option = TIMEZONE_OPTIONS.find(tz => tz.value === timezone);
  return option ? option.label : 'Eastern Time (ET)';
}

export function detectTimezoneFromBrowser(): string {
  try {
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // If browser timezone is in our supported list, use it
    const supportedTimezone = TIMEZONE_OPTIONS.find(tz => tz.value === browserTimezone);
    return supportedTimezone ? browserTimezone : 'America/New_York';
  } catch {
    return 'America/New_York'; // Fallback to Eastern
  }
}