"use client";
import React, { useState } from "react";
import {
  LuPanelLeftOpen,
  LuPanelLeftClose,
  LuSquareKanban,
} from "react-icons/lu";

const MENU_ITEMS = [{ name: "Project Management", icon: <LuSquareKanban /> }];

interface AppLayoutProps {
  children?: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen">
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-16"
        } bg-background transition-all duration-300 ease-in-out flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 justify-end">
          <button onClick={toggleSidebar}>
            {isSidebarOpen ? <LuPanelLeftClose /> : <LuPanelLeftOpen />}
          </button>
        </div>
        <div className="flex-1">
          {isSidebarOpen && (
            <ul className="space-y-2 py">
              {MENU_ITEMS.map((item) => (
                <li
                  key={item.name}
                  className="flex items-center px-2 space-x-2 hover:bg-foreground hover:text-background"
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      <main className="flex-1 bg-gray-100 p-4">{children}</main>
    </div>
  );
};

export default AppLayout;
