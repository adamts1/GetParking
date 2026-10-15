import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { useAccount, useSession } from '../../providers';
import * as api from '../../lib/api';
import type { Vehicle } from '../../lib/vehicles';

export function useVehicleList() {
  const { t: translate } = useTranslation();
  const { vehicles, vehicle: active, refresh } = useAccount();
  const { session } = useSession();
  const [pending, setPending] = useState<string | null>(null);

  const select = async (vehicle: Vehicle) => {
    if (vehicle.id === active?.id) return;
    // The open session was started with the current car — it is the one the
    // other driver will look for, so it cannot change underneath them.
    if (session) {
      Alert.alert(translate('vehicle.lockedDuringSession'));
      return;
    }
    setPending(vehicle.id);
    try {
      await api.setActiveVehicle(vehicle.id);
      await refresh();
    } catch {
      Alert.alert(translate('errors.unknown'));
    } finally {
      setPending(null);
    }
  };

  /* The active car cannot be removed — pick another first. Otherwise the
     profile would point at an archived car and searches would carry it. */
  const remove = (vehicle: Vehicle) => {
    if (vehicle.id === active?.id) return;
    Alert.alert(translate('vehicle.deleteConfirm', { name: vehicle.make_model }), undefined, [
      { text: translate('common.cancel'), style: 'cancel' },
      {
        text: translate('vehicle.delete'),
        style: 'destructive',
        onPress: async () => {
          await api.archiveVehicle(vehicle.id).catch(() => Alert.alert(translate('errors.unknown')));
          await refresh().catch(() => {});
        },
      },
    ]);
  };

  return { vehicles, activeId: active?.id ?? null, pending, select, remove };
}
