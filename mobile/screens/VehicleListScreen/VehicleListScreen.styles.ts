import { StyleSheet } from 'react-native';
import { colors, SPACE, start } from '../../theme';

export const styles = StyleSheet.create({
  content: { paddingHorizontal: SPACE.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: SPACE.lg,
    borderRadius: 18,
    marginBottom: 10,
    backgroundColor: colors.glass,
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
  },
  selected: { backgroundColor: colors.primaryWash, borderColor: colors.primaryLine },
  icon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  name: { color: colors.text, fontSize: 15, fontWeight: '600', textAlign: start },
  detail: { color: colors.textSecondary, fontSize: 13, textAlign: start },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: SPACE.lg,
    borderRadius: 18,
    marginTop: 6,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.glassBorder,
  },
  addLabel: { color: colors.textSecondary, fontSize: 15, fontWeight: '500' },
});
