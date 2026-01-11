
"use server";

import { revalidatePath } from "next/cache";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { z } from "zod";
import { categorizeReport } from "@/ai/flows/categorize-report";
import { initializeFirebase } from "@/firebase/server";
import type { UserProfile } from "@/lib/types";

// --- Authentication Actions ---

const signUpSchema = z.object({
  displayName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function signUp(values: z.infer<typeof signUpSchema>) {
  const { auth, firestore } = initializeFirebase();
  try {
    // 1. Create the user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      values.email,
      values.password
    );
    const user = userCredential.user;

    // 2. Update the auth profile's display name
    await updateProfile(user, { displayName: values.displayName });

    // 3. Create the user profile document in Firestore
    const role = values.email === "admin@schoolcare.com" ? "admin" : "student";
    const userProfile: UserProfile = {
      uid: user.uid,
      email: values.email,
      displayName: values.displayName,
      role: role,
    };
    await setDoc(doc(firestore, "users", user.uid), userProfile);
    
    // Revalidate the root to ensure layouts using this data are updated.
    revalidatePath("/", "layout");
    
    // Return the full user object on complete success
    return { success: true, user: user };
  } catch (error: any) {
    // This will catch failures from any of the steps above
    return { success: false, error: error.message };
  }
}

const logInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function logIn(values: z.infer<typeof logInSchema>) {
  try {
    const { auth } = initializeFirebase();
    await signInWithEmailAndPassword(auth, values.email, values.password);
    return { success: true };
  } catch (error: any) {
    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          return { success: false, error: 'Invalid credentials. Please try again.' };
        case 'auth/invalid-email':
          return { success: false, error: 'The email address is not valid.' };
        default:
          return { success: false, error: 'Login failed. Please try again.' };
      }
    }
    return { success: false, error: "An unknown error occurred." };
  }
}

export async function logOut() {
  try {
    const { auth } = initializeFirebase();
    await signOut(auth);
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- AI Action ---

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
  } catch (error: any) {
    return { success: false, error: "Failed to suggest a category." };
  }
}

// --- Report Actions ---
const updateReportSchema = z.object({
  reportId: z.string(),
  userId: z.string(),
  status: z.enum(['Pending', 'In Progress', 'Completed']).optional(),
  priority: z.enum(['Low', 'Moderate', 'Urgent']).optional(),
  internalNotes: z.string().optional(),
});


export async function updateReport(values: z.infer<typeof updateReportSchema>) {
    const { firestore } = initializeFirebase();
  
  try {
    const reportRef = doc(firestore, "users", values.userId, "reports", values.reportId);
    
    const updateData: any = {
      updatedAt: serverTimestamp(),
    };

    if (values.status) updateData.status = values.status;
    if (values.priority) updateData.priority = values.priority;
    if (values.internalNotes !== undefined) updateData.internalNotes = values.internalNotes;

    await updateDoc(reportRef, updateData);

    revalidatePath("/dashboard/admin");
    return { success: true };

  } catch (error: any)
{
    return { success: false, error: "Failed to update report. " + error.message };
  }
}
