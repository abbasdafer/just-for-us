
// @/app/dashboard/members/[id]/page.tsx

/**
 * # Member Profile Page
 *
 * ## Purpose
 * This page displays a detailed profile for a specific member, including their personal information, subscription details, and an interface for managing their data.
 *
 * ## Features
 * - Fetches and displays member data from the database.
 * - Allows editing of member information through a dialog form.
 * - Provides a button to share the member's public profile.
 * - Shows the member's subscription status and personal data in a clear, organized layout.
 *
 * ## Structure
 * - The main component `MemberProfilePage` handles all logic for data fetching, state management, and user interactions.
 * - It uses several sub-components like `InfoPill` to display information in a consistent style.
 * - A dialog form is used for editing member data, which is validated using `zod`.
 * - The page is responsive and adjusts its layout for different screen sizes.
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { User, Phone, Calendar, Dumbbell, Flame, Weight, Ruler, ChevronLeft, BrainCircuit, Loader2, Sparkles, Soup, Sandwich, Salad, Apple, ChevronDown, CheckCircle, Replace, Copy, Edit, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorDisplay } from '@/components/error-display';
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

/**
 * @type MemberData
 * @description Defines the structure for a member's data, including personal and subscription information.
 * @property {number} id - The unique identifier for the member.
 * @property {string} name - The full name of the member.
 * @property {string} [phone] - The member's phone number (optional).
 * @property {string} subscriptionType - The type of subscription the member has.
 * @property {string} startDate - The start date of the subscription.
 * @property {string} endDate - The end date of the subscription.
 * @property {"Active" | "Expired"} status - The current status of the subscription.
 * @property {number} [age] - The age of the member (optional).
 * @property {number} [weight] - The weight of the member in kilograms (optional).
 * @property {number} [height] - The height of the member in centimeters (optional).
 * @property {"male" | "female"} [gender] - The gender of the member (optional).
 * @property {number} [dailyCalories] - The calculated daily calories for the member (optional).
 */
type MemberData = {
  id: number;
  name: string;
  phone?: string;
  subscriptionType: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Expired";
  age?: number;
  weight?: number;
  height?: number;
  gender?: "male" | "female";
  dailyCalories?: number;
};

/**
 * @const editMemberSchema
 * @description Defines the validation schema for the member editing form using `zod`.
 * This ensures that the data entered by the user is valid before being submitted.
 */
const editMemberSchema = z.object({
    name: z.string().min(1, { message: "اسم العضو مطلوب." }),
    phone: z.string().optional(),
    gender: z.enum(["male", "female"], { required_error: "يجب تحديد الجنس."}),
    age: z.coerce.number().min(10, "يجب أن يكون العمر 10 سنوات على الأقل.").max(100, "يجب أن يكون العمر أقل من 100 سنة."),
    weight: z.coerce.number().min(30, "يجب أن يكون الوزن 30 كجم على الأقل."),
    height: z.coerce.number().min(100, "يجب أن يكون الطول 100 سم على الأقل."),
});

/**
 * @function calculateBMR
 * @description Calculates the Basal Metabolic Rate (BMR) using the Mifflin-St Jeor Equation.
 * @param {("male" | "female")} gender - The gender of the member.
 * @param {number} weight - The weight of the member in kilograms.
 * @param {number} height - The height of the member in centimeters.
 * @param {number} age - The age of the member in years.
 * @returns {number} The calculated BMR value.
 */
const calculateBMR = (gender: "male" | "female", weight: number, height: number, age: number): number => {
  // Mifflin-St Jeor Equation
  if (gender === "male") {
    return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
  } else {
    return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  }
};


/**
 * @function translateSubscriptionType
 * @description Translates the subscription type from English to Arabic.
 * @param {string} type - The subscription type in English (e.g., "Monthly Iron").
 * @returns {string} The translated subscription type in Arabic.
 */
const translateSubscriptionType = (type: string): string => {
  if (!type) return type;
  const parts = type.split(" ");
  const period = parts[0];
  const classes = parts.slice(1).join(" ");

  const periodTranslations: Record<string, string> = {
    "Daily": "يومي",
    "Weekly": "أسبوعي",
    "Monthly": "شهري",
  };

  const classTranslations: Record<string, string> = {
    "Iron": "حديد",
    "Fitness": "لياقة",
    "Iron & Fitness": "حديد و لياقة",
    "Fitness & Iron": "حديد و لياقة"
  };
  
  const translatedPeriod = periodTranslations[period] || period;
  const translatedClasses = classTranslations[classes] || classes;

  return `${translatedPeriod} - ${translatedClasses}`;
};

