/* What the home screen shows. Nothing here decides the flow — the server's
   session does (see SessionProvider); this hook turns it into what to draw. */

import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ToastTone } from '../../components/ui';
import { useAutoClear } from '../../lib/hooks';
import { formatDistance, MatchPhase } from '../../lib/geo';
import { navigateTo } from '../../lib/links';
import { MatchRole, SessionKind, SessionStatus } from '../../lib/session';
import { LocationPermission, useAccount, useLiveTracking, useLocation, useSession } from '../../providers';
import { alpha, colors } from '../../theme';

const TOAST_MS = 4_000;

export function useHomeScreen() {
  const { t: translate } = useTranslation();
  const { vehicle, profile } = useAccount();
  const { permission, fix, heading, openSettings } = useLocation();
  const sessionState = useSession();
  const { session, match, busy, error, notice, clearError, clearNotice } = sessionState;
  const { otherPosition, searcherToSpotM, phase } = useLiveTracking();
  const [starting, setStarting] = useState<SessionKind | null>(null);
  const [confirming, setConfirming] = useState(false);
  const { completed } = sessionState;

  // A completed match shows the success screen — on both phones, whichever
  // one confirmed. It clears `completed` itself when the driver leaves it.
  useEffect(() => {
    if (completed) router.push({ pathname: '/success', params: { role: completed.role } });
  }, [completed]);

  // The leaver is often not looking at the screen: tell them by touch when
  // the searcher gets close and when they arrive.
  const leaving = match?.role === MatchRole.Leaver;
  useEffect(() => {
    if (leaving && phase !== MatchPhase.OnTheWay) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [leaving, phase]);

  useAutoClear(error, clearError, TOAST_MS);
  useAutoClear(notice, clearNotice, TOAST_MS);

  const start = async (kind: SessionKind) => {
    setStarting(kind);
    await (kind === SessionKind.Search ? sessionState.startSearch() : sessionState.startLeave());
    setStarting(null);
  };

  const waiting = session?.status === SessionStatus.Active;
  const searching = match?.role === MatchRole.Searcher;
  const accent = session?.kind === SessionKind.Leave ? colors.success : colors.primary;

  return {
    session,
    match,
    waiting,
    cancelling: busy && starting == null && !confirming,
    confirming,
    confirmParked: async () => {
      setConfirming(true);
      await sessionState.confirmParked();
      setConfirming(false);
    },
    /* Cancelling a match lets the other driver down, so it asks first; a
       plain wait is only the driver's own business. */
    cancel: () =>
      match
        ? Alert.alert(translate('matched.cancelConfirmTitle'), translate('matched.cancelConfirmBody'), [
            { text: translate('matched.keep'), style: 'cancel' },
            { text: translate('matched.cancel'), style: 'destructive', onPress: () => void sessionState.cancel() },
          ])
        : void sessionState.cancel(),
    navigate: () => match && void navigateTo(match.handoff),

    vehicle,
    credits: profile?.credits_balance ?? 0,
    locationDenied: permission === LocationPermission.Denied,
    openSettings,
    openVehicles: () => router.push(vehicle ? '/vehicles' : '/vehicles/new'),
    openProfile: () => router.push('/profile'),

    /* Both actions need a car (the other driver looks for it) and a position
       (where to search, or which spot is being freed). */
    canStart: !!vehicle && !!fix,
    starting,
    startSearch: () => void start(SessionKind.Search),
    startLeave: () => void start(SessionKind.Leave),

    map: {
      me: fix,
      heading,
      radar: waiting ? alpha(accent, 0.35) : null,
      other: match ? otherPosition : null,
      // The other driver in their side's colour: a leaver is green, a searcher blue.
      otherColor: searching ? colors.success : colors.primary,
      spot: match?.handoff ?? null,
      // The route starts at whoever is driving: me when searching, them when leaving.
      routeFrom: match ? (searching ? fix : otherPosition) : null,
      routeColor: colors.primary,
      locateLabel: translate('home.locate'),
    },

    phase,
    distance:
      searcherToSpotM == null
        ? null
        : formatDistance(searcherToSpotM, {
            metres: translate('units.metres'),
            kilometres: translate('units.kilometres'),
          }),

    toast: error
      ? { text: translate(`errors.session.${error}`), tone: ToastTone.Error }
      : notice
        ? { text: translate(`notices.${notice}`), tone: ToastTone.Notice }
        : null,
  };
}
