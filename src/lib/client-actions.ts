
"use client";

import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import type { Category, UserProfile } from "./types";
import { initializeFirebase } from "@/firebase";
import { getDoc } from "firebase/firestore";

interface ReportData {
    category: Category;
    roomNumber: string;
    description: string;
    photoFile: File | null;
}

async function uploadPhoto(
    storage: ReturnType<typeof initializeFirebase>['storage'],
    userId: string,
    file: File
  ): Promise<string> {
    if (!storage) throw new Error("Storage service is not available.");
    const storageRef = ref(storage, `reports/${userId}/${Date.now()}_${file.name}`);
    const uploadResult = await uploadBytes(storageRef, file);
    return getDownloadURL(uploadResult.ref);
}

export async function submitReport(
  values: ReportData
) {
  // Initialize services directly inside the action to guarantee they are ready.
  const { auth, firestore, storage } = initializeFirebase();

  const user = auth.currentUser;

  if (!firestore || !storage || !user) {
    // This is the definitive gatekeeper.
    throw new Error("Authentication not ready. Please log out and log back in.");
  }

  try {
    // Fetch the user profile to get the correct display name
    const userDocRef = doc(firestore, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      throw new Error("User profile not found. Please sign out and sign in again.");
    }
    const userProfile = userDoc.data() as UserProfile;

    let imageUrl: string | undefined = undefined;
    if (values.photoFile) {
      imageUrl = await uploadPhoto(storage, user.uid, values.photoFile);
    }

    const reportsCollection = collection(firestore, "users", user.uid, "reports");

    const newReportRef = doc(reportsCollection);

    await setDoc(newReportRef, {
      id: newReportRef.id,
      userId: user.uid,
      userDisplayName: userProfile.displayName || userProfile.email || "User",
      category: values.category,
      roomNumber: values.roomNumber,
      description: values.description,
      imageUrl,
      status: "Pending",
      priority: "Low",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

  } catch (error: any) {
    console.error("submitReport error: ", error);
    throw new Error("Failed to submit report. " + error.message);
  }
}
