
"use client";

import { useState } from 'react';
import type { Report } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { PriorityBadge } from "@/components/shared/priority-badge";
import { Image as ImageIcon } from "lucide-react";
import EditReportDialog from "./edit-report-dialog";

interface ReportCardProps {
  report: Report;
}

const ReportCard = ({ report }: ReportCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-2">
                <h3 className="font-bold">{report.roomNumber} - {report.description}</h3>
                <div className="flex items-center gap-4">
                    <PriorityBadge priority={report.priority} />
                    {report.imageUrl && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <ImageIcon className="h-4 w-4" />
                            <span>Photo Attached</span>
                        </div>
                    )}
                </div>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>View Details</Button>
        </CardContent>
      </Card>
      <EditReportDialog report={report} isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />
    </>
  );
};

export default ReportCard;
