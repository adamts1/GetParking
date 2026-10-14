import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { alpha } from '../../../theme';
import { Dot } from '../Dot';
import { GlassCard } from '../GlassCard';
import { styles } from './StatusPill.styles';

type Props = {
  color: string;
  text: string;
  /** Short flow marker on the far side — "Finding" / "Leaving". */
  tag?: string;
  /** A distance or a timer, right-aligned. */
  trailing?: string;
  pulse?: boolean;
  /** Tints the text and border with the accent, for moments that matter. */
  emphasised?: boolean;
};

/** The floating line of status over the map. */
export function StatusPill({ color, text, tag, trailing, pulse, emphasised }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { top: insets.top + 10 }]} pointerEvents="box-none">
      <GlassCard style={styles.pill} borderColor={emphasised ? alpha(color, 0.33) : undefined}>
        <Dot color={color} pulse={pulse} />
        <Text style={[styles.text, emphasised && { color }]} numberOfLines={1}>
          {text}
        </Text>
        {tag ? (
          <View style={[styles.tag, { backgroundColor: alpha(color, 0.15) }]}>
            <Text style={[styles.tagText, { color }]}>{tag}</Text>
          </View>
        ) : null}
        {trailing ? <Text style={styles.trailing}>{trailing}</Text> : null}
      </GlassCard>
    </View>
  );
}
