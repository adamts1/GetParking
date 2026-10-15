import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../../../theme';
import { Icon, type IconName } from '../Icons';
import { styles } from './Button.styles';

type Props = {
  label: string;
  onPress?: () => void;
  icon?: IconName;
  /** The flow's accent; the glow underneath is derived from it. */
  color?: string;
  large?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** The filled, glowing call to action. */
export function Button({ label, onPress, icon, color = colors.primary, large, disabled, loading, style }: Props) {
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.button,
        large && styles.large,
        inactive
          ? styles.disabled
          : {
              backgroundColor: color,
              shadowColor: color,
              shadowOpacity: 0.45,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 8 },
            },
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.onColor} />
      ) : (
        <View style={styles.content}>
          {icon ? <Icon name={icon} size={large ? 20 : 18} color={inactive ? colors.textTertiary : colors.onColor} /> : null}
          <Text style={[styles.label, large && styles.largeLabel, inactive && styles.disabledLabel]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}
