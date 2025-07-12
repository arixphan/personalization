import { ReactNode } from "react";
import NavBar from "../navbar/NavBar";
import MainContent from "./MainContent";

export const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div
      className={`min-h-screen transition-colors duration-300 dark:bg-gray-900 dark:text-white bg-gray-50 text-gray-900`}
    >
      <div className="flex">
        <NavBar />
        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
};
