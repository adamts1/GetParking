import { StyleSheet } from 'react-native';
import { SPACE } from '../../theme';

export const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingHorizontal: SPACE.xl },
  preview: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: SPACE.xxl,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  colorLabel: { marginBottom: 10 },
  /** Digits read left-to-right even in Hebrew. */
  plate: { writingDirection: 'ltr' },
  actions: { marginTop: 'auto', paddingTop: SPACE.xl, gap: 14 },
});
