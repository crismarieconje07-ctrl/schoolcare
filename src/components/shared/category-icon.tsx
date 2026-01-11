import { cn } from "@/lib/utils";
import { CATEGORIES, getCategoryColor } from "@/lib/constants";
import type { Category } from "@/lib/types";

export function CategoryIcon({ category, className }: { category: Category, className?: string }) {
  const categoryInfo = CATEGORIES.find((c) => c.value === category);
  if (!categoryInfo) return null;

  const Icon = categoryInfo.icon;

  return (
    <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", className)}>
      <Icon className="h-5 w-5 text-current" />
    </div>
  );
}
