
// @/app/public/member/[id]/page.tsx

/**
 * # Public Member Profile Page
 *
 * ## Purpose
 * This page displays a public-facing profile for a specific member.
 * It is a simplified version of the dashboard member profile page, intended for sharing.
 *
 * ## Features
 * - Fetches and displays public member data from the database.
 * - Shows the member's subscription status.
 * - Does not include any sensitive or editable information.
 *
 * ## Structure
 * - The main component `PublicMemberPage` handles all logic for data fetching and state management.
 * - It uses the URL parameter to identify which member to display.
 * - The page is designed to be simple and read-only.
 */

'use client';


import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { User, Phone, Calendar, Dumbbell, Flame, Weight, Ruler, BrainCircuit, Loader2, Soup, Sandwich, Salad, Apple, Replace } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorDisplay } from '@/components/error-display';
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

/**
 * @type MemberData
 * @description Defines the structure for a member's public data.
 * @property {string} id - The unique identifier for the member.
 * @property {string} name - The full name of the member.
 * @property {string} subscriptionType - The type of subscription the member has.
 * @property {string} endDate - The end date of the subscription.
 * @property {"Active" | "Expired"} status - The current status of the subscription.
 */
type MemberData = {
  id: string;
  name: string;
  subscriptionType: string;
  endDate: string;
  status: "Active" | "Expired";
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
 * @component PublicMemberPage
 * @description The main component for the public member profile page.
 * It handles fetching and displaying public member data.
 */
export default function PublicMemberPage() {
  /**
   * @state params
   * @description The URL parameters, used to get the member's ID.
   */
  const params = useParams();
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
   * @effect
   * @description Fetches the member's data from the API when the component mounts or the ID changes.
   */
  useEffect(() => {
    if (!id) {
        setLoading(false);
        setError("معرّف العضو غير موجود.");
        return;
    };

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

        setMember({ ...memberData, status });

      } catch (e) {
        console.error('Error fetching public member profile:', e);
        setError((e as Error).message || 'فشل في تحميل ملف العضو.');
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [id]);

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">جاري تحميل البيانات...</p>
            </div>
        </div>
    )
  }

  if (error) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <ErrorDisplay title="خطأ في عرض الصفحة" message={error} />
        </div>
    );
  }

  if (!member) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 md:px-8 py-10">
        <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <CardTitle className="text-3xl font-bold text-primary">{member.name}</CardTitle>
                        <CardDescription className="mt-1">
                            {translateSubscriptionType(member.subscriptionType)}
                        </CardDescription>
                    </div>
                     <Badge variant={member.status === "Active" ? "default" : "destructive"} className={cn(member.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300', 'hover:bg-opacity-80 text-base w-fit text-center')}>
                        {member.status === "Active" ? `فعال حتى ${format(new Date(member.endDate), "PPP", { locale: arSA })}` : "الاشتراك منتهي"}
                    </Badge>
                </div>
            </CardHeader>
             <CardContent className="p-6">
                <div className="text-center py-16 text-muted-foreground flex flex-col items-center justify-center h-full">
                    <BrainCircuit className="h-16 w-16 mb-4 text-muted-foreground/30" />
                    <h3 className="text-xl font-semibold">لا توجد خطة غذائية</h3>
                    <p className="mt-2 text-base">لم يتم إنشاء خطة غذائية لهذا العضو حتى الآن.</p>
                </div>
             </CardContent>
        </Card>
    </div>
  );
}