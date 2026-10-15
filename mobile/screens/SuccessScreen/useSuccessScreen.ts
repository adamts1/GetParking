import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { MatchRole } from '../../lib/session';
import { useAccount, useSession } from '../../providers';

export function useSuccessScreen() {
  const { role } = useLocalSearchParams<{ role: MatchRole }>();
  const { profile, refresh } = useAccount();
  const { clearCompleted } = useSession();

  useEffect(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // The server just moved a credit; show the new balance.
    void refresh().catch(() => {});
  }, [refresh]);

  return {
    /** Only the leaver earns a credit; the searcher paid one for the spot. */
    earnedCredit: role === MatchRole.Leaver,
    balance: profile?.credits_balance ?? null,
    done: () => {
      // Cleared first: the home screen opens this route whenever a completion
      // is pending, and would open it straight back.
      clearCompleted();
      if (router.canGoBack()) router.back();
      else router.replace('/');
    },
  };
}
