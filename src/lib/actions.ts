"use server";

import type { Category } from "@/lib/types";

export async function suggestCategory({
  description,
}: {
  description: string;
}): Promise<{ success: true; category: Category }> {
  const text = description.toLowerCase();

  if (text.includes("chair")) return { success: true, category: "chair" };
  if (text.includes("fan")) return { success: true, category: "fan" };
  if (text.includes("window")) return { success: true, category: "window" };
  if (text.includes("light")) return { success: true, category: "light" };
  if (text.includes("toilet") || text.includes("water"))
    return { success: true, category: "sanitation" };

  return { success: true, category: "other" };
}
