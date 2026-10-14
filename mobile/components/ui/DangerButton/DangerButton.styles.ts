import { StyleSheet } from 'react-native';
import { C, R } from '../../../theme';

export const styles = StyleSheet.create({
  button: {
    borderRadius: R.md,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: C.dangerWash,
    borderWidth: 1,
    borderColor: C.dangerLine,
  },
  label: { color: C.danger, fontSize: 15, fontWeight: '600' },
});
