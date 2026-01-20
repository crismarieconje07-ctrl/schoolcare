"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/client";
import { useAuthProfile } from "@/hooks/use-auth-profile";
import { useToast } from "@/hooks/use-toast";

import { CATEGORIES } from "@/lib/constants/categories";
import type { Category } from "@/lib/types";

/* ---------------- SCHEMA ---------------- */

const schema = z.object({
  category: z.string(),
  roomNumber: z.string().min(1, "Room number is required"),
  description: z.string().min(10, "Please provide more details"),
});

type FormValues = z.infer<typeof schema>;

export function ReportForm() {
  const { user } = useAuthProfile();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: "other",
      roomNumber: "",
      description: "",
    },
  });

  async function onSubmit(values: FormValues) {
    if (!user) return;

    setLoading(true);

    await addDoc(collection(db, "users", user.uid, "reports"), {
      category: values.category,
      roomNumber: values.roomNumber,
      description: values.description,
      status: "Pending",
      createdAt: serverTimestamp(), // ✅ THIS FIXES EVERYTHING
    });

    toast({ title: "Report submitted successfully" });
    router.push("/dashboard");
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
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      <div className="flex items-center gap-2">
                        <c.icon className="h-4 w-4" />
                        {c.label}
                      </div>
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
              <FormLabel>Room</FormLabel>
              <Input {...field} />
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
              <Textarea rows={5} {...field} />
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Report
        </Button>

      </form>
    </Form>
  );
}
