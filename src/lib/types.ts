import { Timestamp } from "firebase/firestore";

export type Category =
  | "chair"
  | "fan"
  | "window"
  | "light"
  | "sanitation"
  | "other";

export type Status =
  | "Pending"
  | "In Progress"
  | "Completed";

export type Priority =
  | "Low"
  | "Moderate"
  | "Urgent";

export interface Report {
  id: string;
  category: Category;
  roomNumber: string;
  description: string;
  status: Status;
  priority: Priority;
  userId: string;
  userDisplayName?: string | null;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  internalNotes?: string;
}
