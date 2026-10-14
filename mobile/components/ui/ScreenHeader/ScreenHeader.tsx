import { Text, View } from 'react-native';
import { s } from '../../../theme';
import { IconButton } from '../IconButton';
import { type IconName } from '../Icons';
import { styles } from './ScreenHeader.styles';

type Props = {
  title: string;
  subtitle?: string;
  /** Absent when the screen cannot be left — onboarding's first step. */
  onBack?: () => void;
  icon?: IconName;
};

/** Big title with an optional back arrow — the top of a form screen. */
export function ScreenHeader({ title, subtitle, onBack, icon = 'back' }: Props) {
  return (
    <View style={styles.header}>
      {onBack ? <IconButton icon={icon} onPress={onBack} label={title} /> : null}
      <View style={s.fill}>
        <Text style={s.h1}>{title}</Text>
        {subtitle ? <Text style={[s.body, styles.subtitle]}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}
