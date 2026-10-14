import { StyleSheet } from 'react-native';
import { colors } from '../../../theme';

export const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, marginVertical: 18 },
  rule: { flex: 1, height: 1, backgroundColor: colors.glassBorder },
  label: { color: colors.textTertiary, fontSize: 12 },
});
