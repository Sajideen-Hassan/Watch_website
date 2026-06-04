export const WATCH_COLORS = [
  { id: 'silver', label: 'Silver', hex: '#C0C0C0', gradient: 'from-zinc-300 to-zinc-100' },
  { id: 'black', label: 'Black', hex: '#1A1A1A', gradient: 'from-neutral-800 to-neutral-900' },
  { id: 'titanium', label: 'Titanium', hex: '#8E8E8E', gradient: 'from-stone-400 to-stone-300' },
  { id: 'gold', label: 'Gold', hex: '#D4AF37', gradient: 'from-amber-400 to-yellow-300' },
] as const

export type WatchColorId = (typeof WATCH_COLORS)[number]['id']

export const FEATURES = [
  { label: 'Calibre', value: 'CH-27', unit: '' },
  { label: 'Water Resistance', value: '100', unit: 'm' },
  { label: 'Shock Resistance', value: 'Military', unit: 'Grade' },
  { label: 'Weight', value: '52', unit: 'g' },
] as const

export const SMART_STATS = [
  { label: 'Heart Rate', value: 'BPM', icon: 'heart' },
  { label: 'Sleep Score', value: '92', icon: 'moon', unit: '%' },
  { label: 'GPS Tracking', value: 'Dual-band', icon: 'map' },
  { label: 'Activity', value: '18K', icon: 'activity', unit: 'steps' },
] as const

export const LIFESTYLE_SCENES = [
  { id: 'office', label: 'Luxury Office', gradient: 'from-slate-900 via-slate-800 to-zinc-900' },
  { id: 'mountain', label: 'Mountain', gradient: 'from-blue-950 via-teal-900 to-emerald-950' },
  { id: 'city', label: 'City Night', gradient: 'from-indigo-950 via-purple-900 to-slate-950' },
  { id: 'travel', label: 'Travel', gradient: 'from-amber-950 via-orange-900 to-stone-950' },
  { id: 'gym', label: 'Gym', gradient: 'from-red-950 via-rose-900 to-neutral-950' },
] as const

export const BATTERY_DAYS = 7

export const SITE_CONFIG = {
  name: 'Horologe',
  tagline: 'Time. Reimagined.',
  cta: 'Not just a watch. A statement.',
  description: 'A luxury timepiece engineered for the modern era.',
} as const