/**
 * @component InfoPill
 * @description A reusable component for displaying a piece of information with an icon and a label.
 * @param {React.ElementType} icon - The icon component to display.
 * @param {string} label - The label for the information.
 * @param {(string | number | undefined)} value - The value to display.
 * @returns {JSX.Element} A styled information pill.
 */
const InfoPill = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number | undefined }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
        <div className="bg-primary/10 p-2.5 rounded-full">
            <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-semibold text-base">{value || 'غير مسجل'}</p>
        </div>
    </div>
);


/**
 * @component MemberProfilePage
 * @description The main component for the member profile page.
 * It handles fetching member data, updating member information, and sharing the public profile.
 */
export default function MemberProfilePage() {
  /**
   * @state user
   * @description The authenticated user object from the `useAuth` hook.
   */
  const { user } = useAuth();
  /**
   * @state params
   * @description The URL parameters, used to get the member's ID.
   */
  const params = useParams();
  /**
   * @state toast
   * @description A function for displaying toast notifications.
   */
  const { toast } = useToast();
  /**
   * @state id
   * @description The ID of the member being viewed.
   */
  const { id } = params;
  /**
   * @state member
   * @description The state variable for storing the member's data.
   * @type {MemberData | null}
   */
  const [member, setMember] = useState<MemberData | null>(null);
  /**
   * @state loading
   * @description A boolean state for indicating when data is being fetched.
   * @type {boolean}
   */
  const [loading, setLoading] = useState(true);
  /**
   * @state error
   * @description A state variable for storing any errors that occur during data fetching.
   * @type {string | null}
   */
  const [error, setError] = useState<string | null>(null);
  /**
   * @state isEditDialogOpen
   * @description A boolean state for controlling the visibility of the edit member dialog.
   * @type {boolean}
   */
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);

  /**
   * @const form
   * @description The form instance for the edit member dialog, created using `react-hook-form`.
   */
  const form = useForm<z.infer<typeof editMemberSchema>>({
    resolver: zodResolver(editMemberSchema),
  });

  /**
   * @effect
   * @description Fetches the member's data from the API when the component mounts or the user/ID changes.
   */
  useEffect(() => {
    if (!user || !id) return;

    const fetchMember = async () => {
      setLoading(true);
      setError(null);
      try {
        const memberId = Array.isArray(id) ? id[0] : id;
        const res = await fetch(`/api/members/${memberId}`);
        if (!res.ok) throw new Error("Failed to fetch member");
        const memberData = await res.json();

        const endDate = new Date(memberData.endDate);
        const status = new Date() > endDate ? 'Expired' : 'Active';

        const fullMemberData = { ...memberData, status };

        setMember(fullMemberData);
        form.reset({
            name: fullMemberData.name,
            phone: fullMemberData.phone,
            gender: fullMemberData.gender,
            age: fullMemberData.age,
            weight: fullMemberData.weight,
            height: fullMemberData.height,
        });

      } catch (e) {
        console.error('Error fetching member profile:', e);
        setError((e as Error).message || 'فشل في تحميل ملف العضو.');
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [user, id, form]);

  /**
   * @function handleUpdateMember
   * @description Handles the submission of the edit member form.
   * It calculates the BMR, sends a PUT request to the API to update the member's data,
   * and then updates the local state to reflect the changes.
   * @param {z.infer<typeof editMemberSchema>} values - The validated form values.
   */
  const handleUpdateMember = async (values: z.infer<typeof editMemberSchema>) => {
    if (!member) return;

    const dailyCalories = calculateBMR(values.gender, values.weight, values.height, values.age);
    const updatedData = { ...values, dailyCalories };
    
    try {
        const res = await fetch(`/api/members/${member.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData)
        });
        if (!res.ok) throw new Error("Failed to update member");
        
        // Update local state to reflect changes instantly
        setMember(prev => prev ? { ...prev, ...updatedData } : null);
        
        toast({ title: "تم التحديث بنجاح", description: `تم تحديث بيانات ${values.name}.` });
        setEditDialogOpen(false);

    } catch (e) {
        console.error("Error updating member:", e);
        toast({ variant: "destructive", title: "فشل التحديث", description: "حدث خطأ أثناء تحديث بيانات العضو." });
    }
  };

  /**
   * @function handleShareProfile
   * @description Copies the URL of the member's public profile to the clipboard.
   */
  const handleShareProfile = () => {
    if (!member) return;
    const publicUrl = `${window.location.origin}/public/member/${member.id}`;
    navigator.clipboard.writeText(publicUrl)
        .then(() => {
            toast({ title: "تم نسخ الرابط", description: "يمكنك الآن مشاركة ملف العضو العام." });
        })
        .catch(err => {
            console.error('Failed to copy URL: ', err);
            toast({ variant: "destructive", title: "فشل النسخ", description: "لم نتمكن من نسخ الرابط." });
        });
  };


  if (loading) {
    return (
        <div className="container mx-auto max-w-5xl px-4 md:px-8 py-6 space-y-6">
            <Skeleton className="h-8 w-32" />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-8 w-24" />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        </div>
    );
  }

  if (error) {
    return <div className="container mx-auto p-4 md:p-8"><ErrorDisplay title="خطأ" message={error} /></div>;
  }

  if (!member) {
    return null;
  }
  
  return (
    <div className="container mx-auto max-w-6xl px-4 md:px-8 py-6">
        <Button asChild variant="outline" size="sm" className="mb-6">
            <Link href="/dashboard">
                <ChevronLeft className="h-4 w-4 ml-1" />
                العودة إلى قائمة الأعضاء
            </Link>
        </Button>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{member.name}</h1>
                 <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Edit className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>تعديل بيانات {member.name}</DialogTitle>
                            <DialogDescription>
                                قم بتحديث معلومات المتدرب هنا. سيتم تحديث السعرات الحرارية تلقائياً.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleUpdateMember)} className="space-y-4">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField control={form.control} name="name" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>الاسم الكامل</FormLabel>
                                            <FormControl><Input placeholder="الاسم الكامل للعضو" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="phone" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>الهاتف (اختياري)</FormLabel>
                                            <FormControl><Input placeholder="+9665xxxxxxxx" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <FormField control={form.control} name="gender" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>الجنس</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue placeholder="اختر الجنس" /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="male">ذكر</SelectItem>
                                                        <SelectItem value="female">أنثى</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                     <FormField control={form.control} name="age" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>العمر</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                     <FormField control={form.control} name="weight" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>الوزن (كجم)</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                     <FormField control={form.control} name="height" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>الطول (سم)</FormLabel>
                                            <FormControl><Input type="number" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                                <DialogFooter className="pt-4">
                                    <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>إلغاء</Button>
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                        حفظ التغييرات
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
                <Button variant="outline" size="icon" onClick={handleShareProfile}>
                    <Share2 className="h-4 w-4" />
                </Button>
            </div>
          <Badge variant={member.status === "Active" ? "default" : "destructive"} className={cn(member.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300', 'hover:bg-opacity-80 text-base w-fit')}>
            {member.status === "Active" ? "الاشتراك فعال" : "الاشتراك منتهي"}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
                {/* Subscription Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>تفاصيل الاشتراك</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <InfoPill icon={Dumbbell} label="نوع الاشتراك" value={translateSubscriptionType(member.subscriptionType)} />
                        <InfoPill icon={Calendar} label="تاريخ البدء" value={format(new Date(member.startDate), "PPP", { locale: arSA })} />
                        <InfoPill icon={Calendar} label="تاريخ الانتهاء" value={format(new Date(member.endDate), "PPP", { locale: arSA })} />
                    </CardContent>
                </Card>

                {/* Profile Info Card */}
                 <Card>
                    <CardHeader>
                        <CardTitle>البيانات الشخصية</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                         <InfoPill icon={Phone} label="رقم الهاتف" value={member.phone} />
                         <InfoPill icon={User} label="الجنس" value={member.gender === 'male' ? 'ذكر' : 'أنثى'} />
                         <InfoPill icon={Calendar} label="العمر" value={`${member.age} سنة`} />
                         <InfoPill icon={Weight} label="الوزن" value={`${member.weight} كجم`} />
                         <InfoPill icon={Ruler} label="الطول" value={`${member.height} سم`} />
                         <InfoPill icon={Flame} label="السعرات (BMR)" value={`${member.dailyCalories?.toLocaleString()} سعر حراري`} />
                    </CardContent>
                </Card>
            </div>

             {/* AI Meal Plan Card */}
            <Card className="lg:col-span-2">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                         <div className="flex-1">
                            <CardTitle className="flex items-center gap-2">
                                <BrainCircuit className="h-6 w-6 text-primary" />
                                خطة غذائية 
                            </CardTitle>
                            <CardDescription className="mt-2">
                                لا يوجد خطة غذائية متاحة في الوقت الحالي.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>
        </div>
      </div>
    </div>
  );
}
