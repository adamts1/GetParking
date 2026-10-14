import { StyleSheet } from 'react-native';
import { C, R } from '../../../theme';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.glassBorder,
    borderRadius: R.xl,
    overflow: 'hidden',
  },
});
