/* Adding a car, and — during onboarding — the nickname the other driver will
   see. Validate, save, report the one error that matters. The first car a
   driver adds becomes the active one. */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccount } from '../../lib/account';
import * as api from '../../lib/api';
import { suggestedNickname, useAuth } from '../../lib/auth';
import { CarColor, PLATE_DIGITS_RE } from '../../lib/vehicles';
import type { VehicleFormProps } from './VehicleForm';

type FieldErrors = { name?: string; makeModel?: string; plate?: string };

export function useVehicleForm({ onDone, onSkip, askName = false, askCar = true }: VehicleFormProps) {
  const { t: translate } = useTranslation();
  const { session } = useAuth();
  const { profile, refresh } = useAccount();
  const [name, setName] = useState(() => (askName ? suggestedNickname(session) : ''));
  const [makeModel, setMakeModel] = useState('');
  const [color, setColor] = useState(CarColor.White);
  const [plate, setPlate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const validate = (withCar: boolean) => {
    const errors: FieldErrors = {};
    if (askName && !name.trim()) errors.name = translate('vehicle.errors.name');
    if (withCar && !makeModel.trim()) errors.makeModel = translate('vehicle.errors.makeModel');
    if (withCar && !PLATE_DIGITS_RE.test(plate)) errors.plate = translate('vehicle.errors.plate');
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const run = async (withCar: boolean, after: () => void) => {
    if (!profile || !validate(withCar)) return;
    setSaving(true);
    setError(null);
    try {
      if (askName) await api.updateNickname(profile.id, name.trim());
      if (withCar) {
        const id = await api.addVehicle(profile.id, {
          make_model: makeModel.trim(),
          color,
          plate_last_digits: plate,
        });
        if (!profile.active_vehicle_id) await api.setActiveVehicle(id);
      }
      await refresh();
      after();
    } catch {
      setError(translate('errors.unknown'));
      setSaving(false);
    }
  };

  return {
    name,
    setName,
    makeModel,
    setMakeModel,
    color,
    setColor,
    plate,
    // Digits only; the field is short enough that nothing else belongs in it.
    onPlateChange: (value: string) => setPlate(value.replace(/\D/g, '').slice(0, 3)),
    saving,
    error,
    fieldErrors,
    save: () => void run(askCar, onDone),
    // Skipping the car still keeps the nickname — it is required either way.
    skip: () => void run(false, () => onSkip?.()),
  };
}
