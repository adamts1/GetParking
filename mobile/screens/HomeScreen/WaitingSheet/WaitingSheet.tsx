import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { BottomSheet, DangerButton, Spinner, StatusPill } from '../../../components/ui';
import { useTimeLeft } from '../../../lib/hooks';
import { SessionKind, type ServerSession } from '../../../lib/session';
import { colors, sharedStyles } from '../../../theme';
import { styles } from './WaitingSheet.styles';

type Props = { session: ServerSession; cancelling: boolean; onCancel: () => void };

/** Waiting for the server to find a partner. Searching and leaving are the
    same screen in two colours. The timer is the time left before the server
    gives up on the session. */
export function WaitingSheet({ session, cancelling, onCancel }: Props) {
  const { t: translate } = useTranslation();
  const timeLeft = useTimeLeft(session.expires_at);
  const searching = session.kind === SessionKind.Search;
  const accent = searching ? colors.primary : colors.success;
  const copy = searching ? 'searching' : 'leaving';

  return (
    <>
      <StatusPill color={accent} text={translate(`${copy}.pill`)} trailing={timeLeft} pulse />
      <BottomSheet>
        <View style={styles.intro}>
          <Spinner color={accent} />
          <Text style={[sharedStyles.h2, styles.title]}>{translate(`${copy}.title`)}</Text>
          <Text style={[sharedStyles.body, styles.body]}>{translate(`${copy}.body`)}</Text>
        </View>
        <DangerButton label={translate(`${copy}.cancel`)} onPress={onCancel} loading={cancelling} />
      </BottomSheet>
    </>
  );
}
