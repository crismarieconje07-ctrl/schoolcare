import { Armchair, CheckCircle, ChevronDown, ChevronUp, Clock, Droplets, Lightbulb, Loader, MoreHorizontal, PanelTop, Wind, GripHorizontal } from "lucide-react";
import type { Category, Priority, Status } from "./types";

export const CATEGORIES: { value: Category; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "chair", label: "Chair", icon: Armchair },
  { value: "fan", label: "Fan", icon: Wind },
  { value: "window", label: "Window", icon: PanelTop },
  { value: "light", label: "Light", icon: Lightbulb },
  { value: "sanitation", label: "Sanitation", icon: Droplets },
  { value: "other", label: "Other", icon: MoreHorizontal },
];

export const STATUSES: { value: Status; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "Pending", label: "Pending", icon: Clock },
  { value: "In Progress", label: "In Progress", icon: Loader },
  { value: "Completed", label: "Completed", icon: CheckCircle },
];

export const PRIORITIES: { value: Priority; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "Low", label: "Low", icon: ChevronDown },
  { value: "Moderate", label: "Moderate", icon: GripHorizontal },
  { value: "Urgent", label: "Urgent", icon: ChevronUp },
];

export const getCategoryColor = (category: Category) => {
  const colors: Record<Category, string> = {
    chair: "bg-category-chairs",
    fan: "bg-category-fans",
    window: "bg-category-windows",
    light: "bg-category-lights",
    sanitation: "bg-category-sanitation",
    other: "bg-category-others",
  };
  return colors[category] || "bg-gray-400";
};

export const getStatusColor = (status: Status) => {
  const colors: Record<Status, string> = {
    "Pending": "bg-status-pending",
    "In Progress": "bg-status-in-progress",
    "Completed": "bg-status-completed",
  };
  return colors[status] || "bg-gray-400";
};

export const getPriorityColor = (priority: Priority) => {
    const colors: Record<Priority, string> = {
      "Low": "bg-priority-low",
      "Moderate": "bg-priority-moderate",
      "Urgent": "bg-priority-urgent",
    };
    return colors[priority] || "bg-gray-400";
  };
