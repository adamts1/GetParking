import { StyleSheet } from 'react-native';
import { C, R } from '../../../theme';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: R.lg,
    backgroundColor: C.glass,
    borderWidth: 1,
    borderColor: C.glassBorder,
    marginBottom: 10,
  },
  danger: { borderColor: C.dangerLine },
  label: { flex: 1, fontSize: 15, fontWeight: '500', textAlign: 'center' },
  spacer: { width: 18 },
});
