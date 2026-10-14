import { StyleSheet } from 'react-native';
import { C } from './colors';
import { SPACE, start } from './metrics';

/** Styles shared across screens: the screen itself, rows, and the type scale.
    Anything used by exactly one component lives in that component's
    `<Name>.styles.ts` instead. */
export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  centred: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowGap: { flexDirection: 'row', alignItems: 'center', gap: SPACE.md },
  fill: { flex: 1 },

  h1: { color: C.text, fontSize: 22, fontWeight: '800', textAlign: start },
  h2: { color: C.text, fontSize: 17, fontWeight: '700', textAlign: start },
  body: { color: C.textSecondary, fontSize: 14, lineHeight: 20, textAlign: start },
  caption: { color: C.textTertiary, fontSize: 12, textAlign: start },
  label: {
    color: C.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 6,
    textAlign: start,
  },
  centredBody: { color: C.textSecondary, fontSize: 14, lineHeight: 20, textAlign: 'center' },
  error: { color: C.danger, fontSize: 13, textAlign: 'center' },
});
