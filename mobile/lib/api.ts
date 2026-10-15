/* Data access for the signed-in driver. Tables are read directly (RLS limits
   every select to the driver's own rows); state changes go through RPCs. */

import type { LatLng } from './geo';
import { SessionKind, type ActiveState } from './session';
import { supabase } from './supabase';
import type { Vehicle } from './vehicles';

export type Profile = {
  id: string;
  nickname: string;
  credits_balance: number;
  active_vehicle_id: string | null;
};

export async function getProfile(): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nickname, credits_balance, active_vehicle_id')
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateNickname(id: string, nickname: string) {
  const { error } = await supabase.from('profiles').update({ nickname }).eq('id', id);
  if (error) throw error;
}

export async function listVehicles(): Promise<Vehicle[]> {
  const { data, error } = await supabase
    .from('vehicles')
    .select('id, make_model, color, plate_last_digits, created_at')
    .is('archived_at', null)
    .order('created_at');
  if (error) throw error;
  return data;
}

/** Adds a car and returns its id. */
export async function addVehicle(
  userId: string,
  vehicle: Pick<Vehicle, 'make_model' | 'color' | 'plate_last_digits'>,
): Promise<string> {
  const { data, error } = await supabase
    .from('vehicles')
    .insert({ user_id: userId, ...vehicle })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

/** Cars are archived, not deleted: past sessions still point at them. */
export async function archiveVehicle(id: string) {
  const { error } = await supabase
    .from('vehicles')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function setActiveVehicle(id: string) {
  const { error } = await supabase.rpc('set_active_vehicle', { p_vehicle_id: id });
  if (error) throw error;
}

// ─── Sessions ────────────────────────────────────────────────────────────

type Reading = LatLng & { accuracy: number | null };

const position = (reading: Reading) => ({
  lat: reading.lat,
  lng: reading.lng,
  accuracy: reading.accuracy ?? undefined,
});

/** Opens a search or a leave session at the driver's position; the server
    tries to match it straight away. */
export async function startSession(kind: SessionKind, at: Reading) {
  const { error } = await supabase.rpc(kind === SessionKind.Search ? 'start_search' : 'start_leave', position(at));
  if (error) throw error;
}

/** Keeps the server's copy of the driver's position fresh; a waiting
    searcher is re-matched against it. */
export async function updateLocation(at: Reading) {
  const { error } = await supabase.rpc('update_location', position(at));
  if (error) throw error;
}

export async function cancelActive() {
  const { error } = await supabase.rpc('cancel_active');
  if (error) throw error;
}

export async function getActiveState(): Promise<ActiveState> {
  const { data, error } = await supabase.rpc('get_active_state');
  if (error) throw error;
  return data as ActiveState;
}
