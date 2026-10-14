import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button, Icon, IconButton, IconName } from '../components/ui';
import { useAccount } from '../lib/account';
import { colorHex } from '../lib/vehicles';
import { colors, radius, SPACE, sharedStyles } from '../theme';

// Phase 1: top bar with the active car and the profile. The map and session
// flows arrive in phases 2–3.
export default function Home() {
  const { t: translate } = useTranslation();
  const { vehicle, profile } = useAccount();

  return (
    <SafeAreaView style={sharedStyles.screen}>
      <View style={styles.bar}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(vehicle ? '/vehicles' : '/vehicles/new')}
          style={styles.vehicle}
        >
          <Icon name={IconName.Car} size={20} color={vehicle ? colorHex(vehicle.color) : colors.textTertiary} />
          <Text style={[sharedStyles.body, sharedStyles.fill]} numberOfLines={1}>
            {vehicle ? vehicle.make_model : translate('home.noVehicle')}
          </Text>
          <Text style={styles.credits}>{translate('home.credits', { count: profile?.credits_balance ?? 0 })}</Text>
        </Pressable>
        <IconButton icon={IconName.User} label={translate('profile.title')} onPress={() => router.push('/profile')} />
      </View>

      <View style={styles.map} />

      <View style={styles.actions}>
        <Button label={translate('home.search')} color={colors.primary} large style={sharedStyles.fill} disabled={!vehicle} />
        <Button label={translate('home.leave')} color={colors.success} large style={sharedStyles.fill} disabled={!vehicle} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: SPACE.sm, padding: SPACE.lg },
  vehicle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.sm,
    paddingHorizontal: SPACE.md,
    paddingVertical: SPACE.sm + 2,
    borderRadius: radius.md,
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  credits: { color: colors.success, fontSize: 13, fontWeight: '700' },
  map: { flex: 1, backgroundColor: colors.card },
  actions: { flexDirection: 'row', gap: SPACE.md, padding: SPACE.lg },
});
