import { Animated } from 'react-native';
import { useFloat } from '../../../components/ui';
import { CONFETTI_COLORS, CONFETTI_COUNT } from './Confetti.styles';

/** A drifting fleck. Positions are derived from the index rather than random
    so a re-render never makes the scene jump. */
function Fleck({ index }: { index: number }) {
  const value = useFloat(index, 3000 + (index % 2) * 1000);
  const size = 4 + (index % 3) * 2;
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: `${10 + ((index * 7) % 80)}%`,
        top: `${15 + ((index * 13) % 40)}%`,
        width: size,
        height: size,
        borderRadius: index % 2 === 0 ? size / 2 : 1,
        backgroundColor: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
        opacity: 0.35,
        transform: [
          { translateY: value.interpolate({ inputRange: [0, 1], outputRange: [0, -20] }) },
          { rotate: value.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) },
        ],
      }}
    />
  );
}

export function Confetti() {
  return (
    <>
      {Array.from({ length: CONFETTI_COUNT }, (_slot, index) => (
        <Fleck key={index} index={index} />
      ))}
    </>
  );
}
