import { createClient } from '../supabase/server';
import { Event, EventRsvp } from '../supabase/types';

/**
 * Fetch all published events ordered by start_at ascending
 */
export async function getPublicEvents(): Promise<Event[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_published', true)
      .order('start_at', { ascending: true });

    if (error || !data || data.length === 0) {
      return [];
    }

    return data as Event[];
  } catch {
    return [];
  }
}

/**
 * Fetch upcoming events (start_at >= now) for home / dashboard widgets
 */
export async function getUpcomingEvents(limit: number = 3): Promise<Event[]> {
  const supabase = createClient();
  const nowIso = new Date().toISOString();

  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_published', true)
      .gte('start_at', nowIso)
      .order('start_at', { ascending: true })
      .limit(limit);

    if (error || !data || data.length === 0) {
      return [];
    }

    return data as Event[];
  } catch {
    return [];
  }
}

/**
 * Fetch a single event by unique slug
 */
export async function getEventBySlug(slug: string): Promise<Event | null> {
  const supabase = createClient();
  const cleanSlug = slug.trim().toLowerCase();

  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('slug', cleanSlug)
      .single();

    if (error || !data) {
      return null;
    }

    return data as Event;
  } catch {
    return null;
  }
}

/**
 * Fetch RSVPs for authenticated user
 */
export async function getUserEventRsvps(userId: string): Promise<EventRsvp[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('event_rsvps')
      .select('id, user_id, event_id, status, created_at, updated_at, events(*)')
      .eq('user_id', userId);

    if (error || !data) return [];

    return data.map((item: any) => ({
      id: item.id,
      user_id: item.user_id,
      event_id: item.event_id,
      status: item.status,
      created_at: item.created_at,
      updated_at: item.updated_at,
      event: item.events || undefined,
    }));
  } catch {
    return [];
  }
}
