/* Which of the four things to show before the router: setup notice, spinner,
   login, or the onboarding step (nickname and first car). */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { LoadStatus, useAccount } from '../../lib/account';
import { AuthStatus, useAuth } from '../../lib/auth';
import { isConfigured } from '../../lib/supabase';

const SKIP_KEY = 'getparking.skipped-add-car';

export enum GateState {
  Unconfigured = 'unconfigured',
  Loading = 'loading',
  SignedOut = 'signed-out',
  Onboarding = 'onboarding',
  Ready = 'ready',
}

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
  const missingName = status === LoadStatus.Ready && !profile?.nickname;
  const missingCar = status === LoadStatus.Ready && vehicles.length === 0 && !skipped;

  const state: GateState = !isConfigured
    ? GateState.Unconfigured
    : auth.status === AuthStatus.Loading ||
        (auth.status === AuthStatus.SignedIn && (status === LoadStatus.Loading || skipped === null))
      ? GateState.Loading
      : auth.status === AuthStatus.SignedOut
        ? GateState.SignedOut
        : missingName || missingCar
          ? GateState.Onboarding
          : GateState.Ready;

  return { state, askName: missingName, askCar: missingCar || vehicles.length === 0, skip };
}
