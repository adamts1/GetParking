import { StyleSheet } from 'react-native';
import { colors, start } from '../../../theme';

export const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 },
  identity: { flex: 1, gap: 2 },
  name: { color: colors.text, fontSize: 16, fontWeight: '700', textAlign: start },
  verb: { color: colors.textTertiary, fontWeight: '400', fontSize: 13 },
  car: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 10, height: 10, borderRadius: 3 },
  carText: { color: colors.textSecondary, fontSize: 13, flexShrink: 1, textAlign: start },
});
