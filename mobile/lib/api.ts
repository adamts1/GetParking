/* Data access for the signed-in driver. Tables are read directly (RLS limits
   every select to the driver's own rows); state changes go through RPCs. */

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
