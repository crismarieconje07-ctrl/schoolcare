
"use client";

import { useEffect, useState } from "react";
import { useUser, useFirebase } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import type { UserProfile } from "@/lib/types";

export const useAuth = () => {
  const { user, isUserLoading, userError } = useUser();
  const { firestore } = useFirebase();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserProfile() {
      if (user && firestore) {
        try {
          const userDocRef = doc(firestore, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          } else {
            // User document doesn't exist, maybe it's still being created.
            // For now, we'll treat this as not having a profile yet.
            setUserProfile(null);
          }
        } catch (e) {
          console.error("Error fetching user profile:", e);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    }

    if (!isUserLoading) {
      fetchUserProfile();
    }
  }, [user, isUserLoading, firestore]);

  return { 
    user, 
    userProfile, 
    loading: isUserLoading || loading, 
    error: userError,
    auth: useFirebase().auth,
    firestore: useFirebase().firestore,
    storage: useFirebase().storage,
  };
};
