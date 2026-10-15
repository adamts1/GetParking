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
