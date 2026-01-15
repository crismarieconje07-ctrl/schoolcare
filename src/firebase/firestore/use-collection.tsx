"use client";

import { useEffect, useState } from "react";
import { onSnapshot, Query, DocumentData } from "firebase/firestore";

type UseCollectionResult<T> = {
  documents: T[];
  loading: boolean;
  error: string | null;
};

export function useCollection<T = DocumentData>(
  q: Query<DocumentData> | null
): UseCollectionResult<T> {
  const [documents, setDocuments] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ✅ HARD GUARD — prevents "_delegate in null" crash
    if (!q) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];

        setDocuments(data);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError("Failed to load data");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [q]);

  return { documents, loading, error };
}
