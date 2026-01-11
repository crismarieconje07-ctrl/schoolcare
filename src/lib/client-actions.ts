
"use client";

import {
  addDoc,
  collection,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytes,
  type FirebaseStorage,
} from "firebase/storage";
import type { User } from "firebase/auth";
import type { Category } from "./types";

interface ReportData {
    category: Category;
    roomNumber: string;
    description: string;
    photoFile: File | null;
}

async function uploadPhoto(
    storage: FirebaseStorage,
    userId: string,
    file: File
  ): Promise<string> {
    const storageRef = ref(storage, `reports/${userId}/${Date.now()}_${file.name}`);
    const uploadResult = await uploadBytes(storageRef, file);
    return getDownloadURL(uploadResult.ref);
}

export async function submitReport(
  firestore: Firestore,
  storage: FirebaseStorage,
  user: User,
  values: ReportData
) {
  try {
    let imageUrl: string | undefined = undefined;
    if (values.photoFile) {
      imageUrl = await uploadPhoto(storage, user.uid, values.photoFile);
    }

    const reportsCollection = collection(firestore, "users", user.uid, "reports");

    await addDoc(reportsCollection, {
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

  } catch (error: any) {
    console.error("submitReport error: ", error);
    throw new Error("Failed to submit report. " + error.message);
  }
}

    