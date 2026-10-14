import { StyleSheet } from 'react-native';
import { C, start } from '../../../theme';

export const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  badge: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  letter: { fontWeight: '800', fontSize: 14 },
  text: { flex: 1 },
  title: { color: C.text, fontSize: 13, fontWeight: '600', textAlign: start },
  subtitle: { color: C.textTertiary, fontSize: 11, textAlign: start },
  note: { fontSize: 12, fontWeight: '600' },
});
