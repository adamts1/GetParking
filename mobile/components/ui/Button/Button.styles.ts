import { StyleSheet } from 'react-native';
import { C, R } from '../../../theme';

export const styles = StyleSheet.create({
  button: {
    borderRadius: R.lg,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  large: { paddingVertical: 18, minHeight: 58 },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  label: { color: C.onColor, fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
  largeLabel: { fontSize: 17 },
  disabled: { backgroundColor: C.track },
  disabledLabel: { color: C.textTertiary },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
});
