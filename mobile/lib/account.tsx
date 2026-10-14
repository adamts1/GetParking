/* The signed-in driver's own data: profile (nickname, credits, active car)
   and cars.

   Credits change on the server when someone else confirms a handoff, so the
   profile row is followed over Realtime rather than refetched on a timer. */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from './api';
import { useAuth } from './auth';
import { supabase } from './supabase';
import type { Vehicle } from './vehicles';

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

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const [profile, setProfile] = useState<api.Profile | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [status, setStatus] = useState(LoadStatus.Loading);

  const refresh = useCallback(async () => {
    try {
      const [loadedProfile, loadedVehicles] = await Promise.all([api.getProfile(), api.listVehicles()]);
      setProfile(loadedProfile);
      setVehicles(loadedVehicles);
      setStatus(LoadStatus.Ready);
    } catch (loadError) {
      setStatus(LoadStatus.Error);
      throw loadError;
    }
  }, []);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setVehicles([]);
      setStatus(LoadStatus.Loading);
      return;
    }
    void refresh().catch(() => {});

    const channel = supabase
      .channel(`profile:${userId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
        (payload) => setProfile((current) => (current ? { ...current, ...(payload.new as api.Profile) } : current)),
      )
      .subscribe();
    return () => void supabase.removeChannel(channel);
  }, [userId, refresh]);

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
