/* What the home screen shows: where the driver is, which car they are in,
   and whether they can start. Searching and leaving arrive with sessions. */

import { router } from 'expo-router';
import { useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { useAccount } from '../../lib/account';
import { LocationPermission, useLocation } from '../../lib/location';

export function useHomeScreen() {
  const { vehicle, profile } = useAccount();
  const { permission, fix, heading, openSettings } = useLocation();
  // Height of the bottom controls, so the map keeps the driver above them.
  const [bottomInset, setBottomInset] = useState(0);

  return {
    vehicle,
    credits: profile?.credits_balance ?? 0,
    me: fix,
    heading,
    locationDenied: permission === LocationPermission.Denied,
    openSettings,
    /* Both actions need a car (the other driver looks for it) and a position
       (where to search, or which spot is being freed). */
    canStart: !!vehicle && !!fix,
    bottomInset,
    onBottomLayout: (event: LayoutChangeEvent) => setBottomInset(Math.round(event.nativeEvent.layout.height)),
    openVehicles: () => router.push(vehicle ? '/vehicles' : '/vehicles/new'),
    openProfile: () => router.push('/profile'),
  };
}
