"use server";

import { adminAuth, adminDb } from "@/firebase/firebase-admin";
import { categorizeReport } from "@/ai/flows/categorize-report";
import { Timestamp } from "firebase-admin/firestore";

export async function createReport(formData: FormData) {
  // Example: verify user if needed
  // const user = await adminAuth.verifyIdToken(token);

  const description = formData.get("description") as string;

  if (!description) {
    throw new Error("Description is required");
  }

  // Optional AI categorization
  const category = await categorizeReport({ text: description });

  const report = {
    description,
    category,
    createdAt: Timestamp.now(),
  };

  // Example path:
  // users/{uid}/reports/{autoId}
  await adminDb
    .collection("users")
    .doc("REPLACE_WITH_UID")
    .collection("reports")
    .add(report);

  return { success: true };
}
