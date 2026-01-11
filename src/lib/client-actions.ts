
"use client";

import {
  addDoc,
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
import type { Category } from "./types";
import type { FirebaseContextState } from "@/firebase";

interface ReportData {
    category: Category;
    roomNumber: string;
    description: string;
    photoFile: File | null;
}

async function uploadPhoto(
    storage: FirebaseContextState['storage'],
    userId: string,
    file: File
  ): Promise<string> {
    if (!storage) throw new Error("Storage service is not available.");
    const storageRef = ref(storage, `reports/${userId}/${Date.now()}_${file.name}`);
    const uploadResult = await uploadBytes(storageRef, file);
    return getDownloadURL(uploadResult.ref);
}

export async function submitReport(
  firebase: FirebaseContextState,
  values: ReportData
) {
  const { firestore, storage, user, userProfile } = firebase;

  if (!firestore || !storage || !user || !userProfile) {
    throw new Error("Authentication not ready. Please wait and try again.");
  }

  try {
    let imageUrl: string | undefined = undefined;
    if (values.photoFile) {
      imageUrl = await uploadPhoto(storage, user.uid, values.photoFile);
    }

    const reportsCollection = collection(firestore, "users", user.uid, "reports");

    const newReportRef = doc(reportsCollection);

    await setDoc(newReportRef, {
      id: newReportRef.id,
      userId: user.uid,
      userDisplayName: userProfile.displayName || userProfile.email || "Anonymous",
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
