import { supabase } from '../lib/supabase';
import type { Review } from '../types';

export const getReviewsByExperience = async (experienceId: string): Promise<Review[]> => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('experience_id', experienceId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Reviews unavailable:', error.message);
    return [];
  }
  return data as Review[];
};

export const createReview = async (review: Partial<Review>): Promise<Review | null> => {
  const { data, error } = await supabase
    .from('reviews')
    .insert([review])
    .select()
    .single();

  if (error) {
    console.warn('Review create failed:', error.message);
    return null;
  }
  return data as Review;
};
