import { supabase } from '../supabase';
import type { DBSlide } from './types';

export async function saveSlides(
  webinarId: string,
  slides: Omit<DBSlide, 'id' | 'webinar_id' | 'created_at' | 'updated_at'>[]
) {
  // First delete existing slides
  await supabase
    .from('slides')
    .delete()
    .eq('webinar_id', webinarId);

  // Then insert new slides
  const { data, error } = await supabase
    .from('slides')
    .insert(
      slides.map(slide => ({
        ...slide,
        webinar_id: webinarId
      }))
    )
    .select();

  if (error) throw error;
  return data;
}