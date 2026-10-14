import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button, Icon, IconButton } from '../components/ui';
import { useAccount } from '../lib/account';
import { colorHex } from '../lib/vehicles';
import { C, R, SPACE, s } from '../theme';

// Phase 1: top bar with the active car and the profile. The map and session
// flows arrive in phases 2–3.
export default function Home() {
  const { t } = useTranslation();
  const { vehicle, profile } = useAccount();

  return (
    <SafeAreaView style={s.screen}>
      <View style={styles.bar}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(vehicle ? '/vehicles' : '/vehicles/new')}
          style={styles.vehicle}
        >
          <Icon name="car" size={20} color={vehicle ? colorHex(vehicle.color) : C.textTertiary} />
          <Text style={[s.body, s.fill]} numberOfLines={1}>
            {vehicle ? vehicle.make_model : t('home.noVehicle')}
          </Text>
          <Text style={styles.credits}>{t('home.credits', { count: profile?.credits_balance ?? 0 })}</Text>
        </Pressable>
        <IconButton icon="user" label={t('profile.title')} onPress={() => router.push('/profile')} />
      </View>

      <View style={styles.map} />

      <View style={styles.actions}>
        <Button label={t('home.search')} color={C.primary} large style={s.fill} disabled={!vehicle} />
        <Button label={t('home.leave')} color={C.success} large style={s.fill} disabled={!vehicle} />
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
    borderRadius: R.md,
    backgroundColor: C.glass,
    borderWidth: 1,
    borderColor: C.glassBorder,
  },
  credits: { color: C.success, fontSize: 13, fontWeight: '700' },
  map: { flex: 1, backgroundColor: C.card },
  actions: { flexDirection: 'row', gap: SPACE.md, padding: SPACE.lg },
});
