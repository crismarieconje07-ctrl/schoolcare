"use client";

import {
  collection,
  collectionGroup,
  onSnapshot,
  query,
  Query,
  DocumentData,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../client";

type UseCollectionResult<T> = {
  data: T[];
  loading: boolean;
  error: Error | null;
};

export function useCollection<T = DocumentData>(
  source: string | Query<DocumentData>,
  isCollectionGroup = false
): UseCollectionResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let q: Query<DocumentData>;

    try {
      if (typeof source === "string") {
        q = isCollectionGroup
          ? query(collectionGroup(db, source))
          : query(collection(db, source));
      } else {
        q = source;
      }
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const results = snapshot.docs.map((doc) => ({
          id: doc.id,
          path: doc.ref.path, // ✅ REQUIRED FOR ADMIN
          ...(doc.data() as object),
        })) as T[];

        setData(results);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [source, isCollectionGroup]);

  return { data, loading, error };
}
