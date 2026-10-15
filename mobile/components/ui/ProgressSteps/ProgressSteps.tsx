import { Text, View } from 'react-native';
import { colors } from '../../../theme';
import { styles } from './ProgressSteps.styles';

type Props = {
  labels: string[];
  /** Index of the last step reached; -1 means none. */
  reached: number;
  color: string;
};

/** On the way → nearby → arrived, as three bars both drivers can read. */
export function ProgressSteps({ labels, reached, color }: Props) {
  return (
    <View
      style={styles.row}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: labels.length, now: reached + 1 }}
    >
      {labels.map((label, index) => {
        const isReached = index <= reached;
        return (
          <View key={label} style={styles.step}>
            <View style={[styles.bar, { backgroundColor: isReached ? color : colors.track }]} />
            <Text style={[styles.label, { color: isReached ? color : colors.textTertiary, fontWeight: isReached ? '600' : '400' }]}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

