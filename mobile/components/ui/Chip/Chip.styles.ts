import { StyleSheet } from 'react-native';
import { C } from '../../../theme';

export const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: C.glass,
    borderWidth: 1,
    borderColor: C.glassBorder,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { color: C.textSecondary, fontSize: 12 },
});
