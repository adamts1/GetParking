import { StyleSheet } from 'react-native';
import { C } from '../../../theme';

export const styles = StyleSheet.create({
  avatar: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  letter: { color: C.onColor, fontSize: 22, fontWeight: '700' },
  badge: {
    position: 'absolute',
    bottom: -2,
    end: -2,
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: C.sheetEdge,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
