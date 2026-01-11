
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Wand2, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { suggestCategory } from "@/lib/actions";
import { submitReport } from "@/lib/client-actions";
import { CATEGORIES } from "@/lib/constants";
import Image from "next/image";
import { useFirebase } from "@/firebase";
import type { Category } from "@/lib/types";

const formSchema = z.object({
  category: z.enum(CATEGORIES.map(c => c.value) as [string, ...string[]], {
    required_error: "You need to select a report category.",
  }),
  roomNumber: z.string().min(1, "Room number is required."),
  description: z.string().min(10, "Description must be at least 10 characters."),
});

export function ReportForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const firebaseState = useFirebase();
  const { loading: authLoading, user, firestore, storage } = firebaseState;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const defaultCategory = searchParams.get("category") as Category | null;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: defaultCategory || undefined,
      roomNumber: "",
      description: "",
    },
  });

  useEffect(() => {
    if (defaultCategory) {
      form.setValue('category', defaultCategory);
    }
  }, [defaultCategory, form]);

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSuggestCategory = async () => {
    const description = form.getValues("description");
    if (!description || description.length < 10) {
      toast({
        variant: "destructive",
        title: "Description too short",
        description: "Please provide a more detailed description to suggest a category.",
      });
      return;
    }
    
    setIsSuggesting(true);
    const result = await suggestCategory({
      description,
      photoDataUri: photoPreview ?? undefined,
    });
    setIsSuggesting(false);

    if (result.success && result.category) {
      form.setValue("category", result.category as Category);
      toast({
        title: "Category Suggested",
        description: `We've suggested the "${result.category}" category based on your input.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Suggestion Failed",
        description: result.error,
      });
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore || !storage) {
      toast({
        variant: 'destructive',
        title: 'Authentication not ready',
        description: 'Please wait a moment and try again.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
        await submitReport(firebaseState, {
            ...values,
            photoFile: photoFile,
        });
        
        router.push("/dashboard/submit-report/success");

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Submission Failed",
            description: error.message || "An unknown error occurred.",
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle>Report Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description of Issue</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., The third chair from the left has a broken leg..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe the problem in as much detail as possible.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Photo (Optional)</FormLabel>
              {photoPreview ? (
                <div className="relative w-full aspect-video rounded-md overflow-hidden">
                  <Image src={photoPreview} alt="Photo preview" fill objectFit="cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7"
                    onClick={() => {
                      setPhotoPreview(null);
                      setPhotoFile(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <FormControl>
                  <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-6 text-center hover:bg-muted/50">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="mt-2 text-sm font-medium">Click to upload a photo</span>
                    <span className="mt-1 text-xs text-muted-foreground">PNG, JPG, or WEBP</span>
                    <Input
                      type="file"
                      className="hidden"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handlePhotoChange}
                    />
                  </label>
                </FormControl>
              )}
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <div className="flex gap-2">
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
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSuggestCategory}
                      disabled={isSuggesting}
                    >
                      {isSuggesting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="mr-2 h-4 w-4" />
                      )}
                      Suggest
                    </Button>
                  </div>
                  <FormDescription>
                    Choose the category that best fits the issue, or let AI suggest one.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="roomNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Number / Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Room 201, Library, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={authLoading || isSubmitting}>
              {(authLoading || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Report
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
