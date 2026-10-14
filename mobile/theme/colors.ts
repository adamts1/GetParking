/** The mockups' palette (Parking/Mockups/ParkShare-Mockups.jsx → THEME).
    The app is dark-only: it is used in a car, often at night, next to a map. */
export const colors = {
  bg: '#0F1117',
  card: 'rgba(22, 24, 35, 0.92)',
  glass: 'rgba(255,255,255,0.06)',
  glassBorder: 'rgba(255,255,255,0.1)',
  track: 'rgba(255,255,255,0.08)',

  /** Finding a spot is blue… */
  primary: '#4F8CFF',
  primaryDeep: '#3B6FE0',
  primaryGlow: 'rgba(79,140,255,0.3)',
  primaryWash: 'rgba(79,140,255,0.12)',
  primaryLine: 'rgba(79,140,255,0.25)',

  /** …leaving one is green. The two flows never borrow each other's colour. */
  success: '#34D399',
  successDeep: '#059669',
  successGlow: 'rgba(52,211,153,0.3)',
  successWash: 'rgba(52,211,153,0.08)',
  successLine: 'rgba(52,211,153,0.2)',

  /** The spot itself. */
  warning: '#FBBF24',
  warningWash: 'rgba(251,191,36,0.08)',
  warningLine: 'rgba(251,191,36,0.18)',

  danger: '#F87171',
  dangerWash: 'rgba(248,113,113,0.12)',
  dangerLine: 'rgba(248,113,113,0.2)',

  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.6)',
  textTertiary: 'rgba(255,255,255,0.38)',

  /** Drawn on top of a filled button or marker. */
  onColor: '#FFFFFF',
  /** The sheet behind an avatar badge, so the badge reads as cut out of it. */
  sheetEdge: '#16181f',
} as const;

/** A colour at a given alpha, for washes and borders derived from an accent. */
export const alpha = (hex: string, opacity: number) =>
  `${hex}${Math.round(Math.min(1, Math.max(0, opacity)) * 255)
    .toString(16)
    .padStart(2, '0')}`;

/** The three accents a flow can be drawn in. */
export const ACCENTS = {
  seeker: { main: colors.primary, deep: colors.primaryDeep, wash: colors.primaryWash, line: colors.primaryLine, glow: colors.primaryGlow },
  leaver: { main: colors.success, deep: colors.successDeep, wash: colors.successWash, line: colors.successLine, glow: colors.successGlow },
  spot: { main: colors.warning, deep: colors.warning, wash: colors.warningWash, line: colors.warningLine, glow: colors.warningWash },
} as const;

export type Accent = (typeof ACCENTS)[keyof typeof ACCENTS];
