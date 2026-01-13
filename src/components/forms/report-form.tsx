
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useRef, ChangeEvent } from "react";
import { Loader2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useFirebase } from "@/firebase";
import { db, storage } from "@/firebase/client";
import { useToast } from "@/hooks/use-toast";
import { suggestCategory } from "@/lib/actions";
import { CATEGORIES } from "@/lib/constants";

const reportSchema = z.object({
  category: z.enum(CATEGORIES.map(c => c.value) as [string, ...string[]], {
    required_error: "Please select a category.",
  }),
  roomNumber: z.string().min(1, "Room number is required"),
  description: z.string().min(10, "Please provide a detailed description."),
  photo: z.any().optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

export function ReportForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useFirebase();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      category: (searchParams.get("category") as any) || "",
      roomNumber: "",
      description: "",
    },
  });

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("photo", file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSuggestCategory = async () => {
    const description = form.getValues("description");
    if (!description || description.length < 10) {
      form.setError("description", { type: "manual", message: "Please enter a description (min. 10 characters) to get a suggestion."})
      return;
    }

    setIsSuggesting(true);
    try {
      const result = await suggestCategory({ description, photoDataUri: preview || undefined });
      if (result.success && result.category) {
        form.setValue("category", result.category, { shouldValidate: true });
        toast({ title: "Suggestion Applied!", description: `We've set the category to "${result.category}".` });
      } else {
        toast({ variant: "destructive", title: "Suggestion Failed", description: result.error });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not get a category suggestion." });
    } finally {
      setIsSuggesting(false);
    }
  };

  async function onSubmit(values: ReportFormValues) {
    if (!user) {
      toast({ variant: "destructive", title: "Not Authenticated", description: "You must be logged in to submit a report." });
      return;
    }
    
    setIsSubmitting(true);
    try {
      let imageUrl: string | undefined;
      if (values.photo) {
        const photo = values.photo as File;
        const storageRef = ref(storage, `reports/${user.uid}/${Date.now()}_${photo.name}`);
        const snapshot = await uploadBytes(storageRef, photo);
        imageUrl = await getDownloadURL(snapshot.ref);
      }
      
      const reportData = {
        ...values,
        userId: user.uid,
        userDisplayName: user.displayName || user.email,
        imageUrl,
        status: "Pending",
        priority: "Low",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      // @ts-ignore
      delete reportData.photo;

      const reportCollectionRef = collection(db, `users/${user.uid}/reports`);
      const docRef = await addDoc(reportCollectionRef, reportData);
      
      // Update with the doc ID
      await addDoc(reportCollectionRef, { ...reportData, id: docRef.id });


      toast({ title: "Report Submitted", description: "Thank you for your submission." });
      router.push("/dashboard/submit-report/success");

    } catch (error: any) {
      console.error("Report submission error:", error);
      toast({ variant: "destructive", title: "Submission Failed", description: error.message || "An unexpected error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
        
        <FormField
          control={form.control}
          name="roomNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room Number</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 101, Gym, Library" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the issue in detail..."
                  {...field}
                  rows={5}
                />
              </FormControl>
              <FormDescription>
                Provide as much detail as possible to help us resolve the issue quickly.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={handleSuggestCategory}
            disabled={isSuggesting}
        >
            {isSuggesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Suggest Category with AI
        </Button>

        <FormField
          control={form.control}
          name="photo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Attach a Photo (Optional)</FormLabel>
              <FormControl>
                <>
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handlePhotoChange}
                  />
                  {!preview && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Photo
                    </Button>
                  )}
                </>
              </FormControl>
              {preview && (
                <Card>
                  <CardContent className="p-2 relative">
                    <Image
                      src={preview}
                      alt="Preview"
                      width={500}
                      height={300}
                      className="w-full h-auto rounded-md object-contain max-h-[300px]"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={() => {
                        setPreview(null);
                        form.setValue("photo", null);
                        if(fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Report
        </Button>
      </form>
    </Form>
  );
}
