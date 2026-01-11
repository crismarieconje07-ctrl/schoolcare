import { ReportForm } from '@/components/forms/report-form';

export default function SubmitReportPage() {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
       <div>
        <h1 className="text-3xl font-bold font-headline">Submit a New Report</h1>
        <p className="text-muted-foreground">Fill out the form below to report a maintenance issue.</p>
      </div>
      <ReportForm />
    </div>
  );
}
