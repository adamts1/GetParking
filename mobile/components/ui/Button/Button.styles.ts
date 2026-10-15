import { StyleSheet } from 'react-native';
import { colors, radius } from '../../../theme';

export const styles = StyleSheet.create({
  button: {
    borderRadius: radius.lg,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  large: { paddingVertical: 18, minHeight: 58 },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  label: { color: colors.onColor, fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
  largeLabel: { fontSize: 17 },
  // Opaque enough to read over the map, not only over the plain background.
  disabled: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.glassBorder },
  disabledLabel: { color: colors.textTertiary },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
});
