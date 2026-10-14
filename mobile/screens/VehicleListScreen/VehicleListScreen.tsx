import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, ModalHeader } from '../../components/ui';
import { alpha, C, s } from '../../theme';
import { colorHex, type Vehicle } from '../../lib/vehicles';
import { styles } from './VehicleListScreen.styles';
import { useVehicleList } from './useVehicleList';

/** My cars: pick the one in use, or add another. */
export function VehicleListScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { vehicles, activeId, pending, select, remove } = useVehicleList();

  return (
    <View style={[s.screen, { paddingTop: insets.top + 16 }]}>
      <View style={styles.content}>
        <ModalHeader title={t('vehicle.listTitle')} closeLabel={t('common.back')} onClose={() => router.back()} />
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
          <View style={[styles.icon, { backgroundColor: C.glass }]}>
            <Icon name="plus" size={22} />
          </View>
          <Text style={styles.addLabel}>{t('vehicle.addNew')}</Text>
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
  const { t } = useTranslation();
  const hex = colorHex(vehicle.color);

  return (
    <Pressable
      onPress={onSelect}
      accessibilityRole="radio"
      accessibilityState={{ selected: active, busy }}
      style={[styles.row, active && styles.selected]}
    >
      <View style={[styles.icon, { backgroundColor: alpha(hex, 0.13) }]}>
        <Icon name="car" size={24} color={hex} />
      </View>
      <View style={s.fill}>
        <Text style={styles.name}>{vehicle.make_model}</Text>
        <Text style={styles.detail}>
          {t(`vehicle.colors.${vehicle.color}`, { defaultValue: vehicle.color })} ·{' '}
          {t('vehicle.plateShort', { digits: vehicle.plate_last_digits })}
        </Text>
      </View>
      {active ? (
        <View style={styles.check}>
          <Icon name="check" size={14} color={C.onColor} />
        </View>
      ) : (
        <Pressable onPress={onRemove} hitSlop={10} accessibilityLabel={t('vehicle.delete')}>
          <Icon name="trash" size={18} color={C.textTertiary} />
        </Pressable>
      )}
    </Pressable>
  );
}
