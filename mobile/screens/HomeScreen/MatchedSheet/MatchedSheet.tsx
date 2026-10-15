import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { BottomSheet, DangerButton, Icon, IconName, StatusPill } from '../../../components/ui';
import { useTimeLeft } from '../../../lib/hooks';
import type { ServerMatch } from '../../../lib/session';
import { colors, sharedStyles } from '../../../theme';
import { styles } from '../WaitingSheet/WaitingSheet.styles';

type Props = { match: ServerMatch; cancelling: boolean; onCancel: () => void };

/** Stage 3 placeholder: the match exists and can be cancelled. Who the other
    driver is, and following them live, arrive in stages 4–5. */
export function MatchedSheet({ match, cancelling, onCancel }: Props) {
  const { t: translate } = useTranslation();
  const timeLeft = useTimeLeft(match.expires_at);

  return (
    <>
      <StatusPill color={colors.warning} text={translate('matched.pill')} trailing={timeLeft} emphasised />
      <BottomSheet>
        <View style={styles.intro}>
          <Icon name={IconName.CheckCircle} size={48} color={colors.warning} />
          <Text style={[sharedStyles.h2, styles.title]}>{translate('matched.title')}</Text>
          <Text style={[sharedStyles.body, styles.body]}>{translate('matched.body')}</Text>
        </View>
        <DangerButton label={translate('matched.cancel')} onPress={onCancel} loading={cancelling} />
      </BottomSheet>
    </>
  );
}
