import { I18nManager, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../../../theme';
import { Icon, IconName } from '../Icons';
import { styles } from './GlassRow.styles';

type Props = {
  label: string;
  onPress: () => void;
  icon?: IconName;
  /** Shows a chevron: the row opens something rather than doing it. */
  chevron?: boolean;
  danger?: boolean;
};

/** A settings row. Several of these stack into the profile screen. */
export function GlassRow({ label, onPress, icon, chevron, danger }: Props) {
  const color = danger ? colors.danger : colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, danger && styles.danger, pressed && { opacity: 0.7 }]}
    >
      {icon ? <Icon name={icon} /> : null}
      <Text style={[styles.label, { color }]}>{label}</Text>
      {chevron ? (
        <Icon name={IconName.Chevron} size={18} color={colors.textTertiary} flip={I18nManager.isRTL} />
      ) : (
        <View style={styles.spacer} />
      )}
    </Pressable>
  );
}

