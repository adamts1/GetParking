import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconName, ModalHeader } from '../../components/ui';
import { alpha, colors, sharedStyles } from '../../theme';
import { colorHex, type Vehicle } from '../../lib/vehicles';
import { styles } from './VehicleListScreen.styles';
import { useVehicleList } from './useVehicleList';

/** My cars: pick the one in use, or add another. */
export function VehicleListScreen() {
  const { t: translate } = useTranslation();
  const insets = useSafeAreaInsets();
  const { vehicles, activeId, pending, select, remove } = useVehicleList();

  return (
    <View style={[sharedStyles.screen, { paddingTop: insets.top + 16 }]}>
      <View style={styles.content}>
        <ModalHeader title={translate('vehicle.listTitle')} closeLabel={translate('common.back')} onClose={() => router.back()} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        {vehicles.map((vehicle) => (
          <VehicleRow
            key={vehicle.id}
            vehicle={vehicle}
            active={vehicle.id === activeId}
            busy={pending === vehicle.id}
            onSelect={() => void select(vehicle)}
            onRemove={() => remove(vehicle)}
          />
        ))}

        <Pressable onPress={() => router.push('/vehicles/new')} style={styles.add} accessibilityRole="button">
          <View style={[styles.icon, { backgroundColor: colors.glass }]}>
            <Icon name={IconName.Plus} size={22} />
          </View>
          <Text style={styles.addLabel}>{translate('vehicle.addNew')}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function VehicleRow({
  vehicle,
  active,
  busy,
  onSelect,
  onRemove,
}: {
  vehicle: Vehicle;
  active: boolean;
  busy: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const { t: translate } = useTranslation();
  const hex = colorHex(vehicle.color);

  return (
    <Pressable
      onPress={onSelect}
      accessibilityRole="radio"
      accessibilityState={{ selected: active, busy }}
      style={[styles.row, active && styles.selected]}
    >
      <View style={[styles.icon, { backgroundColor: alpha(hex, 0.13) }]}>
        <Icon name={IconName.Car} size={24} color={hex} />
      </View>
      <View style={sharedStyles.fill}>
        <Text style={styles.name}>{vehicle.make_model}</Text>
        <Text style={styles.detail}>
          {translate(`vehicle.colors.${vehicle.color}`, { defaultValue: vehicle.color })} ·{' '}
          {translate('vehicle.plateShort', { digits: vehicle.plate_last_digits })}
        </Text>
      </View>
      {active ? (
        <View style={styles.check}>
          <Icon name={IconName.Check} size={14} color={colors.onColor} />
        </View>
      ) : (
        <Pressable onPress={onRemove} hitSlop={10} accessibilityLabel={translate('vehicle.delete')}>
          <Icon name={IconName.Trash} size={18} color={colors.textTertiary} />
        </Pressable>
      )}
    </Pressable>
  );
}
