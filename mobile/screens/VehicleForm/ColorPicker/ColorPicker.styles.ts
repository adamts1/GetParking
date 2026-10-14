import { StyleSheet } from 'react-native';
import { C, R } from '../../../theme';

export const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: C.glass,
    borderWidth: 1.5,
    borderColor: C.glassBorder,
  },
  swatch: { width: 20, height: 20, borderRadius: R.sm - 4 },
  // White on a dark sheet needs an outline to read as a swatch at all.
  whiteSwatch: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  label: { color: C.textSecondary, fontSize: 13 },
  selectedLabel: { color: C.text, fontWeight: '600' },
});
