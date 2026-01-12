
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
  getDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { z } from "zod";
import { categorizeReport } from "@/ai/flows/categorize-report";
import { initializeFirebase } from "@/firebase/server";
import type { UserProfile, Category, UserRole } from "@/lib/types";
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { initializeAdminApp } from "./firebase-admin";
import { cookies } from "next/headers";

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
    const role: UserRole = values.email === "admin@schoolcare.com" ? "admin" : "student";
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
        case 'auth/invalid-credential':
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

const reportSchema = z.object({
  category: z.enum(['chair', 'fan', 'window', 'light', 'sanitation', 'other']),
  roomNumber: z.string().min(1, "Room number is required."),
  description: z.string().min(10, "Description must be at least 10 characters."),
});


export async function createReport(formData: FormData) {
  try {
    await initializeAdminApp();
    const { firestore, storage } = initializeFirebase();
    
    const sessionCookie = cookies().get("session")?.value;
    if (!sessionCookie) {
      return { success: false, error: "Authentication token is missing. Please log in." };
    }

    const decodedToken = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    const userId = decodedToken.uid;

    const values = reportSchema.safeParse({
        category: formData.get('category'),
        roomNumber: formData.get('roomNumber'),
        description: formData.get('description'),
    });

    if (!values.success) {
      return { success: false, error: "Invalid report data." };
    }

    const { category, roomNumber, description } = values.data;
    const photo = formData.get('photo') as File | null;

    // Fetch user profile
    const userDocRef = doc(firestore, "users", userId);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      // This should ideally not happen if ensureUserProfile is working correctly
      return { success: false, error: "User profile not found." };
    }
    const userProfile = userDoc.data() as UserProfile;

    let imageUrl: string | undefined = undefined;
    if (photo) {
      const photoBuffer = Buffer.from(await photo.arrayBuffer());
      const storageRef = ref(storage, `reports/${userId}/${Date.now()}_${photo.name}`);
      await uploadBytes(storageRef, photoBuffer, { contentType: photo.type });
      imageUrl = await getDownloadURL(storageRef);
    }

    const reportsCollection = collection(firestore, "users", userId, "reports");
    const newReportRef = doc(reportsCollection);

    await setDoc(newReportRef, {
      id: newReportRef.id,
      userId: userId,
      userDisplayName: userProfile.displayName || userProfile.email || "Anonymous",
      category,
      roomNumber,
      description,
      imageUrl,
      status: "Pending",
      priority: "Low",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/admin");
    return { success: true };

  } catch (error: any) {
    console.error("createReport error:", error);
    if (error.code === 'auth/session-cookie-expired' || error.code === 'auth/session-cookie-revoked' || error.code === 'auth/argument-error') {
      return { success: false, error: "Your session has expired. Please log in again." };
    }
    return { success: false, error: error.message || "Failed to create report." };
  }
}


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
    revalidatePath(`/dashboard/admin/report/${values.userId}/${values.reportId}`);
    return { success: true };

  } catch (error: any)
{
    return { success: false, error: "Failed to update report. " + error.message };
  }
}
