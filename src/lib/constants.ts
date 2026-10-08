import type { EventCategory, RegistrationStatus } from "@/types";

export const APP_NAME = "YourClub";

export const CATEGORIES: EventCategory[] = [
  "Programming",
  "AI & ML",
  "Robotics",
  "Gaming",
  "Workshop",
  "Quiz",
];

export const CATEGORY_STYLES: Record<EventCategory, string> = {
  Programming: "bg-blue-50 text-blue-700",
  "AI & ML": "bg-purple-50 text-purple-700",
  Robotics: "bg-green-50 text-green-700",
  Gaming: "bg-orange-50 text-orange-700",
  Workshop: "bg-teal-50 text-teal-700",
  Quiz: "bg-pink-50 text-pink-700",
};

export const STATUS_LABELS: Record<RegistrationStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  cancelled: "Cancelled",
  waitlisted: "Waitlisted",
};

export const STATUS_STYLES: Record<RegistrationStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
  waitlisted: "bg-slate-100 text-slate-700",
};

export const DEPARTMENTS = [
  "Science (Class 11)",
  "Science (Class 12)",
  "Commerce (Class 11)",
  "Commerce (Class 12)",
  "Humanities (Class 11)",
  "Humanities (Class 12)",
  "Other",
];

export const DEMO_ADMIN = { email: "admin@yourclub.dev", password: "Admin@12345" };
export const DEMO_USER = { email: "user@yourclub.dev", password: "User@12345" };