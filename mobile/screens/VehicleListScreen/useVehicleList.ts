import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { useAccount } from '../../lib/account';
import * as api from '../../lib/api';
import type { Vehicle } from '../../lib/vehicles';

export function useVehicleList() {
  const { t } = useTranslation();
  const { vehicles, vehicle: active, refresh } = useAccount();
  const [pending, setPending] = useState<string | null>(null);

  const select = async (vehicle: Vehicle) => {
    if (vehicle.id === active?.id) return;
    setPending(vehicle.id);
    try {
      await api.setActiveVehicle(vehicle.id);
      await refresh();
    } catch {
      Alert.alert(t('errors.unknown'));
    } finally {
      setPending(null);
    }
  };

  /* The active car cannot be removed — pick another first. Otherwise the
     profile would point at an archived car and searches would carry it. */
  const remove = (vehicle: Vehicle) => {
    if (vehicle.id === active?.id) return;
    Alert.alert(t('vehicle.deleteConfirm', { name: vehicle.make_model }), undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('vehicle.delete'),
        style: 'destructive',
        onPress: async () => {
          await api.archiveVehicle(vehicle.id).catch(() => Alert.alert(t('errors.unknown')));
          await refresh().catch(() => {});
        },
      },
    ]);
  };

  return { vehicles, activeId: active?.id ?? null, pending, select, remove };
}
