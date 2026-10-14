import { StyleSheet } from 'react-native';
import { colors, radius, start } from '../../../theme';

export const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  invalid: { borderColor: colors.dangerLine },
  input: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 14, textAlign: start },
  note: { marginTop: 6 },
  error: { color: colors.danger },
});
