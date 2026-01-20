"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/firebase/client";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot, Unsubscribe } from "firebase/firestore";

export interface UserProfile {
  displayName?: string;
  role?: "admin" | "user";
}

export function useAuthProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: Unsubscribe | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);

      // 🔴 STOP old profile listener
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (!u) {
        setUserProfile(null);
        return;
      }

      const ref = doc(db, "users", u.uid);
      unsubscribeProfile = onSnapshot(ref, (snap) => {
        setUserProfile(snap.exists() ? (snap.data() as UserProfile) : null);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  return { user, userProfile, loading };
}
