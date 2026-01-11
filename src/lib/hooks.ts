
"use client";

import { useFirebase } from "@/firebase";

// This hook is deprecated. Use `useFirebase` from "@/firebase" instead.
export const useAuth = () => {
  const context = useFirebase();
  if (context === undefined) {
    throw new Error("useAuth must be used within a FirebaseProvider.");
  }
  return context;
};
