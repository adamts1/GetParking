import { I18nManager } from 'react-native';

/** Corner radii, from the smallest chip to a sheet. */
export const radius = { sm: 10, md: 14, lg: 16, xl: 24 } as const;

/** The 4-point spacing scale every gap and padding comes from. */
export const SPACE = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

/** Text alignment that follows the reading direction. */
export const start = I18nManager.isRTL ? 'right' : 'left';

/** Assumed sheet height until a sheet measures itself — see BottomSheet. */
export const SHEET_INSET = { compact: 260 } as const;
