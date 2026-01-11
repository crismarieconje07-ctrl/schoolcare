import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Status } from "@/lib/types";
import { getStatusColor } from "@/lib/constants";

export function StatusBadge({ status, className }: { status: Status, className?: string }) {
    const colorClass = getStatusColor(status);
    return (
        <Badge
          className={cn("text-white", colorClass, className)}
        >
          {status}
        </Badge>
      );
}
