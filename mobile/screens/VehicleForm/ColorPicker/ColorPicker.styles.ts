import { StyleSheet } from 'react-native';
import { colors, radius } from '../../../theme';

export const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.glass,
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
  },
  swatch: { width: 20, height: 20, borderRadius: radius.sm - 4 },
  // White on a dark sheet needs an outline to read as a swatch at all.
  whiteSwatch: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  label: { color: colors.textSecondary, fontSize: 13 },
  selectedLabel: { color: colors.text, fontWeight: '600' },
});
