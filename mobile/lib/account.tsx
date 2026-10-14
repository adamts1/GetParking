/* The signed-in driver's own data: profile (nickname, credits, active car)
   and cars.

   Credits change on the server when someone else confirms a handoff, so the
   profile row is followed over Realtime rather than refetched on a timer. */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from './api';
import { useAuth } from './auth';
import { supabase } from './supabase';
import type { Vehicle } from './vehicles';

/** 'error' matters: an empty list because the request failed is not the same
    as a driver with no cars, and only the second should ask for one. */
export type LoadStatus = 'loading' | 'ready' | 'error';

type AccountState = {
  profile: api.Profile | null;
  vehicles: Vehicle[];
  /** The car the driver is using now. */
  vehicle: Vehicle | null;
  status: LoadStatus;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AccountState | null>(null);

const RETRY_MS = 5_000;

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const uid = session?.user.id ?? null;
  const [profile, setProfile] = useState<api.Profile | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');

  const refresh = useCallback(async () => {
    try {
      const [p, v] = await Promise.all([api.getProfile(), api.listVehicles()]);
      setProfile(p);
      setVehicles(v);
      setStatus('ready');
    } catch (e) {
      setStatus('error');
      throw e;
    }
  }, []);

  useEffect(() => {
    if (!uid) {
      setProfile(null);
      setVehicles([]);
      setStatus('loading');
      return;
    }
    void refresh().catch(() => {});

    const channel = supabase
      .channel(`profile:${uid}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${uid}` },
        (payload) => setProfile((p) => (p ? { ...p, ...(payload.new as api.Profile) } : p)),
      )
      .subscribe();
    return () => void supabase.removeChannel(channel);
  }, [uid, refresh]);

  /* A failed load is usually a phone that lost signal for a moment. Keep
     trying quietly rather than leaving the driver with an empty garage. */
  useEffect(() => {
    if (status !== 'error' || !uid) return;
    const timer = setTimeout(() => void refresh().catch(() => {}), RETRY_MS);
    return () => clearTimeout(timer);
  }, [status, uid, refresh]);

  const value = useMemo<AccountState>(
    () => ({
      profile,
      vehicles,
      vehicle: vehicles.find((v) => v.id === profile?.active_vehicle_id) ?? null,
      status,
      refresh,
    }),
    [profile, vehicles, status, refresh],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAccount() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAccount outside AccountProvider');
  return v;
}
