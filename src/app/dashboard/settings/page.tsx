'use client';

import { useAuth } from '@/hooks/use-auth';
import { ChangePasswordForm } from '@/components/change-password-form';
import { AssistantsManager } from '@/components/assistants-manager';
import { PricingSettingsForm } from '@/components/pricing-settings-form';

export default function SettingsPage() {
  const { user } = useAuth();

  if (!user) {
    return null; // Or a loading indicator
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">الإعدادات</h1>
      <div className="space-y-8">
        <ChangePasswordForm />
        {user.role === 'admin' && <PricingSettingsForm />}
        {user.role === 'admin' && <AssistantsManager adminId={user.id} />}
      </div>
    </div>
  );
}