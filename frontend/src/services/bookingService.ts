import { supabase } from '../lib/supabase';
import type { Booking } from '../types';

export const getAllBookings = async (): Promise<Booking[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      experience:experiences(*)
    `)
    .order('created_at', { ascending: false });

  if (!error) return data;

  console.warn('Bookings join failed, retrying without relation:', error.message);
  const fallback = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });

  if (fallback.error) throw fallback.error;
  return fallback.data;
};

export const getBookingById = async (id: string): Promise<Booking> => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      experience:experiences(*)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const getBookingsByExperience = async (experienceId: string): Promise<Booking[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      experience:experiences(*)
    `)
    .eq('experience_id', experienceId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createBooking = async (booking: Partial<Booking>): Promise<Booking> => {
  const { data, error } = await supabase
    .from('bookings')
    .insert([booking])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateBooking = async (id: string, updates: Partial<Booking>): Promise<Booking> => {
  const { data, error } = await supabase
    .from('bookings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};
