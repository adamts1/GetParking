/* Matched: the two drivers know about each other. The searcher drives to the
   spot; the leaver waits in it. Both watch the same three steps — on the way,
   nearby, arrived — worked out from how far the searcher is from the spot.
   The "parked" confirmation comes in stage 6. */

import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import {
  BottomSheet,
  Button,
  ContextBadge,
  DangerButton,
  IconName,
  InfoStrip,
  ProgressSteps,
  StatusPill,
  StripNote,
} from '../../../components/ui';
import { MATCH_PHASES, MatchPhase } from '../../../lib/geo';
import { useTimeLeft } from '../../../lib/hooks';
import { MatchRole, type ServerMatch } from '../../../lib/session';
import { ACCENTS, colors } from '../../../theme';
import { CounterpartRow } from '../CounterpartRow';
import { styles } from './MatchedSheet.styles';

type Props = {
  match: ServerMatch;
  phase: MatchPhase;
  /** Searcher-to-spot distance, formatted; null until a position is known. */
  distance: string | null;
  cancelling: boolean;
  onCancel: () => void;
  onNavigate: () => void;
};

export function MatchedSheet({ match, phase, distance, cancelling, onCancel, onNavigate }: Props) {
  const { t: translate } = useTranslation();
  const timeLeft = useTimeLeft(match.expires_at);
  const steps = MATCH_PHASES.map((step) => translate(`matched.phases.${step}`));
  const reached = MATCH_PHASES.indexOf(phase);

  if (match.role === MatchRole.Searcher) {
    const arrived = phase === MatchPhase.Arrived;
    return (
      <>
        {arrived ? (
          <StatusPill color={colors.success} text={translate('matched.searcher.arrivedPill')} emphasised />
        ) : (
          <StatusPill color={colors.primary} text={translate('matched.searcher.pill')} trailing={timeLeft} emphasised />
        )}
        <BottomSheet>
          <ContextBadge
            color={colors.primary}
            label={translate('matched.searcher.badge')}
            hint={translate('matched.searcher.hint')}
          />
          <CounterpartRow
            counterpart={match.counterpart}
            verb={translate('matched.searcher.verb')}
            avatarColor={colors.success}
            badge={IconName.Car}
            distance={distance ?? undefined}
            distanceCaption={translate('matched.searcher.distanceCaption')}
            accent={colors.primary}
          />
          <InfoStrip
            accent={ACCENTS.spot}
            letter="P"
            title={translate('matched.searcher.spotTitle')}
            subtitle={translate('matched.searcher.spotSubtitle')}
          />
          <ProgressSteps labels={steps} reached={reached} color={colors.primary} />
          <View style={styles.actions}>
            {arrived ? null : (
              <Button large icon={IconName.Navigate} label={translate('matched.searcher.navigate')} onPress={onNavigate} />
            )}
            <DangerButton label={translate('matched.cancel')} onPress={onCancel} loading={cancelling} />
          </View>
        </BottomSheet>
      </>
    );
  }

  return (
    <>
      {phase === MatchPhase.Arrived ? (
        <StatusPill color={colors.success} text={translate('matched.leaver.arrivedPill')} emphasised />
      ) : phase === MatchPhase.Nearby ? (
        <StatusPill
          color={colors.success}
          text={translate('matched.leaver.nearbyPill')}
          trailing={distance ?? undefined}
          pulse
          emphasised
        />
      ) : (
        <StatusPill color={colors.success} text={translate('matched.leaver.pill')} trailing={timeLeft} emphasised />
      )}
      <BottomSheet>
        <ContextBadge
          color={colors.success}
          label={translate('matched.leaver.badge')}
          hint={translate('matched.leaver.hint')}
        />
        <CounterpartRow
          counterpart={match.counterpart}
          verb={translate(phase === MatchPhase.Arrived ? 'matched.leaver.arrivedVerb' : 'matched.leaver.verb')}
          avatarColor={colors.primary}
          badge={IconName.Search}
          distance={phase === MatchPhase.Arrived ? undefined : (distance ?? undefined)}
          distanceCaption={translate('matched.leaver.distanceCaption')}
          accent={colors.success}
        />
        <InfoStrip
          accent={ACCENTS.leaver}
          icon={IconName.Pin}
          title={translate('matched.leaver.spotTitle')}
          subtitle={translate('matched.leaver.spotSubtitle')}
          trailing={<StripNote text={translate('matched.leaver.credit')} color={ACCENTS.leaver.main} />}
        />
        <ProgressSteps labels={steps} reached={reached} color={colors.success} />
        <View style={styles.actions}>
          <DangerButton label={translate('matched.cancel')} onPress={onCancel} loading={cancelling} />
        </View>
      </BottomSheet>
    </>
  );
}
