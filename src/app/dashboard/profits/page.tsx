
// @/app/dashboard/profits/page.tsx

/**
 * # Profits Page
 *
 * ## Purpose
 * This page displays a dashboard with key statistics about the gym's financial performance.
 * It provides a high-level overview of total revenue, number of members, and monthly revenue trends.
 *
 * ## Features
 * - Fetches profit and member data from the API.
 * - Displays key performance indicators (KPIs) in a clear and concise manner.
 * - Renders a bar chart to visualize monthly revenue.
 * - Handles loading and error states gracefully.
 *
 * ## Structure
 * - The main component `ProfitsPage` handles all logic for data fetching and state management.
 * - It uses several sub-components from the `recharts` library to display the bar chart.
 * - The page is responsive and adjusts its layout for different screen sizes.
 */

"use client";

import { useState, useEffect } from 'react';
import { Users, TrendingUp } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { arSA } from "date-fns/locale";

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorDisplay } from '@/components/error-display';

/**
 * @component ProfitsPage
 * @description The main component for the profits page.
 * It fetches and displays profit statistics.
 */
export default function ProfitsPage() {
  /**
   * @state user
   * @description The authenticated user object from the `useAuth` hook.
   */
  const { user } = useAuth();

  if (user && user.role !== 'admin') {
    return <ErrorDisplay title="Access Denied" message="You do not have permission to view this page." />
  }
  /**
   * @state stats
   * @description The state variable for storing the profit statistics.
   * @type {{totalRevenue: number; totalMembers: number; averageRevenuePerMember: number; monthlyRevenue: { name: string; total: number }[];} | null}
   */
  const [stats, setStats] = useState<{
    totalRevenue: number;
    totalMembers: number;
    averageRevenuePerMember: number;
    monthlyRevenue: { name: string; total: number }[];
  } | null>(null);
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
   * @description Fetches the profit statistics from the API when the component mounts or the user changes.
   */
  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/profits");
        if (!res.ok) throw new Error("Failed to fetch profits");
        const statsData = await res.json();
        setStats(statsData);
      } catch (e) {
        console.error("خطأ في جلب بيانات الأرباح:", e);
        setError((e as Error).message || 'حدث خطأ غير متوقع أثناء حساب الإحصائيات.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);
  
  if (loading) {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-32 rounded-lg" />
                <Skeleton className="h-32 rounded-lg" />
                <Skeleton className="h-32 rounded-lg" />
            </div>
            <Skeleton className="h-[350px] rounded-lg" />
        </div>
    );
  }

  if (error) {
    return <ErrorDisplay title="فشل في عرض الإحصائيات" message={error} />
  }

  if (!stats || stats.totalMembers === 0) {
    return <div className="text-center py-10 text-muted-foreground">لا توجد إحصائيات لعرضها. قد لا يكون لديك أي أعضاء حتى الآن.</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <span className="text-muted-foreground">د.ع</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} د.ع</div>
            <p className="text-xs text-muted-foreground">الإجمالي من جميع الاشتراكات المسجلة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأعضاء</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">العدد الكلي للأعضاء المسجلين</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط الإيرادات / عضو</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRevenuePerMember.toLocaleString('ar-IQ', { style: 'currency', currency: 'IQD', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
            <p className="text-xs text-muted-foreground">متوسط القيمة لكل عضو</p>
          </CardContent>
        </Card>
      </div>
       <Card>
          <CardHeader>
            <CardTitle>نظرة عامة على الإيرادات الشهرية</CardTitle>
            <CardDescription>
                عرض تفصيلي للإيرادات المحققة من اشتراكات الأعضاء كل شهر.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
            {stats.monthlyRevenue.length > 0 ? (
              <BarChart data={stats.monthlyRevenue}>
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  locale={arSA}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value.toLocaleString()} د.ع`}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                    لا توجد بيانات كافية لعرض الرسم البياني.
                </div>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
    </div>
  );
}
