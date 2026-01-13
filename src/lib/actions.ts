"use server";

import { z } from "zod";
import { Timestamp } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/firebase/admin";
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

/* --------------------------- REPORTS --------------------------- */

const createReportSchema = z.object({
  category: z.string(),
  description: z.string(),
});

export async function createReport(values: z.infer<typeof createReportSchema>) {
  const decoded = await adminAuth.verifyIdToken(values as any);

  await adminDb
    .collection("users")
    .doc(decoded.uid)
    .collection("reports")
    .add({
      category: values.category,
      description: values.description,
      createdAt: Timestamp.now(),
      status: "pending",
    });

  return { success: true };
}
