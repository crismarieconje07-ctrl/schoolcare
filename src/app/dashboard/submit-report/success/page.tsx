
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SubmissionSuccessPage() {
  return (
    <div className="flex items-center justify-center h-full">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center items-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Report Submitted</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Thank you for helping keep our school safe and functional.
          </p>
          <div>
            <span className="font-semibold">Status:</span>
            <span className="ml-2 text-yellow-500 font-medium">Pending</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="w-full">
              <Link href="/dashboard">Back to Home</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard">View My Reports</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
