"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useFirebase } from "@/firebase";
import { db } from "@/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { suggestCategory } from "@/lib/actions";
import { CATEGORIES } from "@/lib/constants";

/* ---------------- SCHEMA (NO PHOTO) ---------------- */

const reportSchema = z.object({
  category: z.enum(CATEGORIES.map(c => c.value) as [string, ...string[]], {
    required_error: "Please select a category.",
  }),
  roomNumber: z.string().min(1, "Room number is required"),
  description: z.string().min(10, "Please provide a detailed description."),
});

type ReportFormValues = z.infer<typeof reportSchema>;

export function ReportForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useFirebase();
  const { toast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      category: (searchParams.get("category") as any) || "",
      roomNumber: "",
      description: "",
    },
  });

  /* ---------------- AI CATEGORY SUGGESTION ---------------- */

  const handleSuggestCategory = async () => {
    const description = form.getValues("description");

    if (!description || description.length < 10) {
      form.setError("description", {
        type: "manual",
        message: "Please enter at least 10 characters for AI suggestion.",
      });
      return;
    }

    setIsSuggesting(true);
    try {
      const result = await suggestCategory({ description });
      if (result.success && result.category) {
        form.setValue("category", result.category, { shouldValidate: true });
        toast({
          title: "Category Suggested",
          description: `Category set to "${result.category}"`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Suggestion failed",
          description: result.error || "Could not suggest a category.",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Failed to get category suggestion.",
      });
    } finally {
      setIsSuggesting(false);
    }
  };

  /* ---------------- SUBMIT REPORT ---------------- */

  async function onSubmit(values: ReportFormValues) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not logged in",
        description: "Please log in to submit a report.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const reportData = {
        category: values.category,
        roomNumber: values.roomNumber,
        description: values.description,
        userId: user.uid,
        userDisplayName: user.displayName || user.email,
        status: "Pending",
        priority: "Low",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const reportsRef = collection(db, `users/${user.uid}/reports`);
      await addDoc(reportsRef, reportData);

      toast({
        title: "Report submitted",
        description: "Your report has been sent successfully.",
      });

      router.push("/dashboard/submit-report/success");
    } catch (error: any) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: error.message || "Unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  /* ---------------- UI ---------------- */

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

        {/* CATEGORY */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ROOM NUMBER */}
        <FormField
          control={form.control}
          name="roomNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room Number</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 101, Gym, Library" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* DESCRIPTION */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the issue in detail..."
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* AI BUTTON */}
        <Button
          type="button"
          variant="outline"
          onClick={handleSuggestCategory}
          disabled={isSuggesting}
        >
          {isSuggesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Suggest Category with AI
        </Button>

        {/* SUBMIT */}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Report
        </Button>

      </form>
    </Form>
  );
}
