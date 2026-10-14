import { StyleSheet } from 'react-native';
import { C, R, start } from '../../../theme';

export const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16, zIndex: 50 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: R.lg,
  },
  text: { flex: 1, color: C.text, fontSize: 15, fontWeight: '600', textAlign: start },
  trailing: { color: C.text, fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  tag: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  tagText: { fontSize: 12, fontWeight: '600' },
});
