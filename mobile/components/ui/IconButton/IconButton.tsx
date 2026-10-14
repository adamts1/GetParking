import { I18nManager, Pressable } from 'react-native';
import { Icon, type IconName } from '../Icons';
import { styles } from './IconButton.styles';

type Props = { icon: IconName; onPress: () => void; label: string };

/** A glass square with one icon — back, close, menu. */
export function IconButton({ icon, onPress, label }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && { opacity: 0.7 }]}
    >
      {/* A back arrow points the other way when the layout is mirrored. */}
      <Icon name={icon} flip={icon === 'back' && I18nManager.isRTL} />
    </Pressable>
  );
}
