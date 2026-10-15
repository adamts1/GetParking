import { StyleSheet } from 'react-native';
import { colors, radius } from '../../../theme';

export const styles = StyleSheet.create({
  button: {
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.dangerWash,
    borderWidth: 1,
    borderColor: colors.dangerLine,
  },
  label: { color: colors.danger, fontSize: 15, fontWeight: '600' },
});
