import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { Button, GlassCard, Icon, IconName } from '../../components/ui';
import { colors, sharedStyles } from '../../theme';
import { Confetti } from './Confetti';
import { styles } from './SuccessScreen.styles';
import { useSuccessScreen } from './useSuccessScreen';

/** The handoff is done. Both drivers see it, whichever phone confirmed. */
export function SuccessScreen() {
  const { t: translate } = useTranslation();
  const { earnedCredit, balance, done } = useSuccessScreen();

  return (
    <View style={[sharedStyles.screen, sharedStyles.centred, styles.screen]}>
      {/* Over the home screen's dark status bar, which suits its light map. */}
      <StatusBar style="light" />
      <Confetti />

      <View style={styles.badgeOuter}>
        <View style={styles.badgeInner}>
          <Icon name={IconName.Check} size={36} color={colors.onColor} />
        </View>
      </View>

      <Text style={styles.title}>{translate(earnedCredit ? 'success.leaverTitle' : 'success.searcherTitle')}</Text>
      <Text style={[sharedStyles.centredBody, styles.body]}>
        {translate(earnedCredit ? 'success.leaverBody' : 'success.searcherBody')}
      </Text>

      <GlassCard style={styles.card}>
        <View>
          <Text style={styles.cardLabel}>{translate(earnedCredit ? 'success.earned' : 'success.paid')}</Text>
          <Text style={[styles.cardValue, earnedCredit ? styles.earned : styles.paid]}>
            {earnedCredit ? '+1' : '−1'}
          </Text>
        </View>
        <View style={styles.balance}>
          <Text style={styles.cardLabel}>{translate('success.balance')}</Text>
          <Text style={styles.cardValue}>{balance ?? '—'}</Text>
        </View>
      </GlassCard>

      <Button large label={translate('success.home')} onPress={done} style={styles.action} />
    </View>
  );
}
