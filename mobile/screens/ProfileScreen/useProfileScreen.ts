/* Editing the nickname, reaching the garage, signing out. */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { useAccount } from '../../lib/account';
import * as api from '../../lib/api';
import { signOut } from '../../lib/auth';
import { useAutoClear } from '../../lib/hooks';

export function useProfileScreen() {
  const { t: translate } = useTranslation();
  const { profile, refresh } = useAccount();
  // Null until the driver edits the field, so it follows the profile as it
  // arrives (and changes) without an effect copying it over.
  const [draft, setDraft] = useState<string | null>(null);
  const name = draft ?? profile?.nickname ?? '';
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  useAutoClear(saved, () => setSaved(false), 2000);

  const dirty = !!profile && name.trim() !== profile.nickname;

  const save = async () => {
    if (!profile) return;
    if (!name.trim()) {
      setNameError(translate('vehicle.errors.name'));
      return;
    }
    setNameError(null);
    setSaving(true);
    try {
      await api.updateNickname(profile.id, name.trim());
      await refresh();
      setDraft(null);
      setSaved(true);
    } catch {
      Alert.alert(translate('errors.unknown'));
    } finally {
      setSaving(false);
    }
  };

  return {
    credits: profile?.credits_balance ?? 0,
    name,
    setName: setDraft,
    nameError,
    dirty,
    saving,
    saved,
    save,
    signOut: () => void signOut(),
  };
}
