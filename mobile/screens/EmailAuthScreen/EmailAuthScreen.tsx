import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Field, Icon, LinkText, ScreenHeader } from '../../components/ui';
import { C, s } from '../../theme';
import { styles } from './EmailAuthScreen.styles';
import { CODE_LENGTH, useEmailAuthScreen } from './useEmailAuthScreen';

type Props = { onBack: () => void };

export function EmailAuthScreen({ onBack }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const form = useEmailAuthScreen();

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader
          title={t('auth.signIn')}
          subtitle={t('auth.step', { step: form.step })}
          onBack={form.step === 2 ? form.back : onBack}
        />

        <View style={styles.progress}>
          <View style={[styles.progressStep, styles.progressOn]} />
          <View style={[styles.progressStep, form.step === 2 && styles.progressOn]} />
        </View>

        {form.step === 1 ? (
          <>

            <Field
              label={t('auth.emailLabel')}
              placeholder={t('auth.emailPlaceholder')}
              icon="mail"
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


            {form.error ? <Text style={s.error}>{form.error}</Text> : null}

            <View style={styles.actions}>
              <Button large label={t('common.continue')} loading={form.busy} onPress={form.send} />
            </View>
          </>
        ) : (
          <>
            <View style={styles.verify}>
              <View style={styles.mailIcon}>
                <Icon name="mail" size={36} color={C.primary} />
              </View>
              <Text style={[s.h2, styles.verifyTitle]}>{t('auth.verifyTitle')}</Text>
              <Text style={[s.centredBody, styles.verifyBody]}>
                {t('auth.verifyBody')}
                {'\n'}
                <Text style={styles.email}>{form.email.trim()}</Text>
              </Text>

              <Pressable onPress={() => form.codeInput.current?.focus()} style={styles.codeRow}>
                {Array.from({ length: CODE_LENGTH }, (_, i) => (
                  <View key={i} style={[styles.codeBox, i === form.code.length && styles.codeBoxActive]}>
                    <Text style={styles.codeDigit}>{form.code[i] ?? ''}</Text>
                  </View>
                ))}
              </Pressable>
              <TextInput
                ref={form.codeInput}
                value={form.code}
                onChangeText={form.onCodeChange}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                accessibilityLabel={t('auth.verifyTitle')}
                maxLength={CODE_LENGTH}
                style={styles.hiddenInput}
                autoFocus
              />

              {form.error ? <Text style={[s.error, styles.errorLine]}>{form.error}</Text> : null}
              <Text style={[s.caption, styles.noCode]}>{t('auth.noCode')}</Text>
              {form.resendIn > 0 ? (
                <Text style={[s.caption, styles.resendIn]}>{t('auth.resendIn', { s: form.resendIn })}</Text>
              ) : (
                <LinkText label={t('auth.resend')} onPress={form.send} />
              )}
            </View>

            <View style={styles.actions}>
              <Button
                large
                label={t('auth.verify')}
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
