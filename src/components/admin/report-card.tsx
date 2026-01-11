"use client";

import { useState } from 'react';
import type { Report } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CategoryIcon } from "@/components/shared/category-icon";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { formatDistanceToNow } from "date-fns";
import { User, Calendar, MapPin, Image as ImageIcon } from "lucide-react";
import EditReportDialog from "./edit-report-dialog";

interface ReportCardProps {
  report: Report;
}

const ReportCard = ({ report }: ReportCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Card onClick={() => setIsDialogOpen(true)} className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
              <CategoryIcon category={report.category} />
              <PriorityBadge priority={report.priority} />
          </div>
          <CardTitle className="pt-2">{report.roomNumber}</CardTitle>
          <CardDescription className="line-clamp-2 h-[40px]">{report.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Separator />
          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{report.userDisplayName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{report.createdAt ? formatDistanceToNow(report.createdAt.toDate(), { addSuffix: true }) : ''}</span>
            </div>
            {report.imageUrl && (
              <div className="flex items-center gap-2 text-blue-500">
                <ImageIcon className="h-4 w-4" />
                <span>Image Attached</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <EditReportDialog report={report} isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />
    </>
  );
};

export default ReportCard;
