/* One GPS watcher for the whole app.

   Several screens want the phone's position (the map dot now; starting a
   session and live tracking later). One subscription shared through context
   keeps them agreeing with each other and keeps the battery cost to one
   watcher. It runs only while the app is in the foreground. */

import * as Location from 'expo-location';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Linking } from 'react-native';
import type { LatLng } from './geo';

export type Fix = LatLng & { accuracy: number | null; at: number };

export enum LocationPermission {
  Unknown = 'unknown',
  Granted = 'granted',
  Denied = 'denied',
}

type LocationState = {
  permission: LocationPermission;
  fix: Fix | null;
  /** Compass bearing in degrees, for pointing the marker. Null until the
      magnetometer reports. */
  heading: number | null;
  openSettings: () => void;
};

/* The compass reports continuously and the marker is a native view that has
   to be redrawn on every change, so the bearing is rounded: a parked phone
   jitters by a degree or two and would otherwise redraw forever. */
const HEADING_STEP = 5;

const LocationContext = createContext<LocationState | null>(null);

const toFix = (reading: Location.LocationObject): Fix => ({
  lat: reading.coords.latitude,
  lng: reading.coords.longitude,
  accuracy: reading.coords.accuracy ?? null,
  at: reading.timestamp,
});

/** Asks only when the OS still allows asking; otherwise reports what it has. */
async function ensurePermission(): Promise<LocationPermission> {
  const current = await Location.getForegroundPermissionsAsync();
  let status = current.status;
  if (status !== Location.PermissionStatus.GRANTED && current.canAskAgain) {
    status = (await Location.requestForegroundPermissionsAsync()).status;
  }
  return status === Location.PermissionStatus.GRANTED ? LocationPermission.Granted : LocationPermission.Denied;
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [permission, setPermission] = useState(LocationPermission.Unknown);
  const [fix, setFix] = useState<Fix | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  const positionWatcher = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => setForeground(state === 'active'));
    return () => subscription.remove();
  }, []);

  // Ask on launch, and re-check on returning from Settings.
  useEffect(() => {
    if (!foreground) return;
    ensurePermission().then(setPermission, () => setPermission(LocationPermission.Denied));
  }, [foreground]);

  useEffect(() => {
    if (permission !== LocationPermission.Granted || !foreground) return;
    let cancelled = false;

    // A quick last-known fix so the map is not blank while GPS warms up.
    Location.getLastKnownPositionAsync({ maxAge: 5 * 60_000 }).then(
      (reading) => reading && !cancelled && setFix((current) => current ?? toFix(reading)),
      () => {},
    );

    /* And an actual reading, because a phone that has never had a fix has no
       last-known position, and the watcher below is bound to a distance — a
       driver sitting still might otherwise never see themselves on the map. */
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }).then(
      (reading) => !cancelled && setFix((current) => current ?? toFix(reading)),
      () => {},
    );

    Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 5 },
      (reading) => setFix(toFix(reading)),
    ).then(
      (subscription) => {
        if (cancelled) subscription.remove();
        else positionWatcher.current = subscription;
      },
      () => {},
    );

    return () => {
      cancelled = true;
      positionWatcher.current?.remove();
      positionWatcher.current = null;
    };
  }, [permission, foreground]);

  /* Which way the phone is pointing. From the magnetometer rather than from
     movement, because a driver looking for a spot wants to know which way they
     face while stopped — exactly when the GPS course is unavailable. */
  useEffect(() => {
    if (permission !== LocationPermission.Granted || !foreground) return;
    let cancelled = false;
    let headingWatcher: Location.LocationSubscription | null = null;

    Location.watchHeadingAsync((reading) => {
      // trueHeading is -1 without location permission; magnetic is the fallback.
      const degrees = reading.trueHeading >= 0 ? reading.trueHeading : reading.magHeading;
      if (cancelled || degrees < 0) return;
      const rounded = (Math.round(degrees / HEADING_STEP) * HEADING_STEP) % 360;
      setHeading((previous) => (previous === rounded ? previous : rounded));
    }).then(
      (subscription) => {
        if (cancelled) subscription.remove();
        else headingWatcher = subscription;
      },
      // No magnetometer, or it refused to start: the marker stays round.
      () => {},
    );

    return () => {
      cancelled = true;
      headingWatcher?.remove();
    };
  }, [permission, foreground]);

  const openSettings = useCallback(() => void Linking.openSettings(), []);

  const value = useMemo(
    () => ({ permission, fix, heading, openSettings }),
    [permission, fix, heading, openSettings],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation outside LocationProvider');
  return context;
}
