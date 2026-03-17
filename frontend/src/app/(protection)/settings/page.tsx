import { SettingsContainer } from "./_ui/settings-container";
import { ServerApiHandler } from "@/lib/server-api";
import { UserEndpoint } from "@/constants/endpoints";

export const metadata = {
  title: "Settings - Personalization",
  description: "Manage your preferences and profile",
};

export default async function SettingsPage() {
  let profileData = {};
  try {
    const response = await ServerApiHandler.get(UserEndpoint.profile());
    if (response.data) profileData = response.data;
  } catch (e) {
    console.error("Failed to fetch profile", e);
  }

  return (
    <div className="h-full overflow-auto bg-background text-foreground p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <SettingsContainer initialData={profileData} />
      </div>
    </div>
  );
}
