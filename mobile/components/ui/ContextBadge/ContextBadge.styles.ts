import { StyleSheet } from 'react-native';
import { colors, SPACE } from '../../../theme';

export const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  badge: { paddingHorizontal: 10, paddingVertical: SPACE.xs, borderRadius: 8, borderWidth: 1 },
  label: { fontSize: 11, fontWeight: '700' },
  hint: { color: colors.textSecondary, fontSize: 11 },
});
