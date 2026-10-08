export type UserRole = "user" | "admin";

export type RegistrationStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "waitlisted";

export type EventCategory =
  | "Programming"
  | "AI & ML"
  | "Robotics"
  | "Gaming"
  | "Workshop"
  | "Quiz";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  student_id: string | null;
  phone: string | null;
  department: string | null;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  created_at: string;
}

export interface Fest {
  id: string;
  organization_id: string;
  title: string;
  tagline: string | null;
  description: string | null;
  venue: string | null;
  start_date: string;
  end_date: string;
  image_url: string | null;
  created_at: string;
}

export interface EventItem {
  id: string;
  fest_id: string;
  title: string;
  description: string | null;
  category: EventCategory;
  venue: string | null;
  start_time: string;
  end_time: string;
  registration_deadline: string;
  capacity: number;
  fee: number;
  icon: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Registration {
  id: string;
  event_id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  student_id: string | null;
  department: string | null;
  extra: Record<string, unknown>;
  status: RegistrationStatus;
  checked_in: boolean;
  created_at: string;
}

export interface EventStats {
  event_id: string;
  capacity: number;
  registered_count: number;
  waitlist_count: number;
}

export interface SiteStats {
  upcoming_fests: number;
  total_events: number;
  registered_participants: number;
  active_organizations: number;
}