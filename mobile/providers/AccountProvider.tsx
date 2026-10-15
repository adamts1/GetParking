/* The signed-in driver's own data: profile (nickname, credits, active car)
   and cars.

   Credits change on the server when someone else confirms a handoff, so the
   profile row is followed over Realtime rather than refetched on a timer. */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../lib/api';
import { useAuth } from './AuthProvider';
import { supabase } from '../lib/supabase';
import type { Vehicle } from '../lib/vehicles';

/** Error matters: an empty list because the request failed is not the same
    as a driver with no cars, and only the second should ask for one. */
export enum LoadStatus {
  Loading = 'loading',
  Ready = 'ready',
  Error = 'error',
}

type AccountState = {
  profile: api.Profile | null;
  vehicles: Vehicle[];
  /** The car the driver is using now. */
  vehicle: Vehicle | null;
  status: LoadStatus;
  refresh: () => Promise<void>;
};

const AccountContext = createContext<AccountState | null>(null);

const RETRY_MS = 5_000;

type Loaded = {
  /** Whose data this is. A different (or no) signed-in user means it is stale. */
  userId: string;
  profile: api.Profile | null;
  vehicles: Vehicle[];
  status: LoadStatus;
};

async function loadAccount(userId: string): Promise<Loaded> {
  const [profile, vehicles] = await Promise.all([api.getProfile(), api.listVehicles()]);
  return { userId, profile, vehicles, status: LoadStatus.Ready };
}

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  /* Data loaded for someone else is ignored rather than cleared: signing out
     or switching accounts then needs no effect that resets state. */
  const current = loaded && loaded.userId === userId ? loaded : null;
  const profile = current?.profile ?? null;
  const vehicles = useMemo(() => current?.vehicles ?? [], [current]);
  const status = current?.status ?? LoadStatus.Loading;

  const failed = useCallback(
    (forUser: string) =>
      setLoaded((previous) =>
        previous?.userId === forUser
          ? { ...previous, status: LoadStatus.Error }
          : { userId: forUser, profile: null, vehicles: [], status: LoadStatus.Error },
      ),
    [],
  );

  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      setLoaded(await loadAccount(userId));
    } catch (loadError) {
      failed(userId);
      throw loadError;
    }
  }, [userId, failed]);

  useEffect(() => {
    if (!userId) return;
    loadAccount(userId).then(setLoaded, () => failed(userId));

    const channel = supabase
      .channel(`profile:${userId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
        (payload) =>
          setLoaded((previous) =>
            previous?.userId === userId && previous.profile
              ? { ...previous, profile: { ...previous.profile, ...(payload.new as api.Profile) } }
              : previous,
          ),
      )
      .subscribe();
    return () => void supabase.removeChannel(channel);
  }, [userId, failed]);

  /* A failed load is usually a phone that lost signal for a moment. Keep
     trying quietly rather than leaving the driver with an empty garage. */
  useEffect(() => {
    if (status !== LoadStatus.Error || !userId) return;
    const timer = setTimeout(() => void refresh().catch(() => {}), RETRY_MS);
    return () => clearTimeout(timer);
  }, [status, userId, refresh]);

  const value = useMemo<AccountState>(
    () => ({
      profile,
      vehicles,
      vehicle: vehicles.find((candidate) => candidate.id === profile?.active_vehicle_id) ?? null,
      status,
      refresh,
    }),
    [profile, vehicles, status, refresh],
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) throw new Error('useAccount outside AccountProvider');
  return context;
}
