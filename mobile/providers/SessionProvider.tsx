/* The driver's session: what they are doing right now, kept in sync with the
   server.

   The session is always the server's answer, never a local guess, and no
   single signal is trusted to deliver it:
     - Realtime pushes changes to the driver's own sessions and matches; any of
       them triggers a refetch of get_active_state();
     - every (re)subscribe refetches too, and again a moment later, because
       Realtime can drop changes that land right after SUBSCRIBED;
     - returning to the foreground refetches;
     - while a session is open, a slow poll is the last safety net — it is
       also how an expiry (done by the server's cron) reaches a quiet screen.

   While a session is open the driver's position is sent every few seconds:
   the server re-matches a waiting searcher against it, and later checks the
   "parked" confirmation with it. */

import * as Haptics from 'expo-haptics';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as api from '../lib/api';
import {
  isOpen,
  MatchStatus,
  SessionError,
  sessionErrorOf,
  SessionKind,
  SessionStatus,
  type ActiveState,
  type ServerMatch,
  type ServerSession,
} from '../lib/session';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthProvider';
import { useLocation } from './LocationProvider';

/** Things that happened to the driver's session without them doing anything. */
export enum SessionNotice {
  Expired = 'expired',
  /** The other driver cancelled a match; this one is back to waiting. */
  CounterpartCancelled = 'counterpart_cancelled',
}

type SessionState = {
  /** The open session, or null when the driver is idle. */
  session: ServerSession | null;
  /** The active match, while there is one. */
  match: ServerMatch | null;
  /** A start or cancel is in flight. */
  busy: boolean;
  error: SessionError | null;
  notice: SessionNotice | null;
  clearError: () => void;
  clearNotice: () => void;
  startSearch: () => Promise<void>;
  startLeave: () => Promise<void>;
  cancel: () => Promise<void>;
};

const SessionContext = createContext<SessionState | null>(null);

const POLL_MS = 15_000;
/* While matched the other car's dot comes from the server's copy of their
   position, so it is fetched more often. Stage 5 replaces this with a live
   broadcast between the two phones. */
const MATCHED_POLL_MS = 5_000;
const SUBSCRIBE_SETTLE_MS = 2_500;
const LOCATION_UPLOAD_MS = 5_000;

/** What changed between two server answers that the driver should be told. */
function noticeBetween(previous: ActiveState | null, next: ActiveState): SessionNotice | null {
  const before = previous?.session;
  const after = next.session;
  if (!before || !after || before.id !== after.id) return null;
  if (isOpen(before) && after.status === SessionStatus.Expired) return SessionNotice.Expired;
  if (before.status === SessionStatus.Matched && after.status === SessionStatus.Active) {
    return SessionNotice.CounterpartCancelled;
  }
  return null;
}

/** A match the driver had not seen in the previous answer. */
const isNewMatch = (previous: ActiveState | null, next: ActiveState) =>
  next.match?.status === MatchStatus.Active && next.match.id !== previous?.match?.id;

type Loaded = { userId: string; state: ActiveState };

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { session: authSession } = useAuth();
  const userId = authSession?.user.id ?? null;
  const { fix } = useLocation();

  // Keyed by user, like AccountProvider: another user's state is ignored
  // rather than cleared, so signing out needs no reset effect.
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<SessionError | null>(null);
  const [notice, setNotice] = useState<SessionNotice | null>(null);

  const current = loaded && loaded.userId === userId ? loaded.state : null;
  const latest = current?.session ?? null;
  const session = isOpen(latest) ? latest : null;
  const match = current?.match?.status === MatchStatus.Active ? current.match : null;

  // The last answer, for working out notices; written only from callbacks.
  const lastState = useRef<ActiveState | null>(null);
  const latestFix = useRef(fix);
  useEffect(() => {
    latestFix.current = fix;
  }, [fix]);

  const apply = useCallback((forUser: string, next: ActiveState) => {
    const happened = noticeBetween(lastState.current, next);
    // Felt as well as seen: the driver may be looking at the road.
    if (lastState.current && isNewMatch(lastState.current, next)) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    lastState.current = next;
    if (happened) setNotice(happened);
    setLoaded({ userId: forUser, state: next });
  }, []);

  // Coalesce bursts (a match touches three rows at once) into one fetch.
  const inflight = useRef<Promise<void> | null>(null);
  const fetchAgain = useRef(false);
  const refresh = useCallback(async () => {
    if (!userId) return;
    if (inflight.current) {
      fetchAgain.current = true;
      return inflight.current;
    }
    const run = async () => {
      do {
        fetchAgain.current = false;
        try {
          apply(userId, await api.getActiveState());
        } catch (requestError) {
          if (sessionErrorOf(requestError) === SessionError.Network) setError(SessionError.Network);
        }
      } while (fetchAgain.current);
    };
    inflight.current = run().finally(() => {
      inflight.current = null;
    });
    return inflight.current;
  }, [userId, apply]);

  // ─── Keeping in sync ──────────────────────────────────────────────────

  useEffect(() => {
    if (!userId) return;
    lastState.current = null;
    api.getActiveState().then(
      (state) => apply(userId, state),
      () => setError(SessionError.Network),
    );

    const timers: ReturnType<typeof setTimeout>[] = [];
    const onChange = () => void refresh();
    const channel = supabase
      .channel(`session:${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions', filter: `user_id=eq.${userId}` }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches', filter: `searcher_id=eq.${userId}` }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches', filter: `leaver_id=eq.${userId}` }, onChange)
      .subscribe((status) => {
        if (status !== 'SUBSCRIBED') return;
        void refresh();
        timers.push(setTimeout(() => void refresh(), SUBSCRIBE_SETTLE_MS));
      });

    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
    });

    return () => {
      timers.forEach(clearTimeout);
      appState.remove();
      void supabase.removeChannel(channel);
    };
  }, [userId, apply, refresh]);

  const openSessionId = session?.id ?? null;
  const pollMs = match ? MATCHED_POLL_MS : POLL_MS;

  useEffect(() => {
    if (!openSessionId) return;
    const timer = setInterval(() => void refresh(), pollMs);
    return () => clearInterval(timer);
  }, [openSessionId, pollMs, refresh]);

  useEffect(() => {
    if (!openSessionId) return;
    const timer = setInterval(() => {
      const reading = latestFix.current;
      // A failed upload is retried on the next tick; nothing to tell the driver.
      if (reading) api.updateLocation(reading).catch(() => {});
    }, LOCATION_UPLOAD_MS);
    return () => clearInterval(timer);
  }, [openSessionId]);

  // ─── Actions ──────────────────────────────────────────────────────────

  const run = useCallback(
    async (action: () => Promise<void>) => {
      setBusy(true);
      setError(null);
      try {
        await action();
        await refresh();
      } catch (requestError) {
        setError(sessionErrorOf(requestError));
      } finally {
        setBusy(false);
      }
    },
    [refresh],
  );

  const start = useCallback(
    (kind: SessionKind) =>
      run(async () => {
        const reading = latestFix.current;
        if (!reading) throw new Error(SessionError.NoLocation);
        await api.startSession(kind, reading);
      }),
    [run],
  );

  const value = useMemo<SessionState>(
    () => ({
      session,
      match,
      busy,
      error,
      notice,
      clearError: () => setError(null),
      clearNotice: () => setNotice(null),
      startSearch: () => start(SessionKind.Search),
      startLeave: () => start(SessionKind.Leave),
      cancel: () => run(api.cancelActive),
    }),
    [session, match, busy, error, notice, start, run],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession outside SessionProvider');
  return context;
}
