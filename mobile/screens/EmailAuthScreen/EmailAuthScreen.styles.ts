import { StyleSheet } from 'react-native';
import { colors, radius, SPACE } from '../../theme';

export const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingHorizontal: SPACE.xl },
  progress: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 28 },
  progressStep: { flex: 1, height: 3, borderRadius: 2, backgroundColor: colors.track },
  progressOn: { backgroundColor: colors.primary },

  verify: { alignItems: 'center', marginTop: 20 },
  mailIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.primaryWash,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  verifyTitle: { fontSize: 20, marginBottom: SPACE.sm, textAlign: 'center' },
  verifyBody: { marginBottom: SPACE.xxl },
  email: { color: colors.text, fontWeight: '600' },

  /** Digits run left-to-right whatever the interface language. */
  codeRow: { flexDirection: 'row', gap: SPACE.sm, justifyContent: 'center', marginBottom: 28, direction: 'ltr' },
  codeBox: {
    width: 46,
    height: 58,
    borderRadius: radius.md,
    backgroundColor: colors.glass,
    borderWidth: 1.5,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeBoxActive: { borderColor: colors.primary },
  codeDigit: { fontSize: 24, fontWeight: '700', color: colors.text },
  /** Off-screen but focusable: one input drives the six boxes, so paste and
      one-time-code autofill work. */
  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },

  noCode: { marginBottom: SPACE.sm, textAlign: 'center' },
  resendIn: { textAlign: 'center' },
  errorLine: { marginBottom: SPACE.md },
  actions: { marginTop: 'auto', paddingTop: SPACE.xl },
});
