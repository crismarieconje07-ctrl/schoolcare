
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
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { z } from "zod";
import { categorizeReport } from "@/ai/flows/categorize-report";
import { auth, db, storage } from "@/lib/firebase";
import type { UserProfile } from "@/lib/types";

// --- Authentication Actions ---

const signUpSchema = z.object({
  displayName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function signUp(values: z.infer<typeof signUpSchema>) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      values.email,
      values.password
    );
    const user = userCredential.user;

    await updateProfile(user, { displayName: values.displayName });

    const role =
      values.email === "admin@schoolcare.com" ? "admin" : "student";

    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: values.displayName,
      role: role,
    };

    await setDoc(doc(db, "users", user.uid), userProfile);

    return { success: true };
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
    await signInWithEmailAndPassword(auth, values.email, values.password);
    return { success: true };
  } catch (error: any) {
    // Provide more specific error messages from Firebase
    if (error.code) {
      switch (error.code) {
        case 'auth/user-not-found':
          return { success: false, error: 'No user found with this email.' };
        case 'auth/wrong-password':
          return { success: false, error: 'Incorrect password. Please try again.' };
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
    await signOut(auth);
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
const reportSchema = z.object({
  category: z.enum(['chair', 'fan', 'window', 'light', 'sanitation', 'other']),
  roomNumber: z.string().min(1, "Room number is required"),
  description: z.string().min(1, "Description is required"),
  photoDataUri: z.string().optional(),
});


export async function submitReport(values: z.infer<typeof reportSchema>) {
  const user = auth.currentUser;
  if (!user) {
    return { success: false, error: "You must be logged in to submit a report." };
  }

  try {
    let imageUrl: string | undefined = undefined;
    if (values.photoDataUri) {
      const storageRef = ref(storage, `reports/${user.uid}/${Date.now()}`);
      const uploadResult = await uploadString(storageRef, values.photoDataUri, 'data_url');
      imageUrl = await getDownloadURL(uploadResult.ref);
    }

    await addDoc(collection(db, "reports"), {
      userId: user.uid,
      userDisplayName: user.displayName || "Anonymous",
      category: values.category,
      roomNumber: values.roomNumber,
      description: values.description,
      imageUrl,
      status: "Pending",
      priority: "Low",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Failed to submit report. " + error.message };
  }
}


const updateReportSchema = z.object({
  reportId: z.string(),
  status: z.enum(['Pending', 'In Progress', 'Completed']).optional(),
  priority: z.enum(['Low', 'Moderate', 'Urgent']).optional(),
  internalNotes: z.string().optional(),
});


export async function updateReport(values: z.infer<typeof updateReportSchema>) {
   const user = auth.currentUser;
   if (!user) {
    return { success: false, error: "Authentication required." };
  }
  // In a real app, we'd check for admin role here from a trusted source
  
  try {
    const reportRef = doc(db, "reports", values.reportId);
    
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
