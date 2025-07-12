import { logout } from "@/app/(auth)/actions/logout";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <button
      onClick={logout}
      className="p-2 rounded-lg transition-colors hover:bg-gray-100 text-red-600 hover:text-red-500 dark:hover:bg-gray-700 dark:text-red-400 dark:hover:text-red-300"
      aria-label="Logout"
      title="Logout"
    >
      <LogOut size={24} />
    </button>
  );
}
