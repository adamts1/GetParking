import { Linking, Platform } from 'react-native';
import type { LatLng } from './geo';

/* Waze first — it is what most Tel Aviv drivers use, and its universal link
   opens the app when installed and the website otherwise. */
export async function navigateTo(point: LatLng) {
  const waze = `https://waze.com/ul?ll=${point.lat},${point.lng}&navigate=yes`;
  try {
    await Linking.openURL(waze);
  } catch {
    const fallback =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?daddr=${point.lat},${point.lng}&dirflg=d`
        : `google.navigation:q=${point.lat},${point.lng}`;
    await Linking.openURL(fallback).catch(() => {});
  }
}
