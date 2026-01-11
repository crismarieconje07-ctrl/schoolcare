"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { initializeFirebase } from "@/firebase";
import type { UserProfile } from "@/lib/types";

export const useAuth = () => {
  const { user, isUserLoading, userError } = useUser();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserProfile() {
      if (user) {
        const { firestore } = initializeFirebase();
        const userDocRef = doc(firestore, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        } else {
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
  }, [user, isUserLoading]);

  return { user, userProfile, loading: isUserLoading || loading, error: userError };
};
