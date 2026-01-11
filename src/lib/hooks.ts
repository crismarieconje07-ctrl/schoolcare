
"use client";

import { useFirebase } from "@/firebase";

export const useAuth = () => {
  const context = useFirebase();
  if (context === undefined) {
    throw new Error("useAuth must be used within a FirebaseProvider.");
  }
  return context;
};
