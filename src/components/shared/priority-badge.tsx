import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Priority } from "@/lib/types";
import { getPriorityColor, PRIORITIES } from "@/lib/constants";

export function PriorityBadge({ priority, className }: { priority: Priority, className?: string }) {
    const colorClass = getPriorityColor(priority);
    const priorityInfo = PRIORITIES.find(p => p.value === priority);

    if(!priorityInfo) return null;

    const Icon = priorityInfo.icon;
    
    return (
        <Badge
          variant="outline"
          className={cn("flex items-center gap-1 border-0", colorClass, className)}
        >
          <Icon className="h-4 w-4 text-white" />
          <span className="text-white">{priority}</span>
        </Badge>
      );
}
