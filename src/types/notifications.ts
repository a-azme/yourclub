export type NotificationType = "cancelled" | "confirmed" | "waitlisted";

export interface AppNotification {
  id: string;
  user_id: string;
  event_id: string | null;
  registration_id: string | null;
  type: NotificationType;
  title: string;
  body: string | null;
  read: boolean;
  created_at: string;
}