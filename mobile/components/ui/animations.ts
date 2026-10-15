/* The animations the UI primitives share. Kept apart from the views so a
   component file says what it draws, not how a value is driven over time. */

import { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';

// Created once and kept for the component's life; state, not a ref, so it can be read while rendering.
const useValue = (initial: number) => useState(() => new Animated.Value(initial))[0];

/** Breathes between full and dim — a live status dot. */
export function usePulse(active: boolean | undefined, duration = 700) {
  const value = useValue(1);
  useEffect(() => {
    if (!active) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(value, { toValue: 0.35, duration, useNativeDriver: true }),
        Animated.timing(value, { toValue: 1, duration, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, duration, value]);
  return value;
}

/** A continuous rotation, as a ready-to-use `rotate` interpolation. */
export function useSpin(duration = 1000) {
  const value = useValue(0);
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(value, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [duration, value]);
  return value.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
}

/** Staggered rings expanding outward — the radar around the driver's dot. */
export function useRadarRings(active: boolean, count = 3, duration = 2500) {
  const values = [useValue(0), useValue(0), useValue(0)].slice(0, count);
  useEffect(() => {
    if (!active) return;
    const loops = values.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * (duration / count)),
          Animated.timing(value, { toValue: 1, duration, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(value, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ),
    );
    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
    // values are refs: stable across renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, count, duration]);
  return values;
}

/** Drifts up and back down — the confetti on the success screen. */
export function useFloat(index: number, duration: number) {
  const value = useValue(0);
  useEffect(() => {
    const leg = (toValue: number) =>
      Animated.timing(value, { toValue, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true });
    const loop = Animated.loop(Animated.sequence([Animated.delay(index * 200), leg(1), leg(0)]));
    loop.start();
    return () => loop.stop();
  }, [duration, index, value]);
  return value;
}
