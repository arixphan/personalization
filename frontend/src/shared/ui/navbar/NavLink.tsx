import React from "react";
import * as motion from "motion/react-client";

export interface NavLinkProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({
  to,
  label,
  icon,
  isActive = false,
}) => {
  return (
    <motion.a
      href={to}
      className={`relative flex items-center justify-center p-2 rounded-lg transition-colors group
        ${
          isActive
            ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700"
        }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {icon}

      <motion.span
        className="absolute left-full ml-2 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none bg-white text-gray-900 shadow-md dark:bg-gray-700 dark:text-white"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 0, x: -10 }}
        whileHover={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        {label}
      </motion.span>
    </motion.a>
  );
};

export default NavLink;
