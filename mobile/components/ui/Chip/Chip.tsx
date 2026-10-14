import { Text, View } from 'react-native';
import { colors } from '../../../theme';
import { styles } from './Chip.styles';

/** A small count of what is happening nearby. */
export function Chip({ text, color = colors.success }: { text: string; color?: string }) {
  return (
    <View style={styles.chip}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

