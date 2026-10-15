import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';
import { BrandMark } from '../../components/ui';
import { colors, sharedStyles } from '../../theme';
import { LoginScreen } from '../LoginScreen';
import { VehicleForm } from '../VehicleForm';
import { styles } from './AuthGate.styles';
import { GateState, useAuthGate } from './useAuthGate';

/** Wraps the router: nothing inside it renders until there is a session. */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { t: translate } = useTranslation();
  const { state, askName, askCar, skip } = useAuthGate();

  switch (state) {
    case GateState.Unconfigured:
      return (
        <View style={[sharedStyles.screen, sharedStyles.centred, styles.notice]}>
          <BrandMark size={96} />
          <Text style={[sharedStyles.h2, styles.centre]}>{translate('setup.title')}</Text>
          <Text style={sharedStyles.centredBody}>{translate('setup.body')}</Text>
        </View>
      );

    case GateState.Loading:
      // AsyncStorage is genuinely async on a cold start, so this is visible.
      return (
        <View style={[sharedStyles.screen, sharedStyles.centred, styles.loading]}>
          <BrandMark size={96} />
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );

    case GateState.SignedOut:
      return <LoginScreen />;

    case GateState.Onboarding:
      return <VehicleForm onDone={() => {}} onSkip={askCar ? skip : undefined} askName={askName} askCar={askCar} />;

    case GateState.Ready:
      return <>{children}</>;
  }
}
