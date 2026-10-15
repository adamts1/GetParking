import { Animated, View } from 'react-native';
import { useRadarRings } from '../../../ui';
import { styles } from './UserDot.styles';

/* The driver's own position. `radar` is both the ring colour and the fact
   that they are waiting: the rings run only while a session is open and
   unmatched.

   `heading` points a cone the way the phone is facing; 0° is north, which is
   also up because the map is never rotated. Without a heading (no
   magnetometer) the dot is drawn plain rather than pointing somewhere
   invented. */
export function UserDot({ heading, radar }: { heading: number | null; radar: string | null }) {
  const rings = useRadarRings(!!radar);
  return (
    <View style={styles.wrap}>
      {heading != null ? (
        <View style={[styles.headingWrap, { transform: [{ rotate: `${heading}deg` }] }]}>
          <View style={styles.cone} />
        </View>
      ) : null}

      {radar
        ? rings.map((value, index) => (
            <Animated.View
              key={index}
              style={[
                styles.ring,
                {
                  borderColor: radar,
                  opacity: value.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
                  transform: [{ scale: value.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }],
                },
              ]}
            />
          ))
        : null}
      <View style={styles.halo} />
      <View style={styles.dot} />
    </View>
  );
}
