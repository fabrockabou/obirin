import type { Metadata } from "next";
import { NotifyForm } from "@/components/admin/NotifyForm";
import { PasswordForm, SettingsForm } from "@/components/admin/SettingsForms";
import { notifyStatus } from "@/lib/notify";
import { STORE_DIR, getAdminUsername, getSettings } from "@/lib/store";

export const metadata: Metadata = { title: "Réglages" };

export default function AdminSettingsPage() {
  const settings = getSettings();
  const status = notifyStatus(settings);
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="display text-5xl text-forest">Réglages</h1>
        <p className="mt-2 text-ink-soft">Numéro WhatsApp Business, envoi automatique des demandes et accès à l&apos;administration.</p>
      </div>
      <SettingsForm number={settings.whatsappNumber} greeting={settings.whatsappGreeting} />
      <NotifyForm
        mode={settings.notifyMode}
        notifyTo={settings.notifyTo}
        fallbackNumber={settings.whatsappNumber}
        hasKey={Boolean(settings.callmebotApiKey)}
        metaConfigured={Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID)}
        status={{ ready: status.ready, reason: status.reason }}
      />
      <PasswordForm username={getAdminUsername() ?? ""} />
      <p className="text-sm text-ink-soft">
        Dossier de stockage des données : <code>{STORE_DIR}</code>
      </p>
    </div>
  );
}
