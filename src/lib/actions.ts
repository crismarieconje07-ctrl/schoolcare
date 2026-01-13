
"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";

// Firebase Admin
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

import { initializeAdminApp } from "@/lib/firebase-admin";
import type { UserProfile, UserRole } from "@/lib/types";
import { categorizeReport } from "@/ai/flows/categorize-report";

/* ----------------------------- SCHEMAS ----------------------------- */

const signUpSchema = z.object({
  displayName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const logInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const reportSchema = z.object({
  category: z.enum([
    "chair",
    "fan",
    "window",
    "light",
    "sanitation",
    "other",
  ]),
  roomNumber: z.string().min(1),
  description: z.string().min(10),
});

/* ----------------------------- SIGN UP ----------------------------- */

export async function signUp(values: z.infer<typeof signUpSchema>) {
  try {
    const app = initializeAdminApp();
    const auth = getAuth(app);
    const db = getFirestore(app);

    const userRecord = await auth.createUser({
      email: values.email,
      password: values.password,
      displayName: values.displayName,
    });

    const role: UserRole =
      values.email.toLowerCase() === "admin@schoolcare.com"
        ? "admin"
        : "student";

    const profile: UserProfile = {
      uid: userRecord.uid,
      email: values.email,
      displayName: values.displayName,
      role,
    };

    await db.collection("users").doc(userRecord.uid).set(profile);

    // If the user is an admin, also add them to the roles_admin collection
    if (role === "admin") {
      await db.collection("roles_admin").doc(userRecord.uid).set({
        email: values.email,
        role: "admin",
      });
    }


    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error(error);
    // Return the actual Firebase error message for debugging
    return { success: false, error: error.message || "An unknown sign-up error occurred." };
  }
}

/* ----------------------------- LOG IN ----------------------------- */

export async function logIn(values: z.infer<typeof logInSchema>) {
  try {
    const app = initializeAdminApp();
    const auth = getAuth(app);

    // This part of the logic is handled client-side with session cookies.
    // The server-side login is just to verify credentials.
    // A successful verification doesn't require returning a token here
    // because the client will set its own auth state and session cookie.
    await auth.getUserByEmail(values.email);

    return { success: true };
  } catch {
    return { success: false, error: "Invalid credentials" };
  }
}

/* ----------------------------- LOG OUT ----------------------------- */

export async function logOut() {
  const cookieStore = await cookies();
  cookieStore.delete("session");

  revalidatePath("/", "layout");
  return { success: true };
}

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

/* ----------------------------- CREATE REPORT ----------------------------- */

export async function createReport(formData: FormData) {
  try {
    const app = initializeAdminApp();
    const auth = getAuth(app);
    const db = getFirestore(app);
    const storage = getStorage(app);

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
      return { success: false, error: "Not authenticated" };
    }

    const decoded = await auth.verifySessionCookie(sessionCookie, true);
    const userId = decoded.uid;
    const user = await auth.getUser(userId);

    const parsed = reportSchema.safeParse({
      category: formData.get("category"),
      roomNumber: formData.get("roomNumber"),
      description: formData.get("description"),
    });

    if (!parsed.success) {
      return { success: false, error: "Invalid form data" };
    }

    const photo = formData.get("photo") as File | null;
    let imageUrl: string | undefined;

    if (photo && photo.size > 0) {
      const buffer = Buffer.from(await photo.arrayBuffer());
      const filePath = `reports/${userId}/${Date.now()}_${photo.name}`;
      const bucket = storage.bucket();
      const file = bucket.file(filePath);

      await file.save(buffer, {
        contentType: photo.type,
      });

      // Make the file public to get a URL
      await file.makePublic();
      imageUrl = file.publicUrl();
    }

    const reportRef = db
      .collection("users")
      .doc(userId)
      .collection("reports")
      .doc();

    await reportRef.set({
      id: reportRef.id,
      userId,
      userDisplayName: user.displayName || user.email,
      ...parsed.data,
      imageUrl,
      status: "Pending",
      priority: "Low",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/admin");

    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: "Failed to create report" };
  }
}

/* --------------------------- UPDATE REPORT --------------------------- */

const updateReportSchema = z.object({
    reportId: z.string(),
    userId: z.string(),
    status: z.enum(["Pending", "In Progress", "Completed"]),
    priority: z.enum(["Low", "Moderate", "Urgent"]),
    internalNotes: z.string().optional(),
});

export async function updateReport(values: z.infer<typeof updateReportSchema>) {
    try {
        const app = initializeAdminApp();
        const db = getFirestore(app);

        const { reportId, userId, ...updateData } = values;

        const reportRef = db.collection("users").doc(userId).collection("reports").doc(reportId);
        
        await reportRef.update({
            ...updateData,
            updatedAt: FieldValue.serverTimestamp(),
        });

        revalidatePath(`/dashboard/admin/report/${userId}/${reportId}`);
        revalidatePath("/dashboard/admin");
        
        return { success: true };
    } catch (error) {
        console.error("Error updating report:", error);
        return { success: false, error: "Failed to update the report." };
    }
}
