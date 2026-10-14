import { StyleSheet } from 'react-native';
import { C, R, start } from '../../../theme';

export const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    borderRadius: R.md,
    backgroundColor: C.glass,
    borderWidth: 1,
    borderColor: C.glassBorder,
  },
  invalid: { borderColor: C.dangerLine },
  input: { flex: 1, color: C.text, fontSize: 15, paddingVertical: 14, textAlign: start },
  note: { marginTop: 6 },
  error: { color: C.danger },
});
