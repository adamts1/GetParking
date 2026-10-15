import { StyleSheet } from 'react-native';
import { colors } from '../../../../theme';

export const styles = StyleSheet.create({
  wrap: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', width: 48, height: 48, borderRadius: 24 },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2.5,
    borderColor: colors.onColor,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
});
