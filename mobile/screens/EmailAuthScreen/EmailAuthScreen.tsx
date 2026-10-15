import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Field, Icon, IconName, LinkText, ScreenHeader } from '../../components/ui';
import { colors, sharedStyles } from '../../theme';
import { styles } from './EmailAuthScreen.styles';
import { CODE_LENGTH, EmailStep, useEmailAuthScreen } from './useEmailAuthScreen';

type Props = { onBack: () => void };

export function EmailAuthScreen({ onBack }: Props) {
  const { t: translate } = useTranslation();
  const insets = useSafeAreaInsets();
  const { codeInput, ...form } = useEmailAuthScreen();

  return (
    <KeyboardAvoidingView style={sharedStyles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader
          title={translate('auth.signIn')}
          subtitle={translate('auth.step', { step: form.step })}
          onBack={form.step === EmailStep.Code ? form.back : onBack}
        />

        <View style={styles.progress}>
          <View style={[styles.progressStep, styles.progressOn]} />
          <View style={[styles.progressStep, form.step === EmailStep.Code && styles.progressOn]} />
        </View>

        {form.step === EmailStep.Address ? (
          <>

            <Field
              label={translate('auth.emailLabel')}
              placeholder={translate('auth.emailPlaceholder')}
              icon={IconName.Mail}
              value={form.email}
              onChangeText={form.setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              returnKeyType="go"
              onSubmitEditing={form.send}
              error={form.emailError}
            />


            {form.error ? <Text style={sharedStyles.error}>{form.error}</Text> : null}

            <View style={styles.actions}>
              <Button large label={translate('common.continue')} loading={form.busy} onPress={form.send} />
            </View>
          </>
        ) : (
          <>
            <View style={styles.verify}>
              <View style={styles.mailIcon}>
                <Icon name={IconName.Mail} size={36} color={colors.primary} />
              </View>
              <Text style={[sharedStyles.h2, styles.verifyTitle]}>{translate('auth.verifyTitle')}</Text>
              <Text style={[sharedStyles.centredBody, styles.verifyBody]}>
                {translate('auth.verifyBody')}
                {'\n'}
                <Text style={styles.email}>{form.email.trim()}</Text>
              </Text>

              <Pressable onPress={form.focusCode} style={styles.codeRow}>
                {Array.from({ length: CODE_LENGTH }, (_slot, index) => (
                  <View key={index} style={[styles.codeBox, index === form.code.length && styles.codeBoxActive]}>
                    <Text style={styles.codeDigit}>{form.code[index] ?? ''}</Text>
                  </View>
                ))}
              </Pressable>
              <TextInput
                ref={codeInput}
                value={form.code}
                onChangeText={form.onCodeChange}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                accessibilityLabel={translate('auth.verifyTitle')}
                maxLength={CODE_LENGTH}
                style={styles.hiddenInput}
                autoFocus
              />

              {form.error ? <Text style={[sharedStyles.error, styles.errorLine]}>{form.error}</Text> : null}
              <Text style={[sharedStyles.caption, styles.noCode]}>{translate('auth.noCode')}</Text>
              {form.resendIn > 0 ? (
                <Text style={[sharedStyles.caption, styles.resendIn]}>{translate('auth.resendIn', { seconds: form.resendIn })}</Text>
              ) : (
                <LinkText label={translate('auth.resend')} onPress={form.send} />
              )}
            </View>

            <View style={styles.actions}>
              <Button
                large
                label={translate('auth.verify')}
                loading={form.busy}
                disabled={form.code.length !== CODE_LENGTH}
                onPress={form.verify}
              />
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
