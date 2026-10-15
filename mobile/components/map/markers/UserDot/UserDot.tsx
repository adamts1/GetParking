import { View } from 'react-native';
import { styles } from './UserDot.styles';

/* The driver's own position. `heading` points a cone the way the phone is
   facing; 0° is north, which is also up because the map is never rotated.
   Without a heading (no magnetometer) the dot is drawn plain rather than
   pointing somewhere invented. The search radar arrives with sessions. */
export function UserDot({ heading }: { heading: number | null }) {
  return (
    <View style={styles.wrap}>
      {heading != null ? (
        <View style={[styles.headingWrap, { transform: [{ rotate: `${heading}deg` }] }]}>
          <View style={styles.cone} />
        </View>
      ) : null}
      <View style={styles.halo} />
      <View style={styles.dot} />
    </View>
  );
}
