import { Pressable, Text } from 'react-native';
import { colors } from '../../../theme';

type Props = { label: string; onPress: () => void; color?: string };

/** A plain tappable line of text — "skip", "resend", the fallback confirm. */
export function LinkText({ label, onPress, color = colors.primary }: Props) {
  return (
    <Pressable onPress={onPress} hitSlop={10} accessibilityRole="link">
      <Text style={{ color, fontSize: 14, fontWeight: '600', textAlign: 'center' }}>{label}</Text>
    </Pressable>
  );
}
