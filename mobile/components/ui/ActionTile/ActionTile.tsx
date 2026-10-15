import { Pressable, Text, View } from 'react-native';
import { colors } from '../../../theme';
import { Icon, type IconName } from '../Icons';
import { styles } from './ActionTile.styles';

type Props = {
  icon: IconName;
  label: string;
  onPress: () => void;
  danger?: boolean;
  disabled?: boolean;
};

/** Icon over caption, in a glass square — call, message, cancel. */
export function ActionTile({ icon, label, onPress, danger, disabled }: Props) {
  const color = danger ? colors.danger : colors.textSecondary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        danger && styles.danger,
        (pressed || disabled) && { opacity: disabled ? 0.4 : 0.7 },
      ]}
    >
      <Icon name={icon} color={color} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

/** Tiles sit in a row of equal widths often enough to name the row. */
export function ActionRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}
