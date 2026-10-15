import { Text, View } from 'react-native';
import { colors } from '../../../theme';
import { Icon, type IconName } from '../Icons';
import { styles } from './Avatar.styles';

type Props = {
  letter: string;
  color: string;
  /** A small glyph cut into the corner: which side the driver is on. */
  badge?: IconName;
};

/** The other driver, as an initial. */
export function Avatar({ letter, color, badge }: Props) {
  return (
    <View style={[styles.avatar, { backgroundColor: color }]}>
      <Text style={styles.letter}>{letter.toUpperCase()}</Text>
      {badge ? (
        <View style={[styles.badge, { backgroundColor: color }]}>
          <Icon name={badge} size={10} color={colors.onColor} />
        </View>
      ) : null}
    </View>
  );
}

