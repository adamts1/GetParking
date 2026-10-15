import { Animated, View } from 'react-native';
import { colors } from '../../../theme';
import { useSpin } from '../animations';
import { styles } from './Spinner.styles';

/** The ring that turns while the server looks for a partner. */
export function Spinner({ color, size = 48 }: { color: string; size?: number }) {
  const rotate = useSpin();
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <View style={[styles.ring, { borderColor: colors.glass, borderRadius: size / 2 }]} />
      <Animated.View
        style={[
          styles.ring,
          { borderColor: 'transparent', borderTopColor: color, borderRadius: size / 2, transform: [{ rotate }] },
        ]}
      />
    </View>
  );
}

