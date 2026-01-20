import {
  Armchair,
  Fan,
  PanelsTopLeft,
  Lightbulb,
  Droplet,
  MoreHorizontal,
} from "lucide-react";

export const CATEGORIES = [
  {
    id: "chair",
    value: "chair",
    label: "Chairs",
    icon: Armchair,
    color: "#6366F1",
  },
  {
    id: "fan",
    value: "fan",
    label: "Fans",
    icon: Fan,
    color: "#22C55E",
  },
  {
    id: "window",
    value: "window",
    label: "Windows",
    icon: PanelsTopLeft,
    color: "#0EA5E9",
  },
  {
    id: "light",
    value: "light",
    label: "Lights",
    icon: Lightbulb,
    color: "#FACC15",
  },
  {
    id: "sanitation",
    value: "sanitation",
    label: "Sanitation",
    icon: Droplet,
    color: "#EC4899",
  },
  {
    id: "other",
    value: "other",
    label: "Other",
    icon: MoreHorizontal,
    color: "#64748B",
  },
];
