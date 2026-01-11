import type { Timestamp } from "firebase/firestore";

export type UserRole = "student" | "teacher" | "admin";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
}

export const CATEGORIES = ['chair', 'fan', 'window', 'light', 'sanitation', 'other'] as const;
export type Category = (typeof CATEGORIES)[number];

export const STATUSES = ['Pending', 'In Progress', 'Completed'] as const;
export type Status = (typeof STATUSES)[number];

export const PRIORITIES = ['Low', 'Moderate', 'Urgent'] as const;
export type Priority = (typeof PRIORITIES)[number];

export interface Report {
  id: string;
  userId: string;
  userDisplayName: string;
  category: Category;
  roomNumber: string;
  description: string;
  imageUrl?: string;
  status: Status;
  priority: Priority;
  internalNotes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
