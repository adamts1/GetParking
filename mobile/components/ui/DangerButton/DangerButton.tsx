import { ActivityIndicator, Pressable, Text } from 'react-native';
import { colors } from '../../../theme';
import { styles } from './DangerButton.styles';

type Props = { label: string; onPress: () => void; loading?: boolean };

/** The quiet way out: cancel a search, an offer, a match. Outlined rather
    than filled — leaving should never be the loudest thing on the sheet. */
export function DangerButton({ label, onPress, loading }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: !!loading }}
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [styles.button, pressed && { opacity: 0.7 }]}
    >
      {loading ? <ActivityIndicator color={colors.danger} /> : <Text style={styles.label}>{label}</Text>}
    </Pressable>
  );
}
