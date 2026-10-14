import { Text, View } from 'react-native';
import { C } from '../../../theme';
import { styles } from './Chip.styles';

/** A small count of what is happening nearby. */
export function Chip({ text, color = C.success }: { text: string; color?: string }) {
  return (
    <View style={styles.chip}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

