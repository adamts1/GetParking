/* Live positions between the two matched phones.

   Each phone joins a private Realtime Broadcast channel named after the match
   and sends its position there; the other phone moves the dot as soon as a
   message lands. Nothing is written to the database — Realtime relays the
   message — and the channel's RLS policy (see the migration) admits only the
   two participants, only while the match is active.

   Broadcast is the fast path, not the only one: the server still gets every
   position from SessionProvider (it checks "parked" against its own copy),
   so if the channel goes quiet the dot falls back to the server's copy of the
   other driver's position. */

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { distanceM, phaseFor, type LatLng, type MatchPhase } from '../lib/geo';
import { counterpartPosition, MatchRole } from '../lib/session';
import { supabase } from '../lib/supabase';
import { useLocation } from './LocationProvider';
import { useSession } from './SessionProvider';

type LiveTrackingState = {
  /** The other driver: live from the channel when fresh, else the server's copy. */
  otherPosition: LatLng | null;
  /** Whether the other phone's broadcasts are arriving. */
  live: boolean;
  /** How far the searcher is from the spot — the number both screens show. */
  searcherToSpotM: number | null;
  phase: MatchPhase;
};

const LiveTrackingContext = createContext<LiveTrackingState | null>(null);

const LOCATION_EVENT = 'location';
/** Send on movement of at least this much… */
const MOVE_M = 8;
/** …but not more often than this… */
const SEND_MIN_MS = 1_000;
/** …and at least this often, so a parked phone still shows it is there. */
const HEARTBEAT_MS = 3_000;
/** A live position older than this gives way to the server's copy. */
const STALE_MS = 15_000;
const CLOCK_MS = 5_000;

type Broadcast = LatLng & { accuracy: number | null; at: number };
type Received = { matchId: string; position: Broadcast; receivedAt: number };

export function LiveTrackingProvider({ children }: { children: React.ReactNode }) {
  const { match } = useSession();
  const { fix } = useLocation();
  const matchId = match?.id ?? null;

  const [received, setReceived] = useState<Received | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const channel = useRef<RealtimeChannel | null>(null);
  const joined = useRef(false);
  const lastSent = useRef<{ position: LatLng; at: number } | null>(null);
  const latestFix = useRef(fix);

  const send = (reading: Broadcast) => {
    if (!channel.current || !joined.current) return;
    lastSent.current = { position: reading, at: Date.now() };
    void channel.current.send({ type: 'broadcast', event: LOCATION_EVENT, payload: reading });
  };

  // Join the match's channel for as long as the match lasts.
  useEffect(() => {
    if (!matchId) return;
    let cancelled = false;

    const matchChannel = supabase.channel(`match:${matchId}`, {
      config: { private: true, broadcast: { self: false } },
    });
    matchChannel.on('broadcast', { event: LOCATION_EVENT }, ({ payload }) =>
      setReceived({ matchId, position: payload as Broadcast, receivedAt: Date.now() }),
    );
    channel.current = matchChannel;

    // Private channels authorise with the user's token, which Realtime must
    // have before joining.
    void supabase.realtime.setAuth().then(() => {
      if (cancelled) return;
      matchChannel.subscribe((status) => {
        joined.current = status === 'SUBSCRIBED';
      });
    });

    const heartbeat = setInterval(() => {
      const reading = latestFix.current;
      const since = lastSent.current ? Date.now() - lastSent.current.at : Infinity;
      if (reading && since >= HEARTBEAT_MS) send(reading);
    }, HEARTBEAT_MS);

    return () => {
      cancelled = true;
      clearInterval(heartbeat);
      joined.current = false;
      lastSent.current = null;
      channel.current = null;
      void supabase.removeChannel(matchChannel);
    };
  }, [matchId]);

  // Send as the driver moves, without flooding the channel.
  useEffect(() => {
    latestFix.current = fix;
    if (!fix || !matchId) return;
    const previous = lastSent.current;
    const moved = previous ? distanceM(previous.position, fix) : Infinity;
    const since = previous ? Date.now() - previous.at : Infinity;
    if (moved >= MOVE_M && since >= SEND_MIN_MS) send(fix);
  }, [fix, matchId]);

  // A coarse clock, only to notice that live positions have gone stale.
  useEffect(() => {
    if (!matchId) return;
    const timer = setInterval(() => setNow(Date.now()), CLOCK_MS);
    return () => clearInterval(timer);
  }, [matchId]);

  const fresh = received && received.matchId === matchId && now - received.receivedAt < STALE_MS ? received : null;
  const otherPosition = fresh?.position ?? counterpartPosition(match);

  // Whoever is driving to the spot: me when I search, them when I leave.
  const searcherPosition = match?.role === MatchRole.Searcher ? fix : otherPosition;
  const searcherToSpotM = match && searcherPosition ? distanceM(searcherPosition, match.handoff) : null;

  const value = useMemo<LiveTrackingState>(
    () => ({ otherPosition, live: !!fresh, searcherToSpotM, phase: phaseFor(searcherToSpotM) }),
    [otherPosition, fresh, searcherToSpotM],
  );

  return <LiveTrackingContext.Provider value={value}>{children}</LiveTrackingContext.Provider>;
}

export function useLiveTracking() {
  const context = useContext(LiveTrackingContext);
  if (!context) throw new Error('useLiveTracking outside LiveTrackingProvider');
  return context;
}
