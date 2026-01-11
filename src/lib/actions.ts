
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
import type { User } from "firebase/auth";

// --- Authentication Actions ---

const signUpSchema = z.object({
  displayName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function signUp(values: z.infer<typeof signUpSchema>) {
  try {
    const { auth } = initializeFirebase();
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      values.email,
      values.password
    );
    
    await updateProfile(userCredential.user, { displayName: values.displayName });

    return { success: true, user: userCredential.user };
  } catch (error: any) {
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

export async function createUserProfile(user: User, displayName: string) {
    const { firestore } = initializeFirebase();
  
    const role = user.email === "admin@schoolcare.com" ? "admin" : "student";
  
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      role: role,
    };
  
    try {
      await setDoc(doc(firestore, "users", user.uid), userProfile);
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

  } catch (error: any) {
    return { success: false, error: "Failed to update report. " + error.message };
  }
}

    