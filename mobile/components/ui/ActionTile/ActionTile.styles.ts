import { StyleSheet } from 'react-native';
import { C, R } from '../../../theme';

export const styles = StyleSheet.create({
  tile: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    borderRadius: R.md,
    backgroundColor: C.glass,
    borderWidth: 1,
    borderColor: C.glassBorder,
  },
  danger: { backgroundColor: C.dangerWash, borderColor: C.dangerLine },
  label: { fontSize: 12, fontWeight: '500' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
