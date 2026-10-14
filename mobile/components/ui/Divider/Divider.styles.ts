import { StyleSheet } from 'react-native';
import { C } from '../../../theme';

export const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, marginVertical: 18 },
  rule: { flex: 1, height: 1, backgroundColor: C.glassBorder },
  label: { color: C.textTertiary, fontSize: 12 },
});
