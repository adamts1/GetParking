/* Keeping the map pointed at the right things.

   The map follows what is on it — the driver, and while matched the other
   car and the spot — until the driver pans away; then it stays put until they tap locate. The view component only
   renders; every decision about the camera is here. */

import { useCallback, useEffect, useRef, useState } from 'react';
import type MapView from 'react-native-maps';
import { regionFor, TEL_AVIV, type LatLng } from '../../../lib/geo';

/* How close the map sits when there is only the driver to show — roughly a
   400 m box, about the distance someone will walk from a spot. It is a floor,
   not a fixed zoom: regionFor opens out when more points have to fit. */
export const DEFAULT_DELTA = 0.004;

export function useParkMap(points: (LatLng | null | undefined)[]) {
  const map = useRef<MapView>(null);
  const [following, setFollowing] = useState(true);
  const panning = useRef(false);

  const visible = points.filter((point): point is LatLng => !!point);

  // Re-fit only when something actually moved (~10 m), not on every render.
  const positionsKey = visible.map((point) => `${point.lat.toFixed(4)},${point.lng.toFixed(4)}`).join('|');

  /* One region for any number of points. The covered bottom strip is passed
     to the map as padding (see ParkMap), so the map centres the region in
     what is actually visible. */
  const fit = useCallback(
    (animated = true) => {
      if (!map.current || visible.length === 0) return;
      map.current.animateToRegion(regionFor(visible, DEFAULT_DELTA), animated ? 600 : 0);
    },
    // `visible` is rebuilt every render; `positionsKey` is what says it changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [positionsKey],
  );

  useEffect(() => {
    if (following) fit();
  }, [following, fit]);

  /* The first fix often lands before the native map has finished mounting,
     and a camera move made then is dropped. Fit once more when the map says
     it is ready — otherwise a driver who never moves never gets centred. */
  const onMapReady = useCallback(() => {
    if (following) fit(false);
  }, [following, fit]);

  const recenter = useCallback(() => {
    setFollowing(true);
    fit();
  }, [fit]);

  /** Where the map opens before anything is known. Read once by MapView. */
  const [initialRegion] = useState(() => regionFor(visible.length ? visible : [TEL_AVIV], DEFAULT_DELTA));

  return {
    map,
    initialRegion,
    following,
    recenter,
    onMapReady,
    /** A drag is the driver taking over; a programmatic move is not. */
    onPanDrag: () => {
      panning.current = true;
    },
    onRegionChangeComplete: () => {
      if (!panning.current) return;
      panning.current = false;
      setFollowing(false);
    },
  };
}
