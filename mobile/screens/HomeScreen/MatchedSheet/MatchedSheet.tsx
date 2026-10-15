/* Matched: the two drivers know about each other. The searcher drives to the
   spot; the leaver waits in it. Distance and "arrived" come with live
   tracking in stage 5, the "parked" confirmation in stage 6. */

import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import {
  BottomSheet,
  Button,
  ContextBadge,
  DangerButton,
  IconName,
  InfoStrip,
  StatusPill,
  StripNote,
} from '../../../components/ui';
import { useTimeLeft } from '../../../lib/hooks';
import { MatchRole, type ServerMatch } from '../../../lib/session';
import { ACCENTS, colors } from '../../../theme';
import { CounterpartRow } from '../CounterpartRow';
import { styles } from './MatchedSheet.styles';

type Props = {
  match: ServerMatch;
  cancelling: boolean;
  onCancel: () => void;
  onNavigate: () => void;
};

export function MatchedSheet({ match, cancelling, onCancel, onNavigate }: Props) {
  const { t: translate } = useTranslation();
  const timeLeft = useTimeLeft(match.expires_at);
  const searcher = match.role === MatchRole.Searcher;

  return searcher ? (
    <>
      <StatusPill color={colors.primary} text={translate('matched.searcher.pill')} trailing={timeLeft} emphasised />
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
        />
        <InfoStrip
          accent={ACCENTS.spot}
          letter="P"
          title={translate('matched.searcher.spotTitle')}
          subtitle={translate('matched.searcher.spotSubtitle')}
        />
        <View style={styles.actions}>
          <Button large icon={IconName.Navigate} label={translate('matched.searcher.navigate')} onPress={onNavigate} />
          <DangerButton label={translate('matched.cancel')} onPress={onCancel} loading={cancelling} />
        </View>
      </BottomSheet>
    </>
  ) : (
    <>
      <StatusPill color={colors.success} text={translate('matched.leaver.pill')} trailing={timeLeft} emphasised />
      <BottomSheet>
        <ContextBadge
          color={colors.success}
          label={translate('matched.leaver.badge')}
          hint={translate('matched.leaver.hint')}
        />
        <CounterpartRow
          counterpart={match.counterpart}
          verb={translate('matched.leaver.verb')}
          avatarColor={colors.primary}
          badge={IconName.Search}
        />
        <InfoStrip
          accent={ACCENTS.leaver}
          icon={IconName.Pin}
          title={translate('matched.leaver.spotTitle')}
          subtitle={translate('matched.leaver.spotSubtitle')}
          trailing={<StripNote text={translate('matched.leaver.credit')} color={ACCENTS.leaver.main} />}
        />
        <View style={styles.actions}>
          <DangerButton label={translate('matched.cancel')} onPress={onCancel} loading={cancelling} />
        </View>
      </BottomSheet>
    </>
  );
}
