"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock } from "lucide-react";

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
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

// Schema
const loginSchema = z.object({
  email: z.string().email({ message: "الرجاء إدخال بريد إلكتروني صالح." }),
  password: z.string().min(1, { message: "كلمة المرور مطلوبة." }),
});

// Component
export function AuthForm() {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    setLoading(true);
    const success = signIn(values.email, values.password);
    if (!success) {
      toast({
        variant: "destructive",
        title: "فشل الدخول",
        description: "البيانات التي أدخلتها غير صحيحة.",
      });
    }
    setLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-4 p-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>البريد الإلكتروني</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="admin@gym.com"
                    {...field}
                    className="pr-8"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>كلمة المرور</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="admin"
                    {...field}
                    className="pr-8"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full !mt-6" disabled={loading}>
          {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          تسجيل الدخول
        </Button>
      </form>
    </Form>
  );
}