import { StyleSheet } from 'react-native';
import { colors, radius, SPACE } from '../../theme';

export const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
    top: -60,
    alignSelf: 'center',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(79,140,255,0.10)',
  },
  brand: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 20 },
  /** The product name stays Latin-script in both languages. */
  wordmark: {
    marginTop: SPACE.lg, color: colors.text, fontSize: 32, fontWeight: '800', letterSpacing: -0.5, writingDirection: 'ltr' },
  wordmarkAccent: { color: colors.primary },
  tagline: { color: colors.textSecondary, fontSize: 15, marginTop: SPACE.sm, textAlign: 'center', lineHeight: 21 },

  actions: { paddingHorizontal: 28 },
  provider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACE.md,
    paddingVertical: SPACE.lg,
    borderRadius: radius.lg,
    marginBottom: SPACE.md,
  },
  google: { backgroundColor: '#fff' },
  glass: { backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.glassBorder },
  providerLabel: { fontSize: 16, fontWeight: '600', color: colors.text },
  googleLabel: { color: '#1f2937' },
  errorLine: { marginTop: SPACE.xs },
});
