
"use server";

import { revalidatePath } from "next/cache";
import {
  signInWithEmailAndPassword,
  signOut,
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
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { getStorage as getAdminStorage } from 'firebase-admin/storage';
import { initializeAdminApp } from "./firebase-admin";
import { cookies } from "next/headers";
import { auth } from "firebase-admin";

// --- Authentication Actions ---

const signUpSchema = z.object({
  displayName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function signUp(values: z.infer<typeof signUpSchema>) {
  try {
    // Use ONLY the Admin SDK for server-side operations
    const adminApp = initializeAdminApp();
    const adminAuth = getAdminAuth(adminApp);
    const adminFirestore = getAdminFirestore(adminApp);

    const userRecord = await adminAuth.createUser({
      email: values.email,
      password: values.password,
      displayName: values.displayName,
    });

    const role: UserRole = values.email?.toLowerCase() === "admin@schoolcare.com" ? "admin" : "student";
    
    const userProfile: UserProfile = {
      uid: userRecord.uid,
      email: values.email,
      displayName: values.displayName,
      role: role,
    };
    await adminFirestore.collection("users").doc(userRecord.uid).set(userProfile);

    revalidatePath("/", "layout");
    
    return { success: true };
  } catch (error: any) {
    let errorMessage = "An unknown error occurred during sign up.";
    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-exists':
          errorMessage = "This email address is already in use by another account.";
          break;
        case 'auth/invalid-password':
          errorMessage = "The password must be a string with at least six characters.";
          break;
        default:
           errorMessage = error.message || "Failed to sign up.";
          break;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    console.error("Sign-up Error:", error);
    return { success: false, error: errorMessage };
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
    const adminApp = initializeAdminApp();
    const adminFirestore = getAdminFirestore(adminApp);
    const adminStorage = getAdminStorage(adminApp);
    const adminAuth = getAdminAuth(adminApp);

    const sessionCookie = cookies().get("session")?.value;
    if (!sessionCookie) {
      return { success: false, error: "Authentication token is missing. Please log in." };
    }

    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
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

    const userDocRef = adminFirestore.collection("users").doc(userId);
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) {
      return { success: false, error: "User profile not found." };
    }
    const userProfile = userDoc.data() as UserProfile;

    let imageUrl: string | undefined = undefined;
    if (photo) {
      const photoBuffer = Buffer.from(await photo.arrayBuffer());
      const filePath = `reports/${userId}/${Date.now()}_${photo.name}`;
      const file = adminStorage.bucket().file(filePath);
      await file.save(photoBuffer, { contentType: photo.type });
      imageUrl = await getDownloadURL(ref(getAdminStorage(adminApp).app, filePath));
    }

    const reportsCollection = adminFirestore.collection("users").doc(userId).collection("reports");
    const newReportRef = reportsCollection.doc();

    await newReportRef.set({
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
    const adminApp = initializeAdminApp();
    const adminFirestore = getAdminFirestore(adminApp);
  
  try {
    const reportRef = adminFirestore.collection("users").doc(values.userId).collection("reports").doc(values.reportId);
    
    const updateData: any = {
      updatedAt: serverTimestamp(),
    };

    if (values.status) updateData.status = values.status;
    if (values.priority) updateData.priority = values.priority;
    if (values.internalNotes !== undefined) updateData.internalNotes = values.internalNotes;

    await reportRef.update(updateData);

    revalidatePath("/dashboard/admin");
    revalidatePath(`/dashboard/admin/report/${values.userId}/${values.reportId}`);
    return { success: true };

  } catch (error: any)
{
    return { success: false, error: "Failed to update report. " + error.message };
  }
}

