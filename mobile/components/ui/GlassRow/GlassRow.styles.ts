import { StyleSheet } from 'react-native';
import { colors, radius } from '../../../theme';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    marginBottom: 10,
  },
  danger: { borderColor: colors.dangerLine },
  label: { flex: 1, fontSize: 15, fontWeight: '500', textAlign: 'center' },
  spacer: { width: 18 },
});
