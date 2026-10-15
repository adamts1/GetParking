import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../../theme';
import { GlassCard } from '../GlassCard';
import { styles } from './Toast.styles';

export enum ToastTone {
  Error = 'error',
  Notice = 'notice',
}

type Props = { text: string; tone: ToastTone };

/** A line of trouble over the map. It does not block anything and it goes
    away on its own — see the timers in the screen that raises it. */
export function Toast({ text, tone }: Props) {
  const insets = useSafeAreaInsets();
  const color = tone === ToastTone.Error ? colors.danger : colors.warning;
  const border = tone === ToastTone.Error ? colors.dangerLine : colors.warningLine;
  return (
    <View style={[styles.wrap, { top: insets.top + 76 }]} pointerEvents="none">
      <GlassCard style={styles.card} borderColor={border}>
        <Text style={[styles.text, { color }]}>{text}</Text>
      </GlassCard>
    </View>
  );
}

