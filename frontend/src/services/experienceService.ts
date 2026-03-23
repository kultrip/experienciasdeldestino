import { supabase } from '../lib/supabase';
import type { Experience } from '../types';

const DEFAULT_LOCAL_BACKEND = 'http://localhost:8001';
const RAW_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const isLocalhost =
  typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
const BACKEND_URL = isLocalhost ? DEFAULT_LOCAL_BACKEND : (RAW_BACKEND_URL || '')

export const getAllExperiences = async (): Promise<Experience[]> => {
  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getExperienceById = async (id: string): Promise<Experience> => {
  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const getExperiencesByProvince = async (province: string): Promise<Experience[]> => {
  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .eq('province', province)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getExperiencesByCategory = async (category: string): Promise<Experience[]> => {
  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .eq('category', category)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getMyExperiences = async (userId: string): Promise<Experience[]> => {
  // First get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!profile) return [];

  const { data, error } = await supabase
    .from('experiences')
    .select('*')
    .eq('created_by', profile.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createExperience = async (experience: Partial<Experience>): Promise<Experience> => {
  const { data, error } = await supabase
    .from('experiences')
    .insert([experience])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateExperience = async (id: string, updates: Partial<Experience>): Promise<Experience> => {
  const { data, error } = await supabase
    .from('experiences')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteExperience = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('experiences')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const semanticSearchExperiences = async (params: {
  query: string;
  province?: string;
  category?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  limit?: number;
}): Promise<{ mode: 'semantic' | 'keyword' | 'recent'; data: Experience[] }> => {
  const response = await fetch(`${BACKEND_URL}/api/search-experiences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Search failed (${response.status}) ${detail}`);
  }

  return response.json();
};

export const generateEmbeddingsForExperiences = async (params?: {
  onlyMissing?: boolean;
  limit?: number;
  includeUnpublished?: boolean;
}): Promise<{ success: boolean; updated: number; skipped: number; errors: Array<{ id: string; error: string }> }> => {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;
  if (!token) {
    throw new Error('No auth session. Please log in again.');
  }

  const response = await fetch(`${BACKEND_URL}/api/admin/generate-embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      onlyMissing: true,
      limit: 200,
      includeUnpublished: false,
      ...(params || {}),
    }),
  });

  const payloadText = await response.text();
  if (!response.ok) {
    throw new Error(`Embedding job failed (${response.status}) ${payloadText}`);
  }

  return JSON.parse(payloadText);
};
