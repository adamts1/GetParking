import { Animated } from 'react-native';
import { usePulse } from '../animations';

type Props = { color: string; pulse?: boolean; size?: number };

/** The status dot in a pill: a coloured disc that breathes while live. */
export function Dot({ color, pulse, size = 10 }: Props) {
  const opacity = usePulse(pulse);
  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity,
        shadowColor: color,
        shadowOpacity: 0.8,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 0 },
      }}
    />
  );
}
