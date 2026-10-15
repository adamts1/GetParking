import { StyleSheet } from 'react-native';
import { colors } from '../../../../theme';

/** The marker view is this big so the heading cone fits around the dot. */
export const MARKER_SIZE = 72;

export const styles = StyleSheet.create({
  wrap: { width: MARKER_SIZE, height: MARKER_SIZE, alignItems: 'center', justifyContent: 'center' },
  /* Rotated about its own centre, which sits on the dot, so the cone swings
     around the driver instead of orbiting some other point. */
  headingWrap: {
    position: 'absolute',
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /* A triangle made of borders — React Native has no polygon. It is parked
     just clear of the dot so the two do not merge into one blob. */
  cone: {
    position: 'absolute',
    top: MARKER_SIZE / 2 - 32,
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 15,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.primary,
  },
  halo: { position: 'absolute', width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primaryWash },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.onColor,
    shadowColor: colors.primary,
    shadowOpacity: 0.8,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
});
