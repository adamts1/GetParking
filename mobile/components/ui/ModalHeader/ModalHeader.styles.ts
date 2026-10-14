import { StyleSheet } from 'react-native';
import { SPACE } from '../../../theme';

export const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACE.xl,
  },
  title: { fontSize: 18 },
  /** Balances the close button so the title stays centred. */
  spacer: { width: 40 },
});
