import {
  Settings,
  LucideProps,
} from "lucide-react";
import NavLink from "./NavLink";
import React, {
  ForwardRefExoticComponent,
  RefAttributes,
  Suspense,
} from "react";
import { LogoutButton } from "../buttons/LogoutButton";

const ThemeSwitcher = React.lazy(async () => {
  return {
    default: (await import("../theme-switcher/ThemeSwitcher")).ThemeSwitcher,
  };
});

interface NavBarProps {
  items: Array<{
    to: string;
    label: string;
    icon: ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >;
  }>;
}

import { Logo } from "../logo/Logo";

export const NavBar: React.FC<NavBarProps> = ({ items }) => {
  return (
    <nav className="w-16 min-h-screen transition-colors duration-300 flex flex-col items-center py-8 fixed bg-white text-gray-700 border-r border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700">
      <div className="flex flex-col items-center space-y-6">
        <Logo size={32} />
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={index}
              to={item.to}
              label={item.label}
              icon={<Icon size={24} />}
            />
          );
        })}
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
