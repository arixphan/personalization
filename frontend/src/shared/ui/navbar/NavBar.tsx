import {
  Home,
  Calendar,
  ClipboardList,
  DollarSign,
  BookOpen,
  FileText,
  Settings,
} from "lucide-react";
import NavLink from "./NavLink";
import React, { Suspense } from "react";
import { LogoutButton } from "../buttons/LogoutButton";

const ThemeSwitcher = React.lazy(async () => {
  return {
    default: (await import("../theme-switcher/ThemSwitcher")).ThemeSwitcher,
  };
});

const NavBar: React.FC = () => {
  return (
    <nav className="w-16 min-h-screen transition-colors duration-300 flex flex-col items-center py-8 fixed bg-white text-gray-700 border-r border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">
      <div className="flex flex-col items-center space-y-6">
        <NavLink
          to="/"
          label="Home"
          icon={<Home size={24} />}
          isActive={true}
        />

        <NavLink
          to="/projects"
          label="Projects"
          icon={<ClipboardList size={24} />}
        />

        <NavLink to="/time" label="Time" icon={<Calendar size={24} />} />

        <NavLink
          to="/finance"
          label="Finance"
          icon={<DollarSign size={24} />}
        />

        <NavLink to="/diary" label="Diary" icon={<BookOpen size={24} />} />

        <NavLink to="/blog" label="Blog" icon={<FileText size={24} />} />
      </div>

      <div className="mt-auto flex flex-col items-center space-y-6">
        <Suspense>
          <ThemeSwitcher />
        </Suspense>
        <NavLink
          to="/settings"
          label="Settings"
          icon={<Settings size={24} />}
        />
        <LogoutButton />
      </div>
    </nav>
  );
};

export default NavBar;
