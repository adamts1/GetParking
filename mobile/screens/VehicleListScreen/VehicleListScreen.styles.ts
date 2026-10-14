import { StyleSheet } from 'react-native';
import { C, SPACE, start } from '../../theme';

export const styles = StyleSheet.create({
  content: { paddingHorizontal: SPACE.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: SPACE.lg,
    borderRadius: 18,
    marginBottom: 10,
    backgroundColor: C.glass,
    borderWidth: 1.5,
    borderColor: C.glassBorder,
  },
  selected: { backgroundColor: C.primaryWash, borderColor: C.primaryLine },
  icon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  name: { color: C.text, fontSize: 15, fontWeight: '600', textAlign: start },
  detail: { color: C.textSecondary, fontSize: 13, textAlign: start },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.primary,
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
    borderColor: C.glassBorder,
  },
  addLabel: { color: C.textSecondary, fontSize: 15, fontWeight: '500' },
});
