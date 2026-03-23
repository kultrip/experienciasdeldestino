import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types';

export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data as UserProfile;
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getUsersByRole = async (role: string): Promise<UserProfile[]> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('role', role)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getUsersByProvince = async (province: string): Promise<UserProfile[]> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('province', province)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};
