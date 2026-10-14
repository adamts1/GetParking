import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Field, GlassCard, GlassRow, ModalHeader } from '../../components/ui';
import { s } from '../../theme';
import { styles } from './ProfileScreen.styles';
import { useProfileScreen } from './useProfileScreen';

export function ProfileScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const p = useProfileScreen();

  return (
    <KeyboardAvoidingView style={s.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <ModalHeader title={t('profile.title')} closeLabel={t('common.back')} onClose={() => router.back()} />

        <GlassCard style={styles.credits}>
          <Text style={s.body}>{t('profile.credits')}</Text>
          <Text style={styles.creditsValue}>{p.credits}</Text>
        </GlassCard>

        <Field
          label={t('vehicle.nickname')}
          hint={t('vehicle.nicknameHint')}
          icon="user"
          value={p.name}
          onChangeText={p.setName}
          maxLength={30}
          error={p.nameError}
        />
        <Button
          label={p.saved ? t('profile.saved') : t('common.save')}
          disabled={!p.dirty && !p.saved}
          loading={p.saving}
          onPress={() => void p.save()}
          style={styles.save}
        />

        <GlassRow icon="car" label={t('profile.vehicles')} chevron onPress={() => router.push('/vehicles')} />
        <GlassRow label={t('profile.signOut')} onPress={p.signOut} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
