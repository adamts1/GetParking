/* Car colours and plates. Only the plate's last digits are stored: enough for
   the other driver to confirm the car in the street, not enough to identify
   its owner. The colour is stored as a CarColor value. */

export enum CarColor {
  White = 'white',
  Black = 'black',
  Silver = 'silver',
  Red = 'red',
  Blue = 'blue',
  Gray = 'gray',
  Green = 'green',
  Yellow = 'yellow',
}

export const CAR_COLORS: Record<CarColor, string> = {
  [CarColor.White]: '#F1F5F9',
  [CarColor.Black]: '#1E293B',
  [CarColor.Silver]: '#94A3B8',
  [CarColor.Red]: '#EF4444',
  [CarColor.Blue]: '#3B82F6',
  [CarColor.Gray]: '#6B7280',
  [CarColor.Green]: '#22C55E',
  [CarColor.Yellow]: '#EAB308',
};

export const CAR_COLOR_KEYS = Object.values(CarColor);

export type Vehicle = {
  id: string;
  make_model: string;
  color: string;
  plate_last_digits: string;
  created_at: string;
};

/** A colour key we know, or grey for anything else the column holds. */
export const colorHex = (color: string) => CAR_COLORS[color as CarColor] ?? CAR_COLORS[CarColor.Gray];

/** Mirrors the vehicles.plate_last_digits check constraint. */
export const PLATE_DIGITS_RE = /^[0-9]{2,3}$/;
