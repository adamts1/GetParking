/* Welcome: Google, Apple, or an email code. The gate shows this instead of
   the router while signed out, so there is no /login route to deep-link past.
   A first sign-in by any of them creates the account. */

import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandMark, GoogleIcon, Icon, IconName } from '../../components/ui';
import { colors, sharedStyles } from '../../theme';
import { EmailAuthScreen } from '../EmailAuthScreen';
import { styles } from './LoginScreen.styles';
import { SignInProvider, useLoginScreen } from './useLoginScreen';

export function LoginScreen() {
  const { t: translate } = useTranslation();
  const insets = useSafeAreaInsets();
  const login = useLoginScreen();

  if (login.emailOpen) return <EmailAuthScreen onBack={login.closeEmail} />;

  return (
    <View style={[sharedStyles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.glow} />

      <View style={styles.brand}>
        <BrandMark size={120} label="GetParking" />
        <Text style={styles.wordmark}>
          Get<Text style={styles.wordmarkAccent}>Parking</Text>
        </Text>
        <Text style={styles.tagline}>{translate('app.tagline')}</Text>
      </View>

      <View style={styles.actions}>
        {login.providers.google ? (
          <ProviderButton
            provider={SignInProvider.Google}
            label={translate('auth.google')}
            busy={login.busy === SignInProvider.Google}
            disabled={!!login.busy}
            onPress={() => void login.signIn(SignInProvider.Google)}
          />
        ) : null}

        {login.providers.apple ? (
          <ProviderButton
            provider={SignInProvider.Apple}
            label={translate('auth.apple')}
            busy={login.busy === SignInProvider.Apple}
            disabled={!!login.busy}
            onPress={() => void login.signIn(SignInProvider.Apple)}
          />
        ) : null}

        {login.providers.email ? (
          <ProviderButton provider={SignInProvider.Email} label={translate('auth.email')} disabled={!!login.busy} onPress={login.openEmail} />
        ) : null}

        {login.error ? <Text style={[sharedStyles.error, styles.errorLine]}>{login.error}</Text> : null}
      </View>
    </View>
  );
}

function ProviderButton({
  provider,
  label,
  onPress,
  disabled,
  busy,
}: {
  provider: SignInProvider;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
}) {
  const google = provider === SignInProvider.Google;
  const tint = google ? '#1f2937' : colors.onColor;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, busy }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.provider,
        google ? styles.google : styles.glass,
        (pressed || (disabled && !busy)) && { opacity: 0.85 },
      ]}
    >
      {busy ? (
        <ActivityIndicator color={tint} />
      ) : google ? (
        <GoogleIcon />
      ) : (
        <Icon name={provider === SignInProvider.Apple ? IconName.Apple : IconName.Mail} color={tint} />
      )}
      <Text style={[styles.providerLabel, google && styles.googleLabel]}>{label}</Text>
    </Pressable>
  );
}
