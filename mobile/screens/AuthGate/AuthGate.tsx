import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';
import { BrandMark } from '../../components/ui';
import { C, s } from '../../theme';
import { LoginScreen } from '../LoginScreen';
import { VehicleForm } from '../VehicleForm';
import { styles } from './AuthGate.styles';
import { useAuthGate } from './useAuthGate';

/** Wraps the router: nothing inside it renders until there is a session. */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { state, askName, askCar, skip } = useAuthGate();

  switch (state) {
    case 'unconfigured':
      return (
        <View style={[s.screen, s.centred, styles.notice]}>
          <BrandMark size={96} />
          <Text style={[s.h2, styles.centre]}>{t('setup.title')}</Text>
          <Text style={s.centredBody}>{t('setup.body')}</Text>
        </View>
      );

    case 'loading':
      // AsyncStorage is genuinely async on a cold start, so this is visible.
      return (
        <View style={[s.screen, s.centred, styles.loading]}>
          <BrandMark size={96} />
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      );

    case 'signed-out':
      return <LoginScreen />;

    case 'onboarding':
      return <VehicleForm onDone={() => {}} onSkip={askCar ? skip : undefined} askName={askName} askCar={askCar} />;

    case 'ready':
      return <>{children}</>;
  }
}
