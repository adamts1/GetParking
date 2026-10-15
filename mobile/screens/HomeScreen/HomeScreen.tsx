/* The one map screen: the map underneath, the driver's car and credits on
   top, and the two actions at the bottom. */

import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ParkMap } from '../../components/map';
import { Button, GlassCard, Icon, IconButton, IconName, LinkText } from '../../components/ui';
import { colorHex } from '../../lib/vehicles';
import { colors, sharedStyles } from '../../theme';
import { styles } from './HomeScreen.styles';
import { useHomeScreen } from './useHomeScreen';

export function HomeScreen() {
  const { t: translate } = useTranslation();
  const insets = useSafeAreaInsets();
  const home = useHomeScreen();

  return (
    <View style={sharedStyles.screen}>
      <ParkMap
        me={home.me}
        heading={home.heading}
        bottomInset={home.bottomInset}
        locateLabel={translate('home.locate')}
      />

      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <View style={styles.bar}>
          <Pressable accessibilityRole="button" onPress={home.openVehicles} style={styles.vehicle}>
            <GlassCard style={styles.vehicleCard}>
              <Icon
                name={IconName.Car}
                size={20}
                color={home.vehicle ? colorHex(home.vehicle.color) : colors.textTertiary}
              />
              <Text style={[sharedStyles.body, sharedStyles.fill]} numberOfLines={1}>
                {home.vehicle ? home.vehicle.make_model : translate('home.noVehicle')}
              </Text>
              <Text style={styles.credits}>{translate('home.credits', { count: home.credits })}</Text>
            </GlassCard>
          </Pressable>
          <IconButton icon={IconName.User} label={translate('profile.title')} onPress={home.openProfile} />
        </View>

        {home.locationDenied ? (
          <GlassCard style={styles.notice} borderColor={colors.warningLine}>
            <Text style={sharedStyles.h2}>{translate('location.deniedTitle')}</Text>
            <Text style={sharedStyles.body}>{translate('location.deniedBody')}</Text>
            <LinkText label={translate('location.openSettings')} onPress={home.openSettings} />
          </GlassCard>
        ) : null}
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 16 }]} onLayout={home.onBottomLayout}>
        <Button
          label={translate('home.search')}
          color={colors.primary}
          large
          style={sharedStyles.fill}
          disabled={!home.canStart}
        />
        <Button
          label={translate('home.leave')}
          color={colors.success}
          large
          style={sharedStyles.fill}
          disabled={!home.canStart}
        />
      </View>
    </View>
  );
}
