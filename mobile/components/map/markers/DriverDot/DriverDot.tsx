import { View } from 'react-native';
import { alpha, colors } from '../../../../theme';
import { Icon, IconName } from '../../../ui';
import { styles } from './DriverDot.styles';

/** The other car, once the two are matched — in the colour of its side. */
export function DriverDot({ color }: { color: string }) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.halo, { backgroundColor: alpha(color, 0.12) }]} />
      <View style={[styles.dot, { backgroundColor: color }]}>
        <Icon name={IconName.Car} size={14} color={colors.onColor} />
      </View>
    </View>
  );
}
