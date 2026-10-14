import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Field, GlassCard, GlassRow, IconName, ModalHeader } from '../../components/ui';
import { sharedStyles } from '../../theme';
import { styles } from './ProfileScreen.styles';
import { useProfileScreen } from './useProfileScreen';

export function ProfileScreen() {
  const { t: translate } = useTranslation();
  const insets = useSafeAreaInsets();
  const profile = useProfileScreen();

  return (
    <KeyboardAvoidingView style={sharedStyles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <ModalHeader title={translate('profile.title')} closeLabel={translate('common.back')} onClose={() => router.back()} />

        <GlassCard style={styles.credits}>
          <Text style={sharedStyles.body}>{translate('profile.credits')}</Text>
          <Text style={styles.creditsValue}>{profile.credits}</Text>
        </GlassCard>

        <Field
          label={translate('vehicle.nickname')}
          hint={translate('vehicle.nicknameHint')}
          icon={IconName.User}
          value={profile.name}
          onChangeText={profile.setName}
          maxLength={30}
          error={profile.nameError}
        />
        <Button
          label={profile.saved ? translate('profile.saved') : translate('common.save')}
          disabled={!profile.dirty && !profile.saved}
          loading={profile.saving}
          onPress={() => void profile.save()}
          style={styles.save}
        />

        <GlassRow icon={IconName.Car} label={translate('profile.vehicles')} chevron onPress={() => router.push('/vehicles')} />
        <GlassRow label={translate('profile.signOut')} onPress={profile.signOut} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
