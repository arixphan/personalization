import { ReactNode } from "react";
import MainContent from "./MainContent";
import { NavBar } from "../navbar/NavBar";
import { APP_MODULES } from "@/manager/manager";

export const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div
      className={`min-h-screen transition-colors duration-300 dark:bg-gray-900 dark:text-white bg-gray-50 text-gray-900`}
    >
      <div className="flex">
        <NavBar
          items={APP_MODULES.map((module) => ({
            icon: module.icon,
            label: module.name,
            to: module.url,
          }))}
        />
        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
};
