import React from "react";
import {
  Home,
  Calendar,
  ClipboardList,
  DollarSign,
  BookOpen,
  FileText,
  Settings,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import NavLink from "../../../../frontend/src/app/widgets/navbar/NavLink";

const NavBar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { logout, user } = useAuth();

  return (
    <nav
      className={`w-16 min-h-screen transition-colors duration-300 flex flex-col items-center py-8 ${
        theme === "dark"
          ? "bg-gray-800 text-gray-200 border-r border-gray-700"
          : "bg-white text-gray-700 border-r border-gray-200"
      }`}
    >
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
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition-colors ${
            theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
          }`}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? <Moon size={24} /> : <Sun size={24} />}
        </button>

        <NavLink
          to="/settings"
          label="Settings"
          icon={<Settings size={24} />}
        />

        <button
          onClick={logout}
          className={`p-2 rounded-lg transition-colors ${
            theme === "dark"
              ? "hover:bg-gray-700 text-red-400 hover:text-red-300"
              : "hover:bg-gray-100 text-red-600 hover:text-red-500"
          }`}
          aria-label="Logout"
          title="Logout"
        >
          <LogOut size={24} />
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
