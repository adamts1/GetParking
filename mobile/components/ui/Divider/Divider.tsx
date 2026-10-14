import { Text, View } from 'react-native';
import { C } from '../../../theme';
import { styles } from './Divider.styles';

/** A labelled rule — "or". */
export function Divider({ label }: { label: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.rule} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.rule} />
    </View>
  );
}

