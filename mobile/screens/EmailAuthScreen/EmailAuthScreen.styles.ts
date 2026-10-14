import { StyleSheet } from 'react-native';
import { C, R, SPACE } from '../../theme';

export const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingHorizontal: SPACE.xl },
  progress: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 28 },
  progressStep: { flex: 1, height: 3, borderRadius: 2, backgroundColor: C.track },
  progressOn: { backgroundColor: C.primary },

  verify: { alignItems: 'center', marginTop: 20 },
  mailIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: C.primaryWash,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  verifyTitle: { fontSize: 20, marginBottom: SPACE.sm, textAlign: 'center' },
  verifyBody: { marginBottom: SPACE.xxl },
  email: { color: C.text, fontWeight: '600' },

  /** Digits run left-to-right whatever the interface language. */
  codeRow: { flexDirection: 'row', gap: SPACE.sm, justifyContent: 'center', marginBottom: 28, direction: 'ltr' },
  codeBox: {
    width: 46,
    height: 58,
    borderRadius: R.md,
    backgroundColor: C.glass,
    borderWidth: 1.5,
    borderColor: C.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBoxActive: { borderColor: C.primary },
  codeDigit: { fontSize: 24, fontWeight: '700', color: C.text },
  /** Off-screen but focusable: one input drives the six boxes, so paste and
      one-time-code autofill work. */
  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },

  noCode: { marginBottom: SPACE.sm, textAlign: 'center' },
  resendIn: { textAlign: 'center' },
  errorLine: { marginBottom: SPACE.md },
  actions: { marginTop: 'auto', paddingTop: SPACE.xl },
});
