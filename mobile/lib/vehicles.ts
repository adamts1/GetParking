/* Car colours and plates. Only the plate's last digits are stored: enough for
   the other driver to confirm the car in the street, not enough to identify
   its owner. The colour is stored as one of the keys below. */

export const CAR_COLORS = {
  white: '#F1F5F9',
  black: '#1E293B',
  silver: '#94A3B8',
  red: '#EF4444',
  blue: '#3B82F6',
  gray: '#6B7280',
  green: '#22C55E',
  yellow: '#EAB308',
} as const;

export type CarColor = keyof typeof CAR_COLORS;
export const CAR_COLOR_KEYS = Object.keys(CAR_COLORS) as CarColor[];

export type Vehicle = {
  id: string;
  make_model: string;
  color: string;
  plate_last_digits: string;
  created_at: string;
};

/** A colour key we know, or grey for anything else the column holds. */
export const colorHex = (color: string) => CAR_COLORS[color as CarColor] ?? CAR_COLORS.gray;

/** Mirrors the vehicles.plate_last_digits check constraint. */
export const PLATE_DIGITS_RE = /^[0-9]{2,3}$/;
