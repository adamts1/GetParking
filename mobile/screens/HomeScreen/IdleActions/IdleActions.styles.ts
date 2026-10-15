import { StyleSheet } from 'react-native';
import { SPACE } from '../../../theme';

export const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    bottom: 0,
    start: 0,
    end: 0,
    flexDirection: 'row',
    gap: SPACE.md,
    paddingHorizontal: SPACE.lg,
    paddingTop: SPACE.lg,
  },
});
