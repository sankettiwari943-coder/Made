import { createClient } from '../supabase/server';
import { Project, ProjectWithDetails } from '../supabase/types';

/**
 * Fetch all public projects with technologies and owner profile
 */
export async function getPublicProjects(): Promise<ProjectWithDetails[]> {
  const supabase = createClient();

  try {
    const { data: projectsData, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error || !projectsData || projectsData.length === 0) {
      return [];
    }

    const projectIds = projectsData.map((p) => p.id);
    const ownerIds = Array.from(new Set(projectsData.map((p) => p.owner_id)));

    // Fetch technologies
    const { data: techData } = await supabase
      .from('project_technologies')
      .select('project_id, technology')
      .in('project_id', projectIds);

    const techMap: Record<string, string[]> = {};
    if (techData) {
      techData.forEach((t) => {
        if (!techMap[t.project_id]) techMap[t.project_id] = [];
        techMap[t.project_id].push(t.technology);
      });
    }

    // Fetch owner profiles
    const { data: ownersData } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url, role, primary_focus')
      .in('id', ownerIds);

    const ownerMap: Record<string, any> = {};
    if (ownersData) {
      ownersData.forEach((o) => {
        ownerMap[o.id] = o;
      });
    }

    return projectsData.map((p) => ({
      ...(p as Project),
      technologies: techMap[p.id] || [],
      owner: ownerMap[p.owner_id] || undefined,
    }));
  } catch {
    return [];
  }
}

/**
 * Fetch single project by unique slug with members, build logs, and tech stack
 */
export async function getProjectBySlug(slug: string): Promise<ProjectWithDetails | null> {
  const supabase = createClient();
  const cleanSlug = slug.trim().toLowerCase();

  try {
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', cleanSlug)
      .single();

    if (error || !project) {
      return null;
    }

    const targetId = project.id;

    // 1. Fetch technologies
    const { data: techData } = await supabase
      .from('project_technologies')
      .select('technology')
      .eq('project_id', targetId);

    // 2. Fetch members with profiles
    const { data: membersData } = await supabase
      .from('project_members')
      .select('id, project_id, user_id, role, joined_at, profiles(id, full_name, username, avatar_url, role, primary_focus)')
      .eq('project_id', targetId);

    // 3. Fetch build logs with author profiles
    const { data: updatesData } = await supabase
      .from('project_updates')
      .select('id, project_id, author_id, title, content, created_at, updated_at, profiles(id, full_name, username, avatar_url, role)')
      .eq('project_id', targetId)
      .order('created_at', { ascending: false });

    // 4. Fetch owner profile
    const { data: ownerData } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url, role, primary_focus')
      .eq('id', project.owner_id)
      .single();

    return {
      ...(project as Project),
      technologies: techData?.map((t) => t.technology) || [],
      members:
        membersData?.map((m: any) => ({
          id: m.id,
          project_id: m.project_id,
          user_id: m.user_id,
          role: m.role,
          joined_at: m.joined_at,
          profile: m.profiles,
        })) || [],
      updates:
        updatesData?.map((u: any) => ({
          id: u.id,
          project_id: u.project_id,
          author_id: u.author_id,
          title: u.title,
          content: u.content,
          created_at: u.created_at,
          updated_at: u.updated_at,
          author: u.profiles,
        })) || [],
      owner: ownerData || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch featured projects for homepage
 */
export async function getFeaturedProjects(limit = 3): Promise<ProjectWithDetails[]> {
  const projects = await getPublicProjects();
  return projects.slice(0, limit);
}

/**
 * Fetch projects owned by or collaborated on by a user
 */
export async function getUserProjects(userId: string): Promise<ProjectWithDetails[]> {
  const supabase = createClient();

  try {
    const { data: memberRows, error } = await supabase
      .from('project_members')
      .select('project_id, role, projects(*)')
      .eq('user_id', userId);

    if (error || !memberRows || memberRows.length === 0) {
      return [];
    }

    const projects = memberRows.map((m: any) => m.projects).filter(Boolean);
    return projects as ProjectWithDetails[];
  } catch {
    return [];
  }
}

/**
 * Fetch public projects associated with a username
 */
export async function getPublicProjectsByUsername(username: string): Promise<ProjectWithDetails[]> {
  const supabase = createClient();
  const cleanUsername = username.trim().toLowerCase();

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', cleanUsername)
      .single();

    if (!profile) {
      return [];
    }

    const { data: memberRows, error } = await supabase
      .from('project_members')
      .select('project_id, projects(*)')
      .eq('user_id', profile.id);

    if (error || !memberRows || memberRows.length === 0) {
      return [];
    }

    const projects = memberRows
      .map((m: any) => m.projects)
      .filter((p: any) => p && p.is_public);

    return projects as ProjectWithDetails[];
  } catch {
    return [];
  }
}
