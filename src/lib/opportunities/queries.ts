import { createClient } from '../supabase/server';
import { Opportunity, SavedOpportunity, OpportunityApplication } from '../supabase/types';
import { calculateOpportunityStatus } from './validations';

/**
 * Fetch all published opportunities with calculated status
 */
export async function getPublicOpportunities(): Promise<Opportunity[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('is_published', true)
      .order('deadline', { ascending: true, nullsFirst: false });

    if (error || !data || data.length === 0) {
      return [];
    }

    return data.map((opp: Opportunity) => ({
      ...opp,
      status: calculateOpportunityStatus(opp.deadline),
    }));
  } catch {
    return [];
  }
}

/**
 * Fetch a single opportunity by unique slug
 */
export async function getOpportunityBySlug(slug: string): Promise<Opportunity | null> {
  const supabase = createClient();
  const cleanSlug = slug.trim().toLowerCase();

  try {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('slug', cleanSlug)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      ...(data as Opportunity),
      status: calculateOpportunityStatus(data.deadline),
    };
  } catch {
    return null;
  }
}

/**
 * Fetch saved opportunities for authenticated user
 */
export async function getUserSavedOpportunities(userId: string): Promise<SavedOpportunity[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('saved_opportunities')
      .select('id, user_id, opportunity_id, created_at, opportunities(*)')
      .eq('user_id', userId);

    if (error || !data) return [];

    return data.map((item: any) => ({
      id: item.id,
      user_id: item.user_id,
      opportunity_id: item.opportunity_id,
      created_at: item.created_at,
      opportunity: item.opportunities
        ? {
            ...item.opportunities,
            status: calculateOpportunityStatus(item.opportunities.deadline),
          }
        : undefined,
    }));
  } catch {
    return [];
  }
}

/**
 * Fetch personal application tracking entries for authenticated user
 */
export async function getUserOpportunityApplications(userId: string): Promise<OpportunityApplication[]> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('opportunity_applications')
      .select('id, user_id, opportunity_id, status, created_at, updated_at, opportunities(*)')
      .eq('user_id', userId);

    if (error || !data) return [];

    return data.map((item: any) => ({
      id: item.id,
      user_id: item.user_id,
      opportunity_id: item.opportunity_id,
      status: item.status,
      created_at: item.created_at,
      updated_at: item.updated_at,
      opportunity: item.opportunities
        ? {
            ...item.opportunities,
            status: calculateOpportunityStatus(item.opportunities.deadline),
          }
        : undefined,
    }));
  } catch {
    return [];
  }
}
