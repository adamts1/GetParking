import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { BrandMark, Button } from '../components/ui';
import { C, SPACE, s } from '../theme';
import { isConfigured } from '../lib/supabase';

// Phase 0 placeholder. Map, active-vehicle bar and session flows arrive in phases 1–3.
export default function Home() {
  const { t } = useTranslation();

  if (!isConfigured) {
    return (
      <SafeAreaView style={[s.screen, s.centred, styles.setup]}>
        <BrandMark size={96} />
        <Text style={[s.h2, styles.centre]}>{t('setup.title')}</Text>
        <Text style={s.centredBody}>{t('setup.body')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.screen}>
      <View style={styles.map} />
      <View style={styles.actions}>
        <Button label={t('home.search')} color={C.primary} large style={s.fill} />
        <Button label={t('home.leave')} color={C.success} large style={s.fill} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  setup: { gap: SPACE.md, padding: SPACE.xl },
  centre: { textAlign: 'center' },
  map: { flex: 1, backgroundColor: C.card },
  actions: { flexDirection: 'row', gap: SPACE.md, padding: SPACE.lg },
});
