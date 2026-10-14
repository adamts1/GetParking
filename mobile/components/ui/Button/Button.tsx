import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { C } from '../../../theme';
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
export function Button({ label, onPress, icon, color = C.primary, large, disabled, loading, style }: Props) {
  const off = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      disabled={off}
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.button,
        large && styles.large,
        off
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
        <ActivityIndicator color={C.onColor} />
      ) : (
        <View style={styles.content}>
          {icon ? <Icon name={icon} size={large ? 20 : 18} color={off ? C.textTertiary : C.onColor} /> : null}
          <Text style={[styles.label, large && styles.largeLabel, off && styles.disabledLabel]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}
