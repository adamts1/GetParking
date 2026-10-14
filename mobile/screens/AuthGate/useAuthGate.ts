/* Which of the four things to show before the router: setup notice, spinner,
   login, or the onboarding step (nickname and first car). */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { useAccount } from '../../lib/account';
import { useAuth } from '../../lib/auth';
import { isConfigured } from '../../lib/supabase';

const SKIP_KEY = 'getparking.skipped-add-car';

export type GateState = 'unconfigured' | 'loading' | 'signed-out' | 'onboarding' | 'ready';

export function useAuthGate() {
  const auth = useAuth();
  const { status, profile, vehicles } = useAccount();
  const [skipped, setSkipped] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(SKIP_KEY)
      .then((value) => setSkipped(value === '1'))
      .catch(() => setSkipped(false));
  }, []);

  const skip = useCallback(() => {
    setSkipped(true);
    void AsyncStorage.setItem(SKIP_KEY, '1').catch(() => {});
  }, []);

  /* The nickname is what the other driver sees, so it is required; the car
     can wait — the home screen asks for one before a search can start. Only a
     driver we know is missing something is asked; if the load failed, let
     them in and retry there. */
  const missingName = status === 'ready' && !profile?.nickname;
  const missingCar = status === 'ready' && vehicles.length === 0 && !skipped;

  const state: GateState = !isConfigured
    ? 'unconfigured'
    : auth.status === 'loading' || (auth.status === 'in' && (status === 'loading' || skipped === null))
      ? 'loading'
      : auth.status === 'out'
        ? 'signed-out'
        : missingName || missingCar
          ? 'onboarding'
          : 'ready';

  return { state, askName: missingName, askCar: missingCar || vehicles.length === 0, skip };
}
