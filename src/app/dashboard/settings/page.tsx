
// @/app/dashboard/settings/page.tsx

/**
 * # Settings Page
 *
 * ## Purpose
 * This page allows the gym owner to configure the pricing for different subscription types.
 * It provides a form for setting the daily, weekly, and monthly prices for fitness and iron memberships.
 *
 * ## Features
 * - Fetches the current pricing settings from the API.
 * - Provides a form for updating the pricing settings.
 * - Validates the form data to ensure that all prices are positive numbers.
 * - Saves the updated settings to the database via an API call.
 *
 * ## Structure
 * - The main component `SettingsPage` handles all logic for data fetching, form management, and state management.
 * - It uses `react-hook-form` and `zod` for form handling and validation.
 * - The page is responsive and adjusts its layout for different screen sizes.
 */

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { ErrorDisplay } from "@/components/error-display";


/**
 * @const pricingSchema
 * @description Defines the validation schema for the pricing settings form using `zod`.
 * This ensures that all price inputs are positive numbers.
 */
const pricingSchema = z.object({
  dailyFitness: z.coerce.number().min(0, "يجب أن يكون السعر موجبًا."),
  weeklyFitness: z.coerce.number().min(0, "يجب أن يكون السعر موجبًا."),
  monthlyFitness: z.coerce.number().min(0, "يجب أن يكون السعر موجبًا."),
  dailyIron: z.coerce.number().min(0, "يجب أن يكون السعر موجبًا."),
  weeklyIron: z.coerce.number().min(0, "يجب أن يكون السعر موجبًا."),
  monthlyIron: z.coerce.number().min(0, "يجب أن يكون السعر موجبًا."),
});

/**
 * @type PricingFormValues
 * @description Defines the type for the pricing form values, inferred from the `pricingSchema`.
 */
type PricingFormValues = z.infer<typeof pricingSchema>;

/**
 * @component SettingsPage
 * @description The main component for the settings page.
 * It handles fetching and updating the pricing settings.
 */
export default function SettingsPage() {
  /**
   * @state user
   * @description The authenticated user object from the `useAuth` hook.
   */
  const { user } = useAuth();
  /**
   * @state toast
   * @description A function for displaying toast notifications.
   */
  const { toast } = useToast();
  /**
   * @state loading
   * @description A boolean state for indicating when data is being fetched.
   * @type {boolean}
   */
  const [loading, setLoading] = useState(true);
  /**
   * @state saving
   * @description A boolean state for indicating when data is being saved.
   * @type {boolean}
   */
  const [saving, setSaving] = useState(false);
  /**
   * @state error
   * @description A state variable for storing any errors that occur during data fetching.
   * @type {string | null}
   */
  const [error, setError] = useState<string | null>(null);

  /**
   * @const form
   * @description The form instance for the pricing settings form, created using `react-hook-form`.
   */
  const form = useForm<PricingFormValues>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      dailyFitness: 0,
      weeklyFitness: 0,
      monthlyFitness: 0,
      dailyIron: 0,
      weeklyIron: 0,
      monthlyIron: 0,
    },
  });

  /**
   * @effect
   * @description Fetches the pricing settings from the API when the component mounts or the user changes.
   */
  useEffect(() => {
    const fetchPricing = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error("Failed to fetch settings");
        const pricingData = await res.json();
        if (pricingData) {
          form.reset(pricingData);
        }
      } catch (e) {
        console.error("Error fetching pricing settings: ", e);
        setError((e as Error).message || "فشل في تحميل إعدادات الأسعار.");
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, [user, form]);

  /**
   * @function onSubmit
   * @description Handles the submission of the pricing settings form.
   * It sends a POST request to the API to save the updated settings.
   * @param {PricingFormValues} data - The validated form values.
   */
  const onSubmit = async (data: PricingFormValues) => {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      toast({
        title: "تم الحفظ بنجاح",
        description: "تم تحديث أسعار الاشتراكات الخاصة بك.",
      });
    } catch (e) {
      console.error("Error saving pricing settings: ", e);
      toast({
        variant: "destructive",
        title: "خطأ في الحفظ",
        description: "فشل في تحديث الأسعار. يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-8">
                 <Skeleton className="h-40 w-full" />
                 <Skeleton className="h-10 w-24 self-end" />
            </CardContent>
        </Card>
    );
  }

  if (error) {
      return <ErrorDisplay title="فشل تحميل الإعدادات" message={error} />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>إعدادات النادي</CardTitle>
        <CardDescription>
          قم بتحديث إعدادات الأسعار الخاصة باشتراكات أعضائك هنا.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
                <div className="space-y-1">
                    <h3 className="text-lg font-medium text-primary">أسعار اشتراكات اللياقة</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="dailyFitness"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>السعر اليومي</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <span className="absolute right-2.5 top-2.5 text-sm text-muted-foreground">د.ع</span>
                                    <Input type="number" placeholder="0" className="pr-8" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="weeklyFitness"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>السعر الأسبوعي</FormLabel>
                            <FormControl>
                                <div className="relative">
                                     <span className="absolute right-2.5 top-2.5 text-sm text-muted-foreground">د.ع</span>
                                    <Input type="number" placeholder="0" className="pr-8" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="monthlyFitness"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>السعر الشهري</FormLabel>
                            <FormControl>
                                <div className="relative">
                                     <span className="absolute right-2.5 top-2.5 text-sm text-muted-foreground">د.ع</span>
                                    <Input type="number" placeholder="0" className="pr-8" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            <Separator />

            <div className="space-y-4">
                <div className="space-y-1">
                     <h3 className="text-lg font-medium text-primary">أسعار اشتراكات الحديد</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="dailyIron"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>السعر اليومي</FormLabel>
                            <FormControl>
                                <div className="relative">
                                     <span className="absolute right-2.5 top-2.5 text-sm text-muted-foreground">د.ع</span>
                                    <Input type="number" placeholder="0" className="pr-8" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="weeklyIron"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>السعر الأسبوعي</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <span className="absolute right-2.5 top-2.5 text-sm text-muted-foreground">د.ع</span>
                                    <Input type="number" placeholder="0" className="pr-8" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="monthlyIron"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>السعر الشهري</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <span className="absolute right-2.5 top-2.5 text-sm text-muted-foreground">د.ع</span>
                                    <Input type="number" placeholder="0" className="pr-8" {...field} />
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            <div className="flex justify-end">
                 <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                    حفظ التغييرات
                </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
