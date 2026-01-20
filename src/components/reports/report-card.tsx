import { Badge } from "@/components/ui/badge";

type ReportCardProps = {
  category: string;
  description: string;
  status?: "pending" | "resolved";
};

export function ReportCard({
  category,
  description,
  status = "pending",
}: ReportCardProps) {
  return (
    <div className="rounded-xl border bg-white p-4 space-y-2 hover:shadow-sm transition">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <span className="font-semibold capitalize">
          {category}
        </span>

        <Badge
          variant={
            status === "resolved" ? "success" : "secondary"
          }
        >
          {status}
        </Badge>
      </div>

      {/* DESCRIPTION */}
      <p className="text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
