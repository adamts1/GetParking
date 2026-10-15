import { Platform, StyleSheet } from 'react-native';
import { colors } from '../../../../theme';

/* The pin is a square turned 45°, so its point is a corner. React Native
   lays the square out unrotated — a transform never changes layout — and the
   rotated corner then juts out past the box the layout reserved: a 32 px
   square spans 45.25 px once turned. Leaving the marker to anchor at the
   bottom of its own view therefore put the coordinate about five pixels below
   the point the driver can see.

   Five pixels is nothing at close range and a street's width when zoomed out,
   because a pixel is worth more metres the further out the camera is — which
   is why the pin looked misplaced until you zoomed in.

   So the geometry is spelled out rather than left to flow, and the anchor is
   derived from it. */
const SIDE = 32;
const DIAGONAL = SIDE * Math.SQRT2; // 45.25 — the turned square's bounding box
const HALF_DIAGONAL = DIAGONAL / 2; // centre → point

const WIDTH = Math.ceil(DIAGONAL); // 46, so the side corners are not clipped
const PIN_TOP = 6.4; // chosen so the point lands on TIP_Y
const TIP_Y = PIN_TOP + SIDE / 2 + HALF_DIAGONAL; // ≈ 45
const SHADOW_SIZE = { w: 16, h: 4 };
const SHADOW_GAP = 3; // the pin reads as floating above its own shadow
const HEIGHT = Math.ceil(TIP_Y + SHADOW_GAP + SHADOW_SIZE.h / 2 + 1);

/** Where the point actually is, as a fraction — what the Marker anchors to. */
export const PIN_ANCHOR = { x: 0.5, y: TIP_Y / HEIGHT };

export const styles = StyleSheet.create({
  wrap: { width: WIDTH, height: HEIGHT },
  pin: {
    position: 'absolute',
    left: (WIDTH - SIDE) / 2,
    top: PIN_TOP,
    width: SIDE,
    height: SIDE,
    // Three rounded corners and one sharp one; turning the square puts the
    // sharp corner at the bottom, so the pin points at the spot.
    borderTopLeftRadius: SIDE / 2,
    borderTopRightRadius: SIDE / 2,
    borderBottomLeftRadius: SIDE / 2,
    borderBottomRightRadius: 0,
    transform: [{ rotate: '-45deg' }],
    backgroundColor: colors.warning,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    ...Platform.select({
      ios: { shadowColor: colors.warning, shadowOpacity: 0.5, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
    }),
  },
  letter: { transform: [{ rotate: '45deg' }], fontWeight: '800', fontSize: 14, color: '#000' },
  shadow: {
    position: 'absolute',
    left: (WIDTH - SHADOW_SIZE.w) / 2,
    top: TIP_Y + SHADOW_GAP - SHADOW_SIZE.h / 2,
    width: SHADOW_SIZE.w,
    height: SHADOW_SIZE.h,
    borderRadius: SHADOW_SIZE.h / 2,
    backgroundColor: 'rgba(251,191,36,0.3)',
  },
});
