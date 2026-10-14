import { StyleSheet } from 'react-native';
import { colors, SPACE } from '../../theme';

export const styles = StyleSheet.create({
  content: { paddingHorizontal: SPACE.lg },
  credits: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: SPACE.lg,
    marginBottom: SPACE.xl,
  },
  creditsValue: { color: colors.success, fontSize: 28, fontWeight: '800' },
  save: { marginBottom: SPACE.xl },
});
