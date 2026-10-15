import { I18nManager, StyleSheet, Text, View } from 'react-native';
import { alpha, colors, SPACE } from '../../../theme';
import { Icon, IconName } from '../Icons';
import { styles } from './ContextBadge.styles';

type Props = { color: string; label: string; hint: string };

/** "YOU'RE PARKING › Drive to the spot" — which side of the handoff this is. */
export function ContextBadge({ color, label, hint }: Props) {
  return (
    <View style={styles.row}>
      <View style={[styles.badge, { backgroundColor: alpha(color, 0.12), borderColor: alpha(color, 0.2) }]}>
        <Text style={[styles.label, { color }]}>{label}</Text>
      </View>
      <Icon name={IconName.Chevron} size={14} color={colors.textTertiary} flip={I18nManager.isRTL} />
      <Text style={styles.hint}>{hint}</Text>
    </View>
  );
}

