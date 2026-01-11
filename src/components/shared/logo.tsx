import { Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xl font-bold text-primary",
        className
      )}
    >
      <div className="rounded-lg bg-primary p-2">
        <Wrench className="h-5 w-5 text-primary-foreground" />
      </div>
      <span className="font-headline">SchoolCare</span>
    </div>
  );
}
