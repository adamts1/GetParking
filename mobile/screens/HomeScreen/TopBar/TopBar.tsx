import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GlassCard, Icon, IconName, LinkText } from '../../../components/ui';
import { colorHex, type Vehicle } from '../../../lib/vehicles';
import { colors, sharedStyles } from '../../../theme';
import { styles } from './TopBar.styles';

type Props = {
  vehicle: Vehicle | null;
  credits: number;
  locationDenied: boolean;
  onOpenVehicles: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
};

/** Idle only: the car the driver is in, their credits, and the profile. */
export function TopBar({ vehicle, credits, locationDenied, onOpenVehicles, onOpenProfile, onOpenSettings }: Props) {
  const { t: translate } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
      <View style={styles.bar}>
        <Pressable accessibilityRole="button" onPress={onOpenVehicles} style={styles.vehicle}>
          <GlassCard style={styles.vehicleCard}>
            <Icon name={IconName.Car} size={20} color={vehicle ? colorHex(vehicle.color) : colors.textTertiary} />
            <Text style={[sharedStyles.body, sharedStyles.fill]} numberOfLines={1}>
              {vehicle ? vehicle.make_model : translate('home.noVehicle')}
            </Text>
            <Text style={styles.credits}>{translate('home.credits', { count: credits })}</Text>
          </GlassCard>
        </Pressable>
        {/* A frosted card rather than the plain IconButton, which is made for
            dark screens and vanishes over the light map. */}
        <Pressable accessibilityRole="button" accessibilityLabel={translate('profile.title')} onPress={onOpenProfile}>
          <GlassCard style={styles.profileCard}>
            <Icon name={IconName.User} />
          </GlassCard>
        </Pressable>
      </View>

      {locationDenied ? (
        <GlassCard style={styles.notice} borderColor={colors.warningLine}>
          <Text style={sharedStyles.h2}>{translate('location.deniedTitle')}</Text>
          <Text style={sharedStyles.body}>{translate('location.deniedBody')}</Text>
          <LinkText label={translate('location.openSettings')} onPress={onOpenSettings} />
        </GlassCard>
      ) : null}
    </View>
  );
}
