/* What the home screen shows. Nothing here decides the flow — the server's
   session does (see SessionProvider); this hook turns it into what to draw. */

import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ToastTone } from '../../components/ui';
import { useAutoClear } from '../../lib/hooks';
import { navigateTo } from '../../lib/links';
import { counterpartPosition, MatchRole, SessionKind, SessionStatus } from '../../lib/session';
import { LocationPermission, useAccount, useLocation, useSession } from '../../providers';
import { alpha, colors } from '../../theme';

const TOAST_MS = 4_000;

export function useHomeScreen() {
  const { t: translate } = useTranslation();
  const { vehicle, profile } = useAccount();
  const { permission, fix, heading, openSettings } = useLocation();
  const sessionState = useSession();
  const { session, match, busy, error, notice, clearError, clearNotice } = sessionState;
  const [starting, setStarting] = useState<SessionKind | null>(null);

  useAutoClear(error, clearError, TOAST_MS);
  useAutoClear(notice, clearNotice, TOAST_MS);

  const start = async (kind: SessionKind) => {
    setStarting(kind);
    await (kind === SessionKind.Search ? sessionState.startSearch() : sessionState.startLeave());
    setStarting(null);
  };

  const waiting = session?.status === SessionStatus.Active;
  const accent = session?.kind === SessionKind.Leave ? colors.success : colors.primary;

  return {
    session,
    match,
    waiting,
    cancelling: busy && starting == null,
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
      other: counterpartPosition(match),
      // The other driver in their side's colour: a leaver is green, a searcher blue.
      otherColor: match?.role === MatchRole.Searcher ? colors.success : colors.primary,
      spot: match?.handoff ?? null,
      locateLabel: translate('home.locate'),
    },

    toast: error
      ? { text: translate(`errors.session.${error}`), tone: ToastTone.Error }
      : notice
        ? { text: translate(`notices.${notice}`), tone: ToastTone.Notice }
        : null,
  };
}
