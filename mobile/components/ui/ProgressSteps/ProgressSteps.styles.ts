import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  step: { flex: 1, alignItems: 'center' },
  bar: { height: 4, borderRadius: 2, alignSelf: 'stretch', marginBottom: 6 },
  label: { fontSize: 11 },
});
