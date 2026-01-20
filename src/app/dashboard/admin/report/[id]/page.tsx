import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/client";

type Props = {
  params: { id: string };
};

export default async function AdminReportPage({ params }: Props) {
  const snap = await getDoc(doc(db, "reports", params.id));

  if (!snap.exists()) return <p>Report not found</p>;

  const report = snap.data();

  return (
    <div>
      <h1>{report.category}</h1>
      <p>{report.description}</p>
      <p>Status: {report.status}</p>
    </div>
  );
}
