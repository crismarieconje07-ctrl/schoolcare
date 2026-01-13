
"use server";

import { z } from "zod";
import { categorizeReport } from "@/ai/flows/categorize-report";

/* ----------------------------- AI ----------------------------- */

const suggestCategorySchema = z.object({
  description: z.string(),
  photoDataUri: z.string().optional(),
});

export async function suggestCategory(
  values: z.infer<typeof suggestCategorySchema>
) {
  try {
    const result = await categorizeReport(values);
    return { success: true, category: result.suggestedCategory };
  } catch {
    return { success: false, error: "AI categorization failed" };
  }
}
