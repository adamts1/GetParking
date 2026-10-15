export type LatLng = { lat: number; lng: number };

/** Dizengoff Square — where the map opens before the phone reports a fix. */
export const TEL_AVIV: LatLng = { lat: 32.0776, lng: 34.7741 };

/** Map region that fits every given point, with some breathing room. */
export function regionFor(points: LatLng[], minDelta: number) {
  const latitudes = points.map((point) => point.lat);
  const longitudes = points.map((point) => point.lng);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(minDelta, (maxLat - minLat) * 1.8),
    longitudeDelta: Math.max(minDelta, (maxLng - minLng) * 1.8),
  };
}

const EARTH_RADIUS_M = 6_371_000;
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/** Great-circle distance in metres. Plenty accurate at street scale. */
export function distanceM(from: LatLng, to: LatLng): number {
  const deltaLat = toRadians(to.lat - from.lat);
  const deltaLng = toRadians(to.lng - from.lng);
  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) * Math.sin(deltaLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(haversine)));
}

/** "350 מ׳" / "1.2 ק״מ" — the unit strings come from the caller's locale. */
export function formatDistance(metres: number, units: { metres: string; kilometres: string }): string {
  if (!Number.isFinite(metres)) return '';
  if (metres < 1000) return `${Math.max(0, Math.round(metres / 10) * 10)} ${units.metres}`;
  return `${(metres / 1000).toFixed(1)} ${units.kilometres}`;
}

/* Where the searcher is relative to the spot. Drives the three-step progress
   both drivers see. The thresholds are generous on purpose: phone GPS between
   Tel Aviv buildings is often 20–30 m off, and a banner that flickers between
   states is worse than one that switches a little early. */
export const NEARBY_M = 150;
export const ARRIVED_M = 40;

export enum MatchPhase {
  OnTheWay = 'on_the_way',
  Nearby = 'nearby',
  Arrived = 'arrived',
}

export const MATCH_PHASES = [MatchPhase.OnTheWay, MatchPhase.Nearby, MatchPhase.Arrived];

export function phaseFor(searcherToSpotM: number | null): MatchPhase {
  if (searcherToSpotM == null) return MatchPhase.OnTheWay;
  if (searcherToSpotM <= ARRIVED_M) return MatchPhase.Arrived;
  if (searcherToSpotM <= NEARBY_M) return MatchPhase.Nearby;
  return MatchPhase.OnTheWay;
}
