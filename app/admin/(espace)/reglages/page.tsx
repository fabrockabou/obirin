import type { Metadata } from "next";
import { PasswordForm, SettingsForm } from "@/components/admin/SettingsForms";
import { getAdminUsername, getSettings } from "@/lib/store";

export const metadata: Metadata = { title: "Réglages" };

export default function AdminSettingsPage() {
  const settings = getSettings();
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="display text-5xl text-forest">Réglages</h1>
        <p className="mt-2 text-ink-soft">Numéro WhatsApp Business et accès à l&apos;administration.</p>
      </div>
      <SettingsForm number={settings.whatsappNumber} greeting={settings.whatsappGreeting} />
      <PasswordForm username={getAdminUsername() ?? ""} />
    </div>
  );
}
