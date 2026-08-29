export type UserRole = 'MEMBER' | 'ADMIN' | 'SUPER_ADMIN';

export type ProjectStatus = 'IDEA' | 'BUILDING' | 'PROTOTYPE' | 'LIVE' | 'OPEN_SOURCE' | 'ARCHIVED';
export type ProjectMemberRole = 'OWNER' | 'COLLABORATOR';
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';

export type OpportunityType =
  | 'HACKATHON'
  | 'INTERNSHIP'
  | 'FELLOWSHIP'
  | 'COMPETITION'
  | 'SCHOLARSHIP'
  | 'GRANT'
  | 'PROGRAM'
  | 'OTHER';

export type OpportunityStatus = 'OPEN' | 'CLOSING_SOON' | 'CLOSED' | 'ARCHIVED';
export type OpportunityAppStatus = 'INTERESTED' | 'APPLIED' | 'COMPLETED' | 'DISMISSED';

export type EventType =
  | 'MEETUP'
  | 'WORKSHOP'
  | 'HACKATHON'
  | 'DEMO_DAY'
  | 'TALK'
  | 'CONFERENCE'
  | 'COMMUNITY'
  | 'OTHER';

export type EventRsvpStatus = 'GOING' | 'MAYBE' | 'NOT_GOING';

export type RoleDepartment =
  | 'ENGINEERING'
  | 'AI_ML'
  | 'DESIGN'
  | 'CYBERSECURITY'
  | 'CONTENT'
  | 'COMMUNITY'
  | 'OPERATIONS'
  | 'RESEARCH'
  | 'OTHER';

export type CareerRoleStatus = 'OPEN' | 'PAUSED' | 'CLOSED' | 'ARCHIVED';

export type ApplicationStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN';

export type AdminAuditAction =
  | 'CAREER_CREATED'
  | 'CAREER_UPDATED'
  | 'CAREER_PUBLISHED'
  | 'CAREER_UNPUBLISHED'
  | 'CAREER_PAUSED'
  | 'CAREER_CLOSED'
  | 'CAREER_ARCHIVED'
  | 'CAREER_DELETED'
  | 'OPPORTUNITY_CREATED'
  | 'OPPORTUNITY_UPDATED'
  | 'OPPORTUNITY_PUBLISHED'
  | 'OPPORTUNITY_UNPUBLISHED'
  | 'OPPORTUNITY_ARCHIVED'
  | 'OPPORTUNITY_DELETED'
  | 'EVENT_CREATED'
  | 'EVENT_UPDATED'
  | 'EVENT_PUBLISHED'
  | 'EVENT_UNPUBLISHED'
  | 'EVENT_ARCHIVED'
  | 'EVENT_DELETED'
  | 'PROJECT_MODERATED'
  | 'PROJECT_ARCHIVED'
  | 'BUILDER_MODERATED'
  | 'APPLICATION_STATUS_CHANGED'
  | 'APPLICATION_NOTE_ADDED'
  | 'APPLICATION_NOTE_DELETED';

export interface Profile {
  id: string;
  full_name: string;
  name?: string | null;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  primary_focus: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  location: string | null;
  current_build: string | null;
  onboarding_completed: boolean;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface ProfileSkill {
  id: string;
  profile_id: string;
  skill: string;
  created_at: string;
}

export interface ProfileInterest {
  id: string;
  profile_id: string;
  interest: string;
  created_at: string;
}

export interface ProfileWithDetails extends Profile {
  skills?: string[];
  interests?: string[];
}

export interface Project {
  id: string;
  owner_id: string;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  category: string;
  status: ProjectStatus;
  cover_image: string | null;
  github_url: string | null;
  live_url: string | null;
  demo_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectTechnology {
  id: string;
  project_id: string;
  technology: string;
  created_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectMemberRole;
  joined_at: string;
  profile?: Partial<Profile>;
}

export interface ProjectUpdate {
  id: string;
  project_id: string;
  author_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: Partial<Profile>;
}

export interface ProjectInvitation {
  id: string;
  project_id: string;
  inviter_id: string;
  invitee_id: string;
  status: InvitationStatus;
  created_at: string;
  responded_at: string | null;
  project?: Project;
  inviter?: Profile;
  invitee?: Profile;
}

export interface ProjectWithDetails extends Project {
  technologies?: string[];
  members?: (ProjectMember & { profile?: Partial<Profile> })[];
  updates?: (ProjectUpdate & { author?: Partial<Profile> })[];
  owner?: Partial<Profile>;
}

export interface Opportunity {
  id: string;
  title: string;
  slug: string;
  organization: string;
  short_description: string;
  description: string;
  type: OpportunityType;
  location: string | null;
  is_remote: boolean;
  application_url: string | null;
  deadline: string | null;
  start_date: string | null;
  end_date: string | null;
  status: OpportunityStatus;
  cover_image: string | null;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SavedOpportunity {
  id: string;
  user_id: string;
  opportunity_id: string;
  created_at: string;
  opportunity?: Opportunity;
}

export interface OpportunityApplication {
  id: string;
  user_id: string;
  opportunity_id: string;
  status: OpportunityAppStatus;
  created_at: string;
  updated_at: string;
  opportunity?: Opportunity;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  organizer: string;
  short_description: string;
  description: string;
  event_type: EventType;
  location: string | null;
  is_remote: boolean;
  start_at: string;
  end_at: string | null;
  registration_url: string | null;
  cover_image: string | null;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventRsvp {
  id: string;
  user_id: string;
  event_id: string;
  status: EventRsvpStatus;
  created_at: string;
  updated_at: string;
  event?: Event;
}

export interface CareerRole {
  id: string;
  title: string;
  slug: string;
  department: RoleDepartment;
  short_description: string;
  description: string;
  responsibilities: string;
  requirements: string;
  nice_to_have: string | null;
  benefits: string;
  location: string | null;
  is_remote: boolean;
  commitment: string;
  deadline: string | null;
  status: CareerRoleStatus;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CareerApplication {
  id: string;
  reference_code: string;
  role_id: string;
  applicant_id: string;
  full_name?: string | null;
  name?: string | null;
  applicant_name?: string | null;
  email?: string | null;
  applicant_email?: string | null;
  user_email?: string | null;
  contact_email?: string | null;
  admin_notes?: string | null;
  internal_notes?: string | null;
  cover_message: string;
  what_they_build: string;
  experience: string;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  resume_path: string | null;
  resume_url?: string | null;
  resume?: string | null;
  cv_url?: string | null;
  file_url?: string | null;
  additional_information: string | null;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
  role?: CareerRole;
  applicant?: Profile;
  profiles?: Profile;
  auth_user?: { email?: string | null } | null;
}

export interface ApplicationNote {
  id: string;
  application_id: string;
  author_id: string;
  content: string;
  note?: string;
  author_name?: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface ApplicationStatusHistory {
  id: string;
  application_id: string;
  changed_by: string | null;
  old_status: ApplicationStatus | null;
  new_status: ApplicationStatus;
  created_at: string;
  changer?: Profile;
}

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  action: AdminAuditAction | string;
  entity_type: 'CAREER' | 'OPPORTUNITY' | 'EVENT' | 'PROJECT' | 'BUILDER' | 'APPLICATION' | 'NOTE' | 'SETTINGS';
  entity_id: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  admin?: Partial<Profile>;
}
